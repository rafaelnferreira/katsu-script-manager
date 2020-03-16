import * as dotenv from 'dotenv';
dotenv.config();

import express from "express";
import bodyParser from 'body-parser';
import {ApplicationStatus} from "./types/application-status";
import {ActionService} from "./services/action.service";
import {ConfigInit} from "./configuration/config-init";
import { initSequelize } from './configuration/sequelize.config';
import { configure, getLogger } from 'log4js';
import path from 'path';


const server = express();
const port = process.env.PORT || 3000 ;

server.set('view engine', 'hbs');
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use('/public', express.static(path.join(__dirname, '../public')));

console.log(path.join(__dirname, '../public'))
// DB support disabled
// initSequelize();

export const logger = getLogger();
logger.level = 'debug';

configure({
    appenders: {
      console: { type: 'console' }
    },
    categories: {
      default: { appenders: ['console'], level: 'debug' }}
  });

export const applicationStatus: ApplicationStatus = new ApplicationStatus();
export const actionService: ActionService = new ActionService(applicationStatus);
new ConfigInit(applicationStatus);

server.post('/run-script/:scriptName', (req, res) => {
    const args = req.body;

    logger.debug('received request for script: {} with args {}', req.params.scriptName, args);

    const isRunning = actionService.runScript(req.params.scriptName, args);
    isRunning ? res.sendStatus(200) : res.sendStatus(404);
});

server.get('/', (req, res) => {
  res.render('jobs', {jobs: actionService.getJobs()});
});

server.post('/exec-job', (req, res) => {
    const payload = req.body;
    logger.debug('received exect-job request:', payload);
    actionService.executeJob(payload);
    res.sendStatus(200);
});

server.post('/enable', (req, res) => {
  logger.info('Enabling processing events');
  applicationStatus.acceptingRequests = true;
  res.sendStatus(200);
});

server.post('/disable', (req, res) => {
  logger.info('disabling processing events');
  applicationStatus.acceptingRequests = false;
  res.sendStatus(200);
});

server.post('/add-job', (req, res) => {
  actionService.saveJob(req.body);
  res.sendStatus(200);
});

server.delete('/job/:jobName', (req, res) => {
  actionService.deleteJob(req.params.jobName);
  res.sendStatus(200);
});

server.get('/jobs', (req, res) => {
  res.send(actionService.getJobs());
})

server.listen(port, () => logger.info(`Katsu script server started on port ${port}`));