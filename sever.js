const express = require('express');
const bodyParser = require('body-parser');
const mssql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// การตั้งค่าการเชื่อมต่อ MSSQL
const dbConfig = {
    user: 'ipuetdatabase',         // ชื่อผู้ใช้งานฐานข้อมูล
    password: 'Audi2546', // รหัสผ่าน
    server: 'ipuetdatabase.database.windows.net',     // ชื่อเซิร์ฟเวอร์
    database: 'ipuetdatabase',// ชื่อฐานข้อมูล
    options: {
        encrypt: true,       // ใช้ในกรณี Azure SQL
        trustServerCertificate: true
    }
};

// ฟังก์ชันเชื่อมต่อฐานข้อมูล
async function connectToDB() {
    try {
        const pool = await mssql.connect(dbConfig);
        return pool;
    } catch (err) {
        console.error('Database connection failed: ', err);
        throw err;
    }
}

// Endpoint สำหรับ Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'กรุณากรอกอีเมลและรหัสผ่าน!' });
    }

    try {
        const pool = await connectToDB();
        const result = await pool.request()
            .input('email', mssql.VarChar, email)
            .input('password', mssql.VarChar, password)
            .query('SELECT * FROM Users WHERE email = @email AND password = @password');

        if (result.recordset.length > 0) {
            res.json({ message: 'เข้าสู่ระบบสำเร็จ!', success: true });
        } else {
            res.status(401).json({ message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง!' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ!' });
    }
});

// เริ่มเซิร์ฟเวอร์
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
