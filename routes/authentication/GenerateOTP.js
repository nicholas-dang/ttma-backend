const { respond, error } = require("../utils");
const connection = require("../../dbconnection");
const nodemailer = require("nodemailer");
const bcrypt = require('bcryptjs');
const otpGenerator = require('otp-generator');

var salt = bcrypt.genSaltSync(10);

async function email(UserEmail,otp) {
    //set up email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "taxtimemobileassistant@gmail.com",
        pass: "wrrpjldiyufxaysn",
      },
    });
  
    console.log(UserEmail);

    //set up email message
    var mailOptions = {
      from: "taxtimemobileassistant@gmail.com",
      to: UserEmail,
      subject: "Verification Email",
      text: "Please confirm your OTP \nHere is your OTP code: \n" + otp,
      html:         
        `<h1>Tax Time Mobile Application</h1>
        <p>Here is your OTP code:</p>
        <p>${otp}</p>`

    };

    //send OTP email to user
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }

//if there exist an otp in the database for the same user, update the OTP
function updateOTP(otp,expDate,emailAddress,req,res) {
    sql = "UPDATE OTPAuth SET OTP = (?), ExpiryDate = (?) WHERE Email = (?);";
    connection.query(sql,[otp,expDate,emailAddress],(err, results) => {
        if (!err) {
            //successfully updated OTP
            message = "OTP sent to Email";
            console.log(message);
            respond(res, 201, 
                {
                    message: message,
                    result: 0,
                }
            );                
        }
        else {
            //failed to update OTP
            message = "Failed to generated OTP";
            console.log(message);
            respond(res, 201, 
                {
                    message: message,
                    result: -1,
                }
            );   
        }
    });
}

//if theredoes not exist an otp in the database add new OTP for eamil
function addOTP(otp,expDate,emailAddress,req,res) {
    sql = "INSERT INTO OTPAuth (OTP,ExpiryDate,Email) VALUES (?,?,?);";
    connection.query(sql,[otp,expDate,emailAddress],(err,results) => {
        if (!err) {

            message = "OTP sent to Email";
            console.log(message);
            respond(res, 201, 
                {
                    message: message,
                    result: 0,
                }
            );   
        }
        else {
            message = "Failed to generated OTP";
            console.log(message);
            respond(res, 201, 
                {
                    message: message,
                    result: -1,
                }
            );   
        }
    });
}

function createOTP(emailAddress,req,res) {
    //generate OTP - generate 6 digit random number
    var otp = otpGenerator.generate(6, { lowerCaseAlphabets:false, upperCaseAlphabets: false, specialChars: false, digits:true });
    var hashOTP = bcrypt.hashSync(otp, salt);

    //add 5 minutes to the expiryDate
    var expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 5);
    var expDate = expiryDate.toISOString().replace('Z','').replace('T', ' ');
    console.log(expDate);

    //check if there is already a verification for the email
    sql = "SELECT * FROM OTPAuth WHERE Email=(?)";
    connection.query(sql,[emailAddress],(err, results) => {
        if (!err) {
            //no users OTP in database
            if (results.length == 0) {
                addOTP(hashOTP,expiryDate,emailAddress,req,res);
            }
            //there is a user OTP in the database already
            else {
                updateOTP(hashOTP,expiryDate,emailAddress,req,res);
            }
            //send otp to user email
            email(emailAddress,otp);
        }
        else {
            var message = "Failed to connect to database";
            console.log(message);
            respond(res, 201, 
                {
                    message: message,
                    result: -1,
                }
            ); 
        }
    }); 
}

//await for OTP message to come
function generateOTP(req, res) {
    if (req.method === "POST" && req.url === "/generateOTP") {
        let data = "";

        req.on("data", (chunk) => {
        data += chunk;
        });
  
        req.on("end", () => {
        try {
            const inputData = JSON.parse(data);
            var Email = inputData.Email;
            createOTP(Email,req,res);
        } catch (error) {
            console.error(error);
            error(res, 400, "Invalid JSON data");
        }
        });
    } 
    else {
        error(res, 404, "Not Found");
    }
}

module.exports = generateOTP;