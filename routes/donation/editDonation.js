const { respond, error } = require("../utils");
const connection = require("../../dbconnection");
const {verifyToken} = require("../authentication/BearerToken");


function edit(inputData, req, res){
  
            //Edit income
            sql = "UPDATE Donations SET Organization = (?), Amount = (?), Date = (?), YearID = (?) WHERE DonationID = (?);";
            connection.query(sql,
              [
                inputData.Organization,
                inputData.Amount,
                inputData.Date,
                inputData.YearID,
                inputData.DonationID,
              ],
              (err, results) => {
                if (!err) {
                  console.log("Donation Successfully Edited");
                  respond(res, 201, 
                    {
                      message: 'Donation Successfully Edited', 
                      result: 0,
                    });
                } 
                else {
                  console.error(err);
                  error(res, 500, "Failed to Edit Donation");
                }
              }
            )
}
function editDonation(req, res) {
  if (req.method === "POST" && req.url === "/editDonation") {
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

        sql1 = "SELECT YearID FROM FinancialYear WHERE Name = (?);";
        
        //Check if year exist, return the yearID
        connection.query(sql1,
          [
            inputData.YearID,
          ],
            (err, results) => {
                if (!err) {
                  if (results.length == 0) {
      
             
                    let year = inputData.YearID;
                    let lastDate = year + '-06-30';
                    let firstDate = (year-1) + '-07-01';
                    console.log(firstDate + " " + lastDate); 
      
                    sql2 = "INSERT INTO FinancialYear (YearID, Name, YearStart, YearEnd) VALUES (?,?,?,?);";
      
                    connection.query(sql2,
                      [
                        //Sql 1
                        year,
                        year,
                        firstDate,
                        lastDate,
                            
                      ],
                      (err, results) => {
                        if (!err) {
                            console.log("Year Added to Database");
                              
                              edit(inputData, req, res);
                              
                        } 
                        else {
                          console.error(err);
                          error(res, 500, "Failed to add year");
                          respond(res, 500, 
                            {
                              message: 'Failed to add year',
                              result: -1,
                            }); 
                        }
                      }
                    );
                  }else {
                    
                    console.log("year already exists");
                    edit(inputData, req, res);
                  }
                }else{
                  error(res, 404, "Not Found");
                }
              }
            );

        
      } catch (error) {
        console.error(error);
        error(res, 400, "Invalid JSON data");
      }
    });
  } else {
    error(res, 404, "Not Found");
  }
}

module.exports = editDonation;