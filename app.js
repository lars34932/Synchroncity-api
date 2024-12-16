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
app.post('/login', async (req, res) => {
    const email = req.body.email;

    conn.connect(error => {
        if (error) {
            res.json({ success: false, error: error.stack });
            return;
        }

        const insertQuery = 'SELECT * FROM users WHERE email = ?';
        const values = [email];

        conn.query(insertQuery, values, (error, results, fields) => {
            if (error) {
                res.json({ success: false, error: error.message });
                return;
            }

            res.json({ success: false, hash: results.password, salt: results.salt, error: null });
        });
    });
})

app.post('/register', async (req, res) => {
    const name = req.body.name;
    const password = req.body.password;
    const email = req.body.email;
    const phoneNumber = req.body.phoneNumber;
    const salt = req.body.salt;

    conn.connect(error => {
        if (error) {
            res.json({ success: false, error: error.stack, duplicate: false });
            return;
        }

        const insertQuery = 'INSERT INTO users (name, password, salt, email, phoneNumber) VALUES (?, ?, ?, ?, ?)';
        const values = [name, password, salt, email, phoneNumber];

        conn.query(insertQuery, values, (error, results, fields) => {

            if (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    res.json({
                        success: false,
                        error: 'Email or phone number already exists',
                        duplicate: true,
                    });
                } else {
                    res.json({
                        success: false,
                        error: error.message,
                        duplicate: null,
                    });
                }
                return;
            }

            const userId = results.insertId.toString();
            res.json({
                success: true,
                error: null,
                duplicate: null,
                usedName: name,
                usedEmail: email,
                usedPhoneNumber: phoneNumber,
                usedUserId: userId,
            });
        });
    });
});

app.post('/thought', async (req, res) => {
    const userId = req.body.user;
    const type = req.body.type;
    const time = req.body.time;
    const value = req.body.value.toLowerCase();

    conn.connect(error => {
        if (error) {
            res.json({ success: false, error: error.stack });
            return;
        }

        const selectQuery = 'SELECT * FROM user_thoughts WHERE value = ? ORDER BY time DESC';
        const selectValues = [value];

        conn.query(selectQuery, selectValues, (error, results) => {
            if (error) {
                res.json({ success: false, error: error.message });
                return;
            }

            let inserted = false;

            for (let i = 0; i < results.length; i++) {
                const result = results[i];

                if (Number(userId) !== Number(result['user_id']) && result['matched'] === 0) {
                    const insertQuery = 'INSERT INTO user_thoughts (user_id, type, thoughtTime, value, matched, matched_user_id) VALUES (?, ?, ?, ?, ?, ?)';
                    const insertValues = [userId, type, time, value, true, result['user_id']];

                    conn.query(insertQuery, insertValues, (error) => {
                        if (error) {
                            res.json({ success: false, error: error.message });
                            return;
                        }

                        res.json({ success: true, message: "Matched and inserted successfully", error: null });
                    });

                    const insertQuery2 = 'UPDATE user_thoughts SET matched = ?, matched_user_id = ? WHERE id = ?';
                    const insertValues2 = [true, userId, result['id']];

                    conn.query(insertQuery2, insertValues2, (error) => {
                        if (error) {
                            res.json({ success: false, error: error.message });
                            return;
                        }
                    });
                    inserted = true;

                    return;
                }
            }

            if (!inserted) {
                const insertQuery = 'INSERT INTO user_thoughts (user_id, type, thoughtTime, value, matched, matched_user_id) VALUES (?, ?, ?, ?, ?, ?)';
                const insertValues = [userId, type, time, value, false, null];

                conn.query(insertQuery, insertValues, (error) => {
                    if (error) {
                        res.json({ success: false, error: error.message });
                        return;
                    }

                    res.json({ success: true, message: "Inserted without matching", error: null });
                });
            }
        });
    });
});

app.post('/matches', async (req, res) => {
    const userId = req.body.user;

    conn.connect(error => {
        if (error) {
            res.json({ success: false, error: error.stack });
            return;
        }
    });

    const insertQuery = 'SELECT * FROM user_thoughts WHERE user_id = ? ORDER BY time DESC';
    const values = [userId];

    conn.query(insertQuery, values, (error, results, fields) => {
        res.json({ success: true, result: results });
    });
});

app.post('/user', async (req, res) => {
    const userId = req.body.user;

    conn.connect(error => {
        if (error) {
            res.json({ success: false, error: error.stack });
            return;
        }
    });

    const insertQuery = 'SELECT * FROM users WHERE id = ?';
    const values = [userId];

    conn.query(insertQuery, values, (error, results, fields) => {
        res.json({ success: true, result: results[0]['name'] });
    });
});

app.listen(PORT, '0.0.0.0', (error) => {
    if (!error)
        console.log("The server is running on port " + PORT);
    else
        console.log("Error occurred, server can't start", error)
});