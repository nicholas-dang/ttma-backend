const { respond, error } = require("../utils");
const connection = require("../../dbconnection");
const {verifyToken} = require("../authentication/BearerToken");

function viewExpense(req, res) {
  if (req.method === "POST" && req.url === "/viewExpense") {
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
        sql = "SELECT * FROM TaxDeductionsExpenses WHERE TaxID = (?);";
        connection.query(sql,
          [
            inputData.ExpenseID,
          ],
          (err, results) => {
            if (!err) {
              console.log("Expense Successfully Retrieved");
                TaxID = results[0].TaxID;
                UserID = results[0].UserID;
                Type = results[0].Type;
                Amount = results[0].Amount;
                ExpenseDate = results[0].Date;
                Description = results[0].Description;
                YearID = results[0].YearID;
                respond(res, 201, 
                  {
                    message: {
                      TaxID,
                      UserID,
                      Type,
                      Amount,
                      ExpenseDate,
                      Description,
                      YearID,
                    }, 
                    result: 0,
                  });
            } 
            else {
              console.error(err);
              error(res, 500, "Failed to Retrieve Expense Details");
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

module.exports = viewExpense;