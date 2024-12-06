const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const PORT = 3000;

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

app.use(express.json());
app.post('/register', (req, res) => {
    const { name, phoneNumber } = req.body;

    const insertQuery = 'INSERT INTO users (name, phoneNumber) VALUES (?, ?)';
    const values = [name, phoneNumber];

    pool.query(insertQuery, values, (error, results) => {
        if (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                res.json({ success: false, error: 'Phone number already exists', duplicate: true });
            } else {
                res.json({ success: false, error: error.message, duplicate: null });
            }
            return;
        }

        const userId = results.insertId.toString();
        res.json({ success: true, error: null, duplicate: null, usedName: name, usedPhoneNumber: phoneNumber, usedUserId: userId });
    });
});

app.post('/thought', (req, res) => {
    const { user, type, time, value } = req.body;

    const insertQuery = 'INSERT INTO user_thoughts (user_id, type, thoughtTime, value) VALUES (?, ?, ?, ?)';
    const values = [user, type, time, value];

    pool.query(insertQuery, values, (error, results) => {
        if (error) {
            res.json({ success: false, error: error.message });
            return;
        }

        res.json({ success: true, error: null });
    });
});

app.listen(PORT, '0.0.0.0', (error) => {
    if (!error) {
        console.log(`The server is running on port ${PORT}`);
    } else {
        console.log("Error occurred, server can't start", error);
    }
});