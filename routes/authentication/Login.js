const { respond, error } = require("../utils");
const connection = require("../../dbconnection");
const bcrypt = require('bcryptjs');
const {generateToken} = require("./BearerToken");

//login with email
function login(req, res) {
  if (req.method === "POST" && req.url === "/Login") {
    let data = "";

    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", () => {
      try {
        const inputData = JSON.parse(data);

        //check if all fields are correct
        //check email
        const emailRegEx = new RegExp(/[A-Za-z0-9_.+-]+@[a-z]+\.[a-z]{2,3}/);
        if (!emailRegEx.test(inputData.email)) {
          var message = "Email Format incorrect";
          respond(res,201, 
            {
              message: message,
              result: -1,
            });
        }
        //check password
        else if (inputData.password.length < 6 || inputData.password.length > 18) {
          var message = "Incorrect Email/Password";
          respond(res,201, 
            {
              message: message,
              result: -1,
            });
        }
        else 
        {
          //Check if account exist, return the userID
          sql = "SELECT UserID, Password FROM UserLogin WHERE Email = (?);";
          connection.query(sql,
            [
              inputData.email,
            ],
            (err, results) => {
              if (!err) {
                if (results.length == 0) {
                  //acount not found
                  console.log("No user found");
                  respond(res, 201, 
                    {
                      message: 'Incorrect Email/Password', 
                      result: -1,
                    });
                }
                else if(bcrypt.compareSync(inputData.password,results[0].Password)) {
                  //account found and password matched
                  console.log(results[0].UserID);
                  var token = generateToken(results[0].UserID);
                  respond(res, 201, 
                    {
                      token: token,
                      result: 0,
                    });
                }
                else {
                  //account found but password doesnt match
                  console.log("No user found");
                  respond(res, 201, 
                    {
                      message: 'Incorrect Email/Password', 
                      result: -1,
                    });
                }
              }
              else {
                //no account found
                console.error(err);
                error(res, 500, "Failed Retrieve Account");
              } 
            }
          )
        } 
      }
      catch (error) {
        console.error(error);
        error(res, 400, "Invalid JSON data");
      }
      });
  } else {
    error(res, 404, "Not Found");
  }
}

module.exports = login;