const express = require('express');

let { verificaToken } = require('../middlewares/autenticacion');

let app = express();

let Producto = require('../models/producto');



// ============================
// get all products 
// ============================
app.get('/producto', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        //.limit(5)
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err: err
                })
            }

            /*  Producto.count({}, (err, conteo) => {
                 res.json({
                     ok: true,
                     productos: productos,
                     count: conteo
                 });
             }) */

            res.json({
                ok: true,
                productos: productos
            });



        })
});

// ============================
// get product by ID 
// ============================
app.get('/producto/:id', verificaToken, (req, res) => {
    // Categoria.findById(....); populate usuario y categoria

    let id = req.params.id;

    //Categoria.findById(id, (err, categoriaDB) => {
    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El ID no existe'
                    }
                });
            }


            res.json({
                ok: true,
                producto: productoDB
            });

        });


});


// ===========================
//  Buscar productos
// ===========================
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {


            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            })

        })


});



// ============================
// create product 
// ============================
app.post('/producto', verificaToken, (req, res) => {

    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id
    });


    producto.save((err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        });


    });


});




// ============================
// update product
// ============================
app.put('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    let bodyProducto = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    };

    /*   Producto.findByIdAndUpdate(id, bodyProducto, { new: true, runValidators: true }, (err, productoDB) => {

          if (err) {
              return res.status(500).json({
                  ok: false,
                  err
              });
          }

          if (!productoDB) {
              return res.status(400).json({
                  ok: false,
                  err: {
                      message: 'there is no such product'
                  }
              });
          }

          res.json({
              ok: true,
              producto: productoDB
          });

      }); */

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'there is no such product'
                }
            });
        }


        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.descripcion;

        productoDB.save((err, productoGuardado) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }


            res.json({
                ok: true,
                producto: productoGuardado
            });

        });

    });

});



// ============================
// delete product
// ============================
app.delete('/producto2/:id', [verificaToken], function(req, res) {

    let id = req.params.id; // param url
    const productObj = {
        disponible: false
    };

    Producto.findByIdAndUpdate(id, productObj, { new: true }, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err: err
            })
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    })

});

app.delete('/producto/:id', [verificaToken], function(req, res) {

    let id = req.params.id; // param url


    Producto.findById(id, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err: err
            })
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'there is no such product'
                }
            });
        }

        productoDB.disponible = false;

        productoDB.save((err, productoBorrado) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err: err
                });
            }

            res.json({
                ok: true,
                producto: productoBorrado,
                message: 'product was removed'

            });
        })

    });

});

module.exports = app;