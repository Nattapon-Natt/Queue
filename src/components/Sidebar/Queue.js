import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import '../CSS/Queue.css'; // Import CSS file if it exists
import Sidebar from './Sidebar';

const OrderItem = ({ itemId, cartItem, getFoodName }) => {
    if (!cartItem) return null;
    return (
        <div>
            <p>
                {getFoodName(itemId)} x {cartItem.quantity} : {cartItem.spicinessLevel} : {cartItem.additionalDetails}
            </p>
        </div>
    );
};

const Queue = () => {
    const [queueData, setQueueData] = useState([]);
    const [acceptedQueueData, setAcceptedQueueData] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [error, setError] = useState(null);

    const getFoodName = useCallback((itemId) => {
        const item = menuItems.find((item) => item.id === parseInt(itemId, 10));
        return item ? item.foodname : 'Unknown';
    }, [menuItems]);

    const groupCartItems = useMemo(() => {
        const groupOrders = (data) => {
            const groupedOrders = {};

            data.forEach(queueItem => {
                if (!queueItem?.cartItems) {
                    return;
                }
                const queueNumber = queueItem.queueNumber;

                if (!groupedOrders[queueNumber]) {
                    groupedOrders[queueNumber] = {
                        queueNumber: queueNumber,
                        reservationDetails: queueItem.reservationDetails,
                        items: []
                    };
                }
                for (const [itemId, cartItem] of Object.entries(queueItem.cartItems)) {
                    groupedOrders[queueNumber].items.push({
                        itemId,
                        ...cartItem
                    });
                }
            });
            return groupedOrders;
        }
        return {
            newOrders: groupOrders(queueData),
            acceptedOrders: groupOrders(acceptedQueueData)
        }
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

    useEffect(() => {
        const storedQueueData = localStorage.getItem('queueData');
        if (storedQueueData) {
            try {
                const parsedQueueData = JSON.parse(storedQueueData);
                setQueueData(prevQueueData => {
                    // Check if the new queue item already exists
                    const alreadyExists = prevQueueData.some(item => item.queueNumber === parsedQueueData.queueNumber);
                    if (alreadyExists) {
                        return prevQueueData
                    }
                    return [parsedQueueData, ...prevQueueData]
                });
            } catch (error) {
                console.error("Error parsing storedQueueData in useEffect:", error);
                setError("Failed to parse queue data");
            }
        }
        const storedAcceptedQueueData = localStorage.getItem('acceptedQueueData');
        if (storedAcceptedQueueData) {
            try {
                const parsedAcceptedQueueData = JSON.parse(storedAcceptedQueueData);
                setAcceptedQueueData(parsedAcceptedQueueData);
            } catch (error) {
                console.error("Error parsing storedAcceptedQueueData in useEffect:", error);
                setError("Failed to parse accepted queue data");
            }
        }
        const handleStorageChange = () => {
            const storedQueueData = localStorage.getItem('queueData');
            if (storedQueueData) {
                try {
                    const parsedQueueData = JSON.parse(storedQueueData);
                    setQueueData(prevQueueData => {
                        // Check if the new queue item already exists
                        const alreadyExists = prevQueueData.some(item => item.queueNumber === parsedQueueData.queueNumber);
                        if (alreadyExists) {
                            return prevQueueData
                        }
                        return [parsedQueueData, ...prevQueueData]
                    });

                } catch (error) {
                    console.error("Error parsing storedQueueData in handleStorageChange:", error);
                    setError("Failed to parse queue data");
                }
            }
            const storedAcceptedQueueData = localStorage.getItem('acceptedQueueData');
            if (storedAcceptedQueueData) {
                try {
                    const parsedAcceptedQueueData = JSON.parse(storedAcceptedQueueData);
                    setAcceptedQueueData(parsedAcceptedQueueData)
                } catch (error) {
                    console.error("Error parsing storedAcceptedQueueData in useEffect:", error);
                    setError("Failed to parse accepted queue data");
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const handleRemoveFromLocalStorage = (queueNumber) => {
        const storedQueueData = localStorage.getItem('queueData');
        if (storedQueueData) {
            try {
                const parsedQueueData = JSON.parse(storedQueueData);
                const filteredQueueData = parsedQueueData.filter(item => item.queueNumber !== queueNumber);
                localStorage.setItem('queueData', JSON.stringify(filteredQueueData))
            } catch (error) {
                console.error("Error parsing storedQueueData in handleRemoveFromLocalStorage:", error);
                setError("Failed to parse queue data");
            }
        }
    }

    const handleAcceptOrder = (queueNumber) => {
        const orderToMove = queueData.find((order) => order.queueNumber === queueNumber);
    
        if (orderToMove) {
            // อัปเดต queueData โดยกรองเอา order ที่ย้ายออก
            setQueueData((prevQueueData) => {
                const updatedQueueData = prevQueueData.filter((order) => order.queueNumber !== queueNumber);
                localStorage.setItem('queueData', JSON.stringify(updatedQueueData));
                return updatedQueueData;
            });
    
            // อัปเดต acceptedQueueData
            setAcceptedQueueData((prevAcceptedQueueData) => {
                const updatedAcceptedQueueData = [orderToMove, ...prevAcceptedQueueData];
                localStorage.setItem('acceptedQueueData', JSON.stringify(updatedAcceptedQueueData));
                return updatedAcceptedQueueData;
            });
    
            console.log(`Order for queue ${queueNumber} accepted`);
        }
    };
    
    const handleClearOrder = (queueNumber) => {
        // ลบ order ที่เคลียร์ออกจาก acceptedQueueData
        setAcceptedQueueData((prevAcceptedQueueData) => {
            const updatedAcceptedQueueData = prevAcceptedQueueData.filter((order) => order.queueNumber !== queueNumber);
            localStorage.setItem('acceptedQueueData', JSON.stringify(updatedAcceptedQueueData));
            return updatedAcceptedQueueData;
        });
    
        console.log(`Order for queue ${queueNumber} cleared`);
    };
    

    console.log('queueData:', queueData);

    if (error) {
        return (
            <div className="queue-container">
                <h2>Error: {error}</h2>
            </div>
        );
    }

    if (!queueData || queueData.length === 0) {
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
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="layout">
            <Sidebar />
            <div className="queue-container">
                {/* คิวใหม่ */}
                <div className="queue-section">
                    <h2>คิวใหม่</h2>
                    <div className="queue-list">
                        {Object.values(groupCartItems.newOrders).length > 0 ? (
                            Object.values(groupCartItems.newOrders).map((order, index) => (
                                <div
                                    className="queue-item"
                                    key={index}
                                    aria-labelledby={`queue-item-${index}`}
                                >
                                    <div className="queue-info">
                                        <span
                                            className="queue-number"
                                            id={`queue-item-${index}`}
                                        >
                                            {order?.queueNumber}
                                        </span>
                                        <span className="queue-name">
                                            {order?.reservationDetails?.name} (
                                            {order?.reservationDetails?.numPeople}P)
                                        </span>
                                        <div className="queue-order">
                                            {order?.items?.map((item, idx) => (
                                                <OrderItem
                                                    key={idx}
                                                    itemId={item.itemId}
                                                    cartItem={item}
                                                    getFoodName={getFoodName}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        className="order-button order-button-accepted"
                                        onClick={() =>
                                            handleAcceptOrder(order?.queueNumber)
                                        }
                                        aria-label={`Accept order for queue ${order?.queueNumber}`}
                                    >
                                        รับออเดอร์
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="queue-empty"></div>
                        )}
                    </div>
                </div>

                {/* คิวรับแล้ว */}
                <div className="queue-section">
                    <h2>คิวรับแล้ว</h2>
                    <div className="queue-list">
                        {Object.values(groupCartItems.acceptedOrders).length > 0 ? (
                            Object.values(groupCartItems.acceptedOrders).map(
                                (order, index) => (
                                    <div
                                        className="queue-item"
                                        key={index}
                                        aria-labelledby={`queue-item-${index}`}
                                    >
                                        <div className="queue-info">
                                            <span
                                                className="queue-number"
                                                id={`queue-item-${index}`}
                                            >
                                                {order?.queueNumber}
                                            </span>
                                            <span className="queue-name">
                                                {order?.reservationDetails?.name} (
                                                {order?.reservationDetails?.numPeople}P)
                                            </span>
                                            <div className="queue-order">
                                                {order?.items?.map((item, idx) => (
                                                    <OrderItem
                                                        key={idx}
                                                        itemId={item.itemId}
                                                        cartItem={item}
                                                        getFoodName={getFoodName}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <button
                                            className="order-button order-button-accepted"
                                            onClick={() =>
                                                handleAcceptOrder(order?.queueNumber)
                                            }
                                            aria-label={`Accept order for queue ${order?.queueNumber}`}
                                        >
                                            เคลียร์
                                        </button>
                                    </div>
                                )
                            )
                        ) : (
                            <div className="queue-empty"></div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Queue;