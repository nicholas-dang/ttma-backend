const { respond, error } = require("../utils");
const connection = require("../../dbconnection");
const fs = require('fs');
const {verifyToken} = require("../authentication/BearerToken");

function DeleteFile(req,res) {
    if (req.method === "POST" && req.url === "/deleteFile") {
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
                const DocumentType = inputData.DocumentType;
                const DocumentID = inputData.DocumentID;
                const FileIDs = inputData.FileID;
                console.log("Detelete File Called");
                const FileIDList = FileIDs.join(',');
                console.log('FileIDList: ', FileIDList);
                // Retreive File location
                
                // Delete one file or all files from a document
                let sql = `SELECT fi.FileLocation FROM FilesImages fi ` +
                `INNER JOIN ${DocumentType}Files sf ON fi.FileID = sf.FileID ` +
                `WHERE sf.${DocumentType}ID = ${DocumentID} ` +
                (FileIDs.length > 0 ? `AND fi.FileID IN (${FileIDList})` : '')

                connection.query(sql, (err,results) => {
                    if (!err){
                        console.log('querried for file path: '+ sql);
                        const fileLocations = results.map(row => row.FileLocation);
                        
                        // Delete files using fs.unlink
                        fileLocations.forEach(fileLocation => {
                            fs.unlink(fileLocation, (unlinkErr) => {
                                if (unlinkErr) {
                                    console.error("Failed to delete file:", unlinkErr);
                                } else {
                                    console.log("File deleted:", fileLocation);
                                }
                            });
                        });
                    } else {
                        console.error(err);
                        error(res, 500, "Failed to DeleteFile file");
                    }
                }); // End Retreive File location
                           
                // Delete file and link from database
                // Linking file will be deleted using ON DELETE CASCADE
                sql = `DELETE FilesImages FROM FilesImages ` + 
                `INNER JOIN ${DocumentType}Files ON FilesImages.FileID = ${DocumentType}Files.FileID ` + 
                `WHERE ${DocumentType}ID = ${DocumentID};`;

                if (FileIDs.length > 0) {
                    sql = `DELETE FROM FilesImages WHERE FileID IN (${FileIDList});`;
                }

                connection.query(sql, (err,results) => {
                    if (!err) {
                        console.log('File removed from database!');
                        respond(res, 201, {
                            message: 'File remove succeeded!',
                            result: 0,
                        });
                    }
                    else {
                        console.error(err);
                        error(res, 500, "Failed to remove files");
                    }
                });
                

            } catch {
                console.error(error);
                error(res, 400, "Invalid JSON data");
            }
        }); // end req.on
    } else {
        error (res, 404, "Not Found");
    }
}

module.exports = DeleteFile;