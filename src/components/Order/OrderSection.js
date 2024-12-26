import React from 'react';
import '../CSS/Queue.css';
import OrderCard from './OrderCard'

const OrderSection = ({ title, orders }) => {
    return (
        <div className="order-section">
            <h2>{title}</h2>
            {orders?.length > 0 ? (
                <ul>
                    {orders.map((order, index) => (
                        <li key={index}>
                           {/* แสดงผลข้อมูล order */}
                             <OrderCard key={index} order={order} onAccept={order.onAccept} />
                        </li>
                    ))}
                </ul>
            ) : (
                <p>ไม่มีคิว</p>
            )}
        </div>
    );
};

export default OrderSection;