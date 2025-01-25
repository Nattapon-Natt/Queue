import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

const QueueItem = ({ order, getFoodName, onAccept, onClear, isAccepted }) => {
    const handleAccept = () => {
        onAccept(order);
    };

    const formattedFoodname = useMemo(() => {
        if (!order?.reservationDetails?.foodname) return "ไม่มี";
        try {
            return typeof order?.reservationDetails?.foodname === 'string'
                ? JSON.parse(order.reservationDetails.foodname).join('\n')
                : order.reservationDetails.foodname.join('\n');
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
                <span className="queue-name">👤 {order.reservationDetails.name} ({order.reservationDetails.numPeople} คน)</span>
                <label>🍽️ รายการอาหาร : </label>
                {formattedFoodname.split('\n').map((item, index) => (
                    <label key={index}>{item}<br /></label>
                ))}
                <label>🕒 วัน/เวลา : {formattedArrivalTime}</label>
                <label>📞 เบอร์โทร : {order?.reservationDetails?.user_phone || "ไม่มีข้อมูล"}</label>
                <div className="queue-order">
                    {order.items?.map((item, idx) => (
                        <OrderItem key={idx} itemId={item.itemId} cartItem={item} getFoodName={getFoodName} />
                    ))}
                </div>
            </div>
            {isAccepted ? (
                <button className="order-button order-button-clear" onClick={() => onClear(order.id)}>
                    เคลียร์
                </button>
            ) : (
                <button className="order-button order-button-accepted" onClick={handleAccept}>
                    รับออเดอร์
                </button>
            )}
        </div>
    );
};

const Queue = () => {
    const [queueData, setQueueData] = useState([]);
    const [acceptedQueueData, setAcceptedQueueData] = useState([]);
    const acceptedQueueDataRef = useRef([]);
    const [menuItems, setMenuItems] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

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

    const fetchOrders = async () => {
        try {
            const response = await axios.get('http://localhost:8081/ordering');
            const allOrders = response.data;

            // แยกข้อมูลตามสถานะ
            const pendingOrders = allOrders.filter((order) => order.status !== 'booked');  // คิวใหม่
            const bookedOrders = allOrders.filter((order) => order.status === 'booked');  // คิวรับแล้ว

            setQueueData(pendingOrders);  // ข้อมูลคิวใหม่
            acceptedQueueDataRef.current = bookedOrders;  // คิวรับแล้ว
            setAcceptedQueueData(bookedOrders);  // คิวรับแล้ว
        } catch (error) {
            setError('ไม่สามารถดึงข้อมูลออเดอร์ได้');
            console.error('Error fetching orders:', error);
        }
    };

    useEffect(() => {
        fetchMenuItems();
        fetchOrders(); // เรียกใช้ fetchOrders ครั้งแรกทันที

        // ตั้ง interval เพื่อดึงข้อมูลทุกๆ 3 วินาที
        const intervalId = setInterval(() => {
            fetchOrders();
        }, 3000);

        // เมื่อ component ถูกทำลายจะทำการหยุด interval
        return () => clearInterval(intervalId);
    }, []);

    const handleAcceptOrder = async (order) => {
        try {
            await axios.put(`http://localhost:8081/ordering/${order.id}`, { status: 'booked' });
            // Update the accepted order on acceptedQueueDataRef and acceptedQueueData
            acceptedQueueDataRef.current = [...acceptedQueueDataRef.current, order];
            setAcceptedQueueData([...acceptedQueueDataRef.current]);

            navigate(`/table-booking`, { state: { order } });
        } catch (error) {
            console.error('Failed to accept order:', error);
        }
    };

    const handleClearOrder = useCallback(
        async (orderId) => {
            try {
                await axios.delete(`http://localhost:8081/ordering/${orderId}`);
                acceptedQueueDataRef.current = acceptedQueueDataRef.current.filter(order => order.id !== orderId);
                setAcceptedQueueData([...acceptedQueueDataRef.current]);
            } catch (err) {
                setError("ไม่สามารถเคลียร์คิวได้");
                console.error("Error clearing order:", err);
            }
        },
        []
    );

    useEffect(() => {
         if (location.state?.bookedOrderIds && location.state?.order) {
            const bookedOrderIds = location.state.bookedOrderIds;
            const bookedOrder = location.state.order;

            setQueueData((prevQueueData) =>
                prevQueueData.filter((item) => !bookedOrderIds.includes(item.id))
            );

            // This is already handled in the `handleAcceptOrder` function.
            // No need to set them here since it causes data conflict.
            // acceptedQueueDataRef.current = [...acceptedQueueDataRef.current, bookedOrder];
            // setAcceptedQueueData([...acceptedQueueDataRef.current]);

            navigate('/queue', { replace: true, state: {} });
        }
    }, [location.state, navigate]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

    return (
        <div className="layout">
            <Sidebar />
            <div className="queue-container">
                {/* คิวใหม่ (ข้อมูลที่ไม่มีสถานะ 'booked') */}
                <div className="queue-section">
                    <h2>คิวใหม่</h2>
                    {queueData.length > 0 ? (
                        queueData.map((order) => (
                            <QueueItem
                                key={order.id}
                                order={order}
                                onAccept={handleAcceptOrder}
                            />
                        ))
                    ) : (
                        <div>ไม่มีคิวใหม่</div>
                    )}
                </div>

                <div className="queue-section">
                    <h2>คิวรับแล้ว</h2>
                    {acceptedQueueDataRef.current.length > 0 ? (
                        acceptedQueueDataRef.current.map((order) => (
                            <QueueItem
                                key={order.id}
                                order={order}
                                isAccepted={true}
                                onClear={handleClearOrder}
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