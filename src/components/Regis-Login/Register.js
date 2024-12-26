import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../CSS/Register.css';
import Validation from './RegisterValidation';

const Register = () => {
    const [values, setValues] = useState({
        name: "",
        lastname: "",
        phone: "",
        email: "",
        password: "",
        memberType: "cus",
    });

    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleInput = (event) => {
        setValues(prev => ({ ...prev, [event.target.name]: event.target.value }));
    };

    const handleSelectChange = (event) => {
        setValues(prev => ({ ...prev, memberType: event.target.value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setErrors(Validation(values)); // ทำการตรวจสอบค่าใน values

        // ตรวจสอบว่ามีข้อมูลครบถ้วนหรือไม่
        if (!values.name || !values.lastname || !values.phone || !values.email || !values.password) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;  // ไม่ให้ส่งข้อมูลหากไม่กรอกข้อมูลครบ
        }

        // ถ้าไม่มีข้อผิดพลาดในการตรวจสอบ
        if (!errors.name && !errors.lastname && !errors.tel && !errors.email && !errors.password) {
            console.log('Sending data to the server:', values); // ตรวจสอบข้อมูลที่ส่งไป
            axios.post('http://localhost:8081/register', values)
                .then(res => {
                    console.log(res);
                    navigate('/logincus');  // ไปยังหน้าล็อกอิน
                })
                .catch(err => {
                    console.error(err); // แสดงข้อผิดพลาดที่เกิดขึ้น
                });
        }
    };

    return (
        <div>
            <div className="">
                <main className="register-page">
                    <h3>Create new Account</h3>
                    <div className="register-box">
                        <form onSubmit={handleSubmit}>
                            <h5> กรุณากรอกรายละเอียดเพื่อทำการสมัครสมาชิก</h5>
                            <div className="input-icons">
                                <label htmlFor="name" className="required-asterisk">* </label>
                                <img className="icon" src="/assets/pic/user_icon.png" alt="User Icon" />
                                <input
                                    type="text"
                                    onChange={handleInput}
                                    name='name'
                                    className="form-control "
                                    id="name"
                                    placeholder="Name"
                                />
                            </div>
                            <div className="mb-4 mt-1">
                                {errors.name && <span className='text-danger'> {errors.name} </span>}
                            </div>

                            <div className="input-icons">
                                <label htmlFor="lastname" className="required-asterisk">* </label>
                                <img className="icon" src="/assets/pic/user_icon.png" alt="User Icon" />
                                <input
                                    type="text"
                                    onChange={handleInput}
                                    name='lastname'
                                    className="form-control form-outline-idol"
                                    id="lastname"
                                    placeholder="Lastname"
                                />
                            </div>
                            <div className="mb-4 mt-1">
                                {errors.lastname && <span className='text-danger'> {errors.lastname} </span>}
                            </div>

                            <div className="input-icons">
                                <label htmlFor="phone" className="required-asterisk">* </label>
                                <img className="icon" src="/assets/pic/user_icon.png" alt="User Icon" />
                                <input
                                    type="phone"
                                    onChange={handleInput}
                                    name='phone'
                                    className="form-control form-outline-idol"
                                    id="phone"
                                    placeholder="your country code"
                                />
                            </div>
                            <div className="mb-4 mt-1">
                                {errors.phone && <span className='text-danger'> {errors.phone} </span>}
                            </div>

                            <div className="input-icons">
                                <label htmlFor="email" className="required-asterisk">* </label>
                                <img className="icon" src="/assets/pic/user_icon.png" alt="User Icon" />
                                <input
                                    type="email"
                                    onChange={handleInput}
                                    name='email'
                                    className="form-control form-outline-idol"
                                    id="email"
                                    placeholder="youremail@gmail.com"
                                />
                            </div>
                            <div className="mb-4 mt-1">
                                {errors.email && <span className='text-danger  pb-3'> {errors.email} </span>}
                            </div>

                            <div className="input-icons">
                                <label htmlFor="password" className="required-asterisk">* </label>
                                <img className="icon" src="/assets/pic/user_icon.png" alt="User Icon" />
                                <input
                                    type="password"
                                    onChange={handleInput}
                                    name='password'
                                    className="form-control form-outline-idol"
                                    id="password"
                                    placeholder="your password"
                                />
                            </div>
                            <div className="mb-4 mt-1">
                                {errors.password && <span className='text-danger mb-3'> {errors.password} </span>}
                            </div>

                            <button className="next">
                                Sign Up
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Register;
