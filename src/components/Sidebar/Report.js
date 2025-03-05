import React, { useState, useEffect } from 'react';
import '../CSS/Report.css';
import Sidebar from './Sidebar';
import jsPDF from 'jspdf';
import jspdfAutoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Report() {
    const [dailyTopItems, setDailyTopItems] = useState([]);
    const [monthlyTopItems, setMonthlyTopItems] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [kanitBase64, setKanitBase64] = useState(null);
    const [fontLoaded, setFontLoaded] = useState(false);
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        name: '',
        lastname: '',
        position: '',
        phone: '',
        birthdate: '',
        email: '',
        password: '',
    });

    useEffect(() => {
        const storedEmail = localStorage.getItem('email');
        const storedPassword = localStorage.getItem('password');

        if (!storedEmail || !storedPassword) {
            navigate('/emp', { replace: true });
            return;
        }

        const fetchUserData = async () => {
            try {
                const response = await axios.get(`http://localhost:8081/profile/emp?email=${storedEmail}`);
                if (response.data && response.data.password === storedPassword) {
                    setUserData(response.data);
                } else {
                    console.error("Unauthorized access");
                    localStorage.removeItem('email');
                    localStorage.removeItem('password');
                    navigate('/emp', { replace: true });
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                localStorage.removeItem('email');
                localStorage.removeItem('password');
                navigate('/emp', { replace: true });
            }
        };

        fetchUserData();
    }, [navigate]);
    
    // โหลดไฟล์ฟอนต์ .ttf และแปลงเป็น base64
    useEffect(() => {
        fetch('/assets/fonts/Kanit-Regular.ttf')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load Kanit font: ${response.statusText}`);
                }
                return response.blob();
            })
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result.split(',')[1]; // ดึงเฉพาะส่วน base64
                    if (base64) {
                        setKanitBase64(base64);
                        setFontLoaded(true);
                        console.log('Kanit font loaded successfully');
                    } else {
                        throw new Error('Failed to convert font to base64');
                    }
                };
                reader.onerror = () => {
                    throw new Error('Error reading font file');
                };
                reader.readAsDataURL(blob);
            })
            .catch(err => {
                console.error('Error loading font:', err);
                setFontLoaded(false);
                setKanitBase64(null);
                alert('ไม่สามารถโหลดฟอนต์ Kanit ได้ กรุณาตรวจสอบว่าไฟล์ Kanit-Regular.ttf อยู่ใน public/assets/fonts/ หรือไม่');
            });
    }, []);

    useEffect(() => {
        async function fetchData() {
            try {
                const dailyResponse = await fetch(`http://localhost:8081/top-foods-by-category/daily?date=${selectedDate}`);
                const monthlyResponse = await fetch(`http://localhost:8081/top-foods-by-category/monthly?date=${selectedDate}`);

                if (!dailyResponse.ok || !monthlyResponse.ok) {
                    throw new Error(`HTTP error! status: ${dailyResponse.status} / ${monthlyResponse.status}`);
                }

                const dailyData = await dailyResponse.json();
                const monthlyData = await monthlyResponse.json();

                setDailyTopItems(dailyData);
                setMonthlyTopItems(monthlyData);
                setLoading(false);
            } catch (e) {
                setError(e.message);
                setLoading(false);
            }
        }

        fetchData();
    }, [selectedDate]);

    if (loading) return <p>กำลังโหลดข้อมูลรายงาน...</p>;
    if (error) return <p>เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน: {error}</p>;

    const getCategoryName = (category, useThai = fontLoaded) => {
        if (!useThai) {
            switch (category) {
                case 'food': return 'Food';
                case 'dessert': return 'Dessert';
                case 'drink': return 'Drink';
                default: return 'Unknown';
            }
        }
        switch (category) {
            case 'food': return 'ของคาว';
            case 'dessert': return 'ของหวาน';
            case 'drink': return 'เครื่องดื่ม';
            default: return 'ไม่ระบุ';
        }
    };

    const formatThaiDate = (useThai = fontLoaded) => {
        const date = new Date(selectedDate);
        const day = date.getDate();
        if (!useThai) {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                                'July', 'August', 'September', 'October', 'November', 'December'];
            const month = monthNames[date.getMonth()];
            return { day, month };
        }
        const monthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
        const month = monthNames[date.getMonth()];
        return { day, month };
    };

    const { day, month } = formatThaiDate();

    const generatePDF = (type) => {
        const doc = new jsPDF({ compress: true });

        // เพิ่มฟอนต์ Kanit ถ้าโหลดสำเร็จ
        if (kanitBase64 && fontLoaded) {
            try {
                doc.addFileToVFS('Kanit-Regular.ttf', kanitBase64);
                doc.addFont('Kanit-Regular.ttf', 'Kanit', 'normal');
                doc.setFont('Kanit');
                console.log('Kanit font set successfully. Available fonts:', doc.getFontList());
            } catch (e) {
                console.error('Error setting Kanit font:', e);
                setFontLoaded(false);
                doc.setFont('Helvetica');
                console.log('Falling back to Helvetica. Available fonts:', doc.getFontList());
            }
        } else {
            console.warn('Kanit font not loaded, using Helvetica');
            doc.setFont('Helvetica');
        }

        const title = fontLoaded ? 'รายงานการขาย' : 'Sales Report';
        const subtitle = type === 'daily'
            ? fontLoaded
                ? `รายการที่ขายดีประจำวันที่ ${day} ${month}`
                : `Top Sales on ${day} ${month}`
            : fontLoaded
                ? `รายการที่ขายดีประจำเดือน ${month}`
                : `Top Sales for ${month}`;
        const items = type === 'daily' ? dailyTopItems : monthlyTopItems;

        // ใช้ฟอนต์ในส่วนหัวข้อ
        doc.setFont(fontLoaded ? 'Kanit' : 'Helvetica');
        doc.text(title, 105, 10, { align: 'center' });
        doc.text(subtitle, 14, 20);

        if (items.length > 0) {
            jspdfAutoTable(doc, {
                startY: 30,
                head: [[
                    fontLoaded ? 'ประเภท' : 'Category',
                    fontLoaded ? 'ชื่อรายการ' : 'Item Name',
                    fontLoaded ? 'จำนวนที่ขายได้' : 'Quantity Sold'
                ]],
                body: items.map(item => [
                    getCategoryName(item.category),
                    item.food_name,
                    item.total_quantity.toString()
                ]),
                theme: 'striped',
                styles: { 
                    font: fontLoaded ? 'Kanit' : 'Helvetica', 
                    fontSize: 12, 
                    cellPadding: 3,
                    overflow: 'linebreak'
                },
                headStyles: { 
                    fillColor: [200, 200, 200], 
                    textColor: [0, 0, 0], 
                    font: fontLoaded ? 'Kanit' : 'Helvetica',
                    fontSize: 12,
                    fontStyle: 'normal' // บังคับให้ใช้ normal เพื่อป้องกันการ override
                },
                columnStyles: {
                    0: { cellWidth: 40 },
                    1: { cellWidth: 90 },
                    2: { cellWidth: 40 }
                },
                didParseCell: (data) => {
                    // บังคับให้ใช้ฟอนต์ Kanit ในทุกเซลล์ รวมถึงหัวตาราง
                    if (fontLoaded && doc.getFontList()['Kanit']) {
                        data.cell.styles.font = 'Kanit';
                        data.cell.styles.fontStyle = 'normal'; // ป้องกันการ override
                    } else {
                        data.cell.styles.font = 'Helvetica';
                    }
                    // Debug: ตรวจสอบฟอนต์ที่ใช้ในแต่ละเซลล์
                    if (data.section === 'head') {
                        console.log('Header cell font:', data.cell.styles.font);
                    }
                },
                didDrawPage: (data) => {
                    console.log('Page drawn, font used:', doc.getFont());
                }
            });
        } else {
            doc.setFont(fontLoaded ? 'Kanit' : 'Helvetica');
            doc.text(fontLoaded ? 'ข้อมูลว่าง: ไม่มี' : 'No data available', 14, 30);
        }

        // Convert to Blob and open in new tab
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
        URL.revokeObjectURL(pdfUrl); // Clean up the URL object after opening

    };

    return (
        <div className="layout">
            <Sidebar />
            <div className="report">
                <h1>หน้าแสดงรายงาน</h1>

                <div style={{ marginBottom: '20px' }}>
                    <label>เลือกวันที่: </label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <button
                        onClick={() => generatePDF('daily')}
                        style={{ marginRight: '10px', padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                        เปิด PDF (ประจำวัน)
                    </button>
                    <button
                        onClick={() => generatePDF('monthly')}
                        style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                        เปิด PDF (ประจำเดือน)
                    </button>
                </div>

                <h2>รายการที่ขายดีประจำวันที่ {day} {month}</h2>
                {dailyTopItems.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>ประเภท</th>
                                <th>ชื่อรายการ</th>
                                <th>จำนวนที่ขายได้</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dailyTopItems.map((item, index) => (
                                <tr key={index}>
                                    <td>{getCategoryName(item.category)}</td>
                                    <td>{item.food_name}</td>
                                    <td>{item.total_quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>ข้อมูลว่าง: ไม่มี</p>
                )}

                <h2>รายการที่ขายดีประจำเดือน {month}</h2>
                {monthlyTopItems.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>ประเภท</th>
                                <th>ชื่อรายการ</th>
                                <th>จำนวนที่ขายได้</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthlyTopItems.map((item, index) => (
                                <tr key={index}>
                                    <td>{getCategoryName(item.category)}</td>
                                    <td>{item.food_name}</td>
                                    <td>{item.total_quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>ข้อมูลว่าง: ไม่มี</p>
                )}
            </div>
        </div>
    );
}

export default Report;