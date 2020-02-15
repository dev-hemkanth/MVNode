const router = require('express').Router();
const sql = require('mssql');
const axios = require('axios');
const conn = require('../connections/connections')();


// send sms - otp
async function sendSms(to, message) {
    let res = await axios.post(`http://hpsms.dial4sms.com/api/web2sms.php?username=mvhospds&password=Admin@15&to=${to}&sender=MVHOSP&message=${message}`);
    if (res.status == 200) return true;
    return false;
}

// register
router.post('/User', async (req, res) => {
 
    try {
        // refernce
        
        const table = req.body.table;
        const _phone_number = req.body.data.phone_number;

        if(!_phone_number || _phone_number == '' || _phone_number == null) return res.status(400).send({status: false, result: 'Phone number can\'t be empty'})
        let keys = Object.keys(req.body.data);
        keys.push('otp');
        const values = Object.values(req.body.data);
        const randomOtpDigit = Math.floor(1000 + Math.random() * 9000);
        let tempvalue = '';
       
        

        // single value insert
        for (let i = 0; i < values.length; i++) {
            tempvalue = (typeof values[i] == Number) ? (i == 0) ? values[i].toString() : tempvalue.toString() + ", " + values[i].toString() : (i == 0) ? "'" + values[i].toString() + "'" : tempvalue.toString() + ", '" + values[i].toString() + "'";
        }
        tempvalue = '(' + tempvalue + ',' + randomOtpDigit +')';
        
        // query
        const query = `INSERT INTO [${table}] (${keys.toString()}) VALUES ${tempvalue} SELECT SCOPE_IDENTITY() as ID;`

        // save data
        let pool = await  conn.connect();
        let result = await pool.request().query(query);

        // send otp sms
        const sms_status = sendSms(_phone_number, `YOUR OTP IS ${randomOtpDigit}`);
        if(!sms_status) res.status(400).send({status: false, result: 'Successfully register but error sending sms'})

        pool.close();
        res.status(200).send({status: true, result: result.recordset});
    } catch(err) {
        conn.close();
        res.status(417).send({status: false, result: err})
    }
})

// login Auth
router.post ('/login', async (req, res) => {
    try {
        // refernce
        const table = req.body.table;
        const data = req.body.data;
        console.log(table,data);
        const randomOtpDigit = Math.floor(1000 + Math.random() * 9000);

        // query
        let query = `SELECT * FROM [${table}] WHERE phone_number=${data.phone_number}`;

        // fetch list && response
        let pool = await  conn.connect();
        let result = await pool.request().query(query);
        pool.close();

        if (result.recordset.length != 0) {

            // otp update
            query = `UPDATE [${table}] SET otp=${randomOtpDigit} WHERE phone_number=${data.phone_number}`
            // fetch list && response
            let pool = await  conn.connect();
            let resultOtp = await pool.request().query(query);
            pool.close();
            
            // send otp sms
            const sms_status = sendSms(data.phone_number, `YOUR OTP IS ${randomOtpDigit}`);
            if(!sms_status) res.status(400).send({status: false, result: 'error sending sms'})


        }
        const returnOtp = (result.recordset.length != 0) ? randomOtpDigit : ''
        res.status(200).send({status: true, result: result.recordset});

    } catch (error) {
        conn.close();
        res.status(417).send({status: false, result: err})
    }
});

// validate otp
router.post('/otp-validate', async (req, res) => {
    try {
        // refernce
        const table = req.body.table;
        const data = req.body.data;

        //query
        let query = `SELECT * FROM [${table}] WHERE phone_number=${data.phone_number} AND otp=${data.otp}`;

        // fetch list && response
        let pool = await  conn.connect();
        let result = await pool.request().query(query);
        pool.close();

        if (result.recordset.length != 0) {
            // otp update  
            query = `UPDATE [${table}] SET otp=NULL WHERE phone_number=${data.phone_number}`
            // fetch list && response
            let pool = await  conn.connect();
            let resultOtp = await pool.request().query(query);
            pool.close();
        }

        const returnAuthStatus = (result.recordset.length != 0) ? true : false;
        res.status(200).send({status: true, result: result.recordset, authStatus: returnAuthStatus});

    } catch (error) {
        conn.close();
        res.status(417).send({status: false, result: err})
    }
});

// List
router.post ('/', async (req, res) => {
    try {
       // console.log(req.body);
        


        // refernce
        const CategoryId = req.body.CategoryId
        const table = req.body.table;
        const sortProperty = req.body.sortProperty;
        const sortType = req.body.sortType;
        const skipCount = (req.body.skipCount !== null && req.body.skipCount !== '' && req.body.skipCount) ? req.body.skipCount : 0;
        const limitCount = (req.body.limitCount !== null && req.body.limitCount !== '' && req.body.limitCount) ? req.body.limitCount : 10;
        let pool =  await  conn.connect();
        // query
        let query=`SELECT * FROM [${table}]`;
         
        if (sortProperty !== '' && sortProperty !== null) 
   //   query=`SELECT * FROM [${table}] c LEFT JOIN ProductImages o ON c.ProductId = o.ProductId where status = 1 ORDER BY ${sortProperty} ${sortType} offset ${skipCount} rows fetch next ${limitCount} rows only`;
    
    query = `SELECT
        p.ProductId
      , c.ProductName
      , c.AddedOn
      , c.CategoryId
      , c.Price
      , MAX(p.Thumbimage) as Largeimage
      , MIN(p.Thumbimage) as Thumbimage
      FROM ProductImages p
      INNER JOIN [${table}] c 
          ON p.ProductId = c.ProductId where status = 1 
          and CategoryId IN (${CategoryId})
          GROUP BY p.ProductId , c.ProductName  , c.AddedOn , c.Price , c.CategoryId ORDER BY 
          ${sortProperty} ${sortType} offset ${skipCount} rows fetch next ${limitCount} rows only `;


          
         
        // fetch list && response
       // let pool =  await  conn.connect();
        let result = await pool.request().query(query);
        // var return_data = {};
        // return_data.table1 = result.recordset
        // let result2 = await pool.request().query(query2);
        // //return_data.table2 = result2.recordset
        // let value = "";
        // var item = result2.recordset[0]
        pool.close();
        res.status(200).send({status: true, result: result.recordset });
    } catch(err) {
        conn.close();
        res.status(417).send({status: false, result: err});
    }
});
// View
router.post('/Myorders', async (req, res) => {
    try {

        // refernce
       
        const id = req.body.Id;

        // query
        let query = `select * from OrderDetails o left join 
        ProductImages i ON o.ProductId = i.ProductId where OrderId = ${id}`
        //let query=`SELECT * FROM [${table}] WHERE ${refernce}=${id}`;
        
        // fetch list && response
        let pool = await  conn.connect();
        let result = await pool.request().query(query);
        pool.close();
        
        res.status(200).send({status: true, result: result.recordset});
    } catch(err) {
        conn.close();
        res.status(417).send({status: false, result: err});
    }
});


router.post(`/getProductDetails`, async (req,res) => {
    try {

        //  console.log(req.body);
          
  
          // refernce
          const table = req.body.table;
          const refernce = req.body.refernce;
          const id = req.body.Id;
   

        //  let query = `SELECT ma.ProductId, ma.ProductName, CONCAT(sm.Largeimage,sm.Largeimage) 
        //  as Product , CONCAT(so.ColorName,so.ColorName) as colors FROM Products ma
        //  LEFT JOIN ProductImages sm ON(ma.ProductId = sm.ProductId)
        //  LEFT JOIN ProductColors so ON(ma.ProductId = so.ProductId)
        //  WHERE ma.ProductId = 85
        //  GROUP BY ma.ProductId , ma.ProductName , so.ProductId , sm.Largeimage  , so.ColorName `;


        let query = `SELECT ProductName , ProductId ,
        Colors = STUFF  
        (  
            (  
              SELECT DISTINCT ','+ CAST(g.ColorName AS VARCHAR(MAX))  
              FROM ProductColors g,Products e   
              WHERE g.ProductId = e.ProductId and e.ProductId = t1.ProductId   
              FOR XMl PATH('')  
            ),1,1,''  
        ) ,
        Images = STUFF  
        (  
            (  
              SELECT DISTINCT ','+ CAST(g.Largeimage AS VARCHAR(MAX))  
              FROM ProductImages g,Products e   
              WHERE g.ProductId = e.ProductId and e.ProductId = t1.ProductId   
              FOR XMl PATH('')  
            ),1,1,''  
        ) ,
        Size = STUFF  
        (  
            (  
              SELECT DISTINCT ','+ CAST(g.Size AS VARCHAR(MAX))
              FROM ProductSizeDetails g,Products e   
              WHERE g.ProductId = e.ProductId and e.ProductId = t1.ProductId   
              FOR XMl PATH('')  
            ),1,1,''  
        ) 
        FROM Products t1  where ProductId =  ${id}
        GROUP BY ProductName ,  ProductId `


        // let query = `SELECT p.ProductName, p.ProductId
        // FROM Products p
        // LEFT JOIN 
        // (
        //     SELECT ps.ProductId , ps.Largeimage, ps.Thumbimage as images
        //     FROM ProductImages ps
        //     INNER JOIN 
        //     (
        //       SELECT ProductId, MIN(ColorName) as colors 
        //       FROM ProductColors
        //       GROUP BY ProductId
        //     ) ps2 
        //     ON (ps2.ProductId = ps.ProductId)
        // )a ON (a.ProductId = p.ProductId) where p.ProductId = 85`

          // query
        //   let query=`SELECT * FROM Products p   left join ProductImages i 
        //   ON p.ProductId = i.ProductId left join ProductSizeDetails s
        //   ON p.ProductId = s.ProductId left join ProductColors c  ON p.ProductId = c.ProductId
        //   where p.ProductId = ${id} ` ;
          
          // fetch list && response
          let pool = await  conn.connect();
          let result = await pool.request().query(query);
          pool.close();
  
          res.status(200).send({status: true, result: result.recordset});
      } catch(err) {
          conn.close();
          res.status(417).send({status: false, result: err});
      }
})


// View
router.post('/Product', async (req, res) => {
    try {

      //  console.log(req.body);
        

        // refernce
        const table = req.body.table;
        const refernce = req.body.refernce;
        const id = req.body.Id;

        // query
        let query=`SELECT * FROM [${table}] WHERE ${refernce}=${id}`;
        
        // fetch list && response
        let pool = await  conn.connect();
        let result = await pool.request().query(query);
        pool.close();
        res.status(200).send({status: true, result: result.recordset});
    } catch(err) {
        conn.close();
        res.status(417).send({status: false, result: err});
    }
});


// create
router.post('/Order', async (req, res) => {
    try {
        // refernce
        const table = req.body.table;
        const multipleInsert = req.body.multipleInsert;
        const keys = (multipleInsert) ? Object.keys(req.body.data[0]) : Object.keys(req.body.data);
        const values = Object.values(req.body.data);
        let tempvalue = '';

        // single value insert
        if (!multipleInsert) {
            for (let i = 0; i < values.length; i++) {
                tempvalue = (typeof values[i] == 'number') ? (i == 0) ? values[i].toString() : tempvalue.toString() + ", " + values[i].toString() : (i == 0) ? "'" + values[i].toString() + "'" : tempvalue.toString() + ", '" + values[i].toString() + "'";
            }
            tempvalue = '(' + tempvalue + ')';
        }
        // multiple value insert
        if (multipleInsert) {
            for (let i = 0; i < values.length; i++) {
            
                // store single value object process variable
                const temp_process_value = Object.values(values[i]);

                // single result value
                let temp_result_value = '';
                for (let j = 0; j < temp_process_value.length; j++) {
                    temp_result_value = (typeof temp_process_value[j] == 'number') ? (j == 0) ? temp_process_value[j].toString() : temp_result_value.toString() + ", " + temp_process_value[j].toString() : (j == 0) ? "'" + temp_process_value[j].toString() + "'" : temp_result_value.toString() + ", '" + temp_process_value[j].toString() + "'";
                }
                tempvalue += (i == values.length - 1) ? '(' + temp_result_value + ')' : '(' + temp_result_value + '),'
            }
        }

        // query
        const query = `INSERT INTO [${table}] (${keys.toString()}) VALUES ${tempvalue} SELECT SCOPE_IDENTITY() as ID;`

        // save data
        let pool = await  conn.connect();
        let result = await pool.request().query(query);

        pool.close();
        res.status(200).send({status: true, result: result.recordset});
    } catch(err) {
        conn.close();
        res.status(417).send({status: false, result: err})
    }
});

// update
router.put('/:ID', async (req, res) => {
    try {
        // refernce
        const table = req.body.table;
        const refernce = req.body.refernce;
        const id = req.params.ID;
        const keys = Object.keys(req.body.data);
        const values = Object.values(req.body.data);
        let tempvalue = '';

        for (let i = 0; i < keys.length; i++) { 
            tempvalue += (i < keys.length - 1) ?  (typeof values[i] == 'number') ? keys[i] + '=' + values[i] + ', ' : keys[i] + '=' + "'" + values[i] + "'" + ', ' : (typeof values[i] == Number) ? keys[i] + '=' + values[i] : keys[i] + '=' + "'" + values[i] + "'"
        }
         // query
        let query=`UPDATE ${table} SET ${tempvalue} WHERE ${refernce}=${id}`;
        console.log(query);

        // save data
        let pool = await  conn.connect();
        let result = await pool.request().query(query);
        pool.close();

        res.status(200).send({status: true, result: result.recordset});

    } catch (error) {
        conn.close();
        res.status(417).send({status: false, result: err})
    }
});
module.exports = router;