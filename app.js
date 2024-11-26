const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.post('/register', async (req, res)=>{
    const name = req.body.name;
    const phoneNumber = req.body.phoneNumber
    const conn = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    conn.connect(err => {
        if(err) {
            console.error('Database connection failed:', err.stack);
            return;
        }
        
        console.log('connection made!');
    })
})

app.post('/test', (req, res) =>{
    res.send('test')
})

app.listen(PORT, '0.0.0.0', (error) =>{
    if(!error)
        console.log("The server is running on port " + PORT);
    else
        console.log("Error occurred, server can't start", error)
});