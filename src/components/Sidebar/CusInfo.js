import React, { useState, useEffect, useCallback } from 'react';
import '../CSS/CusInfo.css';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const CustomerItem = ({ customer, onEditCustomer, onRemoveCustomer }) => (
    <div className="cus-item">
        <h3>{customer.name} {customer.lastname}</h3>
        <p>เบอร์โทร: {customer.phone}</p>
        <p>อีเมล: {customer.email}</p>
        <div className="button-container">
            <button className="edit-cus" onClick={onEditCustomer}>แก้ไข</button>
            <button className="delete-cus" onClick={onRemoveCustomer}>ลบ</button>
        </div>
    </div>
);

const CusInfo = () => {
    const [customers, setCustomers] = useState([]);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingCustomerId, setEditingCustomerId] = useState(null);
    const [newCustomerData, setNewCustomerData] = useState({ name: '', lastname: '', phone: '', email: '' });
    const [selectedCustomer, setSelectedCustomer] = useState(null);
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

    const fetchCustomers = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:8081/cus');
            if (Array.isArray(response.data)) {
                setCustomers(response.data);
            } else {
                throw new Error("Invalid data format from API");
            }
        } catch (err) {
            setError(err.message);
        }
    }, []);

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

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer);
        localStorage.setItem('name', customer.name);
        localStorage.setItem('email', customer.email);
        localStorage.setItem('phone', customer.phone);
    }

    const handleEditCustomer = useCallback((customer) => {
        setIsEditing(true);
        setEditingCustomerId(customer.id);
        setNewCustomerData({ name: customer.name, lastname: customer.lastname, phone: customer.phone, email: customer.email });
    }, []);

    const handleRemoveCustomer = useCallback(async (id) => {
        const confirmDelete = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลลูกค้ารายนี้?");
        if (confirmDelete) {
            try {
                await axios.delete(`http://localhost:8081/cus/${id}`);
                fetchCustomers();
                alert('ลบข้อมูลลูกค้าสำเร็จ');
            } catch (error) {
                console.error('Error deleting customer:', error);
                alert('เกิดข้อผิดพลาดในการลบข้อมูลลูกค้า: ' + (error.response ? error.response.data.error : error.message));
            }
        }
    }, [fetchCustomers]);

    const handleSaveEdit = useCallback(async (e) => {
        e.preventDefault();
        console.log("newCustomerData before update:", newCustomerData);
        try {
            const formData = new FormData();
            formData.append('name', newCustomerData.name);
            formData.append('lastname', newCustomerData.lastname);
            formData.append('phone', newCustomerData.phone);
            formData.append('email', newCustomerData.email);
            const response = await axios.put(`http://localhost:8081/cus/${editingCustomerId}`, newCustomerData);
            console.log("Data sent successfully:", response.data);
            fetchCustomers();
            setIsEditing(false);
            setEditingCustomerId(null);
            setNewCustomerData({ name: '', lastname: '', phone: '', email: '' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Error saving edited customer data:', error);
            setError('เกิดข้อผิดพลาดในการบันทึกการแก้ไข: ' + (error.response ? error.response.data.message : error.message));
        }
    }, [editingCustomerId, fetchCustomers, newCustomerData]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setNewCustomerData((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleOrder = () => {
        if (newCustomerData) {
            const updatedReservationDetails = {
                name: newCustomerData.name,
                email: newCustomerData.email,
                phone: newCustomerData.phone,
                numPeople: location.state?.reservationDetails?.numPeople
            };
            localStorage.setItem('reservationDetails', JSON.stringify(updatedReservationDetails))
            navigate('/reservation', { state: { reservationDetails: updatedReservationDetails } });
        } else {
            console.log('No customer selected');
        }
    };

    if (error) {
        return <div className="cus-container"><p className="error-message">Error: {error}</p></div>;
    }

    return (
        <div className="layout">
            <Sidebar />
            <div className="cus-container">
                <h1 className="cus-title">ข้อมูลลูกค้า</h1>
                <div className="cus-grid">
                    {customers.map((customer) => (
                        <div key={customer.id} className="cus-item">
                            <h3>{customer.name} {customer.lastname}</h3>
                            <p>เบอร์โทร: {customer.phone}</p>
                            <p>อีเมล: {customer.email} </p>
                            <div className="button-container">
                                <button onClick={() => handleEditCustomer(customer)} className="edit-cus">แก้ไข</button>
                                <button onClick={() => handleRemoveCustomer(customer.id)} className="delete-cus">ลบ</button>
                            </div>
                            {isEditing && editingCustomerId === customer.id &&
                                <form onSubmit={handleSaveEdit} >
                                    <div className="form-group">
                                        <label>ชื่อลูกค้า</label>
                                        <input type="text" name="name" value={newCustomerData.name}
                                            onChange={handleInputChange} placeholder="แก้ไขชื่อลูกค้า"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>นามสกุลลูกค้า</label>
                                        <input type="text" name="lastname" value={newCustomerData.lastname}
                                            onChange={handleInputChange} placeholder="แก้ไขนามสกุลลูกค้า"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>เบอร์โทรศัพท์</label>
                                        <input type="text" name="phone" value={newCustomerData.phone}
                                            onChange={handleInputChange} placeholder="แก้ไขเบอร์โทรศัพท์"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>อีเมล</label>
                                        <input type="email" name="email" value={newCustomerData.email}
                                            onChange={handleInputChange} placeholder="แก้ไขอีเมล"
                                            required
                                        />
                                    </div>
                                    <div className="button-container">
                                        <button type="submit" className="save-btn">บันทึก</button>
                                        <button type="button" className="cancel-btn" onClick={() => {
                                            setIsEditing(false);
                                            setNewCustomerData({ name: '', lastname: '', phone: '', email: '' });
                                        }}
                                        >
                                            ยกเลิก
                                        </button>
                                    </div>
                                </form>
                            }
                        </div>
                    ))}
                </div>
                {/*       {selectedCustomer &&
                     <div className="sum">
                         <button className="order-cus" onClick={handleOrder}>เลือก</button>
                    </div>
                    }*/}
            </div>
        </div>
    );
};

export default CusInfo;