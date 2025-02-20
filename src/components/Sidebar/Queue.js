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
            return typeof order?.reservationDetails?.foodname === "string"
                ? formattedFoodname.split('\n').map((item, index) => (
                    <label key={index}>{item}<br /></label>
                ))
                : <label>{formattedFoodname}</label>
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

    const initialTables = [
        { id: 1, isBooked: false, capacity: 3, orderId: null },
        { id: 2, isBooked: false, capacity: 3, orderId: null },
        { id: 3, isBooked: false, capacity: 4, orderId: null },
        { id: 4, isBooked: false, capacity: 3, orderId: null },
        { id: 5, isBooked: false, capacity: 3, orderId: null },
        { id: 6, isBooked: false, capacity: 3, orderId: null },
        { id: 7, isBooked: false, capacity: 4, orderId: null },
    ];

    const [tables, setTables] = useState(initialTables);

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
            setAcceptedQueueData(bookedOrders);  // ข้อมูลคิวรับแล้ว
        } catch (error) {
            setError('ไม่สามารถดึงข้อมูลออเดอร์ได้');
            console.error('Error fetching orders:', error);
        }
    };

    const handleAcceptOrder = async (order) => {
        navigate(`/table-booking`, { state: { order, tables } });
    };

    const handleClearOrder = useCallback(async (orderId) => {
        console.log("handleClearOrder called with orderId:", orderId); // เพิ่มตรงนี้
        try {
            await axios.delete(`http://localhost:8081/ordering/${orderId}`);
    
            // Find the table associated with this order
            const tableToUpdate = tables.find((table) => table.orderId === orderId);
    
            if (tableToUpdate) {
                console.log("Table to update:", tableToUpdate); // เพิ่มตรงนี้
                // Update the status of the table to "available" in the database
                try {
                  await axios.put(
                    `http://localhost:8081/tables/${tableToUpdate.id}`,
                    {
                      status: "available",
                    }
                  );
                  console.log("Table status update successful"); // เพิ่มตรงนี้
    
                   //Update the local state of the tables
                   setTables((prevTables) =>
                   prevTables.map((table) =>
                     table.id === tableToUpdate.id
                       ? { ...table, isBooked: false, orderId: null }
                       : table
                   )
                 );
                 console.log("Table update successful"); // เพิ่มตรงนี้
    
                } catch (updateError) {
                  console.error("Error updating table status:", updateError);
                }
            }
    
            await fetchOrders();
            console.log("Orders fetched successfully"); // เพิ่มตรงนี้
        } catch (err) {
            setError("ไม่สามารถเคลียร์คิวได้");
            console.error("Error clearing order:", err);
        }
    }, [tables]);

    useEffect(() => {
        fetchMenuItems();
        fetchOrders();

        const intervalId = setInterval(() => {
            fetchOrders();
        }, 3000);

        return () => clearInterval(intervalId);
    }, [fetchMenuItems]);

    useEffect(() => {
        if (location.state?.tables) {
            console.log("update table success");
            setTables(location.state.tables); // อัปเดตตารางจาก TableBooking
        }
    }, [location.state?.tables]);

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
                                getFoodName={getFoodName}
                                onAccept={handleAcceptOrder}
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