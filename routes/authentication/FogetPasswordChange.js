const { respond, error } = require("../utils");
const connection = require("../../dbconnection");
const bcrypt = require('bcryptjs');

var salt = bcrypt.genSaltSync(10);

//change an emails password
function ForgetPasswordChange(req, res) {
    if (req.method === "POST" && req.url === "/ForgetPasswordChange") {
        let data = "";

        req.on("data", (chunk) => {
        data += chunk;
        });

        req.on("end", () => {
            try {
                const inputData = JSON.parse(data);

                //check if password field is correctly formated
                if (inputData.newPassword.length < 6 || inputData.newPassword.length > 18) {
                    var message = "Password length need to be between 6-18";
                    respond(res, 201, {
                        message: message,
                        result: -1,
                    });
                }
                //check if password matches
                else if (inputData.newPassword != inputData.confirmNewPassword) {
                    var message = "Password does not match";
                    respond(res, 201, {
                        message: message,
                        result: -1,
                    });
                }
                else {
                    //check if account already exist
                    var hashPassword = bcrypt.hashSync(inputData.newPassword, salt);
                    sql = "UPDATE UserLogin SET Password=(?) WHERE Email = (?);";
                    connection.query(sql,[hashPassword,inputData.Email],(err, results) => {
                        if (!err) {
                            //send successfully modified
                            var message = "Password Successfully got changed";
                            console.log(message);
                            respond(res, 201, {
                                message: message,
                                result: 0,
                            });
                        }
                        else {
                            //send unsuccessfully modified
                            var message = "Failed to modify password";
                            console.log(message);
                            respond(res, 201, 
                            {
                                message: message,
                                result: -1,
                            });
                        } 
                    });      
                } 
        
            } catch (error) {
            console.error(error);
            error(res, 400, "Invalid JSON data");
            }
        });
    } else {
      error(res, 404, "Not Found");
    }
}
  
module.exports = ForgetPasswordChange;