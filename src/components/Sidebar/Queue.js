import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import '../CSS/Queue.css';
import Sidebar from './Sidebar';
import { useNavigate, useLocation } from 'react-router-dom';

const OrderItem = ({ itemId, cartItem, getFoodName }) => {
    if (!cartItem) return null;
    return (
        <p>
            {getFoodName(itemId)} x {cartItem.quantity} : {cartItem.spicinessLevel || '-'} : {cartItem.additionalDetails || '-'}
        </p>
    );
};

const QueueItem = ({ order, getFoodName, onAccept, onClear, isAccepted, onCancel }) => {
    const handleAccept = () => {
        if (onAccept) onAccept(order);
    };

    const handleClear = () => {
        if (window.confirm(`ต้องการเคลียร์ออเดอร์นี้สำหรับ ${order.reservationDetails.name} หรือไม่?`)) {
            if (onClear) onClear(order.id);
        }
    };

    const handleCancel = () => {
        if (window.confirm(`ต้องการยกเลิกออเดอร์นี้สำหรับ ${order.reservationDetails.name} หรือไม่?`)) {
            if (onCancel) onCancel(order.id);
        }
    };

    const formattedFoodname = useMemo(() => {
        if (!order?.reservationDetails?.foodname) return "ไม่มี";
        try {
            return typeof order?.reservationDetails?.foodname === "string"
                ? order.reservationDetails.foodname.split('\n').map((item, index) => (
                    <label key={index}>{item}<br /></label>
                ))
                : <label>{order.reservationDetails.foodname}</label>
        } catch (e) {
            return order.reservationDetails.foodname;
        }
    }, [order?.reservationDetails?.foodname]);

    const formattedArrivalTime = useMemo(() => {
        if (!order?.reservationDetails?.ArrivalTime) return "ไม่ระบุ";
        try {
            const date = new Date(order.reservationDetails.ArrivalTime);
            return date.toLocaleString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return "ไม่ถูกต้อง";
        }
    }, [order?.reservationDetails?.ArrivalTime]);

    return (
        <div className="queue-item">
            <div className="queue-info">
                <span className="queue-name">
                    👤   {order.customerName
                        ? `${order.customerName} ${order.employeeName ? `(จองโดย : ${order.reservationDetails?.name})` : ''}`
                        : order.reservationDetails?.name} ({order.reservationDetails?.numPeople} คน)
                </span>
                <label>🍽️ รายการอาหาร : </label>
                {formattedFoodname}
                <label>🕒 วัน/เวลา : {formattedArrivalTime}</label>
                <label>📞 เบอร์โทร : {order?.reservationDetails?.user_phone || "ไม่มีข้อมูล"}</label>
                <div className="queue-order">
                    {order.items?.map((item, idx) => (
                        <OrderItem key={idx} itemId={item.itemId} cartItem={item} getFoodName={getFoodName} />
                    ))}
                </div>
            </div>
            <div className="queue-buttons">
                {isAccepted ? (
                    <button
                        className="order-button order-button-clear"
                        onClick={handleClear}
                        disabled={!onClear}
                    >
                        เคลียร์
                    </button>
                ) : (
                    <>
                        <button
                            className="order-button order-button-accepted"
                            onClick={handleAccept}
                            disabled={!onAccept}
                        >
                            รับออเดอร์
                        </button>
                        <button
                            className="order-button order-button-cancel"
                            onClick={handleCancel}
                            disabled={!onCancel}
                        >
                            ยกเลิก
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

const Queue = () => {
    const [queueData, setQueueData] = useState([]);
    const [acceptedQueueData, setAcceptedQueueData] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [tables, setTables] = useState([]);
    const [userData, setUserData] = useState({
        name: '',
        lastname: '',
        position: '',
        phone: '',
        birthdate: '',
        email: '',
        password: '',
    });

    const getFoodName = useCallback(
        (itemId) => menuItems.find((item) => item.id === parseInt(itemId, 10))?.foodname || "Unknown",
        [menuItems]
    );

    const fetchMenuItems = useCallback(async () => {
        try {
            const response = await axios.get("http://localhost:8081/menu");
            setMenuItems(response.data);
        } catch (err) {
            setError("ไม่สามารถดึงข้อมูลเมนูได้");
            console.error("Error fetching menu items:", err);
        }
    }, []);

    const fetchOrders = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:8081/ordering');
            const allOrders = response.data;
            const pendingOrders = allOrders.filter((order) => order.status !== 'booked' && order.status !== 'cleared');
            const bookedOrders = allOrders.filter((order) => order.status === 'booked');

            setQueueData(pendingOrders);
            setAcceptedQueueData(bookedOrders);
        } catch (error) {
            setError('ไม่สามารถดึงข้อมูลออเดอร์ได้');
            console.error('Error fetching orders:', error);
        }
    }, []);

    const handleAcceptOrder = useCallback((order) => {
        navigate(`/table-booking`, { state: { order, tables } });
    }, [navigate, tables]);

    const handleClearOrder = useCallback(async (orderId) => {
        try {
            const tableToUpdate = tables.find((table) =>
                table.orderId === Number(orderId) || table.orderId === orderId
            );
            console.log('Table to update:', tableToUpdate);

            if (tableToUpdate) {
                // อัปเดตสถานะโต๊ะเป็น available และล้าง orderId
                await axios.put(`http://localhost:8081/tables/${tableToUpdate.id}`, {
                    status: "available",
                    orderId: null
                });

                await axios.put(`http://localhost:8081/ordering/${orderId}`, {
                    status: "cleared"
                });

                // ซ่อนรายการจากคิวรับแล้ว
                setAcceptedQueueData(prev =>
                    prev.filter(order => order.id !== orderId)
                );

                // อัปเดต state ของ tables
                setTables(prev =>
                    prev.map(table =>
                        table.id === tableToUpdate.id
                            ? { ...table, status: "available", orderId: null }
                            : table
                    ));
            } else {
                setError("ไม่พบโต๊ะที่ต้องการเคลียร์");
                console.error(`ไม่พบโต๊ะสำหรับ orderId ${orderId}`);
                console.log('Tables structure:', tables.map(t => ({ id: t.id, orderId: t.orderId, status: t.status })));
            }
        } catch (err) {
            setError("ไม่สามารถเคลียร์คิวได้");
            console.error("Error clearing order:", err);
        }
    }, [tables]);

    const handleCancelOrder = useCallback(async (orderId) => {
        try {
            await axios.delete(`http://localhost:8081/ordering/${orderId}`);
            setQueueData(prev => prev.filter(order => order.id !== orderId));
        } catch (err) {
            setError("ไม่สามารถยกเลิกออเดอร์ได้");
            console.error("Error canceling order:", err);
        }
    }, []);

    useEffect(() => {
        fetchMenuItems();
        fetchOrders();

        const intervalId = setInterval(() => {
            fetchOrders();
        }, 5000);

        return () => clearInterval(intervalId);
    }, [fetchMenuItems, fetchOrders]);

    useEffect(() => {
        if (location.state?.tables) {
            console.log("Received tables in Queue:", location.state.tables);
            setTables(location.state.tables);
        }
    }, [location.state?.tables]);

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

    return (
        <div className="layout">
            <Sidebar />
            <div className="queue-container">
                <div className="queue-section">
                    <h2>คิวใหม่</h2>
                    {queueData.length > 0 ? (
                        queueData.map((order) => (
                            <QueueItem
                                key={order.id}
                                order={order}
                                getFoodName={getFoodName}
                                onAccept={handleAcceptOrder}
                                onCancel={handleCancelOrder}
                                isAccepted={false}
                            />
                        ))
                    ) : (
                        <div>ไม่มีคิวใหม่</div>
                    )}
                </div>

                <div className="queue-section">
                    <h2>คิวรับแล้ว</h2>
                    {acceptedQueueData.length > 0 ? (
                        acceptedQueueData.map((order) => (
                            <QueueItem
                                key={order.id}
                                order={order}
                                getFoodName={getFoodName}
                                onClear={handleClearOrder}
                                isAccepted={true}
                            />
                        ))
                    ) : (
                        <div>ไม่มีคิวรับแล้ว</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Queue;