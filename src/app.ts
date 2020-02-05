import * as dotenv from 'dotenv';
dotenv.config();

import * as express from "express";
import * as bodyParser from 'body-parser';
import {ApplicationStatus} from "./models/application-status";
import {ActionService} from "./services/action.service";
import {ConfigInit} from "./configuration/config-init";

const server = express();
const port = 3001;

server.set('view engine', 'hbs');
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

export const applicationStatus: ApplicationStatus = new ApplicationStatus();
export const actionService: ActionService = new ActionService(applicationStatus);
new ConfigInit(applicationStatus);

server.get('/', (req, res) => {
    res.render('overview', applicationStatus.commands);
});

server.post('/spin-up-image', (req, res) => {
    actionService.spinUpImages(req.body);

    res.render('overview', applicationStatus.commands);

});

// app.get('/read-logs/:serviceName', (req, res) => {
//     const fileLogName = config.logsFolder + req.params.serviceName + '.log';
//     const tail = spawn('tail', ['-f', fileLogName]);

//     tail.stdout.on('data', function (data) {
//         res.write('' + data);
//     });
// });

server.get('/alt-service/:serviceName', (req, res) => {
    const serviceName = req.params.serviceName;
    actionService.altImages(serviceName);

    res.render('overview', applicationStatus.commands);
});


server.post('/run-script/:scriptName', (req, res) => {
    const args = req.body;

    const isRunning = actionService.runScript(req.params.scriptName, args);
    isRunning ? res.sendStatus(200) : res.sendStatus(404);
});

server.listen(port, () => console.log(`Microservices server started on port ${port}`));