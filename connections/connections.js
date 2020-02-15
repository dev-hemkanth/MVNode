const sql = require('mssql');
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
        user: 'mvdiabetesusr',
        password: '5ovFpf1M9Z8E1Nsp',
        server: 'shop.mvdiabetes.com',
        database: 'mvdiabetes'
    });

    return conn;
}

module.exports = connect;