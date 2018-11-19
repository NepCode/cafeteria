require('./config/config');

const express = require('express');
const mongoose = require('mongoose');

const app = express();

const bodyParser = require('body-parser');


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

app.use(require('./routes/usuario'));

var port = process.env.PORT || 3000;




mongoose.connect(process.env.URLDB, { useNewUrlParser: true}, (err, res) => {

    if ( err ) throw err;
    console.log('db running...');

});


app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto: ', port );
});