const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const PORT = 3000;

const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

app.use(express.json());
app.post('/register', async (req, res) => {
    const name = req.body.name;
    const phoneNumber = req.body.phoneNumber

    conn.connect(error => {
        if (error) {
            res.json({ succes: false, error: error.stack, duplicate: false });
            return;
        }

        const insertQuery = 'INSERT INTO users (name, phoneNumber) VALUES (?, ?)';
        const values = [name, phoneNumber];

        conn.query(insertQuery, values, (error, results, fields) => {

            if (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    res.json({ success: false, error: 'Phone number already exists', duplicate: true, });
                } else {
                    res.json({ success: false, error: error.message, duplicate: null, });
                }
                return;
            }

            const userId = results.insertId.toString();
            res.json({ succes: true, error: null, duplicate: null, usedName: name, usedPhoneNumber: phoneNumber, usedUserId: userId });
        });   
    });
});

app.post('/thought', async (req, res) => {
    const userId = req.body.user;
    const type = req.body.type
    const time = req.body.time;
    const value = req.body.value;

    conn.connect(error => {
        if (error) {
            res.json({ succes: false, error: error.stack });
            return;
        }

        const insertQuery = 'SELECT * FROM user_thoughts';

        conn.query(insertQuery, (error, results, fields) => {
            if (error) {
                res.json({ success: false, error: error.message });
                return;
            }

            for (let i = 0; i < results.length; i++) {;
                if (value == results[i]['value']) {
                    console.log('matched')
                }
            }
        });

        const insertQuery2 = 'INSERT INTO user_thoughts (user_id, type, thoughtTime, value) VALUES (?, ?, ?, ?)';
        const values2 = [userId, type, time, value];

        conn.query(insertQuery2, values2, (error, results, fields) => {

            if (error) {
                res.json({ success: false, error: error.message });
                return;
            }

            res.json({ succes: true, error: null });
        });   
    });
});

app.post('/matches', async (req, res) => {
    const userId = req.body.user;

    conn.connect(error => {
        if (error) {
            res.json({ succes: false, error: error.stack });
            return;
        }
    });

    const insertQuery = 'SELECT * FROM user_thoughts WHERE user_id = ? ORDER BY time DESC';
    const values = [userId];

    conn.query(insertQuery, values, (error, results, fields) => {
        res.json({ succes: true, result: results });
    });
});

app.post('/user', async (req, res) => {
    const userId = req.body.user;

    conn.connect(error => {
        if (error) {
            res.json({ succes: false, error: error.stack });
            return;
        }
    });

    const insertQuery = 'SELECT * FROM users WHERE id = ?';
    const values = [userId];

    conn.query(insertQuery, values, (error, results, fields) => {
        res.json({ succes: true, result: results[0]['name'] });
    });
});

app.listen(PORT, '0.0.0.0', (error) => {
    if (!error)
        console.log("The server is running on port " + PORT);
    else
        console.log("Error occurred, server can't start", error)
});