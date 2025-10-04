import express from "express";
import pg from "pg";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const port = 3000;

//localhost:3000 is only place to reciece info from
const corsOptions = {
    origin: "https://localhost:3000",
}

app.use(cors(corsOptions));
app.use(bodyParser.json());

//for testing purposes
app.get("/api", (req, res) =>{
    res.json({group8: ["daniel", "cameron", "analia", "ivan", "abbi"]})
});


//info hold
const pool = new pg.Pool({
  user: "postgres",
  host: "3000",
  database: "login",
  password: "8uXXmbVqzL",
  port: 1234,
});

// posts
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const userResult = await pool.query(
      "INSERT INTO login.username (username) VALUES ($1) RETURNING user_id",
      [username]
    );

    const userId = userResult.rows[0].user_id;

    await pool.query(
      "INSERT INTO login.password (user_id, pswd) VALUES ($1, $2)",
      [userId, hashedPassword]
    );

    res.json({ success: true, message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: "Username already exists" });
  }
});

// Login endpoint
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const userResult = await pool.query(
      "SELECT user_id FROM login.username WHERE username = $1",
      [username]
    );

    if (userResult.rowCount === 0) {
      return res.status(400).json({ success: false, error: "Invalid username" });
    }

    const userId = userResult.rows[0].user_id;

    const pswdResult = await pool.query(
      "SELECT pswd FROM login.password WHERE user_id = $1",
      [userId]
    );

    const hashedPassword = pswdResult.rows[0].pswd;

    const isMatch = await bcrypt.compare(password, hashedPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Invalid password" });
    }

    res.json({ success: true, message: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
