import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import '../CSS/ProfileMenu.css';

function ProfileMenu() {
    const { id } = useParams();
    const [menuItem, setMenuItem] = useState(null);

    useEffect(() => {
        const fetchMenuItem = async () => {
            try {
                if (!id) {
                    throw new Error("ไม่พบ ID ของเมนูใน URL");
                }

                const response = await axios.get(`http://localhost:8081/menu?id=${id}`);
                console.log("API Response:", response.data); 

                if (response.status === 200 && response.data) {
                    setMenuItem(response.data);
                } else {
                    throw new Error("ไม่พบเมนูนี้");
                }
            } catch (error) {
                console.error("Error fetching menu item:", error);
                setMenuItem(null);
            }
        };

        fetchMenuItem();
    }, [id]);

    const getImageSrc = (image) => {
        return image ? `http://localhost:8081/uploads/${image}` : "/assets/pic/logo.jpg";
    };

    const { foodname, price, detail, image } = menuItem || {};

    return (
        <main>
            <div className="container">
                {/* แสดงรูปภาพและรายละเอียดเมนู */}
                {menuItem ? (
                    <div className="Menu">
                        <div className="col-lg-6">
                            <div className="profile-menu-box">
                                <img
                                    className="profile-menu-bg"
                                    src={getImageSrc(image)}
                                    alt={foodname || "ไม่พบชื่อเมนู"}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/assets/pic/logo.jpg"; // รูปสำรอง
                                    }}
                                />
                            </div>
                        </div>
                        <div className="menu-detail">
                            <h1>{foodname || "ไม่พบชื่อเมนู"}</h1>
                            <label>Price :</label>
                            <p>{price ? `${price} baht` : "ไม่ระบุราคา"}</p>
                            <label>Details  :</label>
                            <p>{detail || "ไม่มีรายละเอียด"}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <p>ไม่พบข้อมูลเมนูนี้</p>
                    </div>
                )}

                {/* ปุ่มกลับหน้าเมนู */}
                <div className="row justify-content-center">
                    <div className="col-md-4 col-lg-3 text-center">
                        <Link className="back-menu" to="/menu">
                            <img src="/assets/pic/icon/idol-arrow.png" alt="Back to Menu" />
                            Menu Page
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
export default ProfileMenu;