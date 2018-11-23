const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require('../models/usuario');
const app = express();


app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne( {email:body.email}, (err, usuarioDB) => {

        //any error 
        if(err) {
            return res.status(500).json({
                ok:false,
                err
            });
        }

        //wrong user 
        if(!usuarioDB) {
            return res.status(400).json({
                ok:false,
                err: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }

         //wrong password
        if (!bcrypt.compareSync (body.password, usuarioDB.password )) {
            return res.status(400).json({
                ok:false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
        }

        let token = jwt.sign({
            usuario: usuarioDB,
        
        }, process.env.AUTH_SEED, { expiresIn: process.env.EXPIRATION_DATE });

        res.json({
            ok:true,
            usuario: usuarioDB,
            token: token
        });



    });
    

});


//conf google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return{
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
  }
  //verify().catch(console.error);




  //asynchronus function
app.post('/google', async (req, res) => {

    let token = req.body.idtoken;

    //verify(token);

    /* res.json({
        token: token
    }); */

    let googleUser = await verify(token) //promise
                        .catch( e => {
                            return res.status(403).json({
                                ok:false,
                                err: e
                            });
                        });

    Usuario.findOne({ email: googleUser.email}, (err, usuarioDB) => {
        
        //internal error
        if(err) {
            return res.status(500).json({
                ok:false,
                err
            });
        }

        //if user exists with that email
        if( usuarioDB ) {

            //it was authenticate through google?
            if(usuarioDB.google === false) { //nope
                //user is already signed up without google
                return res.status(400).json({
                    ok:false,
                    err: {
                        message: 'please login with email and password'
                    }
                });

            } else {
                //this user was previusly authenticate through google
                //refresh Gtoken
                let token = jwt.sign({
                    usuario: usuarioDB,

                },  process.env.AUTH_SEED, { expiresIn: process.env.EXPIRATION_DATE });

                return res.json({ //status 200 by default
                    ok:true,
                    usuario: usuarioDB,
                    token
                });

            }

        } else {
            //user doesn´t exist in DB, inserting new user in DB for first time
            let usuario = new Usuario();
            //let usuario = new Usuario({});

            usuario.nombre  = googleUser.nombre;
            usuario.email  = googleUser.email;
            usuario.img  = googleUser.img;
            usuario.google  = true;
            usuario.password  = ':)';

            usuario.save((err, usuarioDB) => {

                 //internal error
                if(err) {
                    return res.status(500).json({
                        ok:false,
                        err
                    });
                }

                let token = jwt.sign({
                    usuario: usuarioDB,

                },  process.env.AUTH_SEED, { expiresIn: process.env.EXPIRATION_DATE });

                return res.json({ //status 200 by default
                    ok:true,
                    usuario: usuarioDB,
                    token
                });

            });
        }

    });

   /*  res.json({
        usuario: googleUser
    }); */
 
    

});








module.exports = app;