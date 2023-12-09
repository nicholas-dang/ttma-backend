const { respond, error } = require("../utils");
const connection = require("../../dbconnection");
const {verifyToken} = require("../authentication/BearerToken");

function capitalgainloss(req, res) {
  if (req.method === "POST" && req.url === "/CapitalGainLoss") {
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
        if(inputData.selectedYear == 'All:'){
          sql = "SELECT * FROM CapitalGainLoss WHERE UserID = (?);";
        }else{
        sql = "SELECT * FROM CapitalGainLoss WHERE UserID = (?) AND YearID = (?);";
        }
        connection.query(sql,
          [
            UserID,
            inputData.selectedYear,
          ],
          (err, results) => {
            if (!err) {
              console.log("Account Successfully Retrieved");
              list = []
              for (let i = 0; i < results.length; i++)
              list.push({
                CapitalID: results[i].GainLossID,
                Asset:results[i].Asset,
                Buy:results[i].Buy,
                Sell:results[i].Sell,
                Calc:results[i].Calc,
                YearID:results[i].YearID,
              });
              respond(res, 201, 
                {
                  message: list,
                  result: 0,
                });
            } 
            else {
              console.error(err);
              error(res, 500, "Failed to Retrieve Capital");
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

module.exports = capitalgainloss;