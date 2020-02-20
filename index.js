/**************************
* Project : MSSQL - API   *
* Author: hemkanth        *
* Date: 29-08-2019        *
**************************/

// Packages
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const sql = require('mssql');
const app = express();
require('dotenv').config()


// Assign port
const port = process.env.PORT || 8080; 

// Handler
process.setMaxListeners(0);
process.on('unhandledRejection', (error) => { console.log(`${new Date().toLocaleDateString()} - Unhandled Rejection, ${error}`) });
process.on('uncaughtException', (error) => { console.log(`${new Date().toLocaleDateString()} - Uncaught Exception, ${error}`) });


// Middelware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true, useNewUrlParser: true}));


// Routes
app.use('/api', require('./routes/routes'));
app.use('/api', require('./routes/payment_routes'))

 


// Listen
app.listen(port, () => console.log(`listening on port ${port}`));