const { respond, error } = require("../utils");
const connection = require("../../dbconnection");
const xlsx = require("xlsx");
const JSZip = require("jszip");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const {verifyToken} = require("../authentication/BearerToken");

const file = xlsx.readFile;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function DeleteDir(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = `${dir}/${file}`;
    fs.unlinkSync(filePath);
  }
}

function createxlsx(UserID, selectedYear, res) {
  const ExportFiles = [];
  const workbook = xlsx.utils.book_new();

  //Add capital sheet
  sql =
    "SELECT Asset, CONCAT('$', Buy) AS 'BuyPrice', CONCAT('$', Sell) AS 'SellPrice', CONCAT('$', Calc) AS 'PriceGain', DATE_FORMAT(DATE, '%d/%m/%Y') AS 'Date' FROM CapitalGainLoss WHERE YearID = ? AND UserID = ?";
  connection.query(sql, [selectedYear, UserID], (err, results) => {
    if (!err) {
      console.log("Data Successfully Retrieved");

      //Input Data into XLSX sheet
      const rows =
        results.length > 0
          ? results.map((result) => ({
              Asset: result.Asset,
              BuyPrice: result.BuyPrice,
              SellPrice: result.SellPrice,
              PriceGain: result.PriceGain,
              Date: result.Date,
            }))
          : [
              {
                Asset: "There is no Capital Gain/Loss Recorded",
                BuyPrice: "",
                SellPrice: "",
                PriceGain: "",
                Date: "",
              },
            ];

      const worksheet1 = xlsx.utils.json_to_sheet(rows);
      const Widths = [{ wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }];
      worksheet1["!cols"] = Widths;
      if (results.length == 0) {
        const Merges = [
          {
            s: { r: 1, c: 0 },
            e: { r: 1, c: 4 },
          },
        ];
        worksheet1["!merges"] = Merges;
      }

      xlsx.utils.sheet_add_aoa(
        worksheet1,
        [["Asset", "Buy Price", "Sell Price", "Price Gain", "Date"]],
        { origin: "A1" }
      );
      xlsx.utils.book_append_sheet(workbook, worksheet1, "Capital Gain Loss");
      xlsx.writeFile(workbook, `./routes/history/export/FinancialYear${selectedYear}.xlsx`);
    } else {
      console.error(err);
      error(res, 500, "Failed to Retrieve Data");
    }
  });
  //Add deductions sheet
  sql =
    "SELECT t.Type AS 'TaxType', CONCAT('$', t.Amount) AS 'Amount', DATE_FORMAT(t.Date, '%d/%m/%Y') AS 'TaxDate', t.Description, f.FileName AS 'FileName', f.Type AS 'FileType', f.Date AS 'FileDate', f.FileLocation as 'FileLocation' " +
    "FROM TaxDeductionsExpenses as t " +
    "LEFT OUTER JOIN TaxFiles as tf ON tf.TaxID = t.TaxID " +
    "LEFT OUTER JOIN FilesImages as f ON tf.fileID = f.fileID " +
    "WHERE t.YearID=? AND t.UserID=?;";
  connection.query(sql, [selectedYear, UserID], (err, results) => {
    if (!err) {
      console.log("Data Successfully Retrieved");

      //Input Data into XLSX sheet
      const rows =
        results.length > 0
          ? results.map((result) => ({
              TaxType: result.TaxType,
              Amount: result.Amount,
              TaxDate: result.TaxDate,
              Description: result.Description,
              FileName: result.FileName || "-- No File Attached --",
              FileType: result.FileType,
              FileDate: result.FileDate,
            }))
          : [
              {
                TaxType: "There is no Tax Deductions/Expenses Recorded",
                Amount: "",
                TaxDate: "",
                Description: "",
                FileName: "",
                FileType: "",
                FileDate: "",
              },
            ];

      const worksheet2 = xlsx.utils.json_to_sheet(rows);
      const Widths = [
        { wch: 15 },
        { wch: 10 },
        { wch: 10 },
        { wch: 30 },
        { wch: 20 },
        { wch: 11 },
        { wch: 10 },
      ];
      if (results.length == 0) {
        const Merges = [
          {
            s: { r: 1, c: 0 },
            e: { r: 1, c: 6 },
          },
        ];
        worksheet2["!merges"] = Merges;
      }

      xlsx.utils.sheet_add_aoa(
        worksheet2,
        [
          [
            "Tax Type",
            "Amount",
            "Tax Date",
            "Description",
            "File Name",
            "File Type",
            "File Date",
          ],
        ],
        { origin: "A1" }
      );
      worksheet2["!cols"] = Widths;
      xlsx.utils.book_append_sheet(
        workbook,
        worksheet2,
        "Tax Deductions Expenses"
      );
      xlsx.writeFile(workbook, `./routes/history/export/FinancialYear${selectedYear}.xlsx`);
      
      //Save file Location to export file array
      const Files = results
        .filter((result) => result.FileLocation)  
        .map((result) => ({Type: 'Deductions', TaxType: result.TaxType, FileLocation: result.FileLocation, FileName: result.FileName}));
      
      Files.forEach((file) => {ExportFiles.push(file)});
    } else {
      console.error(err);
      error(res, 500, "Failed to Retrieve Data");
    }
  });

  //Add donations sheet
  sql =
    "SELECT d.Organization, CONCAT('$', d.Amount) AS 'Amount', DATE_FORMAT(d.Date, '%d/%m/%Y') AS 'DonationDate', f.FileName AS 'FileName', f.Type AS 'FileType', f.Date AS 'FileDate', f.FileLocation as 'FileLocation' " +
    "FROM Donations as d " +
    "LEFT OUTER JOIN DonationFiles as df ON df.donationID = d.donationID " +
    "LEFT OUTER JOIN FilesImages as f ON df.fileID = f.fileID " +
    "WHERE d.YearID=? AND d.UserID=?;";
  connection.query(sql, [selectedYear, UserID], (err, results) => {
    if (!err) {
      console.log("Data Successfully Retrieved");

      //Input Data into XLSX sheet
      const rows =
        results.length > 0
          ? results.map((result) => ({
              Organization: result.Organization,
              Amount: result.Amount,
              DonationDate: result.DonationDate,
              FileName: result.FileName || "-- No File Attached --",
              FileType: result.FileType,
              FileDate: result.FileDate,
            }))
          : [
              {
                Organization: "There is no Donations Recorded",
                Amount: "",
                DonationDate: "",
                FileName: "",
                FileType: "",
                FileDate: "",
              },
            ];
      
      const worksheet3 = xlsx.utils.json_to_sheet(rows);
      const Widths = [
        { wch: 15 },
        { wch: 10 },
        { wch: 12 },
        { wch: 20 },
        { wch: 11 },
        { wch: 10 },
      ];
      worksheet3["!cols"] = Widths;
      if (results.length == 0) {
        const Merges = [
          {
            s: { r: 1, c: 0 },
            e: { r: 1, c: 5 },
          },
        ];
        worksheet3["!merges"] = Merges;
      }

      xlsx.utils.sheet_add_aoa(
        worksheet3,
        [
          [
            "Organization",
            "Amount",
            "Donation Date",
            "File Name",
            "File Type",
            "File Date",
          ],
        ],
        { origin: "A1" }
      );
      xlsx.utils.book_append_sheet(workbook, worksheet3, "Donations");
      xlsx.writeFile(workbook, `./routes/history/export/FinancialYear${selectedYear}.xlsx`);

      //Save file Location to export file array
      const Files = results
        .filter((result) => result.FileLocation)  
        .map((result) => ({Type: 'Donations', Org: result.Organization, FileLocation: result.FileLocation, FileName: result.FileName}));
      
      Files.forEach((file) => {ExportFiles.push(file)});
    } else {
      console.error(err);
      error(res, 500, "Failed to Retrieve Data");
    }
  });

  //Add additional income sheet
  sql =
    "SELECT i.Title, CONCAT('$', i.Amount) AS 'Amount', DATE_FORMAT(i.Date, '%d/%m/%Y') AS 'IncomeDate', i.Description, f.FileName AS 'FileName', f.Type AS 'FileType', f.Date AS 'FileDate', f.FileLocation as 'FileLocation' " +
    "FROM AdditionalIncome as i " +
    "LEFT OUTER JOIN IncomeFiles as aif ON aif.IncomeID = i.IncomeID " +
    "LEFT OUTER JOIN FilesImages as f ON aif.fileID = f.fileID " +
    "WHERE i.YearID=? AND i.UserID=?;";
  connection.query(sql, [selectedYear, UserID], (err, results) => {
    if (!err) {
      console.log("Data Successfully Retrieved");

      //Input Data into XLSX sheet
      const rows =
        results.length > 0
          ? results.map((result) => ({
              Title: result.Title,
              Amount: result.Amount,
              IncomeDate: result.IncomeDate,
              Description: result.Description,
              FileName: result.FileName || "-- No File Attached --",
              FileType: result.FileType,
              FileDate: result.FileDate,
            }))
          : [
              {
                Title: "There is no Additional Income Recorded",
                Amount: "",
                IncomeDate: "",
                Description: "",
                FileName: "",
                FileType: "",
                FileDate: "",
              },
            ];

      const worksheet4 = xlsx.utils.json_to_sheet(rows);
      const Widths = [
        { wch: 15 },
        { wch: 10 },
        { wch: 10 },
        { wch: 30 },
        { wch: 20 },
        { wch: 11 },
        { wch: 10 },
      ];
      worksheet4["!cols"] = Widths;
      if (results.length == 0) {
        const Merges = [
          {
            s: { r: 1, c: 0 },
            e: { r: 1, c: 6 },
          },
        ];
        worksheet4["!merges"] = Merges;
      }

      xlsx.utils.sheet_add_aoa(
        worksheet4,
        [
          [
            "Title",
            "Amount",
            "Income Date",
            "Description",
            "File Name",
            "File Type",
            "File Date",
          ],
        ],
        { origin: "A1" }
      );
      xlsx.utils.book_append_sheet(workbook, worksheet4, "Additional Income");
      xlsx.writeFile(workbook, `./routes/history/export/FinancialYear${selectedYear}.xlsx`);
      
      //Save file Location to export file array
      const Files = results
        .filter((result) => result.FileLocation)
        .map((result) => ({Type: 'AdditionalIncome', Title: result.Title,FileLocation: result.FileLocation, FileName: result.FileName}));
      
      Files.forEach((file) => {ExportFiles.push(file)});
    } else {
      console.error(err);
      error(res, 500, "Failed to Retrieve Data");
    }
  });
  return ExportFiles;
}

async function email(id, year) {
  await sleep(1000);
  //Email the zip file to user
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "taxtimemobileassistant@gmail.com",
      pass: "wrrpjldiyufxaysn",
    },
  });

  //Get User Email
  sql = "SELECT Email FROM UserLogin WHERE UserID = ?";
  connection.query(sql, [id], (err, results) => {
    if (!err) {
      const UserEmail = results[0].Email;
      console.log(UserEmail);

      var mailOptions = {
        from: "taxtimemobileassistant@gmail.com",
        to: UserEmail,
        subject: "Financial Year " + year,
        text:
          "The following attachment contains the Additional Income, Tax Deductions/Expenses, Donations and Capital Gain/Loss in the Financial Year " +
          year +
          ".",
        attachments: [
          {
            filename: "FinancialYear" + year + ".zip",
            path: "./routes/history/export/FinancialYear" + year + ".zip",
          },
        ],
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
          DeleteDir("./routes/history/export/");
        }
      });
    } else {
      console.error(err);
      error(res, 500, "Failed to find User Email");
    }
  });
}

async function zipfile(ExportFiles, year) {
  await sleep(1000);
  //Zip File
  const zip = new JSZip();
  try {
    console.log("Zipping");
    const xlsxfile = fs.readFileSync(`./routes/history/export/FinancialYear${year}.xlsx`);
    zip.file("FinancialYear" + year + ".xlsx", xlsxfile);

    console.log(ExportFiles);
    ExportFiles.forEach((file) => {
      const data = fs.readFileSync(file.FileLocation);
      let subfolder;
      if (file.Type === "AdditionalIncome") {
        subfolder = zip.folder("Additional Income").folder(file.TaxType);
      } else if (file.Type === "Deductions") {
        subfolder = zip.folder("Deduction").folder(file.TaxType);
      } else if (file.Type === "Donations") {
        subfolder = zip.folder("Donation").folder(file.Org);
      }
      subfolder.file(file.FileName, data);
    })

    zip
      .generateNodeStream({ type: "nodebuffer", streamFiles: true })
      .pipe(
        fs.createWriteStream(
          "./routes/history/export/FinancialYear" + year + ".zip"
        )
      )
      .on("finish", function () {});
    console.log("./routes/history/export/FinancialYear" + year + ".zip");
  } catch (err) {
    console.error(err);
  }
}

function exp(req, res) {
  if (req.method === "POST" && req.url === "/export") {
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

        if (!fs.existsSync('./routes/history/export/')) {
          // If it doesn't exist, create it
          fs.mkdirSync('./routes/history/export/');
        }

        const ExportFiles = createxlsx(UserID, inputData.selectedYear, res);
        zipfile(ExportFiles, inputData.selectedYear);
        email(UserID, inputData.selectedYear);
        respond(res, 201, {result: 0});
      } catch (error) {
        console.error(error);
        error(res, 400, "Invalid JSON data");
      }
    });
  } else {
    error(res, 404, "Not Found");
  }
}

module.exports = exp;
