import React, { useState, useEffect } from 'react';
import TableItem from './TableItem';
import '../CSS/TableBooking.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const TableBooking = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [order, setOrder] = useState(location.state?.order || null);
    const [tables, setTables] = useState([
        { id: 1, isBooked: false, capacity: '2-3' },
        { id: 2, isBooked: false, capacity: '2-3' },
        { id: 3, isBooked: false, capacity: 4 },
        { id: 4, isBooked: false, capacity: '2-3' },
        { id: 5, isBooked: false, capacity: '2-3' },
        { id: 6, isBooked: false, capacity: '2-3' },
        { id: 7, isBooked: false, capacity: 4 },
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [acceptedOrders, setAcceptedOrders] = useState([]);

    useEffect(() => {
        if (!order) {
            navigate('/queue', { replace: true });
        }
    }, [order, navigate]);

    const handleBookTable = async (tableId) => {
        if (!order) return;
        setLoading(true);
        try {
            // อัปเดตสถานะใน backend
            await axios.put(`http://localhost:8081/ordering/${order.id}`, {
                status: 'booked',
            });

            // อัปเดตสถานะโต๊ะ
            const updatedTables = tables.map((table) =>
                table.id === tableId ? { ...table, isBooked: true } : table
            );
            setTables(updatedTables);

            // นำผู้ใช้กลับไปหน้าคิว พร้อมส่งข้อมูล order ที่จองไปแล้ว
            navigate('/queue', {
                state: {
                    bookedOrderIds: [order.id], // ส่ง ID ของ order ที่จองกลับไป
                    order: order
                },
            });
        } catch (error) {
            console.error('Error booking table:', error);
            setError('Failed to book table. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = (tableId) => {
        const updatedTables = tables.map((table) =>
            table.id === tableId ? { ...table, isBooked: false } : table
        );
        setTables(updatedTables);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="table-booking-container">
            <h2>จองโต๊ะอาหาร</h2>
            <div className="table-lists">
                {/* รายการฝั่งซ้าย */}
                <div className="table-list">
                    <h3>โต๊ะที่ยังไม่ได้จอง</h3>
                    {tables
                        .filter((table) => !table.isBooked) // แสดงเฉพาะโต๊ะที่ยังไม่ได้จอง
                        .map((table) => (
                            <TableItem
                                key={table.id}
                                table={table}
                                onBook={handleBookTable}
                                onCancel={handleCancelBooking}
                            />
                        ))}
                </div>

                {/* รายการฝั่งขวา */}
                <div className="accepted-list">
                    <h3>โต๊ะที่จองแล้ว</h3>
                    {acceptedOrders.map((order, index) => (
                        <div key={index} className="accepted-item">
                            <p>Order ID: {order.id}</p>
                            <p>Table: {order.table || 'N/A'}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

};

export default TableBooking;