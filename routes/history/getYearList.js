const { respond, error } = require("../utils");
const connection = require("../../dbconnection");
const {verifyToken} = require("../authentication/BearerToken");

function getYear(req, res) {
    if (req.method === "POST" && req.url === "/getYear") {
        let data = "";

        req.on("data", (chunk) => {
        data += chunk;
        });

        req.on("end", () => {
            try {
                const inputData = JSON.parse(data);
                var UserID = verifyToken(req,res);
                if (UserID == -1) {
                    console.log("Failed to get UserID");
                    return;
                }

                sql = "SELECT YearID from FinancialYear WHERE " +
                      "YearID IN ( " +
                      `SELECT YearID FROM Donations WHERE UserID = ${UserID} UNION ` +
                      `SELECT YearID FROM AdditionalIncome WHERE UserID = ${UserID} UNION ` +
                      `SELECT YearID FROM TaxDeductionsExpenses WHERE UserID = ${UserID} UNION ` +
                      `SELECT YearID FROM CapitalGainLoss WHERE UserID = ${UserID});`;
            
                connection.query(sql,(err, results) => {
                    if(!err) {
                        console.log("Year list obtained");
                        list = [] 
                        for (let i = 0; i < results.length; i++)
                        list.push({
                        YearID:results[i].YearID,
                        });
                        respond(res, 201, 
                            {
                                message: list,
                                result: 0,
                            });
                    } else {
                        console.error(err);
                        error(res, 500, "Failed to Retrieve Year");
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

module.exports = getYear;