const mysql = require('mysql2/promise');
// Kết nối với MySQL sử dụng Promise API
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "jwtdb",
});
module.exports = db;

