const { respond, error } = require("../utils");
const connection = require("../../dbconnection");
const {verifyToken} = require("../authentication/BearerToken");

function GetFile (req,res) {
    if (req.method === "POST" && req.url === "/getFile") {
        let data = "";

        req.on("data", (chunk) => {
        data += chunk;
        });

        req.on("end", () => {
            try {
                
                var UserID = verifyToken(req,res);
                if (UserID == -1) {
                    console.log("Error with Token");
                    return;
                }

                // Variable declaration
                const inputData = JSON.parse(data);
                const DocType = inputData.DocumentType;
                const DocID = inputData.DocumentID;
                console.log('Get File called');

                let sql = `SELECT ft.FileID, ft.Type, ft.FileName, ft.FileLocation FROM FilesImages ft ` +
                          `INNER JOIN ${DocType}Files dt ON ft.FileID = dt.FileID ` +
                          `WHERE ${DocType}ID = ${DocID}`;
                
                connection.query(sql, (err, results) => {
                    if (!err) {
                        list = []
                        for (let i = 0; i < results.length; i++) {
                            list.push({
                                FileID: results[i].FileID,
                                Type: results[i].Type,
                                FileName: results[i].FileName,
                                FileLocation: results[i].FileLocation,
                            });
                            console.log(list[i]);
                        }
                        respond(res, 201, {
                            message: list,
                            result: 0,
                        });
                    } else {
                        console.error('Querry error: ', err);
                        error(res, 500, 'Database query error');
                    }
                });
                
            } catch {
                console.error(error);
                error(res, 400, "Invalid JSON data");
            } // end catch
        });
    } else {
        error (res, 404, "Not Found");
    }
}

module.exports = GetFile;
