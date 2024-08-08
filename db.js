const Pool = require("pg").Pool;
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "flutter_proj",
  password: "Deptrai@123",
  port: 5432,
});
