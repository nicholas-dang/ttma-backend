const { respond, error } = require("../utils");
const jwt = require('jsonwebtoken');

//generate OTP Token
function generateToken(uid) {
    const secretKey = 'Ps2320';

    //add 1 day to the expiry Date
    var expiryDate = new Date();
    console.log(expiryDate);
    expiryDate.setDate(expiryDate.getDate() + 1);
    console.log(expiryDate);
    
    //create the data
    var data = {
        UserID:uid,
        expiryAt:expiryDate
    };

    //return the encrypted token
    return jwt.sign(data,secretKey); 
}

//check if token is still valid
function verifyToken(req,res) {
    var token = req.headers['authorization'];
    if (token === undefined) {
      //token doesnt exist
      respond(res, 500, {
        message: 'Error: your Login have expired',
        result: -2,
      });
      return -1;
    }
    else {
      var currentDate = new Date();
      const secretKey = 'Ps2320';
      const bearer = token.split(' ');
      //check if there exist "Bearer" as the first word, then get the token (bearer[1])
      if (bearer[0] == "Bearer") {
        const bearerToken = bearer[1];
        //check if secret key is correct
        try {
          var data = jwt.verify(bearerToken,secretKey);
          //check if token is expired
          if (Date.parse(data.expiryAt) > Date.parse(currentDate)) {
            return data.UserID;
          }
          else {
            respond(res, 201, {
              message: 'Error: your Login have expired',
              result: -2,
            });
              return -1;
          }
        }
        catch (err) {
          respond(res, 500, {
            message: 'Error: your Login have expired',
            result: -2,
          });
          return -1;
        }

      }
    }
}   
  
  module.exports = {generateToken,verifyToken};