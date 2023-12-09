const { respond, error } = require("../utils");
const connection = require("../../dbconnection");
const {verifyToken} = require("../authentication/BearerToken");


function insert(UserID,inputData, req, res){
  
   //add to account
   sql = "INSERT INTO Donations (UserID, Organization, Amount, Date, YearID) VALUES (?,?,?,?,?);" +
         "SELECT LAST_INSERT_ID() AS lastId;";
   //sql += "INSERT INTO UserDetails (UserID,FirstName,LastName,Address,PhoneNo) VALUES ((SELECT UserID FROM UserLogin WHERE Email = (?) AND Password = (?)),?,?,?,?);";
 
   connection.query(sql,
     [
       //Sql 1
       UserID,
       inputData.Organization,
       inputData.Amount,
       inputData.Date,
       inputData.YearID,
           
     ],
     (err, results) => {
       if (!err) {
           console.log("Donation Added to Database: " + results[1][0].lastId);
           respond(res, 201, 
             {
                message:{
                  DocumentID:results[1][0].lastId,
                  message: 'Donation successfully added!',
                } ,
                result: 0,
             });            
       } 
       else {
         console.error(err);
         error(res, 500, "Failed to add Donation");
         respond(res, 500, 
           {
             message: 'Failed to add Donation',
             result: -1,
           }); 
       }
     }
   );
}

function InsertDonation(UserID,inputData, req, res) {
 
  
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
                          
                          insert(UserID,inputData, req, res);
                          
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
                insert(UserID,inputData, req, res);
              }
            }else{
              error(res, 404, "Not Found");
            }
          }
        );
}

function addDonation(req, res) {
  if (req.method === "POST" && req.url === "/addDonation") {
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

          InsertDonation(UserID,inputData,req,res);
      } catch (error) {
        console.error(error);
        error(res, 400, "Invalid JSON data");
      }
    });
  } else {
    error(res, 404, "Not Found");
  }
}

module.exports = addDonation;