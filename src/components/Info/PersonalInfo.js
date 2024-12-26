import React, { useEffect, useState } from 'react';
import '../CSS/PersonalInfo.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function PersonalInfo() {
    const [userData, setUserData] = useState({
        name: '',
        lastname: '',
        nickname: '',
        dob: '',
        gender: '',
        province: '',
        tel: '',
        email: '',
        biography: '',
        philosophy: '',
    });

    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();
    const [email, setEmail] = useState(null);
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
            setEmail(storedEmail);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const fetchUserData = async (email) => {
        try {
            const response = await axios.get(`http://localhost:8081/profile/masu?email=${email}`);
            setUserData(response.data);
            // Save user data in localStorage
            for (const key in response.data) {
                localStorage.setItem(key, response.data[key]);
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.error("User not found:", error);
            } else {
                console.error("Error fetching user data:", error);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'tel') {
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
            return; // Don't save if there's an error
        }
        try {
            const email = localStorage.getItem('email');
            // await axios.put(`http://localhost:8081/profile/masu/?email=${email}`, userData);
            await axios.put(`http://localhost:8081/profile/masu/${email}`, userData);
            // Update localStorage with new data
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
                    <p>ชื่อเล่น: {userData.nickname}</p>
                    <p>วันเกิด: {userData.dob}</p>
                    <p>เพศ: {userData.gender}</p>
                    <p>จังหวัด: {userData.province}</p>
                    <p>เบอร์โทร: {userData.tel}</p>

                    <label>ประวัติ :</label>
                    <p>{userData.biography}</p>

                    <label>ปรัชญาในการจับคู่ : </label>
                    <p>{userData.philosophy}</p>

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
                        <label>ชื่อเล่น</label>
                        <input type="text" name="nickname" value={userData.nickname} onChange={handleInputChange} placeholder='ชื่อเล่น' required />
                    </div>
                    <div className='form-group'>
                        <label>วัน/เดือน/ปีเกิด</label>
                        <input type="date" name="dob" value={userData.dob} onChange={handleInputChange} required />
                    </div>
                    <div className='form-group'>
                        <label>เพศ</label>
                        <select name="gender" value={userData.gender} onChange={handleInputChange} required>
                            <option value="">เลือกเพศ</option>
                            <option value="ชาย">ชาย</option>
                            <option value="หญิง">หญิง</option>
                            <option value="อื่น ๆ">อื่น ๆ</option>
                        </select>
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
                        {telError && (
                            <span className="error-message" style={{ color: 'red', display: 'block', marginTop: '5px' }}>
                                {telError}
                            </span>
                        )}
                    </div>

                    <div>
                        <label>ประวัติ:</label>
                        <textarea name="biography" value={userData.biography} onChange={handleInputChange} rows="4" required />
                    </div>

                    <div>
                        <label>ปรัชญาในการจับคู่:</label>
                        <textarea name="philosophy" value={userData.philosophy} onChange={handleInputChange} rows="4" required />
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

export default PersonalInfo;