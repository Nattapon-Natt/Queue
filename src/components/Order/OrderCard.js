import React from 'react';
import '../CSS/Queue.css';

const OrderCard = ({ order, onAccept }) => {
    return (
        <div className="order-card">
            <p>
                <strong>{order.queueNumber}</strong> {order.reservationDetails?.name} ({order.reservationDetails?.numPeople}P)
            </p>
            <ul>
                {order.cartItems?.map((item, index) => (
                    <li key={index}>
                         {item.foodname} x {item.quantity}
                        <p>ความเผ็ด: {item.spicinessLevel}</p>
                        <p>รายละเอียด: {item.additionalDetails}</p>
                    </li>
                ))}
            </ul>
            <button className="accept-button" onClick={onAccept}>รับออเดอร์</button>
        </div>
    );
};

export default OrderCard;