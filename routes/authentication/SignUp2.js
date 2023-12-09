const { respond, error } = require("../utils");
const connection = require("../../dbconnection");
const bcrypt = require('bcryptjs');

var salt = bcrypt.genSaltSync(10);

//add user detail to database
function insert(hashPassword, inputData, req, res) {

  sql = "INSERT INTO UserDetails (UserID,FirstName,LastName,Address,PhoneNo) VALUES ((SELECT UserID FROM UserLogin WHERE Email = (?) AND Password = (?)),?,?,?,?);";

  connection.query(sql,
    [
      inputData.Email,
      hashPassword,
      inputData.FirstName,
      inputData.LastName,
      inputData.Address,
      inputData.PhoneNumber,         
    ],
    (err, results) => {
      if (!err) {
        //successfully add user details to database
        console.log("Account have been created");
        respond(res, 201, 
          {
            message: 'Account have been created',
            result: 0,
          });         
      } 
      else {
        //failed to add user details to database
        console.error(err);
        respond(res, 500, 
          {
            message: 'Failed to UserDetails Account',
            result: -1,
          }); 
      }
    }
  ); 
}

//add users to login database
function InsertUser(inputData, req, res) {
  var hashPassword = bcrypt.hashSync(inputData.Password, salt);

  sql = "INSERT INTO UserLogin (Email,Password) VALUES (?,?);";

  connection.query(sql,
    [

      inputData.Email,
      hashPassword,          
    ],
    (err, results) => {
      if (!err) {
        //successfully added user to database
          console.log("User Added to Database");

          //add use to database
          insert(hashPassword, inputData, req, res);            
      } 
      else {
        //Failed to add user to database
        console.error(err);
        error(res, 500, "Failed to create Account");
        respond(res, 201, 
          {
            message: 'Failed to create Account',
            result: -1,
          }); 
      }
    }
  ); 
}

function signup2(req, res) {
  if (req.method === "POST" && req.url === "/SignUp2") {
    let data = "";

    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", () => {
      try {

        const inputData = JSON.parse(data);
        
        //check if all fields are filled
        const phoneNoRegEx = new RegExp(/[0-9]{8,12}/);

        //check if there exist some values in each data
        if (inputData.FirstName.length == 0 || inputData.LastName.length == 0 || inputData.Address.length == 0 || inputData.PhoneNumber.length == 0) {
          respond(res,201, 
            {
              message: 'All fields is required to be filled',
              result: -1,
            })
            return;
        }
        //check if phone number is in the correct format
        if (!phoneNoRegEx.test(inputData.PhoneNumber)) {
          respond(res,201, 
            {
              message: 'Phone Number needs to have 8-12 digits',
              result: -1,
            }) 
            return;         
        }
        
        //add to dataset
        InsertUser(inputData,req,res);
      } catch (error) {
        console.error(error);
        error(res, 400, "Invalid JSON data");
      }
    });
  } else {
    error(res, 404, "Not Found");
  }
}

module.exports = signup2;