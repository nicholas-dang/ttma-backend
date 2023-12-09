const { respond, error } = require("../utils");
const connection = require("../../dbconnection");
const {verifyToken} = require("../authentication/BearerToken");

function viewuserdetails(req, res) {
  if (req.method === "POST" && req.url === "/UserDetailsView") {
    let data = "";

    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", () => {
      try {
        const inputData = JSON.parse(data);

        //Check if bearer token is expired
        var UserID = verifyToken(req,res);
        if (UserID == -1) {
          return;
        }

        //Retrieve User Details through UserID
        sql = "SELECT * FROM UserDetails WHERE UserID = (?);";
        connection.query(sql,
          [
            UserID,
          ],
          (err, results) => {
            if (!err) {
              //send user details to frontend
              console.log("Account Successfully Retrieved");
              FirstName = results[0].FirstName;
              LastName = results[0].LastName;
              Address = results[0].Address;
              PhoneNumber = results[0].PhoneNo;
              respond(res, 201, 
                {
                  message: {
                    FirstName,
                    LastName,
                    Address,
                    PhoneNumber,
                  }, 
                  result: 0,
                });
            } 
            else {
              //failed to send data to frontend
              console.error(err);
              error(res, 500, "Failed to Retrieve User Details");
            }
          }
        )
      } catch (error) {
        console.error(error);
        error(res, 400, "Invalid JSON data");
      }
    });
  } else {
    error(res, 404, "Not Found");
  }
}

module.exports = viewuserdetails;