const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'PS2320',
  password: 'Ttma@2320',
  database: 'TTMA_Database',
  multipleStatements: true,
});

module.exports = connection;