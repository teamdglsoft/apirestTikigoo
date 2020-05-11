import Server from './server/server';
import router from './router/router';
import bodyParser from 'body-parser';


const server = Server.init(3000);
server.app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
       next();
 });

 // parse application/x-www-form-urlencoded
 server.app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
server.app.use(bodyParser.json());

server.app.use(router);

// const mysql = new MySqlClass();

// MySqlClass.instance;

server.start( () => {
     console.log('Servidor corriendo en el puerto 3000');
} );