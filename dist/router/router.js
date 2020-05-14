"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mysql_1 = __importDefault(require("../mysql/mysql"));
const moment = require('moment');
const utilidades = require('../utilidades/funciones');
const Nexmo = require('nexmo');
const router = express_1.Router();
const nexmo = new Nexmo({
    apiKey: '1e2b52ea',
    apiSecret: 'ckwwCX8cApFOeKUX'
});
//Registrar productos
router.post('/addProductToOrder', (req, res) => {
    var date = new Date();
    let allData = req.body;
    const queryInsertPedido = `
    INSERT INTO productos_pedidos (
        npedido,
        nproducto,
        cantidad,
        nombre,
        precio,
        total,
        observaciones) 
        VALUES ('${allData.npedido}', '${allData.nproducto}', '${allData.cantidad}', '${allData.nombre}',
        '${allData.precio}', '${allData.total}', '${allData.observaciones}');

    `;
    console.log(allData);
    mysql_1.default.ejecutarQuery(queryInsertPedido, (err, resultado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }
        else {
            return res.json({
                ok: true,
                msj: 'El producto se ha asociado al pedido correctamente!'
            });
        }
    });
});
//Registrar pedido y sus productos
router.post('/addNewOrder', (req, res) => {
    var date = new Date();
    let allData = req.body;
    const queryInsertPedido = `
    INSERT INTO pedidos (
        hora_registro, 
        hora_envio,
        hora_cierre,
        ncliente,
        nproductos,
        sucursal,
        observaciones,
        repartidor, 
        importe_total, 
        pagan_con, 
        nutra_cajero, 
        fecha, 
        edo, 
        edo1,
        edo2
        ) VALUES ('${moment().format('hh:mm:ss')}', '${moment().format('hh:mm:ss')}', '${moment().format('hh:mm:ss')}',
        '${allData.idUsuario}', '${allData.cantidadProductos}', '${allData.sucursal}',
        'Ninguna', 'Ninguno', '${allData.importeTotal}', '${allData.pagaCon}',
        'ninguno', '${new Date()}', 1, '${allData.aDomicilio}', 0);

    `;
    console.log(allData);
    mysql_1.default.ejecutarQuery(queryInsertPedido, (err, resultado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }
        else {
            return res.json({
                ok: true,
                msj: 'El pedido se ha registrado correctamente',
                idPedido: resultado.insertId
            });
        }
    });
});
//Agregar información de usuario
router.post('/registerUserInfo', (req, res) => {
    let allData = req.body;
    const queryInsertUser = `
    INSERT INTO cliente (nombre, calle, colonia, ciudad, estado, cp, telefono, correo, nEquipo, edo)
    VALUES (
        '${allData.nombre}', '${allData.calle}', '${allData.colonia}',
        '${allData.ciudad}', '${allData.estado}', '${allData.cp}', '${allData.telefono}',
        '${allData.correo}', '${allData.nEquipo}', '${allData.edo}');
    `;
    const queryUpdateStateEquipo = `
    UPDATE equipo SET edo = 3 WHERE identificadorCel = '${allData.nEquipo}'
    `;
    console.log(allData);
    mysql_1.default.ejecutarQuery(queryInsertUser, (err, resultado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }
        else {
            mysql_1.default.ejecutarQuery(queryUpdateStateEquipo, (errU, resultadoU) => {
                if (err) {
                    console.log('error: ', errU);
                    return res.status(400).json({
                        ok: false,
                        error: err
                    });
                }
                else {
                    console.log('True:::: ', resultadoU);
                    return res.json({
                        ok: true,
                        msj: 'Usuario agregado correctamente, estado en equipo actualizado correctamente'
                    });
                }
            });
        }
    });
});
//validar codigo de verificación y actualizar estado
router.post('/validateCodeToDeviceId/:deviceId/:codeSms', (req, res) => {
    console.log('req: ', req.params);
    const deviceId = req.params.deviceId;
    const codeSms = req.params.codeSms;
    const scapedDeviceId = mysql_1.default.instance.cnn.escape(deviceId);
    const scapedCodeSms = mysql_1.default.instance.cnn.escape(codeSms);
    const queryIfExistDevideId = `SELECT * FROM equipo WHERE identificadorCel = ${scapedDeviceId} AND codigo = ${scapedCodeSms}`;
    const queryUpdateDeviceId = `
    UPDATE equipo  SET edo = 2 WHERE identificadorCel = ${scapedDeviceId} AND codigo = ${scapedCodeSms};
    `;
    mysql_1.default.ejecutarQuery(queryIfExistDevideId, (err, resultado) => {
        if (err) {
            console.log('Sucedio un error: ', err);
            if (err === 'El registro solicitado no existe') {
                return res.json({
                    ok: false,
                    resultado,
                    msj: 'No existe informacion con estos datos'
                });
            }
        }
        else {
            mysql_1.default.ejecutarQuery(queryUpdateDeviceId, (errD, resultadoD) => {
                if (errD) {
                    console.log('Error en consulta aninada: ', err);
                    return res.status(400).json({
                        ok: false,
                        error: err
                    });
                }
                else {
                    console.log('todo sin errores');
                    return res.json({
                        ok: true,
                        msj: 'Estado actualizado correctamente',
                        resultadoD
                    });
                }
            });
        }
    });
});
//Sucursales
router.get('/sucursales', (req, res) => {
    const query = `
    select * from sucursales
    `;
    mysql_1.default.ejecutarQuery(query, (err, resultado) => {
        if (err) {
            res.status(400).json({
                ok: true,
                error: err
            });
        }
        else {
            res.json({
                ok: true,
                sucursales: resultado
            });
        }
    });
});
router.get('/sucursal/:id', (req, res) => {
    const id = req.params.id;
    const scapedId = mysql_1.default.instance.cnn.escape(id);
    const query = `
    select * from sucursales
    where nsucursal = ${scapedId}
    `;
    mysql_1.default.ejecutarQuery(query, (err, resultado) => {
        if (err) {
            res.status(400).json({
                ok: true,
                error: err
            });
        }
        else {
            res.json({
                ok: true,
                resultado
            });
        }
    });
});
//Secciones
router.get('/secciones/:sucursal', (req, res) => {
    let sucursal = req.params.sucursal;
    const query = `
    SELECT * FROM secciones WHERE sucursal = '${sucursal}'
    `;
    mysql_1.default.ejecutarQuery(query, (err, resultado) => {
        if (err) {
            res.status(400).json({
                ok: true,
                error: err
            });
        }
        else {
            res.json({
                ok: true,
                secciones: resultado
            });
        }
    });
});
//productos
router.get('/getProductosBySeccion/:idSeccion', (req, res) => {
    let idSeccion = req.params.idSeccion;
    const query = `
    SELECT * FROM productos WHERE seccion = '${idSeccion}'
    `;
    mysql_1.default.ejecutarQuery(query, (err, resultado) => {
        if (err) {
            res.status(202).json({
                ok: true,
                error: err
            });
        }
        else {
            res.json({
                ok: true,
                productos: resultado
            });
        }
    });
});
//Galeria
router.get('/getImagenes', (req, res) => {
    const query = `
    select * from galeria
    `;
    mysql_1.default.ejecutarQuery(query, (err, resultado) => {
        if (err) {
            res.status(400).json({
                ok: true,
                error: err
            });
        }
        else {
            res.json({
                ok: true,
                imagenes: resultado
            });
        }
    });
});
router.get('/getImagen/:id', (req, res) => {
    const id = req.params.id;
    const scapedId = mysql_1.default.instance.cnn.escape(id);
    const query = `
    select * from galeria
    where idgaleria = ${scapedId}
    `;
    mysql_1.default.ejecutarQuery(query, (err, resultado) => {
        if (err) {
            res.status(400).json({
                ok: true,
                error: err
            });
        }
        else {
            res.json({
                ok: true,
                imagen: resultado
            });
        }
    });
});
router.get('/getDevice/:idDispositivo', (req, res) => {
    const idDispositivo = req.params.idDispositivo;
    const scapedIdDispositivo = mysql_1.default.instance.cnn.escape(idDispositivo);
    const query = `
    select * from equipo
    where identificadorCel = ${scapedIdDispositivo}
    `;
    mysql_1.default.ejecutarQuery(query, (err, resultado) => {
        if (err) {
            res.status(202).json({
                ok: true,
                error: err,
                edo: 0
            });
        }
        else {
            res.json({
                ok: true,
                edo: resultado[0].edo
            });
            // const queryUser = `SELECT * FROM cliente WHERE nEquipo = '${resultado[0].identificadorCel}'`;
            // MySqlClass.ejecutarQuery(queryUser, (errU: any, resultadoU: any) => {
            //     if(err) {
            //         res.status(202).json({
            //             ok: true,
            //             error: err, :D
            //             edo: 0
            //         });
            //     } else {
            //         res.json({
            //             ok: true,
            //             edo: resultado[0].edo,
            //             idUsuario: resultadoU[0].ncliente
            //         });
            //     }
            // });
        }
    });
});
//enviar sms con codigo
router.post('/addDeviceId/:deviceId/:celular', (req, res) => {
    const deviceId = req.params.deviceId;
    const celular = req.params.celular;
    const scapedDeviceId = mysql_1.default.instance.cnn.escape(deviceId);
    const codeToSms = utilidades.codeToSMS(4);
    const queryIfExistDevideId = `SELECT * FROM equipo WHERE identificadorCel = ${scapedDeviceId}`;
    const queryInsertNewDeviceId = `
    INSERT INTO equipo (identificadorCel, codigo, edo) VALUES (${scapedDeviceId}, ${mysql_1.default.instance.cnn.escape(codeToSms)}, 1);
    `;
    const queryUpdateCodeInDeviceId = `
    UPDATE equipo set codigo = ${mysql_1.default.instance.cnn.escape(utilidades.codeToSMS(4))}, edo = 1
    `;
    mysql_1.default.ejecutarQuery(queryIfExistDevideId, (err, resultado) => {
        if (err) {
            if (err === 'El registro solicitado no existe') {
                console.log(err);
                mysql_1.default.ejecutarQuery(queryInsertNewDeviceId, (errD, resultadoD) => {
                    if (errD) {
                        return res.status(400).json({
                            ok: false,
                            error: err
                        });
                    }
                    else {
                        let mensaje = `Bienvenido a El Filon, su codigo de verificación es: ${codeToSms}`;
                        nexmo.message.sendSms('El Filon', celular, (errNexmo, responseData) => {
                            if (errNexmo) {
                            }
                            else {
                                return res.json({
                                    ok: true,
                                    msj: 'Registro creado correctamente',
                                    responseData
                                });
                            }
                        });
                    }
                });
            }
        }
        else {
            mysql_1.default.ejecutarQuery(queryUpdateCodeInDeviceId, (errU, resultadoU) => {
                if (errU) {
                    return res.status(400).json({
                        ok: false,
                        error: err
                    });
                }
                else {
                    return res.json({
                        ok: true,
                        msj: 'Registro actualizado correctamente'
                    });
                }
            });
        }
    });
});
exports.default = router;
