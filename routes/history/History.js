const { respond, error } = require("../utils");
const connection = require("../../dbconnection");
const {verifyToken} = require("../authentication/BearerToken");

function History(req, res) {
  if (req.method === "POST" && req.url === "/History") {
    let data = "";

    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", () => {
      try {
        const inputData = JSON.parse(data);
        var UserID = verifyToken(req,res);
        if (UserID == -1) {
          return;
        }

        //Retrieve User Details through UserID
        sql = `SELECT 'Capital' AS DocumentType, Asset AS DocumentName, Calc AS Amount, Date, CONCAT('Buy Price: ', Buy,' Sell Price: ' , Sell) AS Description, GainLossID AS DocumentID ` + 
              `FROM CapitalGainLoss WHERE YearID = '${inputData.selectedYear}' AND UserID = '${UserID}' UNION ALL ` +
              `SELECT 'Tax Deduction'  AS DocumentType, Type AS DocumentName, Amount, Date, Description, TaxID AS DocumentID ` + 
              `FROM TaxDeductionsExpenses WHERE YearID = '${inputData.selectedYear}' AND UserID = '${UserID}' UNION ALL ` + 
              `SELECT 'Additional Income' AS DocumentType, Title AS DocumentName, Amount, Date, Description, IncomeID AS DocumentID ` + 
              `FROM  AdditionalIncome WHERE YearID = '${inputData.selectedYear}' AND UserID = '${UserID}' UNION ALL ` +
              `SELECT 'Donation' AS DocumentType, Organization AS DocumentName, Amount, Date, 'Donation' AS Description, DonationID AS DocumentID ` +
              `FROM Donations WHERE YearID = '${inputData.selectedYear}' AND UserID = '${UserID}';` ;
        connection.query(sql,
          [ inputData.selectedYear,
            UserID,],
          (err, results) => {
            if (!err) {
              console.log("History Retrieved");
              list = []
              for (let i = 0;  i < results.length; i++) {
                list.push({
                  DocumentType:results[i].DocumentType,
                  DocumentName:results[i].DocumentName,
                  Amount:results[i].Amount,
                  Date:results[i].Date,
                  Description:results[i].Description,
                  DocumentID:results[i].DocumentID
                });
                //console.log(list[i]);
              }
                
              respond(res, 201, 
                {
                  message: list,
                  result: 0,
                });
            } 
            else {
              console.error(err);
              error(res, 500, "Failed to Retrieve History Details");
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

module.exports = History;