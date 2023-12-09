const { respond, error } = require("../utils");
const connection = require("../../dbconnection");
const {verifyToken} = require("../authentication/BearerToken");

function viewCapital(req, res) {
  if (req.method === "POST" && req.url === "/viewCapital") {
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
        sql = "SELECT * FROM CapitalGainLoss WHERE GainLossID = (?);";
        connection.query(sql,
          [
            inputData.CapitalID,
          ],
          (err, results) => {
            if (!err) {
              console.log("Capital Successfully Retrieved");
              GainLossID = results[0].GainLossID;
                UserID = results[0].UserID;
                Asset = results[0].Asset;
                Buy = results[0].Buy;
                Sell = results[0].Sell;
                Calc = results[0].Calc;
                CapitalDate = results[0].Date;
                YearID = results[0].YearID;
                respond(res, 201, 
                  {
                    message: {
                      GainLossID,
                      UserID,
                      Asset,
                      Buy,
                      Sell,
                      Calc,
                      CapitalDate,
                      YearID,
                    }, 
                    result: 0,
                  });
            } 
            else {
              console.error(err);
              error(res, 500, "Failed to Retrieve Capital Details");
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

module.exports = viewCapital;