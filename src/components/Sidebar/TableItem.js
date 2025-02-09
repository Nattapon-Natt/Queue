import React from 'react';
import '../CSS/TableItem.css';

const TableItem = ({ table, onBook, onCancel }) => {
    const handleBookingClick = () => {
        if (table.isBooked) {
            if (window.confirm(`คุณต้องการยกเลิกการจองโต๊ะ ${table.id} หรือไม่?`)) {
                onCancel(table.id);
            }
        } else {
            onBook(table.id);
        }
    };

    return (
        <div className={`table-item ${table.isBooked ? 'booked' : ''}`}>
            <div className={`table-info ${table.isBooked ? 'booked-info' : ''}`}>
                <h3>โต๊ะ {table.id}</h3>
                <p>ความจุ: {table.capacity} คน</p>
                <p>สถานะ: {table.isBooked ? (
                     <span style={{ color: 'green' }}>จองแล้ว</span>
                     ) : (
                     <span style={{ color: 'gray' }}>ว่าง</span>
                 )}</p>
                <button onClick={handleBookingClick} className={`btn ${table.isBooked ? 'btn-cancel' : 'btn-book'}`}>
                    {table.isBooked ? 'ยกเลิกการจอง' : 'จอง'}
                </button>
            </div>
        </div>
    );
};

export default TableItem;