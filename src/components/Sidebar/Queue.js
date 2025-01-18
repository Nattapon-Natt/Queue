import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import '../CSS/Queue.css';
import Sidebar from './Sidebar';

const OrderItem = ({ itemId, cartItem, getFoodName }) => {
    console.log("OrderItem ItemId:", itemId, "cartItem:", cartItem);
    if (!cartItem) return null;
    return (
        <p>
            {getFoodName(itemId)} x {cartItem?.quantity} : {cartItem?.spicinessLevel} : {cartItem?.additionalDetails}
        </p>
    );
};

const QueueItem = ({ order, getFoodName, onAccept, onClear, isAccepted }) => {
    console.log("QueueItem Order:", order);

     // Format ArrivalTime
    const formattedArrivalTime = useMemo(() => {
        if (!order?.reservationDetails?.ArrivalTime) {
            return "ไม่ระบุ";
        }
        try {
            const date = new Date(order?.reservationDetails?.ArrivalTime);
            const formattedDate = date.toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
             const formattedTime = date.toLocaleTimeString('th-TH', {
                 hour: '2-digit',
                 minute: '2-digit',
                });
            return `${formattedDate}  ${formattedTime}`;

        } catch (e) {
             console.error("Error formatting date and time:", e);
             return "ไม่ถูกต้อง";
        }
    }, [order?.reservationDetails?.ArrivalTime]);
 const formattedFoodname = useMemo(() => {
        if (!order?.reservationDetails?.foodname) return "ไม่มี";
        try {
             return  typeof order?.reservationDetails?.foodname === 'string' ? JSON.parse(order?.reservationDetails?.foodname).join('\n') : order?.reservationDetails?.foodname.join('\n')
        } catch (e) {
            return order?.reservationDetails?.foodname;
        }
    }, [order?.reservationDetails?.foodname]);

    return (
        <div className="queue-item">
            <div className="queue-info">
                <span className="queue-name">👤 {order?.reservationDetails?.name} ({order?.reservationDetails?.numPeople} คน)</span>
                 <label>🍽️ รายการอาหาร : </label>  {formattedFoodname.split('\n').map((item, index) => <label key={index}  >{item}<br /></label>)}
                <label>🕒 วัน/เวลา : {formattedArrivalTime}</label>
                <label>📞 เบอร์โทร : {order?.reservationDetails?.user_phone || "ไม่มีข้อมูล"}</label>
                <div className="queue-order">
                    {order?.items?.map((item, idx) => (
                        <OrderItem key={idx} itemId={item.itemId} cartItem={item} getFoodName={getFoodName} />
                    ))}
                </div>
            </div>
            {isAccepted ? (
                <button className="order-button order-button-clear" onClick={() => onClear(order?.queueNumber)}>
                    เคลียร์
                </button>
            ) : (
                <button className="order-button order-button-accepted" onClick={() => onAccept(order?.queueNumber)}>
                    รับออเดอร์
                </button>
            )}
        </div>
    );
};

const Queue = () => {
    const [queueData, setQueueData] = useState([]);
    const [acceptedQueueData, setAcceptedQueueData] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const getFoodName = useCallback((itemId) => {
        const item = menuItems.find((item) => item.id === parseInt(itemId, 10));
        return item ? item.foodname : 'Unknown';
    }, [menuItems]);

    const groupCartItems = useMemo(() => {
        const groupOrders = (data) => {
            const groupedOrders = {};
            if (!data) return groupedOrders;
            data.forEach(queueItem => {
                console.log("groupOrders queueItem:", queueItem)
                if (!queueItem?.cartItems) return;
                const queueNumber = queueItem.id;
                if (!groupedOrders[queueNumber]) {
                    groupedOrders[queueNumber] = {
                        queueNumber: queueNumber,
                        reservationDetails: queueItem?.reservationDetails || {},
                        items: [],
                        status: queueItem?.status,
                    };
                }
                for (const [itemId, cartItem] of Object.entries(queueItem?.cartItems || {})) {
                    groupedOrders[queueNumber].items.push({ itemId, ...cartItem });
                }
            });
            console.log("groupedOrders:", groupedOrders)
            return groupedOrders;
        };

        const newOrders = groupOrders(queueData);
        const acceptedOrders = groupOrders(acceptedQueueData);
        console.log("Grouped New Orders:", newOrders);
        console.log("Grouped Accepted Orders:", acceptedOrders);
        return {
            newOrders: Object.values(newOrders).reverse(),
            acceptedOrders: Object.values(acceptedOrders).reverse()
        };
    }, [queueData, acceptedQueueData]);

    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                const response = await axios.get('http://localhost:8081/menu');
                setMenuItems(response.data);
            } catch (error) {
                console.error("Error fetching menu items:", error);
                setError("Failed to fetch menu items");
            }
        };
        fetchMenuItems();
    }, []);

    const fetchQueueData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8081/ordering');
            console.log("Raw API Response:", response.data);
            const allOrders = response.data;
            const pendingOrders = allOrders
                .filter(order => order?.status === 'pending')
                .map(item => ({ ...item, queueNumber: item.id, foodname : item.foodname  ? JSON.parse(item.foodname) : null }));
            const acceptedOrders = allOrders
                .filter(order => order?.status === 'accepted')
                .map(item => ({ ...item, queueNumber: item.id , foodname : item.foodname  ? JSON.parse(item.foodname) : null}));
            console.log("Pending Orders:", pendingOrders);
            console.log("Accepted Orders:", acceptedOrders);
            setQueueData(pendingOrders);
            setAcceptedQueueData(acceptedOrders);
        } catch (error) {
            console.error("Error fetching ordering data:", error);
            setError("Failed to fetch ordering data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueueData();
        const intervalId = setInterval(fetchQueueData, 30000);
        return () => clearInterval(intervalId);
    }, []);

    const handleAcceptOrder = async (queueNumber) => {
        try {
            const orderToMove = queueData.find((order) => order.id === queueNumber);
            if (orderToMove) {
                await axios.put(`http://localhost:8081/ordering/${queueNumber}`, { ...orderToMove, status: "accepted" });
                fetchQueueData();
            }
        } catch (error) {
            console.error("Error accepting order:", error);
            setError("Failed to accept order");
        }
    };

    const handleClearOrder = async (queueNumber) => {
        try {
            await axios.delete(`http://localhost:8081/ordering/${queueNumber}`);
            fetchQueueData();
        } catch (error) {
            console.error("Error clearing order:", error);
            setError("Failed to clear order");
        }
    };

    if (loading) {
        return (
            <div className="queue-container">
                <h2>Loading...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="queue-container">
                <h2>Error: {error}</h2>
            </div>
        );
    }

    if (!queueData?.length && !acceptedQueueData?.length) {
        return (
            <div className="layout">
                <Sidebar />
                <div className="queue-container">
                    <div className="queue-section">
                        <h2>คิวใหม่</h2>
                        <h2>No Queue Data Received</h2>
                    </div>
                    <div className="queue-section">
                        <h2>คิวรับแล้ว</h2>
                        <h2>No Accepted Queue Data Received</h2>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="layout">
            <Sidebar />
            <div className="queue-container">
                <div className="queue-section">
                    <h2>คิวใหม่</h2>
                    <div className="queue-list">
                        {Object.values(groupCartItems?.newOrders || {}).length > 0 ? (
                            Object.values(groupCartItems?.newOrders || {}).map((order) => (
                                <QueueItem key={order.queueNumber} order={order} getFoodName={getFoodName} onAccept={handleAcceptOrder} isAccepted={false} />
                            ))
                        ) : (
                            <div className="queue-empty">ไม่มีคิวใหม่</div>
                        )}
                    </div>
                </div>
                <div className="queue-section">
                    <h2>คิวรับแล้ว</h2>
                    <div className="queue-list">
                        {Object.values(groupCartItems?.acceptedOrders || {}).length > 0 ? (
                            Object.values(groupCartItems?.acceptedOrders || {}).map((order) => (
                                <QueueItem key={order.queueNumber} order={order} getFoodName={getFoodName} onClear={handleClearOrder} isAccepted={true} />
                            ))
                        ) : (
                            <div className="queue-empty">ไม่มีคิวรับแล้ว</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Queue;