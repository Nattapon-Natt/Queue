import React from 'react';

const TableItem = ({ table, onBook, onCancel }) => {
    const handleBookingClick = () => {
        if (table.isBooked) {
            if (window.confirm(`คุณต้องการยกเลิกการจองโต๊ะ ${table.id} หรือไม่?`)) {
                onCancel(table.id);  // ยกเลิกการจอง
            }
        } else {
            onBook(table.id);  // จองโต๊ะ
        }
    };

    return (
        <div className={`table-item ${table.isBooked ? 'booked' : ''}`}>
            <div className={`table-info ${table.isBooked ? 'booked-info' : ''}`}>
                <h3>โต๊ะ {table.id}</h3>
                <p>ความจุ: {table.capacity} คน</p>
                <p>สถานะ: {table.isBooked ? 'จองแล้ว' : 'ว่าง'}</p>
                <button onClick={handleBookingClick} className={`btn ${table.isBooked ? 'btn-cancel' : 'btn-book'}`}>
                    {table.isBooked ? 'ยกเลิกการจอง' : 'จอง'}
                </button>
            </div>
            {table.isBooked && (
                <div className="booked-table">
                    <p>โต๊ะ {table.id} ถูกจองแล้ว</p>
                </div>
            )}
        </div>
    );
};

export default TableItem;
