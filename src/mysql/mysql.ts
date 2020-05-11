import mysql  = require('mysql');

export default class MySqlClass {
    private static _instance: MySqlClass;
    cnn: mysql.Pool;
    conectado: boolean = false;

    constructor() {
        console.log('Clase inicializada');
        this.cnn = mysql.createPool({
            host: 'www.tikigoo.com',
            user: 'tikigoo',
            password: 'Nosalgas',
            database: 'tikigoo_base'
        });

        //this.conectarDb();
    }


    public static get instance () {
        return this._instance || ( this._instance = new this() );
    }

    static ejecutarQuery (query: string, callback: Function) {
        this.instance.cnn.query(query, (error, resultados: Object[], fields)=> {
            if(error) {
                console.log('error en query');
                console.log(error);
                callback(error);
                return;
            }
            if(resultados.length === 0) {
                callback('El registro solicitado no existe');
            } else {

                callback(null, resultados);
            }
        });
    }

    // private conectarDb() {
    //     this.cnn.connect((err: mysql.MysqlError) => {
    //         if (err) {3
    //             console.log(err.message);
    //             return;
    //         }
    //         this.conectado = true;
    //         console.log('Base de datos en linea');
    //     });
    // }

}