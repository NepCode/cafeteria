const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');


// default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', function(req, res) {


    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'there is no any file selected'
                }
            });
    }

    //check type
    let typesAllowed = ['producto', 'usuario'];
    if (typesAllowed.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'please, select a valid type such: ' + typesAllowed.join(','),
            }
        });
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let archivo = req.files.archivo;
    let nameArchivo = archivo.name.split('.');
    let extFile = nameArchivo[nameArchivo.length - 1];

    //allowed ext
    let pathExt = ['png', 'jpg', 'gif', 'jpeg'];

    if (pathExt.indexOf(extFile) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'please, select a valid image with extension: ' + pathExt.join(','),
                ext: extFile
            }
        });
    }


    //changing file's name
    let fileName = `${ id }-${ new Date().getMilliseconds()}.${extFile}`;



    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${ tipo }/${ fileName }`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });

        //updating igm field mongodb
        /* 
                res.json({
                    ok: true,
                    message: 'image was uploaded successfuly'
                });
         */

        if (tipo === 'usuario') {
            imagenUsuario(id, res, fileName);
        } else {
            imagenProducto(id, res, fileName);
        }

    });


});

app.put('/upload2', function(req, res) {

    if (Object.keys(req.files).length == 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.archivo;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv('./uploads/filename.jpg', function(err) {
        if (err)
            return res.status(500).send(err);

        res.send('File uploaded!');
    });

});




function imagenUsuario(id, res, fileName) {

    Usuario.findById(id, (err, usuarioDB) => {


        if (err) {
            deleteFile(fileName, 'usuario')

            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!usuarioDB) {
            deleteFile(fileName, 'usuario')
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'user does not exist'
                }
            });
        }


        /*    let pathImg = path.resolve(__dirname, `../../uploads/usuario/${usuarioDB.img}`);
           //if img exists
           if (fs.existsSync(pathImg)) {
               //deleting last img
               fs.unlinkSync(pathImg);
           } */

        deleteFile(usuarioDB.img, 'usuario');

        usuarioDB.img = fileName;
        usuarioDB.save((err, usuarioGuardado) => {

            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: fileName
            });
        });
    });
}


function imagenProducto(id, res, fileName) {

    Producto.findById(id, (err, productoDB) => {


        if (err) {
            deleteFile(fileName, 'producto')
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!productoDB) {
            deleteFile(fileName, 'producto')
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'product does not exist'
                }
            });
        }


        deleteFile(productoDB.img, 'producto');

        productoDB.img = fileName;
        productoDB.save((err, productoGuardado) => {

            res.json({
                ok: true,
                producto: productoGuardado,
                img: fileName
            });
        });
    });
}



function deleteFile(nombreImg, tipo) {

    let pathImg = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImg}`);
    //if img exists
    if (fs.existsSync(pathImg)) {
        //deleting last img
        fs.unlinkSync(pathImg);
    }

}

module.exports = app;