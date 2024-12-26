import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../CSS/EmpInfo.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const EmpInfo = () => {
    const [employees, setEmployees] = useState([]); // Employee list
    const [error, setError] = useState(null); // Error handling
    const [isEditing, setIsEditing] = useState(false); // Editing state
    const [editingEmployeeId, setEditingEmployeeId] = useState(null);
    const [newEmployeeData, setNewEmployeeData] = useState({
        name: '', lastname: '', position: '', phone: '', email: '', password: '', image: null
    });
    const [previewImage, setPreviewImage] = useState(null);

    const imageInputRef = useRef(null); // File input reference
    const isAlerted = useRef(false);
    const navigate = useNavigate();

    // Fetch employees
    const fetchEmployees = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:8081/emp');
            if (Array.isArray(response.data)) setEmployees(response.data);
            else throw new Error('Invalid data format');
        } catch (err) {
            setError(err.message);
        }
    }, []);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    // Check superadmin access
    useEffect(() => {
        const email = localStorage.getItem('email');
        const password = localStorage.getItem('password');
        if ((email !== 'superadmin@gmail.com' || password !== 'superadmin') && !isAlerted.current) {
            isAlerted.current = true;
            navigate('/info', { replace: true });
            alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
        }
        // fetchEmployees();
    }, [navigate]);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEmployeeData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle image change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setNewEmployeeData((prev) => ({ ...prev, image: file }));
        setPreviewImage(URL.createObjectURL(file));
    };

    // Add new employee
    const handleAddEmployee = async (e) => {
        e.preventDefault();
        if (!newEmployeeData.name || !newEmployeeData.lastname || !newEmployeeData.position || !newEmployeeData.phone || !newEmployeeData.email || !newEmployeeData.password) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        try {
            const formData = new FormData();
            for (const key in newEmployeeData) formData.append(key, newEmployeeData[key]);

            await axios.post('http://localhost:8081/emp', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            resetForm();
            fetchEmployees();
        } catch (error) {
            console.error('Error adding employee:', error);
            alert('เกิดข้อผิดพลาดในการเพิ่มพนักงาน');
        }
    };

    // Remove employee
    const handleRemoveEmployee = async (id) => {
        if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบพนักงานนี้?')) {
            try {
                await axios.delete(`http://localhost:8081/emp/${id}`);
                fetchEmployees();
            } catch (error) {
                alert('เกิดข้อผิดพลาดในการลบข้อมูล');
            }
        }
    };

    // Edit employee
    const handleEditEmployee = (employee) => {
        setIsEditing(true);
        setEditingEmployeeId(employee.id);
        setNewEmployeeData({
            name: employee.name,
            lastname: employee.lastname,
            position: employee.position,
            phone: employee.phone,
            email: employee.email,
            image: null,
        });
    };

    // Save edited data
    const handleSaveEdit = async (e) => {
        e.preventDefault();
    
        const formData = new FormData();
        
        // เพิ่มข้อมูลที่ไม่ใช่ไฟล์ลงใน FormData
        formData.append('name', newEmployeeData.name);
        formData.append('lastname', newEmployeeData.lastname);
        formData.append('position', newEmployeeData.position);
        formData.append('phone', newEmployeeData.phone);
        formData.append('birthdate', newEmployeeData.birthdate);
    
        // เพิ่มไฟล์รูปถ้าหากมี
        if (newEmployeeData.image) {
            formData.append('image', newEmployeeData.image);
        }
    
        try {
            // ส่งข้อมูลไปยังเซิร์ฟเวอร์โดยใช้ PUT
            const response = await axios.put(`http://localhost:8081/emp/${editingEmployeeId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // ระบุว่าเป็นข้อมูลแบบ multipart
                }
            });
    
            console.log('Response:', response);
    
            // เมื่อสำเร็จ
            setIsEditing(false);
            fetchEmployees();  // รีเฟรชข้อมูล
            resetForm();       // รีเซ็ตฟอร์ม
        } catch (error) {
            console.error('Error saving data:', error);
            alert('เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
        }
    };
    
    // Reset form
    const resetForm = () => {
        setNewEmployeeData({ name: '', lastname: '', position: '', phone: '', email: '', password: '', image: null });
        setPreviewImage(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    return (
        <div className="layout">
            <Sidebar />
            <div className="emp-container">
                <h1 className="emp-title">ข้อมูลพนักงาน</h1>
                <div className="emp-grid">
                    {employees.map((employee) => (
                        <div key={employee.id} className="emp-item">
                            <h3>{employee.name} {employee.lastname}</h3>
                            <p>ตำแหน่ง: {employee.position}</p>
                            <p>เบอร์โทร: {employee.phone}</p>
                            <p>อีเมล: {employee.email} </p>
                            {employee.image && (
                                <img
                                    src={`http://localhost:8081/uploads/${employee.image}`}
                                    alt={employee.name}
                                    style={{ width: '200px', height: 'auto' }}
                                />
                            )}
                            <div className="button-container">
                                <button onClick={() => handleEditEmployee(employee)} className="edit-emp">แก้ไข</button>
                                <button onClick={() => handleRemoveEmployee(employee.id)} className="delete-emp">ลบ</button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ฟอร์มเพิ่มพนักงาน */}

                <div className="add-emp-form">
                    <h2>{isEditing ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่'}</h2>
                    <form onSubmit={isEditing ? handleSaveEdit : handleAddEmployee}>
                        <div className="form-group">
                            <label>ชื่อ</label>
                            <input
                                type="text"
                                name="name"
                                value={newEmployeeData.name}
                                onChange={handleInputChange}
                                placeholder="กรอกชื่อ"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>นามสกุล</label>
                            <input
                                type="text"
                                name="lastname"
                                value={newEmployeeData.lastname}
                                onChange={handleInputChange}
                                placeholder="กรอกนามสกุล"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>ตำแหน่ง</label>
                            <input
                                type="text"
                                name="position"
                                value={newEmployeeData.position}
                                onChange={handleInputChange}
                                placeholder="กรอกตำแหน่ง"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>เบอร์โทร</label>
                            <input
                                type="tel"
                                name="phone"
                                value={newEmployeeData.phone}
                                onChange={handleInputChange}
                                placeholder="กรอกเบอร์โทร"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>อีเมล</label>
                            <input
                                type="email"
                                name="email"
                                value={newEmployeeData.email}
                                onChange={handleInputChange}
                                placeholder="กรอกอีเมล"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>รหัสผ่าน</label>
                            <input
                                type="password"
                                name="password"
                                value={newEmployeeData.password}
                                onChange={handleInputChange}
                                placeholder="กรอกรหัสผ่าน"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>เลือกรูปภาพ</label>
                            <input
                                type="file"
                                onChange={handleImageChange}
                                ref={imageInputRef}
                            />
                            {/* แสดงรูปภาพเดิมในกรณีที่มีภาพเดิม */}
                            {previewImage ? (
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    style={{ width: '100px', height: 'auto', marginTop: '10px' }}
                                />
                            ) : (
                                newEmployeeData.image && (
                                    <img
                                        src={`http://localhost:8081/uploads/${newEmployeeData.image}`}
                                        alt="Current"
                                        style={{ width: '100px', height: 'auto', marginTop: '10px' }}
                                    />
                                )
                            )}
                        </div>
                        <div className="button-container">
                            <button type="submit" className="save-btn">
                                {isEditing ? 'บันทึก' : 'เพิ่มพนักงาน'}
                            </button>
                            {isEditing && (
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setNewEmployeeData({ name: '', lastname: '', position: '', phone: '', email: '', password: '', image: null });
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

};

export default EmpInfo;
