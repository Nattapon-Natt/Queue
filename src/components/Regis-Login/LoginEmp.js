import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../CSS/LoginForm.css';

export default function LoginEmp({ setUserName, setMemberType }) {
    const [values, setValues] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleInput = (event) => {
        const { name, value } = event.target;
        setValues(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!values.email) newErrors.email = "กรุณากรอกอีเมล";
        if (!values.password) newErrors.password = "กรุณากรอกรหัสผ่าน";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm()) return; // หากมีข้อผิดพลาดให้ไม่ทำการส่งฟอร์ม

        try {
            const res = await axios.post('http://localhost:8081/login-emp', values);
            if (res.data.status === "Success") {
                // เก็บข้อมูลผู้ใช้ใน localStorage
                const { name, lastname, position, phone, email, password, birthdate, memberType } = res.data;
                localStorage.setItem('name', name);
                localStorage.setItem('lastname', lastname);
                localStorage.setItem('position', position);
                localStorage.setItem('phone', phone);
                localStorage.setItem('email', email);
                localStorage.setItem('password', password);
                localStorage.setItem('birthdate', birthdate);
                localStorage.setItem('memberType', memberType);

                // เรียกใช้งานฟังก์ชันที่ส่งมาเพื่อตั้งค่า
                setUserName(name);
                setMemberType(memberType);

                // นำทางไปยังหน้า PersonalInfo
                navigate("/info");
            } else {
                alert("ไม่มีข้อมูล");
            }
        } catch (err) {
            console.error(err);
            alert("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
        }
        window.location.reload();

    };

    // return (
    //     <div className="body">
    //         <div className="container">
    //             <main className="register-page">
    //                 <div className="text-center">
    //                     <h3 style={{ fontWeight: 'bold' }}>เข้าสู่ระบบสำหรับพนักงาน</h3>
    //                 </div>
    //                 <div className="row justify-content-center">
    //                     <div className="col-lg-6">
    //                         <div className="register-box">
    //                             <form id="f-admin" className="needs-validation" onSubmit={handleSubmit} style={{ padding: '5px 30px' }}>
    //                                 <div className="row g-3 step1 active">
    //                                     <div className="col-12">
    //                                         <h5 style={{ marginBottom: '30px' }} className="phone-des">กรุณากรอกรายละเอียดเพื่อทำการเข้าสู่ระบบ</h5>
    //                                         <InputField
    //                                             type="email"
    //                                             name="email"
    //                                             placeholder="youremail@gmail.com"
    //                                             value={values.email}
    //                                             onChange={handleInput}
    //                                             error={errors.email}
    //                                         />
    //                                         <InputField
    //                                             type="password"
    //                                             name="password"
    //                                             placeholder="your password"
    //                                             value={values.password}
    //                                             onChange={handleInput}
    //                                             error={errors.password}
    //                                         />
    //                                     </div>
    //                                     <div className="col-12 center-button">
    //                                         <button className="btn next btn-lg">Login</button>
    //                                     </div>
    //                                 </div>
    //                             </form>
    //                         </div>
    //                     </div>
    //                 </div>
    //             </main>
    //         </div>
    //     </div>
    // );
    return (
        <div className="body">
            <div className="container">
                <main className="register-page">
                    <div className="text-center">
                        <h3 style={{ fontWeight: 'bold' }}>เข้าสู่ระบบสำหรับพนักงาน</h3>
                    </div>
                    <div className="row justify-content-center">
                        <div className="col-lg-6">
                            <div className="register-box">
                                <form style={{ padding: '5px 30px' }} id="f-admin" className="needs-validation" onSubmit={handleSubmit}>
                                    <div className="row g-3 step1 active">
                                        <div className="col-12">
                                            <h5 style={{ marginBottom: '30px' }} className="tel-des">กรุณากรอกรายละเอียดเพื่อทำการเข้าสู่ระบบ</h5>
                                            <div className="input-icons">
                                                <img className="icon" src="/assets/pic/icon/user_icon.png" alt="User Icon" />
                                                <input
                                                    type="email"
                                                    onChange={handleInput}
                                                    name='email'
                                                    className="form-control form-outline-idol"
                                                    id="email"
                                                    placeholder="youremail@gmail.com"
                                                    required
                                                />
                                            </div>
                                            <div className="mb-4 mt-1">
                                                {errors.email && <span className='text-danger pb-3'> {errors.email} </span>}
                                            </div>

                                            <div className="input-icons">
                                                <img className="icon" src="/assets/pic/icon/user_icon.png" alt="User Icon" />

                                                <input
                                                    type="password"
                                                    onChange={handleInput}
                                                    name='password'
                                                    className="form-control form-outline-idol"
                                                    id="password"
                                                    placeholder="your password"
                                                    required
                                                />
                                            </div>
                                            <div className="mb-4 mt-1">
                                                {errors.password && <span className='text-danger mb-3'> {errors.password} </span>}
                                            </div>
                                        </div>

                                        <div className="col-12 center-button">
                                            <button className="btn next btn-lg">
                                                Login
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

const InputField = ({ type, name, placeholder, value, onChange, error, autoComplete }) => (
    <div className="input-icons">
        <img className="icon" src="/assets/pic/user_icon.png" alt="User Icon" />

        <input
            type={type}
            name={name}
            placeholder={placeholder}
            className="form-control form-outline-idol"
            value={value}
            onChange={onChange}
            required
            autoComplete={autoComplete}
        />
        {error && <div className="mb-4 mt-1"><span className='text-danger'>{error}</span></div>}
    </div>
);