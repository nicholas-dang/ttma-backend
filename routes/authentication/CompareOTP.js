const { respond, error } = require("../utils");
const connection = require("../../dbconnection");
const bcrypt = require('bcryptjs');

//check if otp is matches
function compareOTP(email,otp,rep,res) {
    sql = "SELECT OTP, ExpiryDate FROM OTPAuth WHERE Email = (?);";
    connection.query(sql,[email],(err, results) => {
        if (!err) {
            if (results.length != 0) {
                var nowDate = new Date();
                //Check if OTP matches
                if (bcrypt.compareSync(otp,results[0].OTP)) {
                    //check if current date is not expired
                    if (nowDate < results[0].ExpiryDate) {
                        //if otp is not expired, return success message
                        var message = "Account has been validated";
                        respond(res, 201, 
                            {
                            message: message,
                            result: 0,
                            }
                        );   

                    }
                    else {
                        //if expired, return fail message
                        var message = "OTP has been expired";
                        respond(res, 201, 
                            {
                            message: message,
                            result: -1,
                            }
                        ); 
                    }
                }
                else {
                    //if otp does not match, return error
                    var message = "OTP does not match";
                    respond(res, 201, 
                        {
                        message: message,
                        result: -1,
                        }
                    ); 
                }
            }
            else {
                var message = "Failed to Retrieve OTP";
                console.log(message);
                respond(res, 201, 
                    {
                        message: message,
                        result: -1,
                    }
                );                     
            }
        }
    }); 
}


//wait for response requesting the OTP
function checkOTP(req, res) {
    if (req.method === "POST" && req.url === "/checkOTP") {
        let data = "";

        req.on("data", (chunk) => {
        data += chunk;
        });
  
        req.on("end", () => {
        try {
            const inputData = JSON.parse(data);

            //send response information to OTP compare function
            var Email = inputData.Email;
            var otp = inputData.OTPCode;
            compareOTP(Email,otp,req,res);
        } catch (error) {
            console.error(error);
            error(res, 400, "Invalid JSON data");
        }
        });
    } 
    else {
        error(res, 404, "Not Found");
    }
}

module.exports = checkOTP;