import React, { useEffect, useState } from 'react';
import '../CSS/PersonalInfo.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Esta() {
    const [userData, setUserData] = useState({
        name: '',
        lastname: '',
        esta_type: '',
        esta_name: '',
        province: '',
        tel: '',
        email: '',
    });

    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();
    const [telError, setTelError] = useState('');

    const provinces = [
        'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น', 'จันทบุรี',
        'ฉะเชิงเทรา', 'ชลบุรี', 'ชุมพร', 'เชียงใหม่', 'เชียงราย', 'ตรัง', 'ตราด',
        'ตาก', 'นครนายก', 'นครปฐม', 'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี',
        'นราธิวาส', 'น่าน', 'ปทุมธานี', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี', 'ปัตตานี', 'พะเยา',
        'พระนครศรีอยุธยา', 'พังงา', 'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์',
        'ระนอง', 'ระยอง', 'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน', 'ศรีสะเกษ',
        'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ', 'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว',
        'สระบุรี', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'อ่างทอง',
        'อุทัยธานี', 'อุตรดิตถ์', 'อุบลราชธานี', 'อำนาจเจริญ', 'แม่ฮ่องสอน', 'แพร่', 'อุดรธานี',
        'หนองคาย', 'บึงกาฬ', 'นครพนม', 'มุกดาหาร', 'เลย', 'ร้อยเอ็ด', 'มหาสารคาม',
        'ยโสธร', 'บุรีรัมย์', 'ชัยภูมิ', 'ชัยนาท', 'ภูเก็ต', 'ยะลา', 'หนองบัวลำภู'
    ].sort((a, b) => a.localeCompare(b));

    useEffect(() => {
        const storedEmail = localStorage.getItem('email');
        if (storedEmail) {
            fetchUserData(storedEmail);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const fetchUserData = async (email) => {
        try {
            const response = await axios.get(`http://localhost:8081/profile/esta?email=${email}`);
            setUserData(response.data);
            // เก็บข้อมูลผู้ใช้ใน local storage
            localStorage.setItem('email', email);
            localStorage.setItem('name', response.data.name);
            localStorage.setItem('lastname', response.data.lastname);
            localStorage.setItem('esta_type', response.data.esta_type);
            localStorage.setItem('esta_name', response.data.esta_name);
            localStorage.setItem('province', response.data.province);
            localStorage.setItem('tel', response.data.tel);
        } catch (error) {
            console.error("Error fetching user data:", error);
            if (error.response && error.response.status === 404) {
                console.error("User not found:", error);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleEditToggle = () => {
        setIsEditing(prev => !prev);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (telError) return; // ตรวจสอบข้อผิดพลาดในเบอร์โทร

        try {
            const email = localStorage.getItem('email');
            // await axios.put(`http://localhost:8081/profile/esta?email=${email}`, userData);
            await axios.put(`http://localhost:8081/profile/esta/${email}`, userData);
            // อัปเดตข้อมูลใน local storage
            for (const key in userData) {
                localStorage.setItem(key, userData[key]);
            }
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating user data:", error);
        }
    };

    return (
        <div className="personal-info">
            {!isEditing ? (
                <div>
                    <h2>ข้อมูลส่วนตัว</h2>
                    <p>ชื่อ: {userData.name}</p>
                    <p>นามสกุล: {userData.lastname}</p>
                    <p>ประเภทสถานประกอบการ: {userData.esta_type}</p>
                    <p>ชื่อสถานประกอบการ: {userData.esta_name}</p>
                    <p>จังหวัด: {userData.province}</p>
                    <p>เบอร์โทร: {userData.tel}</p>

                    <div className="button-container">
                        <button className='edit-btn' onClick={handleEditToggle}>แก้ไขข้อมูล</button>
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
                        <label>ประเภทสถานประกอบการ</label>
                        <input type="text" name="esta_type" value={userData.esta_type} onChange={handleInputChange} placeholder='ประเภทสถานประกอบการ' required />
                    </div>
                    <div className='form-group'>
                        <label>ชื่อสถานประกอบการ</label>
                        <input type="text" name="esta_name" value={userData.esta_name} onChange={handleInputChange} placeholder='ชื่อสถานประกอบการ' required />
                    </div>
                    <div className='form-group'>
                        <label>จังหวัด</label>
                        <select name="province" value={userData.province} onChange={handleInputChange} required>
                            <option value="">เลือกจังหวัดที่อยู่</option>
                            {provinces.map((province, index) => (
                                <option key={index} value={province}>{province}</option>
                            ))}
                        </select>
                    </div>
                    <div className='form-group'>
                        <label>เบอร์โทร</label>
                        <input
                            type="tel"
                            name="tel"
                            value={userData.tel}
                            onChange={handleInputChange}
                            placeholder='เบอร์โทร'
                            required
                        />
                    </div>

                    <div className="button-container">
                        <button type="submit" className='record'>บันทึก</button>
                        <button type="button" className='cancel' onClick={handleEditToggle}>ยกเลิก</button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default Esta;