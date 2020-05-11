"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./server/server"));
const router_1 = __importDefault(require("./router/router"));
const body_parser_1 = __importDefault(require("body-parser"));
require('./server/config');
const server = server_1.default.init(process.env.PORT ? +process.env.PORT : 3000);
server.app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
});
// parse application/x-www-form-urlencoded
server.app.use(body_parser_1.default.urlencoded({ extended: false }));
// parse application/json
server.app.use(body_parser_1.default.json());
server.app.use(router_1.default);
// const mysql = new MySqlClass();
// MySqlClass.instance;
server.start(() => {
    console.log('Servidor corriendo en el puerto 3000');
});
