const { respond, error } = require("../utils");
const connection = require("../../dbconnection");
const {verifyToken} = require("../authentication/BearerToken");

function viewIncome(req, res) {
  if (req.method === "POST" && req.url === "/viewIncome") {
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
        sql = "SELECT * FROM AdditionalIncome WHERE IncomeID = (?);";
        connection.query(sql,
          [
            inputData.IncomeID,
          ],
          (err, results) => {
            if (!err) {
              console.log("Income Successfully Retrieved");
              IncomeID = results[0].IncomeID;
                UserID = results[0].UserID;
                Title = results[0].Title;
                Amount = results[0].Amount;
                IncomeDate = results[0].Date;
                Description = results[0].Description;
                YearID = results[0].YearID;
                respond(res, 201, 
                  {
                    message: {
                      IncomeID,
                      UserID,
                      Title,
                      Amount,
                      IncomeDate,
                      Description,
                      YearID,
                    }, 
                    result: 0,
                  });
            } 
            else {
              console.error(err);
              error(res, 500, "Failed to Retrieve Income Details");
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

module.exports = viewIncome;