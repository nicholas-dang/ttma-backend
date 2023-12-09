const { respond, error } = require("../utils");
const connection = require("../../dbconnection");

//check if Email exist
function CheckEmail(req, res) {
  if (req.method === "POST" && req.url === "/CheckEmail") {
    let data = "";

    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", () => {
      try {
        const inputData = JSON.parse(data);

        //check if account already exist
        sql = "SELECT * FROM UserLogin WHERE Email = (?);";
        connection.query(sql,[inputData.Email],(err, results) => {
            if (!err) {
                if (results.length != 0) {
                  //if there exist a user, return email is found
                  var message = "Email is already registered";
                  console.log(message);
                  respond(res, 201, 
                  {
                      message: message,
                      result: 0,
                  });
                    
                }
                else {
                  //if no user is found, return no email is found
                    var message = "Email is not registered";
                    console.log(message);
                    respond(res, 201, 
                    {
                        message: message,
                        result: -1,
                    });
                }
            }
            else {
              console.error(err);
              error(res, 500, "Failed to Retrieve User Login");
            } 
        });       

      } catch (error) {
        console.error(error);
        error(res, 400, "Invalid JSON data");
      }
    });
  } else {
    error(res, 404, "Not Found");
  }
}

module.exports = CheckEmail;