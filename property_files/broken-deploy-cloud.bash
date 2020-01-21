#!/bin/bash

WEBHOOK_URL=https://outlook.office.com/webhook/81d90bbd-22d4-4870-88a2-62882df33141@02c0ff86-27e7-4ccb-bc4e-288b044b3988/IncomingWebhook/629ecd947dc74df3984cb102e963774d/1a84a845-5aca-404d-9238-e9b39af5315b

declare -A CONFIG=( \
           ["WEBUI"]="service: calypso/calypso-collateral-webui         version: 2.1.2 git_lab_token: $WEBUI_TOKEN            git_lab_url: https://gitlab.calypsoatlas.com/api/v4/projects/10/trigger/pipeline  project_folder: collateral-ui" \
      ["COLLATERAL"]="service: calypso/calypso-collateral-cloud-service version: 1.0.3 git_lab_token: $COLLATERAL_TOKEN       git_lab_url: https://gitlab.calypsoatlas.com/api/v4/projects/7/trigger/pipeline   project_folder: collateral"  \
       ["STATEMENT"]="service: calypso/statement-service                version: 1.0.0 git_lab_token: $STATEMENT_TOKEN        git_lab_url: https://gitlab.calypsoatlas.com/api/v4/projects/11/trigger/pipeline  project_folder: statement" \
         ["REPORTS"]="service: calypso/collateral-reports-service       version: 1.1.2 git_lab_token: $REPORTS_TOKEN          git_lab_url: https://gitlab.calypsoatlas.com/api/v4/projects/13/trigger/pipeline  project_folder: collateral-reports" \
      ["EXCEPTIONS"]="service: calypso/collateral-exceptions-service    version: 1.0.0 git_lab_token: $EXCEPTIONS_TOKEN       git_lab_url: https://gitlab.calypsoatlas.com/api/v4/projects/55/trigger/pipeline  project_folder: collateral-exceptions" \
       ["POSITIONS"]="service: calypso/collateral-position-service      version: 1.0.0 git_lab_token: $POSITIONS_TOKEN        git_lab_url: https://gitlab.calypsoatlas.com/api/v4/projects/9/trigger/pipeline   project_folder: collateral-position" \
   ["NOTIFICATIONS"]="service: calypso/notifications                    version: 1.0.0 git_lab_token: $NOTIFICATIONS_TOKEN    git_lab_url: https://gitlab.calypsoatlas.com/api/v4/projects/12/trigger/pipeline  project_folder: notifications" \
["USER-PREFERENCES"]="service: calypso/user-preferences-service         version: 1.0.0 git_lab_token: $USER_PREFERENCES_TOKEN git_lab_url: https://gitlab.calypsoatlas.com/api/v4/projects/43/trigger/pipeline  project_folder: user-preferences" \
          ["ACADIA"]="service: calypso/acadia-service                   version: 1.0.0 git_lab_token: $ACADIA_TOKEN           git_lab_url: https://gitlab.calypsoatlas.com/api/v4/projects/100/trigger/pipeline project_folder: collateral-acadia" \
)

get_config(){
  echo ${CONFIG["$1"]} | cut -d ' ' -f $2
}

get_image_name(){
  get_config $1 2
}

get_image_version() {
  if [ -z "$2" ] 
  then
    get_config $1 4
  else
    echo $2
  fi
}

get_url() {
  get_config $1 8
}

get_token() {
  get_config $1 6
}

get_project_folder() {
  get_config $1 10 
}

log () {
  TIMESTAMP=$(date "+%H:%M:%S")
  echo -e "\e[92m[${TIMESTAMP}] \e[95m(${1}) \e[93m{${FUNCNAME[1]}} \e[39m-> ${2}"
}

check_push_image() {
  sleep 30
  STATUS=$(curl -s -X GET http://jenkins.calypso.com/jenkins/job/RELENG-PUSH-DOCKER-REGISTRY/lastBuild/api/json  --user $JENKINS_USER:$JENKINS_TOKEN | grep -v "\"id\":\"$3\"," | grep $1 | grep \"result\":\"SUCCESS\")
  
  if [ -z "$STATUS" ] 
  then
      log $4 "Job stil not complete"
      if [ $2 = 5 ]
      then
        log $4 "Unable to determine status after 5 attempts"
        return -1
      else
       log $4 "Trying again in 30 seconds..."
       check_push_image $1 $(($2+1)) $3 $4
      fi
  else
      log $4 "Image successfully pushed"
  fi
}

push_image() {
  SERVICE_NAME=$(get_image_name $1)
  VERSION=$(get_image_version $1 $2)

  LAST_BUILD_ID=$(curl -s -X GET http://jenkins.calypso.com/jenkins/job/RELENG-PUSH-DOCKER-REGISTRY/lastBuild/api/json  --user $JENKINS_USER:$JENKINS_TOKEN | sed -e 's/^.*"id":"\([^"]*\)".*$/\1/')

  log $1 "Last build ID in Jenkins is: ${LAST_BUILD_ID}"

  log $1 "Pushing - ${SERVICE_NAME} - ${VERSION}"

  curl -X POST http://jenkins.calypso.com/jenkins/job/RELENG-PUSH-DOCKER-REGISTRY/build \
  --user $JENKINS_USER:$JENKINS_TOKEN \
  --data-urlencode json="{\"parameter\": [{\"name\":\"IMAGE_REPO\", \"value\":\"$SERVICE_NAME\"}, {\"name\":\"IMG_VERSION\", \"value\":\"${VERSION}\"}]}"
  
  log $1 "Waiting for jenkins job to complete..."
  check_push_image $SERVICE_NAME 1 $LAST_BUILD_ID $1
}

update_git_lab_version() {
  PROJECT_FOLDER=$(get_project_folder $1)
  VERSION=$(get_image_version $1 $2)
  
  pushd $GITLAB_WORKSPACE_LOCATION
  log $1 "Updating tag version for ${1} to ${VERSION}"
  sed -i.$PROJECT_FOLDER.bkp "s/^  tag:.*$/  tag: ${VERSION}/g" deploy-config/$PROJECT_FOLDER/values.yaml

  git commit -am "CCOLT-1 Updated version to ${VERSION}"
  git push
}

deploy() {
  update_git_lab_version $1 $2

  TOKEN=$(get_token $1)
  URL=$(get_url $1)
  
  log $1 "Triggering GitLab pipeline:"

  curl -s -X POST -F token=$TOKEN -F ref=master $URL
  
  if [ $? -eq 0 ]
  then
     JSON="{ \"text\" : \"Deployed: ${1}, version: ${2}\" }"
     curl -X POST $WEBHOOK_URL -d "$JSON"
  fi
}

push_and_deploy() {
  push_image $1 $2

  if [ $? -eq 0 ]
  then
    deploy $1 $2
  fi
}

show_usage() {
  for c in "${!CONFIG[@]}"
  do 
    APPS="${APPS} ${c}"
  done
  
  echo "usage: deploy-cloud [--skip-push] [app@version ...]"
  echo $APPS | tr ' ' '\n' | sort | awk 'BEGIN { printf ("  where valid applications are: ") } { printf ("\n\t%s", $0) } END { printf("\n") } '
}

if [ -z "$1" ] 
then
  show_usage
  exit -1
fi

pushd $GITLAB_WORKSPACE_LOCATION
log GENERAL "Updating GitLab project" 
git pull
popd

SKIP_PUSH=$( echo "${@}" | grep -- --skip-push )

for var in "$@"
do

  if [ $var = "--skip-push" ]
  then
    continue
  fi

  APP_NAME=$(echo $var | cut -d'@' -f 1)
  TAG_VERSION=$(echo $var | cut -d'@' -f 2)

  if [ "$APP_NAME" = "$TAG_VERSION" ]
  then
    TAG_VERSION=
  fi

  TARGET_APP=${CONFIG["$APP_NAME"]}
  if [ -z "${TARGET_APP}" ] 
  then
    log ERROR "invalid app: $APP_NAME"
    continue
  fi

  if [ -z "${SKIP_PUSH}" ]
  then
    push_and_deploy $APP_NAME $TAG_VERSION
  else
    deploy $APP_NAME $TAG_VERSION
  fi

done
