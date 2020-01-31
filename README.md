# katsu-script-manager
A simple automation tool that allows scripts to be configured and executed based on HTTP events.

## Motivation
We wanted to make our daily deployment process into development environments smoother and without manual intervention. We do love shell-scripting (and have tons of scripts), but managing these by hand based on various events still require too much manual intervention, therefore we  needed a tool that could capture these events (generally coming from the CI system), react to them based on the pre defined configuration, and perform the job.

Our mantra is: *Focus on the solution, not in the tooling*.

### Origin of the name
The name was inspired by the team's favorite meal: The famous chicken katsu by ***** (venue's name ommited since they are not paying anything to us neither giving us free meals!).

# Configure the workspace

#### Install dependencies
Navigate to the root folder and install the dependencies via the command 
`$ npm install`

#### Add a .env file
At the root level of your project add a `.env` file. By default the application reads the port of the server via the `.env`, copy and paste the following line inside the `.env` file
```
PORT=3000 
```
You can setup any port number you wish

#### Setting up the docker-compose files
Create and navigate to the folder `config/docker-compose/` at root level and add your docker-compose.yml files. An example of yml file:

```
  my-docker:
    image: my-docker/image
    container_name: my-docker # MAKE SURE THE container_name IS THE SAME AS the docker name
    ports:
    - "0000:0000"
    environment:
    - HOST=localhost
    - PORT=0000
```
####  Adding variables to the .env file 
 In the `.env` you can add variables that you wish the program to read from your docker-compose files. For example
```
#inside .env
MY-DOCKER-PORT=0000
```

#### Adding variables to the docker-compose
It's possible to add variables to the docker-compose files, the program will be able to recognize them. The syntax for the variable is as following 
```
${MY_VAR}
```
Using the previous example: 

```
#inside .env
MY-DOCKER-PORT=0000
```
```
# inside docker-file
  my-docker:
    image: my-docker/image
    container_name: my-docker # MAKE SURE THE container_name IS THE SAME AS the docker name
    ports:
    - "0000:0000"
    environment:
    - HOST=localhost
    - PORT=${MY-DOCKER-PORT}
```

## Running it
To run the program, on the root execute the command
`$ npm start`

## Output
#### tmp folder
A `~tmp` folder will be generated with parsed yml files replacing all the .env variables. The program will read from those files, do not delete this folder while the program is running. Each time the program starts the folder is deleted and recreated. 

#### logs
Under the `~tmp` folder a `logs` folder will be created, the output of each docker will be dumped into a a file inside this folder

## Stopping the application
Since each docker is run via a child process of the application, once the app stops, all the dockers will be brought down as well
