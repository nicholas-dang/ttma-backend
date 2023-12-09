const { respond, error } = require("../utils");
const connection = require("../../dbconnection");
const {verifyToken} = require("../authentication/BearerToken");

function edituserdetails(req, res) {
  if (req.method === "POST" && req.url === "/UserDetailsEdit") {
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

        //check if all fields are filled
        const phoneNoRegEx = new RegExp(/[0-9]{8,12}/);
        //check if all fields are filled correctly
        if (inputData.FirstName.length == 0 || inputData.LastName.length == 0 || inputData.Address.length == 0 || inputData.PhoneNumber.length == 0) {
          respond(res,201, 
            {
              message: 'All fields is required to be filled',
              result: -1,
            })
        }
        //check if phone number is filled corrected
        else if (!phoneNoRegEx.test(inputData.PhoneNumber)) {
          respond(res,201, 
            {
              message: 'Phone Number needs to have 8-12 digits',
              result: -1,
            })          
        }
        else {
          //Edit User Details by the User ID
          sql = "UPDATE UserDetails SET FirstName = (?), LastName = (?), Address = (?), PhoneNo = (?) WHERE UserID = (?);";
          connection.query(sql,
            [
              inputData.FirstName,
              inputData.LastName,
              inputData.Address,
              inputData.PhoneNumber,
              UserID,
            ],
            (err, results) => {
              if (!err) {
                //successful user details edit
                console.log("Account Successfully Edited");
                respond(res, 201, 
                  {
                    message: 'Account Successfully Edited', 
                    result: 0,
                  });
              } 
              else {
                //unsuccessful user details edit
                console.error(err);
                error(res, 500, "Failed to Edit Account");
              }
            }
          )
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

module.exports = edituserdetails;