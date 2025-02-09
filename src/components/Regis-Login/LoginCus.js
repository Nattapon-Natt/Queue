import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../CSS/Login.css';

export default function LoginCus({ setUserName }) {
    const [values, setValues] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleInput = (event) => {
        setValues(prev => ({ ...prev, [event.target.name]: event.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const res = await axios.post('http://localhost:8081/login', values);
            if (res.data.status === "Success") {
                // เก็บชื่อผู้ใช้และประเภทสมาชิกใน localStorage
                localStorage.setItem('name', res.data.name);
                localStorage.setItem('email', res.data.email);
                localStorage.setItem('phone', res.data.phone);
                localStorage.setItem('memberType', res.data.memberType); // เก็บ memberType หากมี
                setUserName(res.data.name); // อัปเดตชื่อผู้ใช้ที่นี่
                navigate("/"); // ไปยังหน้าหลัก
            } else {
                alert("ไม่มีข้อมูล"); // แจ้งเตือนเมื่อไม่มีข้อมูลตรงกัน
            }
        } catch (err) {
            console.error(err);
            alert("เกิดข้อผิดพลาดในการเข้าสู่ระบบ"); // แจ้งเตือนหากเกิดข้อผิดพลาด
        }
    };

    return (
        <div className="body">
            <div className="container">
                <main className="login-page">
                    <h3 style={{}}>เข้าสู่ระบบสำหรับผู้ใช้ทั่วไป (Customer)</h3>
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <form className="needs-validation" onSubmit={handleSubmit}>
                                <div className="row g-3 step1 active">
                                    <div className="login-detail">
                                        <h5>กรุณากรอกรายละเอียดเพื่อทำการเข้าสู่ระบบ</h5>
                                        <div className="inputs">
                                            <img className="icons" src="/assets/pic/icon/user_icon.png" alt="User Icon" />
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

                                        <div className="inputs">
                                            <img className="icons" src="/assets/pic/icon/user_icon.png" alt="User Icon" />

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

                                    <div>
                                        <div className="button-group">
                                            <button className="btn-go-login btn-go-login-outline">
                                                Login
                                            </button>
                                            <Link to="/register" onClick={() => {
                                                window.scrollTo(0, 0);
                                            }} className="btn-go-register btn-go-register-outline">
                                                Register
                                            </Link>
                                        </div>
                                    </div>

                                </div>
                            </form>

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}