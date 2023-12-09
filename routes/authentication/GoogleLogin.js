const { respond, error } = require("../utils");
const connection = require("../../dbconnection");
const bcrypt = require('bcryptjs');
const {generateToken} = require("./BearerToken");

//login with user via google login
function googleLogin(req, res) {
  if (req.method === "POST" && req.url === "/GoogleLogin") {
    let data = "";

    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", () => {
      try {
        const inputData = JSON.parse(data);

        //Check if account exist, return the token
        sql = "SELECT UserID FROM UserLogin WHERE Email = (?);";
        connection.query(sql,
          [
            inputData.email,
          ],
          (err, results) => {
            if (!err) {
              if (results.length == 0) {
                //if no email found
                console.log("No user found");
                respond(res, 201, 
                  {
                    message: 'Email not Registered', 
                    result: -1,
                  });
              }
              else {
                //if successfully found a user
                console.log(results[0].UserID);

                //generate Bearer token
                var token = generateToken(results[0].UserID);

                respond(res, 201, 
                  {
                    message: results[0].UserID,
                    token: token,
                    result: 0,
                  });
              }
            }
            else {
              console.error(err);
              error(res, 500, "Failed Retrieve Account");
            } 
          }
        )
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

module.exports = googleLogin;