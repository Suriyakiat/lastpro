const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');

// การตั้งค่าการเชื่อมต่อ MSSQL
const config = {
    user: 'ipuetdatabase',          // ชื่อผู้ใช้ MSSQL
    password: 'Audi2546',      // รหัสผ่าน MSSQL
    server: 'ipuetdatabase.database.windows.net',           // ชื่อเซิร์ฟเวอร์ MSSQL
    database: 'ipuetdatabase',  // ชื่อฐานข้อมูล
    options: {
        encrypt: true,             // สำหรับ Azure
        trustServerCertificate: true, // สำหรับ local dev
    }
};

const app = express();
app.use(bodyParser.json());

// เชื่อมต่อ MSSQL
sql.connect(config).then(pool => {
    console.log("Connected to MSSQL");

    // Route สำหรับล็อกอิน
    app.post('/login', async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
        }

        try {
            const result = await pool.request()
                .input('email', sql.VarChar, email)
                .input('password', sql.VarChar, password)
                .query(`SELECT * FROM Users WHERE email = @email AND password = @password`);

            if (result.recordset.length > 0) {
                res.status(200).send({ message: "เข้าสู่ระบบสำเร็จ" });
            } else {
                res.status(401).send({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "เกิดข้อผิดพลาดในระบบ" });
        }
    });

}).catch(err => {
    console.error('Database connection failed: ', err);
});

// เปิดเซิร์ฟเวอร์
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
