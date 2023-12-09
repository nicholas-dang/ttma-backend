const { respond, error } = require("../utils");
const connection = require("../../dbconnection");
const {verifyToken} = require("../authentication/BearerToken");

const fs = require('fs');
const multer = require('multer');

const currentDate = new Date();

// Format the date as 'YYYY-MM-DD HH:MM:SS'
const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');

function HandleUpload(req,res) {
    if (req.method === "POST" && req.url === "/handleUpload") {
    
        var UserID = verifyToken(req,res);
        if (UserID == -1) {
          return;
        }

        /**  **/
        const StorageLocation = 'uploads';

        /** Multer configuration **/
        const storageEngine = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, StorageLocation);
            },
            filename: (req, file, cb) => {
                cb(null, file.originalname);
            },
        });

        const upload = multer({ storage: storageEngine });
        upload.array(`files`)(req,res, async (err) => {
            if (err) {
                console.error(err);
                error (res, 500, 'Error uploading files');
            } else {
                console.log('uploadcalled');
                // Use the client-specified path or a default path if not provided

                const DocumentType = req.body.DocumentType, 
                      DocumentID = req.body.DocumentID;
                const uploadPath = `${StorageLocation}/${UserID}/${DocumentType}/${DocumentID}`;
                console.log("Received Upload Path: " + uploadPath);
                console.log (`Received DocumentType: ${DocumentType} - ID: ${DocumentID}`);
                // Create the upload directory if it doesn't exist
                if (!fs.existsSync(uploadPath)) {
                    try {
                        fs.mkdirSync(uploadPath, { recursive: true });
                        console.log(`Created directory: ${uploadPath}`);
                    } catch (error) {
                        console.error(`Error create directory: ${uploadPath}` )
                    }
                }

                /** Post upload processing **/
                req.files.forEach((file) => {
                    
                    
                    const sourcePath = file.path; // Temporary path
                    /*if(!fs.existsSync(sourcePath)) {
                        console.log('Moving file: source file not found');
                        error (res, 400, "Error with File Upload - Multer");
                        return;
                    }*/


                    let targetPath = `${uploadPath}/${file.filename}`; // desired target path
                    let filename = file.filename;
                    /** Auto increment system if file already exists**/
                    while (fs.existsSync(targetPath)) {
                        // Split the file extension (if any) from the filename
                        const extIndex = filename.lastIndexOf('.');
                        const baseName = extIndex !== -1 ? filename.slice(0, extIndex) : file.filename;
                        const extension = extIndex !== -1 ? filename.slice(extIndex) : '';
                    
                        // Add an increment to the filename
                        filename = `${baseName}_1${extension}`;
                        targetPath = `${uploadPath}/${filename}`;
                    }
                    
                    console.log('targetPath: ', targetPath);
                    // Move File to desired path
                    try{
                         fs.renameSync(sourcePath, targetPath);

                         /** Add File to database table **/
                        sql = 'INSERT INTO FilesImages (FileName, Type, Date, FileLocation) ' +
                        `VALUES ('${filename}','${file.mimetype}','${formattedDate}','${targetPath}'); ` +
                        'SELECT LAST_INSERT_ID() AS lastId;';
                        connection.query(sql, (err,results) =>{
                            if(!err) {
                                
                                console.log("File added to Database - ID:"+ results[1][0].lastId);
                                
                                /** Link File to Document **/
                                sql = `INSERT INTO ${DocumentType}Files (${DocumentType}ID, FileID) ` +
                                        `VALUE (${DocumentID},${results[1][0].lastId})`;
                                connection.query(sql, (err,results) =>{
                                    if(!err) {
                                        console.log('File Linked success');
                                    } else {
                                        console.error(err);
                                        error(res, 500, "Failed to link");
                                    }
                                }); // end Link File query
                                
                            } else {
                                console.error(err);
                                error(res, 500, "Failed to Add File");
                            }
                        }); // end add File query

                    } catch (err) {
                        console.error('File system: ', err);
                    }
                   
                    
                    
                }); // end req.file.forEach - Post Upload processing


                console.log('File uploaded to path:', uploadPath);
                respond(res, 201, 
                    {
                        message: 'Upload File Completed',
                        result: 0,
                    });
            }
        });
        
    } else {
        error (res, 404, "Not Found");
    }
}

module.exports = HandleUpload;