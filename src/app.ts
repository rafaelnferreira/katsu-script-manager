import * as dotenv from 'dotenv';
dotenv.config();

import express from "express";
import bodyParser from 'body-parser';
import {ApplicationStatus} from "./types/application-status";
import {ActionService} from "./services/action.service";
import {ConfigInit} from "./configuration/config-init";
import { initSequelize } from './configuration/sequelize.config';
import { configure, getLogger } from 'log4js';

const server = express();
const port = process.env.PORT || 3000 ;

server.set('view engine', 'hbs');
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

initSequelize();

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

    const isRunning = actionService.runScript(req.params.scriptName, args);
    isRunning ? res.sendStatus(200) : res.sendStatus(404);
});


server.post('/exec-job', (req, res) => {
    actionService.executeJob(req.body);
    res.sendStatus(200);
});

server.listen(port, () => console.log(`Katsu script server started on port ${port}`));