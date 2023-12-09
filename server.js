const http = require("http");
const url = require("url");

const login = require("./routes/authentication/Login");
const googleLogin = require("./routes/authentication/GoogleLogin");
const signup1 = require("./routes/authentication/SignUp1");
const signup2 = require("./routes/authentication/SignUp2");
const GenerateOTP = require("./routes/authentication/GenerateOTP");
const CompareOTP = require("./routes/authentication/CompareOTP");
const CheckEmail = require("./routes/authentication/CheckEmail");
const ForgetPasswordChange = require("./routes/authentication/FogetPasswordChange");

const capitalgainloss = require("./routes/capital/CapitalGainLoss");
const CapitalAdd = require("./routes/capital/addCapital");
const CapitalDelete = require("./routes/capital/deleteCapital");
const CapitalEdit = require("./routes/capital/editCapital");
const CapitalView = require("./routes/capital/viewCapital");

const taxdeductionsexpenses = require("./routes/deduction/TaxDeductionsExpenses");
const ExpenseAdd = require("./routes/deduction/addExpense");
const ExpenseDelete = require("./routes/deduction/deleteExpense");
const ExpenseEdit = require("./routes/deduction/editExpense");
const ExpenseView = require("./routes/deduction/viewExpense");

const donations = require("./routes/donation/Donations");
const DonationAdd = require("./routes/donation/addDonation");
const DonationDelete = require("./routes/donation/deleteDonation");
const DonationEdit = require("./routes/donation/editDonation");
const DonationView = require("./routes/donation/viewDonation");

const income = require("./routes/income/Income");
const IncomeAdd = require("./routes/income/addIncome");
const IncomeDelete = require("./routes/income/deleteIncome");
const IncomeEdit = require("./routes/income/editIncome");
const IncomeView = require("./routes/income/viewIncome");

const History = require("./routes/history/History");
const GetYear = require("./routes/history/getYearList");
const exp = require("./routes/history/export");

const HandleUpload = require("./routes/fileManage/handleUpload");
const DeleteFile = require("./routes/fileManage/deleteFile");
const GetFile = require("./routes/fileManage/getFile");
const StreamFile = require("./routes/fileManage/streamFile");

const viewuserdetails = require("./routes/userdetails/UserDetailsView");
const edituserdetails = require("./routes/userdetails/UserDetailsEdit");

const dedYear = require("./routes/deduction/dedYear");
const capYear = require("./routes/capital/capYear");
const donYear = require("./routes/donation/donYear");
const incYear = require("./routes/income/incYear");
const hostname = "0.0.0.0";
const port = 3000;

const server = http.createServer((req, res) => {
  const { pathname } = url.parse(req.url);

  if (pathname.startsWith("/addIncome")) {
    IncomeAdd(req, res);
  } 
  else if (pathname.startsWith("/Login")) {
    login(req,res);
  }
  else if (pathname.startsWith("/GoogleLogin")) {
    googleLogin(req,res);
  }
  else if (pathname.startsWith("/SignUp1")) {
    signup1(req,res);
  }
  else if (pathname.startsWith("/SignUp2")) {
    signup2(req,res);
  }
  else if (pathname.startsWith("/UserDetailsView")) {
    viewuserdetails(req,res);
  }
  else if (pathname.startsWith("/UserDetailsEdit")) {
    edituserdetails(req,res);
  }
  else if (pathname.startsWith("/Income")) {
    income(req,res);
  }
  else if (pathname.startsWith("/Donations")) {
    donations(req,res);
  }
  else if (pathname.startsWith("/TaxDeductionsExpenses")) {
    taxdeductionsexpenses(req,res);
  }
  else if (pathname.startsWith("/CapitalGainLoss")) {
    capitalgainloss(req,res)
  }
  else if (pathname.startsWith("/addDonation")) {
    DonationAdd(req, res);

  }  else if (pathname.startsWith("/addCapital")) {
    CapitalAdd(req, res);

  }  else if (pathname.startsWith("/addExpense")) {
    ExpenseAdd(req, res);

  }  else if (pathname.startsWith("/viewDonation")) {
    DonationView(req, res);

  }  else if (pathname.startsWith("/viewExpense")) {
    ExpenseView(req, res);

  } else if (pathname.startsWith("/viewIncome")) {
    IncomeView(req, res);

  }  else if (pathname.startsWith("/viewCapital")) {
    CapitalView(req, res);

  }  else if (pathname.startsWith("/editIncome")) {
    IncomeEdit(req, res);

  } else if (pathname.startsWith("/deleteIncome")) {
    IncomeDelete(req, res);

  }  else if (pathname.startsWith("/editDonation")) {
    DonationEdit(req, res);

  } else if (pathname.startsWith("/deleteDonation")) {
    DonationDelete(req, res);

  } else if (pathname.startsWith("/editExpense")) {
    ExpenseEdit(req, res);

  } else if (pathname.startsWith("/deleteExpense")) {
    ExpenseDelete(req, res);

  } else if (pathname.startsWith("/editCapital")) {
    CapitalEdit(req, res);

  } else if (pathname.startsWith("/deleteCapital")) {
    CapitalDelete(req, res);
  } else if (pathname.startsWith("/History")) {
    History(req, res);
  } else if (pathname.startsWith("/getYear")) {
    GetYear(req, res);
  } else if (pathname.startsWith("/export")) {
    exp(req, res);
  } else if (pathname.startsWith("/generateOTP")) {
    GenerateOTP(req, res);
  } else if (pathname.startsWith("/checkOTP")) {
    CompareOTP(req,res);
  } else if (pathname.startsWith("/CheckEmail")) {
    CheckEmail(req,res);
  } else if (pathname.startsWith("/ForgetPasswordChange")) {
    ForgetPasswordChange(req,res);
  } else if (pathname.startsWith("/handleUpload")) {
    HandleUpload(req, res);

  } else if (pathname.startsWith("/deleteFile")) {
    DeleteFile(req, res);

  } else if (pathname.startsWith("/getFile")) {
    GetFile(req, res);

  } else if (pathname.startsWith("/uploads")) {
    StreamFile(req, res);

  } else if (pathname.startsWith("/dedYear")) {
    dedYear(req, res);
  } else if (pathname.startsWith("/capYear")) {
    capYear(req, res);
  } else if (pathname.startsWith("/donYear")) {
    donYear(req, res);
  } else if (pathname.startsWith("/incYear")) {
    incYear(req, res);
  }
  else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});


/**const express = require('express');
const http = require('http');
const url = require("url");
const app = express();
const port = 3000;


const login = require("./routes/authentication/Login");
const signup1 = require("./routes/authentication/SignUp1");
const signup2 = require("./routes/authentication/SignUp2");

const capitalgainloss = require("./routes/capital/CapitalGainLoss");
const CapitalAdd = require("./routes/capital/addCapital");
const CapitalDelete = require("./routes/capital/deleteCapital");
const CapitalEdit = require("./routes/capital/editCapital");
const CapitalView = require("./routes/capital/viewCapital");

const taxdeductionsexpenses = require("./routes/deduction/TaxDeductionsExpenses");
const ExpenseAdd = require("./routes/deduction/addExpense");
const ExpenseDelete = require("./routes/deduction/deleteExpense");
const ExpenseEdit = require("./routes/deduction/editExpense");
const ExpenseView = require("./routes/deduction/viewExpense");

const donations = require("./routes/donation/Donations");
const DonationAdd = require("./routes/donation/addDonation");
const DonationDelete = require("./routes/donation/deleteDonation");
const DonationEdit = require("./routes/donation/editDonation");
const DonationView = require("./routes/donation/viewDonation");

const income = require("./routes/income/Income");
const IncomeAdd = require("./routes/income/addIncome");
const IncomeDelete = require("./routes/income/deleteIncome");
const IncomeEdit = require("./routes/income/editIncome");
const IncomeView = require("./routes/income/viewIncome");

const History = require("./routes/history/History");
const GetYear = require("./routes/history/getYearList");
const exp = require("./routes/history/export");

const HandleUpload = require("./routes/fileManage/handleUpload");
const DeleteFile = require("./routes/fileManage/deleteFile");
const GetFile = require("./routes/fileManage/getFile");

const viewuserdetails = require("./routes/userdetails/UserDetailsView");
const edituserdetails = require("./routes/userdetails/UserDetailsEdit");




// Serve static files from the 'uploads' directory
app.use('/uploads/',express.static("./uploads"));

// Define your API routes and handlers here (similar to your existing code)

// Example API route:
app.post("/addIncome", (req, res) => {
  // Handle API requests here
  IncomeAdd(req, res);
});
app.post("/Login", (req,res) => {
    login(req,res);
});
app.post("/SignUp1", (req,res) => {
    signup1(req,res);
});
app.post("/SignUp2", (req,res) => {
    signup2(req,res);
});
app.post("/UserDetailsView", (req,res) => {
    viewuserdetails(req,res);
});
app.post("/UserDetailsEdit", (req,res) => {
    edituserdetails(req,res);
});
app.post("/Income", (req,res) => {
    income(req,res);
});
app.post("/Donations", (req,res) => {
    donations(req,res);
});
app.post("/TaxDeductionsExpenses", (req,res) => {
    taxdeductionsexpenses(req,res);
});
app.post("/CapitalGainLoss", (req,res) => {
    capitalgainloss(req,res);
});
app.post("/addDonation", (req,res) => {
    DonationAdd(req,res);
});
app.post("/addCapital", (req,res) => {
    CapitalAdd(req,res);
});
app.post("/addExpense", (req,res) => {
    ExpenseAdd(req,res);
});
app.post("/viewDonation", (req,res) => {
    DonationView(req,res);
});
app.post("/viewExpense", (req,res) => {
    ExpenseView(req,res);
});
app.post("/viewIncome", (req,res) => {
    IncomeView(req,res);
});
app.post("/viewCapital", (req,res) => {
    CapitalView(req,res);
});
app.post("/editIncome", (req,res) => {
    IncomeEdit(req,res);
});
app.post("/deleteIncome", (req,res) => {
    IncomeDelete(req,res);
});
app.post("/editDonation", (req,res) => {
    DonationEdit(req,res);
});
app.post("/deleteDonation", (req,res) => {
    DonationDelete(req,res);
});
app.post("/editExpense", (req,res) => {
    ExpenseEdit(req,res);
});
app.post("/deleteExpense", (req,res) => {
    ExpenseDelete(req,res);
});
app.post("/deleteCapital", (req,res) => {
    CapitalEdit(req,res);
});
app.post("/editCapital", (req,res) => {
    CapitalDelete(req,res);
});
app.post("/History", (req,res) => {
    History(req,res);
});
app.post("/getYear", (req,res) => {
    GetYear(req,res);
});
app.post("/export", (req,res) => {
    exp(req,res);
});
app.post("/handleUpload", (req,res) => {
    HandleUpload(req,res);
});
app.post("/deleteFile", (req,res) => {
    DeleteFile(req,res);
});
app.post("/getFile", (req,res) => {
    GetFile(req,res);
});

// Create an HTTP server using Express
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); */