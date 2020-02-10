import {Sequelize, SequelizeOptions} from 'sequelize-typescript';
import decamelize from "decamelize";
import {models} from "../models/models";

const options: SequelizeOptions = {
    database: process.env.POSTGRES_DATABASE,
    dialect: 'postgres',
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTRES_HOST,
    ssl: true,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    dialectOptions: {
        ssl: false,
        supportBigNumbers: true,
        bigNumberStrings: true,

    },
};

export function initSequelize(): Sequelize {

    //this line is used to parse big int from the database, else it will return a string
    require('pg').defaults.parseInt8 = true;

    const sequelize = new Sequelize(options);

    // order important here:
    // 1. before define
    // 2. before create
    // 3. add models
    // 4. authenticate
    // 5. synchronise with database

    sequelize.beforeDefine((attributes: any) => {
        Object.keys(attributes).forEach((key) => {
            // typeof check provided by @devalnor
            if (typeof attributes[key] !== "function") {
                attributes[key].field = decamelize(key);
            }
        });
    });

    sequelize.addModels(models);
    sequelize.authenticate();

    return sequelize;
}