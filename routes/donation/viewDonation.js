const { respond, error } = require("../utils");
const connection = require("../../dbconnection");
const {verifyToken} = require("../authentication/BearerToken");

function viewDonation(req, res) {
  if (req.method === "POST" && req.url === "/viewDonation") {
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
        sql = "SELECT * FROM Donations WHERE DonationID = (?);";
        connection.query(sql,
          [
            inputData.DonationID,
          ],
          (err, results) => {
            if (!err) {
              console.log("Account Successfully Retrieved");
                DonationID = results[0].DonationID;
                UserID = results[0].UserID;
                Organization = results[0].Organization;
                Amount = results[0].Amount;
                DonationDate = results[0].Date;
                YearID = results[0].YearID;
                respond(res, 201, 
                  {
                    message: {
                      DonationID,
                      UserID,
                      Organization,
                      Amount,
                      DonationDate,
                      YearID,
                    }, 
                    result: 0,
                  });
            } 
            else {
              console.error(err);
              error(res, 500, "Failed to Retrieve Donation Details");
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

module.exports = viewDonation;