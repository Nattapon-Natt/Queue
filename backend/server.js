const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

app.use('/uploads', express.static(uploadsDir));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "queue"
});

const port = 8081;
app.listen(port, () => {
    console.log("Listening on port", port);
});

const upload = multer({ dest: 'uploads/' });

// สำหรับสมัครสมาชิก
app.post('/register', (req, res) => {
    const { name, lastname, phone, email, password, memberType } = req.body;

    let sql = '';
    let values = [name, lastname, phone, email, password];

    switch (memberType) {
        case 'cus':
            sql = "INSERT INTO customer (name, lastname, phone, email, password) VALUES (?, ?, ?, ?, ?)";
            break;
        case 'emp':
            sql = "INSERT INTO employee (name, lastname, email, password) VALUES (?, ?, ?, ?)";
            break;
        default:
            return res.status(400).json({ message: "Invalid member type." });
    }

    db.query(sql, values, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error while creating user." });
        }
        return res.status(200).json({ message: "User registered successfully!" });
    });
});

// สำหรับเข้าสู่ระบบผู้ใช้
app.post('/login', (req, res) => {
    const sql = "SELECT * FROM customer WHERE email = ? AND password = ?";
    const values = [req.body.email, req.body.password];

    db.query(sql, values, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "ERROR" });
        }

        if (data.length > 0) {
            const user = data[0];
            return res.status(200).json({
                status: "Success",
                name: user.name,
                lastname: user.lastname,
                phone: user.phone,
                email: user.email,
                password: user.password,
                memberType: "cus"
            });
        } else {
            return res.status(400).json({ status: "FAIL" });
        }
    });
});

// สำหรับเข้าสู่ระบบพนักงาน
app.post('/login-emp', (req, res) => {
    const sql = "SELECT * FROM employee WHERE email = ? AND password = ?";
    const values = [req.body.email, req.body.password];

    db.query(sql, values, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "ERROR" });
        }

        if (data.length > 0) {
            const user = data[0];
            return res.status(200).json({
                status: "Success",
                name: user.name,
                lastname: user.lastname,
                position: user.position,
                phone: user.phone,
                email: user.email,
                password: user.password,
                birthdate: user.birthdate,
                memberType: "emp"
            });
        } else {
            return res.status(400).json({ status: "FAIL" });
        }
    });
});

// ดึงข้อมูลโปรไฟล์ลูกค้า
app.get('/users/cus', (req, res) => {
    const { email } = req.query;

    const sql = "SELECT * FROM customer WHERE email = ?";

    db.query(sql, [email], (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error retrieving profile data." });
        }

        if (data.length > 0) {
            return res.status(200).json(data[0]);
        } else {
            return res.status(404).json({ message: "User not found." });
        }
    });
});

// ดึงข้อมูลโปรไฟล์ลูกค้าทั้งหมด
app.get('/cus', (req, res) => {
    const { id } = req.query;

    if (id) {
        // หากมี id ใน query ให้ดึงข้อมูลเมนูที่ตรงกับ id
        const sql = "SELECT * FROM customer WHERE id = ?";
        db.query(sql, [id], (err, data) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Error retrieving menu data." });
            }

            if (data.length > 0) {
                return res.status(200).json(data[0]); // ส่งข้อมูลเมนูที่ตรงกับ id
            } else {
                return res.status(404).json({ message: "Menu not found." });
            }
        });
    } else {
        // หากไม่มี id ให้ดึงข้อมูลทั้งหมดจากเมนู
        const sql = "SELECT * FROM customer";
        db.query(sql, (err, data) => {
            if (err) {
                console.error("Error fetching menu:", err);
                return res.status(500).json({ message: "Error fetching menu." });
            }
            return res.status(200).json(data); // ส่งข้อมูลทั้งหมด
        });
    }
});

// ลบลูกค้า
app.delete('/cus/:id', (req, res) => {
    const { id } = req.params;
    const deleteSql = "DELETE FROM customer WHERE id = ?";

    db.query(deleteSql, [id], (deleteErr, result) => {
        if (deleteErr) {
            console.error("Error deleting cus:", deleteErr);
            return res.status(500).json({ message: "Error deleting cus." });
        }

        if (result.affectedRows > 0) {
            res.status(200).json({ message: "Customer deleted successfully." });
        } else {
            res.status(404).json({ message: "Customer not found." });
        }
    });
});

// อัปเดตข้อมูลลูกค้า
app.put('/cus/:id', (req, res) => {
    const { id } = req.params;
    const { name, lastname, phone, email } = req.body;

    console.log("Request Parameters:", { id, name, lastname, phone, email });

    const sql = "UPDATE customer SET name = ?, lastname = ?, phone = ?, email = ? WHERE id = ?";
    const values = [name, lastname, phone, email, id];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error updating customer:", err);
            return res.status(500).json({ message: "Error updating customer: " + err.message });
        }

        console.log("Query Result:", result);
        if (result.affectedRows > 0) {
            return res.status(200).json({ message: "Customer updated successfully." });
        } else {
            return res.status(404).json({ message: "Customer not found." });
        }
    });
});

// ดึงข้อมูลโปรไฟล์พนักงาน
app.get('/profile/emp', (req, res) => {
    const { email } = req.query;

    const sql = "SELECT * FROM employee WHERE email = ?";

    db.query(sql, [email], (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error retrieving profile data." });
        }

        if (data.length > 0) {
            return res.status(200).json(data[0]);
        } else {
            return res.status(404).json({ message: "User not found." });
        }
    });
});

// ดึงข้อมูลโปรไฟล์พนักงานทั้งหมด
app.get('/emp', (req, res) => {
    const { id } = req.query;

    if (id) {
        // หากมี id ใน query ให้ดึงข้อมูลเมนูที่ตรงกับ id
        const sql = "SELECT * FROM employee WHERE id = ?";
        db.query(sql, [id], (err, data) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Error retrieving emp data." });
            }

            if (data.length > 0) {
                return res.status(200).json(data[0]); // ส่งข้อมูลเมนูที่ตรงกับ id
            } else {
                return res.status(404).json({ message: "Employee not found." });
            }
        });
    } else {
        // หากไม่มี id ให้ดึงข้อมูลทั้งหมดจากเมนู
        const sql = "SELECT * FROM employee";
        db.query(sql, (err, data) => {
            if (err) {
                console.error("Error fetching menu:", err);
                return res.status(500).json({ message: "Error fetching menu." });
            }
            return res.status(200).json(data); // ส่งข้อมูลทั้งหมด
        });
    }
});

// เพิ่มพนักงาน
app.post('/emp', upload.single('image'), (req, res) => {
    const { name, lastname, position, phone, email, password } = req.body; // รับค่าจาก body
    const imagePath = req.file ? req.file.filename : null; // ตรวจสอบไฟล์อัพโหลด

    // ตรวจสอบว่าข้อมูลครบหรือไม่
    if (!name || !lastname || !position || !phone || !email || !password) {
        return res.status(400).json({ error: 'กรุณากรอกรายละเอียดให้สมบูรณ์' });
    }

    // เพิ่มข้อมูลในฐานข้อมูล
    const sql = 'INSERT INTO employee (name, lastname, position, phone, email, password, image) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [name, lastname, position, phone, email, password, imagePath];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error adding employee:', err);
            return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเพิ่มพนักงาน' });
        }

        res.status(201).json({ message: 'พนักงานถูกเพิ่มเรียบร้อยแล้ว', id: result.insertId });
    });
});

// ลบพนักงาน
app.delete('/emp/:id', (req, res) => {
    const { id } = req.params;
    const deleteSql = "DELETE FROM employee WHERE id = ?";

    db.query(deleteSql, [id], (deleteErr, result) => {
        if (deleteErr) {
            console.error("Error deleting cus:", deleteErr);
            return res.status(500).json({ message: "Error deleting cus." });
        }

        if (result.affectedRows > 0) {
            res.status(200).json({ message: "Customer deleted successfully." });
        } else {
            res.status(404).json({ message: "Customer not found." });
        }
    });
});

// อัปเดตข้อมูลพนักงาน
app.put('/emp/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { name, lastname, position, phone, birthdate } = req.body;
    const image = req.file ? req.file.filename : null;

    console.log('Request body:', req.body);
    console.log("Uploaded Image:", image);

    const sql = "UPDATE employee SET name = ?, lastname = ?, position = ?, phone = ?, birthdate = ?, image = ? WHERE id = ?";
    const values = [name, lastname, position, phone, birthdate, image, id];

    console.log('Values for update:', values);

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ message: "Error updating user data." });
        }

        console.log('Query result:', result);

        if (result.affectedRows > 0) {
            return res.status(200).json({ message: "User data updated successfully." });
        } else {
            return res.status(404).json({ message: "User not found." });
        }
    });
});

// อัปเดตข้อมูลพนักงาน(ตัวเอง)
app.put('/profile/emp/:email', upload.single('image'), (req, res) => {
    const { email } = req.params;
    const { name, lastname, position, phone, birthdate } = req.body;
    const image = req.file ? req.file.filename : null;

    console.log('Request body:', req.body);
    console.log("Uploaded Image:", image);

    const sql = "UPDATE employee SET name = ?, lastname = ?, position = ?, phone = ?, birthdate = ?, image = ? WHERE email = ?";
    const values = [name, lastname, position, phone, birthdate, image, email];

    console.log('Values for update:', values);

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ message: "Error updating user data." });
        }

        console.log('Query result:', result);

        if (result.affectedRows > 0) {
            return res.status(200).json({ message: "User data updated successfully." });
        } else {
            return res.status(404).json({ message: "User not found." });
        }
    });
});

// ตั้งค่าที่เก็บไฟล์
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir); // ใช้ uploadsDir ที่กำหนดไว้ข้างต้น
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

// เพิ่มเมนูอาหาร
app.post('/menu', upload.single('image'), (req, res) => {
    const { foodname, price, detail, category } = req.body;  // เพิ่ม category จาก request body
    const imagePath = req.file ? req.file.filename : null;

    if (!foodname || !price) {
        return res.status(400).json({ error: 'กรุณากรอกชื่อเมนูและราคา' });
    }

    const sql = 'INSERT INTO food (foodname, price, detail, image, category) VALUES (?, ?, ?, ?, ?)'; // เพิ่ม category ใน SQL query
    const values = [foodname, price, detail, imagePath, category]; // เพิ่ม category ใน values

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error adding menu item:', err);
            return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเพิ่มเมนู' });
        }

        res.status(201).json({ message: 'เมนูอาหารเพิ่มเรียบร้อยแล้ว', id: result.insertId });
    });
});

// ดึงข้อมูลเมนูอาหารทั้งหมด
app.get('/menu', (req, res) => {
    const { id } = req.query;

    if (id) {
        // หากมี id ใน query ให้ดึงข้อมูลเมนูที่ตรงกับ id
        const sql = "SELECT * FROM food WHERE id = ?";
        db.query(sql, [id], (err, data) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Error retrieving menu data." });
            }

            if (data.length > 0) {
                return res.status(200).json(data[0]); // ส่งข้อมูลเมนูที่ตรงกับ id
            } else {
                return res.status(404).json({ message: "Menu not found." });
            }
        });
    } else {
        // หากไม่มี id ให้ดึงข้อมูลทั้งหมดจากเมนู
        const sql = "SELECT * FROM food";
        db.query(sql, (err, data) => {
            if (err) {
                console.error("Error fetching menu:", err);
                return res.status(500).json({ message: "Error fetching menu." });
            }
            return res.status(200).json(data); // ส่งข้อมูลทั้งหมด
        });
    }
});

// อัปเดตข้อมูลเมนูอาหาร
app.put('/menu/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { foodname, price, detail, category } = req.body; // เพิ่ม category จาก request body
    const image = req.file ? req.file.filename : null;

    console.log("Uploaded Image:", image);
    console.log("Request Parameters:", { id, foodname, price, detail, category });

    const sql = "UPDATE food SET foodname = ?, price = ?, detail = ?, image = ?, category = ? WHERE id = ?";  // เพิ่ม category ใน SQL query
    const values = [foodname, price, detail, image, category, id]; // เพิ่ม category ใน values

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error updating menu:", err);
            return res.status(500).json({ message: "Error updating menu: " + err.message });
        }

        console.log("Query Result:", result);
        if (result.affectedRows > 0) {
            return res.status(200).json({ message: "Menu updated successfully." });
        } else {
            return res.status(404).json({ message: "Menu not found." });
        }
    });
});

// ลบเมนูอาหาร
app.delete('/menu/:id', (req, res) => {
    const { id } = req.params;

    const selectSql = "SELECT image FROM food WHERE id = ?";
    const deleteSql = "DELETE FROM food WHERE id = ?";

    db.query(selectSql, [id], (err, data) => {
        if (err) {
            console.error("Error selecting menu image:", err);
            return res.status(500).json({ message: "Error selecting menu image." });
        }

        if (data.length === 0) {
            return res.status(404).json({ message: "Menu not found." });
        }

        const image = data[0].image;
        if (image) {
            fs.unlink(path.join(uploadsDir, image), (unlinkErr) => {
                if (unlinkErr) {
                    console.error("Error deleting image file:", unlinkErr);
                }
            });
        }

        db.query(deleteSql, [id], (deleteErr, result) => {
            if (deleteErr) {
                console.error("Error deleting menu:", deleteErr);
                return res.status(500).json({ message: "Error deleting menu." });
            }

            if (result.affectedRows > 0) {
                res.status(200).json({ message: "Menu deleted successfully." });
            } else {
                res.status(404).json({ message: "Menu not found." });
            }
        });
    });
});

// เพิ่มคิว
app.post('/queue', async (req, res) => {
    const { queues } = req.body;
    console.log('Received queue data:', req.body)
    if (!queues || !Array.isArray(queues) || queues.length === 0) {
        return res.status(400).json({ error: 'Invalid queue data format.' });
    }

    try {
        const insertPromises = queues.map(async (queue) => {
            const { user_name, queue_number, DateTime } = queue;
            if (!user_name || !queue_number || !DateTime) {
                console.log('Invalid queue data:', queue);
                throw new Error('Missing required fields in queue data.');
            }
            await new Promise((resolve, reject) => {
                db.query( // ใช้ db ตรงนี้
                    'INSERT INTO queue (user_name, queue_number, DateTime) VALUES (?, ?, ?)',
                    [user_name, queue_number, DateTime],
                    (error, results) => {
                        if (error) {
                            console.error('Error inserting queue data:', error);
                            reject(error);
                        } else {
                            console.log('Queue data inserted successfully:', results);
                            resolve(results);
                        }
                    }
                );
            });
        });
        await Promise.all(insertPromises);
        res.status(201).json({ message: 'All queue data inserted successfully!' });
    } catch (error) {
        console.error('Error processing queue data:', error);
        res.status(500).json({ error: 'Failed to insert queue data' });
    }
});

// เพิ่มรายการจอง
app.post('/ordering', async (req, res) => {
    console.log('Received order data:', req.body);
    const { orders } = req.body;
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
        return res.status(400).json({ error: 'Invalid order data format.' });
    }

    try {
        for (const order of orders) {
            console.log('Processing order:', order);
            try {
                const { user_name, foodname, BookTime, ArrivalTime, user_phone, customerName, employeeName } = order;
                if (!user_name || !BookTime || !ArrivalTime) {
                    return res.status(400).json({ error: 'Missing required fields in an order.' });
                }
                await new Promise((resolve, reject) => {
                    db.query(
                        'INSERT INTO ordering (user_name, foodname, BookTime, ArrivalTime, user_phone, customerName, employeeName) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [user_name, foodname, BookTime, ArrivalTime, user_phone, customerName, employeeName],
                        (error, results) => {
                            if (error) {
                                console.error('Error inserting ordering data:', error);
                                reject(error);
                            } else {
                                console.log('Ordering data inserted successfully:', results);
                                resolve(results);
                            }
                        }
                    );
                }).catch(error => {
                    console.error('SQL Error:', error)
                })
            } catch (error) {
                console.error('Error processing order:', error);
            }
        }
        res.status(201).json({ message: 'All ordering data inserted successfully!' });
    } catch (error) {
        console.error('Error inserting ordering data:', error);
        res.status(500).json({ error: 'Failed to insert ordering data' });
    }
});

// ดึงข้อมูลมาแสดงหน้าคิว
app.get('/ordering', (req, res) => {
    const sql = "SELECT * FROM ordering"; // SQL query
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching ordering data from DB:", err);
            return res.status(500).json({ message: "Error fetching ordering data" });
        }

        // Log the data retrieved from the database
        console.log("Data from DB:", results);

        const formattedOrders = results.map(order => {
            let orderDetails = [];
            try {
                // Check and convert order_details to JSON
                if (order.order_details && typeof order.order_details === 'string') {
                    orderDetails = JSON.parse(order.order_details);
                }
            } catch (error) {
                console.error("Error parsing order_details:", error, "for order id:", order.id);
                orderDetails = []; // Set default to an empty array
            }

            // Convert orderDetails to the desired structure
            const items = Array.isArray(orderDetails) ? orderDetails.map(item => ({
                itemId: item.itemId || null, // Use null if no itemId
                quantity: item.quantity || 0, // Use 0 if no quantity
                spicinessLevel: item.spicinessLevel || "ไม่ระบุ", // Use default
                additionalDetails: item.additionalDetails || ""
            })) : [];

            // Returns the new format
            return {
                id: order.id,
                queueNumber: order.id, // Use id as queueNumber
                reservationDetails: {
                    name: order.user_name || "Unknown", // Use "Unknown" if no user_name
                    numPeople: 1, // default
                    foodname: order.foodname || "ไม่ระบุ",
                    ArrivalTime: order.ArrivalTime || "Unknown",
                    user_phone: order.user_phone || "No phone"
                },
                items: items, // food list
                status: order.status || "Pending", // Use "Pending" if no status
                customerName: order.customerName || null,
                employeeName: order.employeeName || null,
                user_name: order.user_name || 'ไม่ระบุ'
            };
        });

        // Log formatted data
        console.log("Formatted data:", formattedOrders);
        res.status(200).json(formattedOrders); // Send data back to client
    });
});

// อัปเดตสถานะการจอง
app.put("/ordering/:id", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        await db.query("UPDATE ordering SET status = ? WHERE id = ?", [status, id]);
        res.status(200).send({ message: "Order updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to update order" });
    }
});

// ลบรายการจอง
app.delete('/ordering/:id', (req, res) => {
    const { id } = req.params;
    const deleteSql = "DELETE FROM ordering WHERE id = ?";

    db.query(deleteSql, [id], (deleteErr, result) => {
        if (deleteErr) {
            console.error("Error deleting ordering:", deleteErr);
            return res.status(500).json({ message: "Error deleting ordering." });
        }

        if (result.affectedRows > 0) {
            res.status(200).json({ message: "Ordering deleted successfully." });
        } else {
            res.status(404).json({ message: "Ordering not found." });
        }
    });
});

//----------------------------------------------------------------------------

app.get('/tables', (req, res) => {
    const sql = 'SELECT * FROM tables';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error getting tables:', err);
            return res.status(500).json({ message: 'Error getting tables' });
        }
        res.json(result);
    });
});

// อัปเดตสถานะโต๊ะ
app.put('/tables/:tableId', (req, res) => {
    const { tableId } = req.params;
    const { status, orderId } = req.body;

    if (!status) {
        return res.status(400).json({ message: 'Status is required' });
    }

    const sql = 'UPDATE tables SET status = ?, orderId = ? WHERE id = ?';
    db.query(sql, [status, orderId || null, tableId], (err, result) => {
        if (err) {
            console.error('Error updating table:', err);
            return res.status(500).json({ message: 'Error updating table', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Table not found' });
        }
        res.json({ message: 'Table status updated successfully' });
    });
});

// อัปเดตสถานะ Order เป็น "cleared"
app.put('/ordering/:orderId', (req, res) => {
    const { orderId } = req.params;
    const sql = 'UPDATE ordering SET status = "cleared" WHERE id = ?';
    db.query(sql, [orderId], (err, result) => {
        if (err) {
            console.error('Error clearing order:', err);
            return res.status(500).json({ message: 'Error clearing order' });
        }
        res.json({ message: 'Order cleared successfully' });
    });
});

// GET - ดึง Order (แก้ไข Filter)
app.get('/ordering', (req, res) => {
    const sql = 'SELECT * FROM ordering WHERE status != "cleared"'; // กรองเฉพาะที่ไม่ใช่ "cleared"
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error getting orders:', err);
            return res.status(500).json({ message: 'Error getting orders' });
        }
        res.json(result);
    });
});

// ------------------------------------------------------------------------

// ดึง ordering ทั้งหมด (โค้ดเดิม)
app.get('/ordering', (req, res) => {
    const sql = `
        SELECT
            BookTime,
            ArrivalTime,
            foodname,
            user_name,
            status,
            user_phone,
            customerName,
            employeeName
        FROM
            ordering;
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error querying ordering data:', err);
            res.status(500).json({ error: 'Failed to fetch ordering data' });
            return;
        }
        res.json(results);
    });
});

// Endpoint สำหรับเมนูที่ขายดีที่สุดตามประเภท (ประจำวัน)
app.get('/top-foods-by-category/daily', (req, res) => {
    const date = req.query.date || 'CURDATE()';
    const sql = `
        SELECT
            foodname,
            ArrivalTime
        FROM
            ordering
        WHERE
            DATE(ArrivalTime) = ${db.escape(date)}
            AND ArrivalTime >= '2025-02-01';
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error querying daily orders:', err);
            res.status(500).json({ error: 'Failed to fetch daily orders' });
            return;
        }

        console.log('Daily orders:', results);
        const categorizedSales = processSalesByCategory(results);
        console.log('Daily categorized sales:', categorizedSales);
        const limit = categorizedSales.length >= 10 ? 10 : Math.max(5, categorizedSales.length);
        const topSales = categorizedSales.slice(0, limit);
        res.json(topSales);
    });
});

// Endpoint สำหรับเมนูที่ขายดีที่สุดตามประเภท (ประจำเดือน)
app.get('/top-foods-by-category/monthly', (req, res) => {
    const date = req.query.date || 'CURDATE()';
    const sql = `
        SELECT
            foodname,
            ArrivalTime
        FROM
            ordering
        WHERE
            MONTH(ArrivalTime) = MONTH(${db.escape(date)})
            AND YEAR(ArrivalTime) = YEAR(${db.escape(date)})
            AND ArrivalTime >= '2025-02-01';
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error querying monthly orders:', err);
            res.status(500).json({ error: 'Failed to fetch monthly orders' });
            return;
        }

        console.log('Monthly orders:', results);
        const categorizedSales = processSalesByCategory(results);
        console.log('Monthly categorized sales:', categorizedSales);
        const limit = categorizedSales.length >= 10 ? 10 : Math.max(5, categorizedSales.length);
        const topSales = categorizedSales.slice(0, limit);
        res.json(topSales);
    });
});

// ฟังก์ชันช่วยแยกประเภทและคำนวณยอดขาย
function processSalesByCategory(orders) {
    const sales = {};

    orders.forEach(order => {
        if (!order.foodname || typeof order.foodname !== 'string') {
            console.warn(`Invalid foodname in order: ${JSON.stringify(order)}`);
            return;
        }

        const foodItems = order.foodname.split(', ').filter(item => item.trim() !== '');
        foodItems.forEach(item => {
            const parts = item.split(' x ');
            if (parts.length < 2) {
                console.warn(`Invalid format in foodname item: ${item}`);
                return;
            }

            let foodName = parts[0].trim();
            const quantityPart = parts[1].split(' - ')[0].trim();
            const quantity = parseInt(quantityPart, 10);

            if (isNaN(quantity) || quantity <= 0) {
                console.warn(`Invalid quantity in foodname item: ${item}`);
                return;
            }

            const thaiNameMatch = foodName.match(/\(([^)]+)\)/g);
            let thaiName = foodName;
            if (thaiNameMatch) {
                for (let match of thaiNameMatch) {
                    const content = match.slice(1, -1);
                    if (/[\u0E00-\u0E7F]/.test(content)) {
                        thaiName = content;
                        break;
                    }
                }
            } else if (/[\u0E00-\u0E7F]/.test(foodName)) {
                thaiName = foodName;
            } else {
                console.warn(`No Thai name found in foodname item: ${item}`);
                return;
            }

            let category = 'food';
            const lowerThaiName = thaiName.toLowerCase();

            if (
                lowerThaiName.includes('กาแฟ') ||
                lowerThaiName.includes('ชา') ||
                lowerThaiName.includes('น้ำ') ||
                lowerThaiName.includes('น้ำผลไม้') ||
                lowerThaiName.includes('น้ำส้ม') ||
                lowerThaiName.includes('โซดา') ||
                lowerThaiName.includes('นม')
            ) {
                category = 'drink';
            } else if (
                lowerThaiName.includes('เค้ก') ||
                lowerThaiName.includes('ของหวาน') ||
                lowerThaiName.includes('ไอศกรีม') ||
                lowerThaiName.includes('คุกกี้') ||
                lowerThaiName.includes('ช็อกโกแลต') ||
                lowerThaiName.includes('เค้กช็อกโกแลต')
            ) {
                category = 'dessert';
            }

            if (!sales[thaiName]) {
                sales[thaiName] = { food_name: thaiName, total_quantity: 0, category };
            }
            sales[thaiName].total_quantity += quantity;
        });
    });

    // แปลงเป็น array และจัดเรียงตามประเภท (food -> dessert -> drink) และจำนวนที่ขายได้
    const salesArray = Object.values(sales);

    // จัดเรียงตามประเภทและจำนวนที่ขายได้
    salesArray.sort((a, b) => {
        const categoryOrder = { 'food': 1, 'dessert': 2, 'drink': 3 };
        // จัดเรียงตามประเภทก่อน
        const categoryComparison = categoryOrder[a.category] - categoryOrder[b.category];
        if (categoryComparison !== 0) {
            return categoryComparison;
        }
        // ถ้าประเภทเดียวกัน จัดเรียงตามจำนวนที่ขายได้ (มากไปน้อย)
        return b.total_quantity - a.total_quantity;
    });

    return salesArray;
}
