import React, { useEffect, useRef, useState } from 'react';
import '../CSS/EditMenu.css';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

function EditMenu() {
    const [menuItems, setMenuItems] = useState([]);
    const [newMenuItem, setNewMenuItem] = useState({ foodname: '', price: '', image: null });
    const [isEditing, setIsEditing] = useState(false);
    const [editingItemId, setEditingItemId] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const imageInputRef = useRef(null);
    const editFormRef = useRef(null);


    const navigate = useNavigate();
    const location = useLocation();
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
        if (!storedEmail && location.pathname === '/editmenu') { 
            navigate('/emp', { replace: true });
            return;
        }

        if (storedEmail) {
            fetchUserData(storedEmail);
        }

        fetchMenu();
    }, [navigate,location]);

    const fetchUserData = async (email) => {
        try {
            const response = await axios.get(`http://localhost:8081/profile/emp?email=${email}`);
            if (response.data) {
                setUserData(response.data); // ตั้งค่าข้อมูลหากมีอีเมล
            } else {
                console.error("User data not found");
                setUserData(null); // รีเซ็ตข้อมูลหากไม่พบ
                navigate('/emp');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            setUserData(null); // รีเซ็ตข้อมูลเมื่อเกิดข้อผิดพลาด
            navigate('/emp');
        }
    };

    // ดึงข้อมูลเมนูจากเซิร์ฟเวอร์
    const fetchMenu = async () => {
        try {
            const response = await axios.get('http://localhost:8081/menu');
            setMenuItems(response.data);
        } catch (error) {
            console.error('Error fetching menu:', error);
            alert('เกิดข้อผิดพลาดในการโหลดข้อมูลเมนู: ' + (error.response ? error.response.data.error : error.message));
        }
    };

    // เพิ่มเมนูใหม่
    const handleAddMenu = async (e) => {
        e.preventDefault();
        if (!newMenuItem.foodname || !newMenuItem.price || !newMenuItem.detail || !newMenuItem.image) {
            alert('กรุณากรอกข้อมูลให้ครบ');
            return;
        }
        try {
            // เตรียมข้อมูลสำหรับการอัปโหลด
            const formData = new FormData();
            formData.append('foodname', newMenuItem.foodname);
            formData.append('price', newMenuItem.price);
            formData.append('detail', newMenuItem.detail);
            formData.append('image', newMenuItem.image);

            await axios.post('http://localhost:8081/menu', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (imageInputRef.current) {
                imageInputRef.current.value = '';
            }

            setNewMenuItem((prev) => ({ ...prev, foodname: '', price: '', detail: '', image: null }));
            setPreviewImage(null); // ล้าง previewImage 
            fetchMenu();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Error adding menu item:', error);
            alert('เกิดข้อผิดพลาดในการเพิ่มเมนู: ' + (error.response ? error.response.data.error : error.message));
        }
        fetchMenu(); // เพิ่ม
    };

    // ลบเมนู
    const handleDeleteMenu = async (id) => {
        // แสดงแจ้งเตือนยืนยันก่อนลบ
        const isConfirmed = window.confirm("คุณต้องการลบเมนูนี้ใช่หรือไม่?");
    
        if (isConfirmed) {
            try {
                await axios.delete(`http://localhost:8081/menu/${id}`);
                fetchMenu();
            } catch (error) {
                console.error('Error deleting menu item:', error);
                alert('เกิดข้อผิดพลาดในการลบเมนู: ' + (error.response ? error.response.data.error : error.message));
            }
        } else {
            console.log("การลบถูกยกเลิก");
        }
    };
    
    // เริ่มแก้ไขเมนู
    const handleEditMenu = (item) => {
        setIsEditing(true);
        setEditingItemId(item.id);
        setNewMenuItem({ foodname: item.foodname, price: item.price, detail: item.detail, image: null });
        setPreviewImage(`http://localhost:8081/uploads/${item.image}`);

        setTimeout(() => {
            if (editFormRef.current) {
                editFormRef.current.scrollIntoView({ begavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    // บันทึกการแก้ไข
    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!newMenuItem.foodname || !newMenuItem.price || !newMenuItem.detail) {
            alert('กรุณากรอกข้อมูลให้ครบ');
            return;
        }
        try {
            const formData = new FormData();
            formData.append('foodname', newMenuItem.foodname);
            formData.append('price', newMenuItem.price);
            formData.append('detail', newMenuItem.detail);
            if (newMenuItem.image) {
                formData.append('image', newMenuItem.image);
            }

            await axios.put(`http://localhost:8081/menu/${editingItemId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setNewMenuItem({ foodname: '', price: '', detail: '', image: null });
            setIsEditing(false);
            setEditingItemId(null);
            fetchMenu();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Error saving edited menu item:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกการแก้ไข: ' + (error.response ? error.response.data.error : error.message));
        }
        fetchMenu(); // เพิ่ม
    };

    // รูป
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setNewMenuItem((prev) => ({ ...prev, image: file }));
        setPreviewImage(URL.createObjectURL(file)); // สร้าง URL สำหรับแสดงตัวอย่าง
    };

    // จัดการการเปลี่ยนแปลงของ input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMenuItem((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="layout">
            <Sidebar />
            <div className="content">
                <div className="menu-management">
                    <h2>จัดการเมนูอาหาร</h2>

                    {/* แสดงรายการเมนู */}
                    <div className="menu-list">
                        {menuItems.map((item) => (
                            <div key={item.id} className="menu-item">
                                <h4>{item.foodname}</h4>
                                <p>ราคา: {item.price} บาท</p>
                                <p>รายละเอียด: {item.detail} </p>
                                {item.image && (
                                    <img
                                        src={`http://localhost:8081/uploads/${item.image}`}
                                        alt={item.foodname}
                                        style={{ width: '200px', height: 'auto' }}
                                    />
                                )}
                                <div className="button-container">
                                    <button onClick={() => handleEditMenu(item)}>แก้ไข</button>
                                    <button onClick={() => handleDeleteMenu(item.id)}>ลบ</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ฟอร์มเพิ่ม/แก้ไขเมนู */}
                    <form ref={editFormRef} onSubmit={isEditing ? handleSaveEdit : handleAddMenu}>
                        <div className="form-group">
                            <label>ชื่อเมนู</label>
                            <input
                                type="text"
                                name="foodname"
                                value={newMenuItem.foodname}
                                onChange={handleInputChange}
                                placeholder="กรอกชื่อเมนู"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>ราคา (บาท)</label>
                            <input
                                type="number"
                                name="price"
                                value={newMenuItem.price}
                                onChange={handleInputChange}
                                placeholder="กรอกราคา"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>รายละเอียด</label>
                            <textarea
                                type="text"
                                name="detail"
                                value={newMenuItem.detail}
                                onChange={handleInputChange}
                                placeholder="กรอกรายละเอียด"
                                rows="4"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>รูปภาพเมนู</label>
                            <input
                                type="file"
                                name="image"
                                onChange={(e) => handleImageChange(e)}
                                ref={imageInputRef}
                            />
                            {previewImage && (
                                <div>
                                    <img
                                        src={previewImage}
                                        alt="Preview"
                                        style={{ width: '200px', height: 'auto' }}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="button-container">
                            <button type="submit" className="save-btn">
                                {isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มเมนู'}
                            </button>
                            {isEditing && (
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setNewMenuItem({ foodname: '', price: '', detail: '', image: null });
                                        setPreviewImage(null);
                                    }}
                                >
                                    ยกเลิก
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditMenu;