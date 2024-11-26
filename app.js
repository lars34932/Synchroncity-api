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
        host: 'localhost',
        user: 'synchron',
        password: '',
        database: 'synchroncity',
    });

    conn.connect(err => {
        if(err) {
            console.error('Database connection failed:', err.stack);
            return;
        }
        
        const [result, fields] = conn.query('INSERT INTO user (name, phoneNumber) VALUES (?, ?)', [name, phoneNumber]);

        console.log(result);
        console.log(fields);
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