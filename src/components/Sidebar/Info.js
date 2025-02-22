import React, { useEffect, useState } from 'react';
import '../CSS/PersonalInfo.css';
import Sidebar from './Sidebar';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Info() {
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();
    const [telError, setTelError] = useState('');
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
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const regex = /^[0-9]*$/;
            if (value.length > 10) {
                setTelError('เบอร์โทรศัพท์ต้องไม่เกิน 10 ตัว');
            } else if (!regex.test(value)) {
                setTelError('กรุณาใส่เฉพาะตัวเลข');
            } else {
                setTelError('');
            }
        }

        setUserData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (telError) {
            return;
        }
        try {
            const email = localStorage.getItem('email');
            await axios.put(`http://localhost:8081/profile/emp/${email}`, userData);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating user data:", error);
        }
    };

    return (
        <div className="layout">
            <Sidebar />
            <div className="content">
                <div className="personal-info">
                    {!isEditing ? (
                        <div>
                            <h2>ข้อมูลส่วนตัว</h2>
                            <p>ชื่อ: {userData.name}</p>
                            <p>นามสกุล: {userData.lastname}</p>
                            <p>ตำแหน่ง: {userData.position}</p>
                            <p>เบอร์โทร: {userData.phone}</p>
                            <p>วันเกิด: {userData.birthdate}</p>
                            <p>อีเมล: {userData.email}</p>
                            <p>รหัสผ่าน: {userData.password}</p>
                            <div className="button-container">
                                <button className="edit-btn" onClick={handleEditToggle}>แก้ไขข้อมูล</button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSave}>
                            <div className='form-group'>
                                <label>กรอกชื่อ</label>
                                <input type="text" name="name" value={userData.name} onChange={handleInputChange} placeholder='ชื่อ' required />
                            </div>
                            <div className='form-group'>
                                <label>กรอกนามสกุล</label>
                                <input type="text" name="lastname" value={userData.lastname} onChange={handleInputChange} placeholder='นามสกุล' required />
                            </div>
                            <div className='form-group'>
                                <label>ตำแหน่ง</label>
                                {/* <input type="text" name="position" value={userData.position} onChange={handleInputChange} placeholder='ตำแหน่ง' required /> */}
                                <select name="position" value={userData.position} onChange={handleInputChange} required>
                                    <option value="">เลือกตำแหน่ง</option>
                                    <option value="ครัว">ครัว</option>
                                    <option value="บาร์น้ำ">บาร์น้ำ</option>
                                    <option value="เสิร์ฟ">เสิร์ฟ</option>
                                    <option value="ฝึกงาน">ฝึกงาน</option>
                                    <option value="แคชเชียร์">แคชเชียร์</option>
                                </select>
                            </div>

                            <div className='form-group'>
                                <label>เบอร์โทร</label>
                                <input
                                    type="phone"
                                    name="phone"
                                    value={userData.phone}
                                    onChange={handleInputChange}
                                    placeholder='เบอร์โทร'
                                    required
                                />
                                {telError && (
                                    <span className="error-message" style={{ color: 'red', display: 'block', marginTop: '5px' }}>
                                        {telError}
                                    </span>
                                )}
                            </div>

                            <div className='form-group'>
                                <label>วัน/เดือน/ปีเกิด</label>
                                <input type="date" name="birthdate" value={userData.birthdate} onChange={handleInputChange} required />
                            </div>
                            <div className='form-group'>
                                <label>อีเมล</label>
                                <input type="email" name="email" value={userData.email} onChange={handleInputChange} required />
                            </div>
                            <div className='form-group'>
                                <label>รหัสผ่าน</label>
                                <input type="password" name="password" value={userData.password} onChange={handleInputChange} required />
                            </div>
                            {/* <div className='form-group'>
                        <label>เพศ</label>
                        <select name="gender" value={userData.gender} onChange={handleInputChange} required>
                            <option value="">เลือกเพศ</option>
                            <option value="ชาย">ชาย</option>
                            <option value="หญิง">หญิง</option>
                            <option value="อื่น ๆ">อื่น ๆ</option>
                        </select>
                    </div> */}
                            {/* <div className='form-group'>
                        <label>จังหวัด</label>
                        <select name="province" value={userData.province} onChange={handleInputChange} required>
                            <option value="">เลือกจังหวัดที่อยู่</option>
                            {provinces.map((province, index) => (
                                <option key={index} value={province}>{province}</option>
                            ))}
                        </select>
                    </div> */}

                            <div className="button-container">
                                <button type="submit" className='record'>บันทึก</button>
                                <button type="button" className='cancel' onClick={handleEditToggle}>ยกเลิก</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Info;