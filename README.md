# Docker Compose Manager
A simple tool that allows management of docker.

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

### Setting up execution for Scripts

Any scripts found under the `SCRIPT_FOLDER` path can be invoked via http post. For example a script named `args.bash` can be executed with the parameters `1 2 3 4` using the following `POST`:

```bash
curl -XPOST -H "Accept: application/json" -H "Content-Type: application/json" -d "[\"1\", \"2\", \"3\", \"4\"]" http://localhost:3001/run-script/args.bash
```

### Setting up execution for docker-compose files
Create and navigate to the folder `config/docker-compose/` at root level and add your docker-compose.yml files. An example of yml file:

```yaml
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

```bash
#inside .env
MY-DOCKER-PORT=0000
```

```yaml
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

### To run the application, on the root execute the command

```bash
$ npm start
```

Launch a web browser at `http://localhost:3001` 

## Output

### tmp folder
A `~tmp-docker` folder will be generated with parsed yml files replacing all the .env variables. The program will read from those files, do not delete this folder while the program is running. Each time the program starts the folder is deleted and recreated. 

### logs
Under the `~tmp-docker` folder a `logs` folder will be created, the output of each docker will be dumped into a a file inside this folder

## Stopping the application
Since each docker is run via a child process of the application, once the app stops, all the dockers will be brought down as well


