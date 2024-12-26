import React, { useState, useEffect } from 'react';
import MenuItem from './MenuItem';
import '../CSS/Menus.css';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function Menus() {
    const [menuItems, setMenuItems] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // เพิ่ม state สำหรับการโหลดข้อมูล
    const navigate = useNavigate();
    const id = 1;

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                // ลบ `id` ออกเพื่อให้ดึงข้อมูลเมนูทั้งหมด
                const response = await axios.get('http://localhost:8081/menu');
                
                // ตรวจสอบข้อมูลที่ได้รับจาก API
                console.log("API Response:", response.data);  // ตรวจสอบว่า API ส่งข้อมูลอะไรมา
    
                if (Array.isArray(response.data)) {
                    // กรณีข้อมูลเป็น array
                    const menuItemsWithImagePaths = response.data.map(item => ({
                        ...item,
                        image: item.image
                            ? `http://localhost:8081/uploads/${item.image}`
                            : '/assets/pic/logo.jpg',
                    }));
                    setMenuItems(menuItemsWithImagePaths);
                } else if (typeof response.data === 'object') {
                    // กรณีข้อมูลเป็น object เดียว
                    const menuItemWithImagePath = {
                        ...response.data,
                        image: response.data.image
                            ? `http://localhost:8081/uploads/${response.data.image}`
                            : '/assets/pic/logo.jpg',
                    };
                    setMenuItems([menuItemWithImagePath]); // แปลงข้อมูลเป็น array
                } else {
                    throw new Error("Invalid data format from API");
                }
    
            } catch (err) {
                setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลเมนู");
            } finally {
                setIsLoading(false); // เมื่อโหลดเสร็จแล้วเปลี่ยนสถานะการโหลด
            }
        };
    
        fetchMenu();
    }, []);
    
    const handleViewDetail = (menuId) => {
        console.log("Navigating to menu with ID:", menuId);
        navigate(`/profile-menu/${menuId}`); // ส่งเมนู ID ไปที่หน้า profile-menu
    };

    if (isLoading) {
        return <p>กำลังโหลดข้อมูลเมนู...</p>; // เพิ่มข้อความโหลด
    }

    if (error) {
        return <p className="error-message">เกิดข้อผิดพลาด: {error}</p>;
    }

    return (
        <div className="menu-page">
            <h1 className="menu-title">MENUS</h1>
            <div className="menu-grid">
                {menuItems.length > 0 ? (
                    menuItems.map((menuItem) => (
                        <MenuItem
                            key={menuItem.id}
                            item={menuItem}
                            onViewDetail={handleViewDetail}
                        />
                    ))
                ) : (
                    <p className="no-menu-message">ไม่พบข้อมูลเมนู</p>
                )}
            </div>
        </div>
    );
}

export default Menus;

