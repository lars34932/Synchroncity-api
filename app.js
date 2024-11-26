const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.post('/register', async (req, res) => {
    const name = req.body.name;
    const phoneNumber = req.body.phoneNumber

    const conn = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    conn.connect(error => {
        if (error) {
            res.json({ succes: false, error: error.stack, duplicate: false });
            return;
        }

        const insertQuery = 'INSERT INTO users (name, phoneNumber) VALUES (?, ?)';
        const values = [name, phoneNumber];

        conn.query(insertQuery, values, (error, results, fields) => {
            conn.end();

            if (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    res.json({ success: false, error: 'Phone number already exists', duplicate: true, });
                } else {
                    res.json({ success: false, error: error.message, duplicate: null, });
                }
                return;
            }

            res.json({ succes: true, error: null, duplicate: null, usedName: name, usedPhoneNumber: phoneNumber });
        });   
    });
});

app.post('/test', (req, res) => {
    res.send('test')
})

app.listen(PORT, '0.0.0.0', (error) => {
    if (!error)
        console.log("The server is running on port " + PORT);
    else
        console.log("Error occurred, server can't start", error)
});