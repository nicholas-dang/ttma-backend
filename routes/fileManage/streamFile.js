const { respond, error } = require("../utils");
const connection = require("../../dbconnection");
const fs = require('fs');
const path = require('path');

function StreamFile(req,res) {
    if (req.method === "GET") {
        /** No Security Validation Here since Static file serving **/
        
        const filePath = path.join('.', req.url);
        console.log('Filepath: ', req.url);
        const extname = path.extname(req.url);

        const mimeTypes = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".jpe": "image/jpe",
            ".png": "image/png",
            ".doc": "application/msword",
            ".docx": "application/msword",
            ".pdf": "application/pdf",
            // Add more as needed
        };

        const contentType = mimeTypes[extname] || "application/octet-stream";
        fs.readFile(filePath, (err, data) =>{
            if(!err) {
                res.writeHead(200, {'Content-Type': contentType });
                res.end(data);
            } else {
                console.error(err);
                error(res, 404, 'File not fould');
            }
        })
    }
}

module.exports = StreamFile;