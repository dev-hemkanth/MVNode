const sql = require('mssql');
require('dotenv').config()

const connect = () => {
//demo

    // const conn = new sql.ConnectionPool({
    //     user: 'mvdiabetesdemousr',
    //     password: 'pbaPeo7xJ5HayeOa',
    //     server: 'shopdemo.mvdiabetes.com',
    //     database: 'mvdiabetesdemo'
    // });
    
  //  live
    const conn = new sql.ConnectionPool({
        user: process.env.user,
        password: process.env.password,
        server: process.env.server,
        database: process.env.database
    });

    return conn;
}

module.exports = connect;