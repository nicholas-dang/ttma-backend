const { respond, error } = require("../utils");
const connection = require("../../dbconnection");

//check if user details is already in database and format of password
function signup1(req, res) {
  if (req.method === "POST" && req.url === "/SignUp1") {
    let data = "";

    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", () => {
      try {
        const inputData = JSON.parse(data);

        //check if all fields are correct
        //check email
        errMSG = '';
        checkError = false;
        const emailRegEx = new RegExp(/[A-Za-z0-9_.+-]+@[a-z]+\.[a-z]{2,3}/);
        if (!emailRegEx.test(inputData.email)) {
          errMSG = 'Email Format incorrect';
          checkError = true;
        }

        //check password
        if (inputData.password.length < 6) {
          errMSG += '\nPassword needs to be at least 6 digits';
          checkError = true;
        }

        if (checkError == true) {
          respond(res,201, 
            {
              message: errMSG,
              result: -1,
            });
            return;
        }
        else {
          //check if account already exist
          sql = "SELECT UserID FROM UserLogin WHERE Email = (?);";
          connection.query(sql,
            [
              inputData.email,
            ],
            (err, results) => {

              if (!err) {
                if (results.length == 0) {
                  //account doesnt exist, can be registered
                  console.log("Email Avaliable");
                  respond(res, 201, 
                    {
                      message: 'Email Avaliable',
                      result: 0,
                    });
                  
                }
                else {
                  //account exist, cannot be register
                  console.log("Account already exist");
                  respond(res, 201, 
                    {
                      message: 'Account already exist',
                      result: -1,
                    });
                }
              }
              else {
                console.error(err);
                error(res, 500, "Failed to Retrieve Account");
              } 
            }
          );
        }        

      } catch (error) {
        console.error(error);
        error(res, 400, "Invalid JSON data");
      }
    });
  } else {
    error(res, 404, "Not Found");
  }
}

module.exports = signup1;