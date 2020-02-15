const express = require("express");
const payment = require("../cotroller/payment_controller")
const payUMoney = require('payumoney-node');
const router = express.Router();
payUMoney.setKeys("30U733", "IJRp5veR", "MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCsdXzzDyB82pH2xljIi788RogyYIXNnZ/VT8C4j6PPVSdmINNvHpTqSsYeqsvB2jLKY7kc9kc43qyAJeQbcc0cWO4i5FCT+Q+jIeC+lk5RMfmrEI1X7jF2RKfFJfhLxQVfBatdI7zbdpJp/K0ebhjUKU8FZQDK4iXbTWqLGKjTXqfZZO7Le8vF3Ib51tYgdhyvYQELTTaSDmw1FZI/yF18zDmz6ugMV4llTAFiZiinvRskY/B549L7870vl9NrzHeFY7lQrdAJazp22InUnNiCY+RnYwRELtYRNiVMTuvSahpoUQc841jobt/r65mF0bGebVtPt+VjCmfHill+MuvTAgMBAAECggEAJXeI481fg4CAwZop47fonhG8uSUbLKaX+OHQvsgGEJ8xZhCvnq6IL7Z7AGKezci3zByKNO6UXpiR5W1V91hr9UKkydPMZblwWkKb7wv8i8tNsIpyCq5m9IjJ4hzzqpJtLk2vAxcmio9iE8CfY8MLhdxLnKJq36juDIzvHrUGyJSmj9++RZHP4jjhCdDRkJr9TodXG95WugLAt2uw62H5kxsbonjBWjyPO0sO5h92OUWCWUOnfV9bAskklcOti5PhkcD4M+76z6IDnE8N0Ce+5VpdCJeA8j156SkguofU6/kslVSvm2UMtAu7rFmacWqJENblqkX+eJjlmjLTQdUOEQKBgQDYfzXYX3iS2NcAj/BWJ0iSSJ5ZQohSZcG84HLyMYaFhd2H3HwE5WsWpQfsJ3VFQloxG6WGg3qbAVLrkhmb6N7KLu8ZRHN7m8IVnBQJPyCC7nWkxPA4+v5WWv3qgngC8tkX/ezjm4J9HM5cuuMyOqj8EqCGpjjI7MxH1C9v5PlAxwKBgQDL7TglnASQDnyaLeKzAtdYiI0eCQos/Gj48BVeKE/sOgWNUEm+Ygsq8PyXPaGpc3zP8vzmJnl3OvVDs0e2tzmIRPghz8H1Ox8278rUPclzJzyQD2XbVCZRx39uwcY76KBtItf8XEmEyckCM326IJnCUrtqvRCg2zrigtQJMhYIlQKBgB4LcWaIwUvnydarIxhhtUGP0GHkyNReiMd0gp833kpTbI35PEDVscnftzy/sReegLPF+W+0eWRfh6lniiRH6fs3Djl8dWZXFFU5ZtJtr05cV3k5V3kg5AEJ+aj82DjYiOY6eBCSOUaxo7XcvcDvwRnSX/KvyLuhmSvyt26Y4TprAoGALUPLibWW4a8Fg2eaAWgpCrLMuBUDmDayykboR00laGb8ooBmzgaPOgnh12RLxQQoeTQTZLa3kXqZxFxAF9OVxqSge0jVYays4hHZ8MCCPbhA3i08y7FjDBX/OEN00AlzyqXIUXDetMXhg0aQqsbful2I0kmDLmFbMboefKgMcf0CgYAyTUqfWH4q1oxJqAoDHtrq8kNag4asbfnD0oHgWtmLiatPjVZE8JG/o+o3obXDKBJnYWnoclILeY0vht47MGPy6ujt+kbiXSlSZpzhoNTiQFxEQXaVnziaC4egg5w/omKqLSx/UPbl/DEd4IxweDsbEsQb3iEkgUj7YBZz6B9XgA==")
payUMoney.isProdMode(true);

router.post("/pay", async function (req, res)  {
  //  console.log(req.body);
    
    try  {
      await  payUMoney.pay(req.body) , async function (err , result) {
          if(err) {
                throw error;
          } else {
            return res.status(200).send({status: true, result: result});
          }
      }
      
    }   catch(error) {
        console.log(err);
        
        return  res.status(400).send({status: true, result: "Payment failed"});
    }
});



 router.post("/success", function (res , err)   {
    console.log("Payment Success");
    console.log("Payment Details : " + JSON.stringify(paymentSuccessBody));
    // You can Update your user payment Success status here
    res.status(200).send({status: true, result: "Payment Success"});
});

router.post("/failure", function (res ,err)  {
    console.log("Payment Failure");
    console.log("Payment Details : " + JSON.stringify(paymentFailureBody));
    // You can Update your user payment Failure status here
    res.status(200).send({status: true, result: "Payment failed"});
   
});
 
module.exports = router; 