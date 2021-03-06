const mongoose = require('mongoose');
const config = require('./config');

const MONGO_USERNAME = config.mongodb.username;
const MONGO_PASSWORD = config.mongodb.password;
const MONGO_HOSTNAME = config.mongodb.hostname;
const MONGO_PORT = config.mongodb.port;
const MONGO_DB = config.mongodb.database;

const url = MONGO_USERNAME 
    ? `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`
    : `mongodb://${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}`;

mongoose.connect(url, {useNewUrlParser: true});