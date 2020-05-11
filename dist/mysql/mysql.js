"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mysql = require("mysql");
class MySqlClass {
    constructor() {
        this.conectado = false;
        console.log('Clase inicializada');
        this.cnn = mysql.createPool({
            host: 'www.tikigoo.com',
            user: 'tikigoo',
            password: 'Nosalgas',
            database: 'tikigoo_base'
        });
        //this.conectarDb();
    }
    static get instance() {
        return this._instance || (this._instance = new this());
    }
    static ejecutarQuery(query, callback) {
        this.instance.cnn.query(query, (error, resultados, fields) => {
            if (error) {
                console.log('error en query');
                console.log(error);
                callback(error);
                return;
            }
            if (resultados.length === 0) {
                callback('El registro solicitado no existe');
            }
            else {
                callback(null, resultados);
            }
        });
    }
}
exports.default = MySqlClass;
