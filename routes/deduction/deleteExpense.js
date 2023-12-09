const { respond, error } = require("../utils");
const connection = require("../../dbconnection");
const {verifyToken} = require("../authentication/BearerToken");

function deleteExpense(req, res) {
  if (req.method === "POST" && req.url === "/deleteExpense") {
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

          //Edit income
          sql = "DELETE FROM TaxDeductionsExpenses WHERE TaxID = (?);";
          connection.query(sql,
            [
              inputData.ExpenseID,
            ],
            (err, results) => {
              if (!err) {
                console.log("Expense Successfully deleted");
                respond(res, 201, 
                  {
                    message: 'Expense Successfully deleted', 
                    result: 0,
                  });
              } 
              else {
                console.error(err);
                error(res, 500, "Failed to deleted Expense");
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

module.exports = deleteExpense;