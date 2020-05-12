import { Router, Request, Response, request } from "express";
import MySqlClass from '../mysql/mysql';
const moment = require('moment');
const utilidades = require('../utilidades/funciones');
const router = Router();

//Registrar productos
router.post('/addProductToOrder', (req: Request, res: Response) => {
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
    MySqlClass.ejecutarQuery(queryInsertPedido, (err: any, resultado: any) => {
            if(err) {
                return res.status(400).json({
                ok: false,
                error: err
            });
        } else {
            return res.json({
                ok: true,
                msj: 'El producto se ha asociado al pedido correctamente!'
            });
            
        }
    });
});


//Registrar pedido y sus productos
router.post('/addNewOrder', (req: Request, res: Response) => {
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
    MySqlClass.ejecutarQuery(queryInsertPedido, (err: any, resultado: any) => {
            if(err) {
                return res.status(400).json({
                ok: false,
                error: err
            });
        } else {
            return res.json({
                ok: true,
                msj: 'El pedido se ha registrado correctamente',
                idPedido: resultado.insertId
            });
            
        }
    });
});

//Agregar información de usuario
router.post('/registerUserInfo', (req: Request, res: Response) => {
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
    MySqlClass.ejecutarQuery(queryInsertUser, (err: any, resultado: any) => {
            if(err) {
                return res.status(400).json({
                ok: false,
                error: err
            });
        } else {
            MySqlClass.ejecutarQuery(queryUpdateStateEquipo, (errU: any, resultadoU: any) => {
                if(err) {
                    return res.status(400).json({
                    ok: false,
                    error: err
                });
            } else {
                return res.json({
                    ok: true,
                    msj: 'Usuario agregado correctamente, estado en equipo actualizado correctamente'
                });
            }
            });
            
        }
    });
});


//enviar sms con codigo
router.post('/addDeviceId/:deviceId', (req: Request, res: Response) => {
    const deviceId = req.params.deviceId;
    const scapedDeviceId = MySqlClass.instance.cnn.escape(deviceId);
    const queryIfExistDevideId = `SELECT * FROM equipo WHERE identificadorCel = ${ scapedDeviceId }`;
    const queryInsertNewDeviceId = `
    INSERT INTO equipo (identificadorCel, codigo, edo) VALUES (${ scapedDeviceId }, ${ MySqlClass.instance.cnn.escape(utilidades.codeToSMS(4)) }, 1);
    `;
    const queryUpdateCodeInDeviceId = `
    UPDATE equipo set codigo = ${ MySqlClass.instance.cnn.escape(utilidades.codeToSMS(4))}, edo = 1
    `;
    MySqlClass.ejecutarQuery(queryIfExistDevideId, (err: any, resultado: any) => {
        if(err) {
            if(err === 'El registro solicitado no existe') {
                console.log(err);
                MySqlClass.ejecutarQuery(queryInsertNewDeviceId, (errD: any, resultadoD: any) => {
                    if(errD) {
                        return res.status(400).json({
                        ok: false,
                        error: err
                    });
                } else {
                    return res.json({
                        ok: true,
                        msj: 'Registro creado correctamente'
                    });
                }
            });
            }
        } else {
            MySqlClass.ejecutarQuery(queryUpdateCodeInDeviceId, (errU: any, resultadoU: any) => {
                if(errU) {
                    return res.status(400).json({
                    ok: false,
                    error: err
                });
            } else {
                return res.json({
                    ok: true,
                    msj: 'Registro actualizado correctamente'
                });
            }
        });
        }

    });
});
//validar codigo de verificación y actualizar estado
router.post('/validateCodeToDeviceId/:deviceId/:codeSms', (req: Request, res: Response) => {
    const deviceId = req.params.deviceId;
    const codeSms = req.params.codeSms;
    const scapedDeviceId = MySqlClass.instance.cnn.escape(deviceId);
    const scapedCodeSms = MySqlClass.instance.cnn.escape(codeSms);
    const queryIfExistDevideId = `SELECT * FROM equipo WHERE identificadorCel = '${ scapedDeviceId }' AND codigo = '${scapedCodeSms}'`;
    const queryUpdateDeviceId = `
    UPDATE equipo  SET edo = 2 WHERE identificadorCel = ${ scapedDeviceId } AND codigo = ${ scapedCodeSms};
    `;
    MySqlClass.ejecutarQuery(queryIfExistDevideId, (err: any, resultado: any) => {
        if(err) {
            if(err === 'El registro solicitado no existe') {
                return res.json({
                    ok: false,
                    resultado,
                    msj: 'No existe informacion con estos datos'
                });
            }
        } else {
            console.log(err);
                MySqlClass.ejecutarQuery(queryUpdateDeviceId, (errD: any, resultadoD: any) => {
                    if(errD) {
                        return res.status(400).json({
                        ok: false,
                        error: err
                    });
                } else {
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
router.get('/sucursales', (req: Request, res: Response) => {
    const query = `
    select * from sucursales
    `;
    MySqlClass.ejecutarQuery(query, (err: any, resultado: Object[]) => {
        if(err) {
            res.status(400).json({
                ok: true,
                error: err
            });
        } else {
            res.json({
                ok: true,
                sucursales: resultado
            });
        }

    });
});

router.get('/sucursal/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    const scapedId = MySqlClass.instance.cnn.escape(id);
    const query = `
    select * from sucursales
    where nsucursal = ${scapedId}
    `;
    MySqlClass.ejecutarQuery(query, (err: any, resultado: Object[]) => {
        if(err) {
            res.status(400).json({
                ok: true,
                error: err
            });
        } else {
            res.json({
                ok: true,
                resultado
            });
        }

    });
});

//Secciones
router.get('/secciones/:sucursal', (req: Request, res: Response) => {
    let sucursal = req.params.sucursal;
    const query = `
    SELECT * FROM secciones WHERE sucursal = '${sucursal}'
    `;
    MySqlClass.ejecutarQuery(query, (err: any, resultado: Object[]) => {
        if(err) {
            res.status(400).json({
                ok: true,
                error: err
            });
        } else {
            res.json({
                ok: true,
                secciones: resultado
            });
        }

    });
});

//productos
router.get('/getProductosBySeccion/:idSeccion', (req: Request, res: Response) => {
    let idSeccion = req.params.idSeccion;
    const query = `
    SELECT * FROM productos WHERE seccion = '${idSeccion}'
    `;
    MySqlClass.ejecutarQuery(query, (err: any, resultado: Object[]) => {
        if(err) {
            res.status(202).json({
                ok: true,
                error: err
            });
        } else {
            res.json({
                ok: true,
                productos: resultado
            });
        }

    });
});
//Galeria
router.get('/getImagenes', (req: Request, res: Response) => {
    const query = `
    select * from galeria
    `;
    MySqlClass.ejecutarQuery(query, (err: any, resultado: Object[]) => {
        if(err) {
            res.status(400).json({
                ok: true,
                error: err
            });
        } else {
            res.json({
                ok: true,
                imagenes: resultado
            });
        }

    });
});

router.get('/getImagen/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    const scapedId = MySqlClass.instance.cnn.escape(id);
    const query = `
    select * from galeria
    where idgaleria = ${scapedId}
    `;
    MySqlClass.ejecutarQuery(query, (err: any, resultado: Object[]) => {
        if(err) {
            res.status(400).json({
                ok: true,
                error: err
            });
        } else {
            res.json({
                ok: true,
                imagen: resultado
            });
        }

    });
});

// 0 no registrado
// 1 en espera de que ingrese su codigo de verificacion
// 2 registrado exitosamente
router.get('/getDevice/:idDispositivo', (req: Request, res: Response) => {
    const idDispositivo = req.params.idDispositivo;
    const scapedIdDispositivo = MySqlClass.instance.cnn.escape(idDispositivo);
    const query = `
    select * from equipo
    where identificadorCel = ${scapedIdDispositivo}
    `;
    const queryUser = ``
    MySqlClass.ejecutarQuery(query, (err: any, resultado: any) => {
        if(err) {
            res.status(202).json({
                ok: true,
                error: err,
                edo: 0
            });
        } else {
            const queryUser = `SELECT * FROM cliente WHERE nEquipo = ${resultado[0].identificadorCel}`
            MySqlClass.ejecutarQuery(queryUser, (errU: any, resultadoU: any) => {
                if(err) {
                    res.status(202).json({
                        ok: true,
                        error: err,
                        edo: 0
                    });
                } else {
                    res.json({
                        ok: true,
                        edo: resultado[0].edo,
                        idUsuario: resultadoU[0].ncliente
                    });
                }
            });
            
        }

    });
});

router.post('/newDevice', (req: Request, res: Response) => {
    //identificadorCel, codigo, edo
});

export default router;