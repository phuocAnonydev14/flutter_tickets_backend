const Pool = require("pg").Pool;
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "flutter_proj",
  password: "Deptrai@123",
  port: 5432,
});

const getUserById = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query("SELECT * FROM users WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getUsers = (request, response) => {
  pool.query("SELECT * FROM users ORDER BY id ASC", (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const createUser = (request, response) => {
  const { name, email } = request.body;

  pool.query(
    "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
    [name, email],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`User added with ID: ${results.rows[0].id}`);
    }
  );
};

const updateUser = (request, response) => {
  const id = parseInt(request.params.id);
  const { name, email } = request.body;

  pool.query(
    "UPDATE users SET name = $1, email = $2 WHERE id = $3",
    [name, email, id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`User modified with ID: ${id}`);
    }
  );
};

const deleteUser = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query("DELETE FROM users WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(`User deleted with ID: ${id}`);
  });
};

// flight

const getFlights = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM flights");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const addFlight = async (req, res) => {
  const { from, to, flying_time, date, departure_time, number } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO flights (from_code, from_name, to_code, to_name, flying_time, date, departure_time, number) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        from.code,
        from.name,
        to.code,
        to.name,
        flying_time,
        date,
        departure_time,
        number,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateFlight = async (req, res) => {
  const { id } = req.params;
  const { from, to, flying_time, date, departure_time, number } = req.body;
  try {
    const result = await pool.query(
      "UPDATE flights SET from_code = $1, from_name = $2, to_code = $3, to_name = $4, flying_time = $5, date = $6, departure_time = $7, number = $8 WHERE id = $9 RETURNING *",
      [
        from.code,
        from.name,
        to.code,
        to.name,
        flying_time,
        date,
        departure_time,
        number,
        id,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Flight not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteFlight = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM flights WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Flight not found" });
    }
    res.status(200).json({ message: "Flight deleted successfully" });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  pool,
  getFlights,
  addFlight,
  updateFlight,
  deleteFlight,
};
