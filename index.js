const express = require("express");
const bodyParser = require("body-parser");
const app = express();
var cors = require("cors");
const db = require("./service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = db.pool;
app.use(cors());
const port = 3001;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get("/", (request, response) => {
  response.json({ info: "Node.js, Express, and Postgres API" });
});

app.get("/users", db.getUsers);
app.get("/users/:id", db.getUserById);
app.post("/users", db.createUser);
app.put("/users/:id", db.updateUser);
app.delete("/users/:id", db.deleteUser);

app.get("/flights", db.getFlights);
app.post("/flights", db.addFlight);
app.put("/flights/:id", db.updateFlight);
app.delete("/flights/:id", db.deleteFlight);

app.post("/register", async (req, res) => {
  console.log(req.body);
  const { name, email, password } = req.body;
  try {
    const existingUser = await pool.query(
      'SELECT * FROM "user" WHERE email = $1',
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO "user" (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, hashedPassword]
    );

    res.status(201).json(result.rows[0]);
    console.log("return done");
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const SECRET_KEY = "askdjjksahdkjahkdkjfdshjkfhdskjf";
    const user = await pool.query('SELECT * FROM "user" WHERE email = $1', [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.rows[0].id, email: user.rows[0].email },
      SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ token, username: user.rows[0].email });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/book_tickets", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "book_ticket"');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/flight_tickets", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "flight_ticket"');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/book_ticket/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM "book_ticket" WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Book ticket not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/flight_ticket/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM "book_ticket" WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Book ticket not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/add_owner_hotel_ticket", async (req, res) => {
  const { passport, payment_method, ticket_id, owner_id } = req.body;

  try {
    const ticketResult = await pool.query(
      'SELECT * FROM "hotel_ticket" WHERE id = $1',
      [ticket_id]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: "Hotel ticket not found" });
    }

    const ownerResult = await pool.query('SELECT * FROM "user" WHERE id = $1', [
      owner_id,
    ]);

    if (ownerResult.rows.length === 0) {
      return res.status(404).json({ error: "Owner not found" });
    }

    const result = await pool.query(
      'INSERT INTO "owner_hotel_ticket" (passport, payment_method, ticket_id, owner_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [passport, payment_method, ticket_id, owner_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
