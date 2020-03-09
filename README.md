
  

  

# Katsu Script Manager

  

A simple automation tool that allows scripts to be configured and executed based on HTTP events.

  

  

## Motivation

  

We wanted to make our daily deployment process into development environments smoother and without manual intervention. We do love shell-scripting (and have tons of scripts), but managing these by hand based on various events still require too much manual intervention, therefore we needed a tool that could capture these events (generally coming from the CI system), react to them based on the pre defined configuration, and perform the job.

  

  

Our mantra is: *Focus on the solution, not in the tooling*.

  

  

### Origin of the name

  

The name was inspired by the team's favorite meal: The famous chicken katsu by ***** (venue's name ommited since they are not paying anything to us neither giving us free meals!).

  

  

# Configure the workspace

  

  

#### Install dependencies

  

Navigate to the root folder and install the dependencies via the command

  

`$ npm install`

  

  

#### Add a .env file

  

  

At the root level of your project add a `.env` file:

  

  

```bash
$ touch .env
```

  

  

By default the application listens http on port `3000` you can modify this port via the `.env` file:

  

  

```
PORT=3000
```

  

  

You can setup any port number you wish.

  

  

You can define a `SCRIPT_FOLDER` variable in the `.env` file as well, otherwise it will search for scripts under `config/scripts/`.

  

Add the following envs to connect to the database

  

```

POSTGRES_DATABASE =database

POSTGRES_USERNAME =username

POSTGRES_PASSWORD =password

POSTGRES_HOST =host

```

  

  

### Setting up execution for Scripts
 

#### Configuring jobs

  

Navigate to the folder config/jobs and edit the file `jobs.config.json`. e.g.

  

```json
[
	{
		"name": "DEPLOY_UI_DEV01",
		"jobName": "WEBUI",
		"branch": "FEAT-DEV-INTEGRATION",
		"scriptName": "deploy.bash",
		"args": ["--env", "dev01"]
	}
]
```

  

where	:

  

-  <b>name:</b> is an id for the job, this will be used as a name to the logs files

  

-  <b>jobName</b>: the name of the job

  

-  <b>branch</b>: the name of the branch to execute from

  

-  <b>scriptName</b>: the name of the script to execute

  

-  <b>args</b>: the args to be passed to the script

  

  



  

### Script logs

  

Script logs can be found in the folder `scripts-logs/{CURRENT-DATE}`

  
 ## Endpoints
 
 ### Run script in folder
 <b>POST /run-script/{SCRIPTNAME}</b>
 Any scripts found under the `SCRIPT_FOLDER` path can be invoked via http post. For example a script named `args.bash` can be executed with the parameters `1 2 3 4` using the following `POST`:
 
```bash
POST http://localhost:3000/run-script/args.bash
```
With Body:
```json
	[1,2,3,4]
```

Curl:
  ```bash
curl -XPOST -H "Accept: application/json" -H "Content-Type: application/json" -d "[\"1\", \"2\", \"3\", \"4\"]" http://localhost:3000/run-script/args.bash
```

 ### Executing jobs
 <b>POST /exec-job</b>

```bash
POST http://localhost:3000/exec-job
```

 

With Body:
```json
	{
		"jobName": "WEBUI",
		"branch" : "FEAT-DEV-INTEGRATION"
	}
```

Curl:
```bash
curl -XPOST -H "Accept: application/json" -H "Content-Type: application/json" -d "{
\"jobName\": \"WEBUI\",
\"branch\": \"FEAT-DEV-INTEGRATION\"
}" http://localhost:3000/exec-job
```

### Adding a new job
 <b>POST /add-job</b>

```bash
POST http://localhost:3000/add-job
```
With Body:
```json
	{
		"name": "DEPLOY_UI_DEV01",
		"jobName": "WEBUI",
		"branch": "FEAT-DEV-INTEGRATION",
		"scriptName": "deploy.bash",
		"args": ["--env", "dev01"]
	}
```

### Deleting a  job
 <b>DELETE /job/{NAME}</b>

```bash
DELETE http://localhost:3000/job/DEPLOY_UI_DEV01
```

### get all  jobs
 <b>GET /jobs</b>

```bash
GET http://localhost:3000/jobs
```

## Running it

  

  

### To run the application, on the root execute the command

  

  

```bash
$ npm start
```

  

  

Launch a web browser at `http://localhost:3000`