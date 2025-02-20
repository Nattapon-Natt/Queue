import React, { useState, useEffect } from 'react';
import '../CSS/TableBooking.css';
import '../CSS/TableItem.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const TableBooking = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [order, setOrder] = useState(location.state?.order || null);

    // รับ state tables จาก props และกำหนด capacity ให้ถูกต้อง
    const [tables, setTables] = useState(location.state?.tables || [
        { id: 1, table_number: 1, isBooked: false, capacity: 3 },
        { id: 2, table_number: 2, isBooked: false, capacity: 3 },
        { id: 3, table_number: 3, isBooked: false, capacity: 4 },
        { id: 4, table_number: 4, isBooked: false, capacity: 3 },
        { id: 5, table_number: 5, isBooked: false, capacity: 3 },
        { id: 6, table_number: 6, isBooked: false, capacity: 3 },
        { id: 7, table_number: 7, isBooked: false, capacity: 4 },
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!order) {
            navigate('/queue', { replace: true });
        }
    }, [order, navigate]);

    useEffect(() => {
        // อัปเดต state tables เมื่อได้รับจาก location.state
        if (location.state?.tables) {
            setTables(location.state.tables);
        }
    }, [location.state?.tables]);

    const handleBookTable = async (tableId) => {
        if (!order) return;
        if (!tableId) {
            console.error("Error: tableId is undefined or null");
            return;
        }

        setLoading(true);
        try {
            console.log(`Booking Table API: http://localhost:8081/tables/${tableId}`);
            console.log(`Updating Order API: http://localhost:8081/ordering/${order.id}`);

            // ดึง capacity จาก state
            const tableToUpdate = tables.find((table) => table.id === tableId);
            const capacity = tableToUpdate ? tableToUpdate.capacity : 3;

            // Update the status of the table to 'booked'
            await axios.put(`http://localhost:8081/tables/${tableId}`, {
                status: 'booked',
            });

            // **Post** ข้อมูลการจองใหม่
            await axios.post(`http://localhost:8081/tables`, {
                table_number: tableId,
                status: 'booked',
                capacity: capacity,
            });

            // อัปเดตสถานะออเดอร์เป็น 'booked'
            const orderResponse = await axios.put(`http://localhost:8081/ordering/${order.id}`, {
                status: 'booked'
            });

            console.log("Order Update Response:", orderResponse.data);

            // อัปเดต state ใน frontend
            const updatedTables = tables.map(table =>
                table.id === tableId ? { ...table, isBooked: true } : table
            );

            setTables(updatedTables);
            navigate('/queue', {
                state: {
                    tables: updatedTables  // ส่ง tables ที่อัปเดตไปให้ Queue
                },
            });
        } catch (error) {
            console.error('Error booking table:', error.response ? error.response.data : error);
            setError('Failed to book table. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (tableId) => {
        if (!order) return;
        setLoading(true);
        try {
            console.log(`Canceling Table API: http://localhost:8081/tables/${tableId}`);

            //ดึง capacity จาก state
            const tableToUpdate = tables.find((table) => table.id === tableId);
            const capacity = tableToUpdate ? tableToUpdate.capacity : 3;

            // **Put** เพื่ออัปเดต status เป็น available
            await axios.put(`http://localhost:8081/tables/${tableId}`, {
              status: 'available',
            });

            // **Post** ข้อมูลการจองใหม่
            await axios.post(`http://localhost:8081/tables`, {
              table_number: tableId,
              status: 'available',
              capacity: capacity,
            });

            // อัปเดต state ใน frontend
            const updatedTables = tables.map(table =>
                table.id === tableId ? { ...table, isBooked: false } : table
            );

            setTables(updatedTables);
            navigate('/queue', {
                state: {
                    tables: updatedTables  // ส่ง tables ที่อัปเดตไปให้ Queue
                },
            });
        } catch (error) {
            console.error('Error cancelling booking table:', error);
            setError('Failed to cancel booking table. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const notBookedTable = tables.filter((table) => !table.isBooked);
    const bookedTable = tables.filter((table) => table.isBooked);

    // TableItem Component (Inline)
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
                        <span style={{ color: 'red' }}>จองแล้ว</span>
                    ) : (
                        <span style={{ color: 'green' }}>ว่าง</span>
                    )}</p>
                    <button onClick={handleBookingClick} className={`btn ${table.isBooked ? 'btn-cancel' : 'btn-book'}`}>
                        {table.isBooked ? 'ยกเลิก' : 'จอง'}
                    </button>
                </div>
            </div>
        );
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="table-booking-container">
            <h2>จองโต๊ะอาหาร</h2>
            <div className="table-lists">
                <div className="table-list">
                    <h3>โต๊ะที่ยังไม่ได้จอง</h3>
                    {notBookedTable.map((table) => (
                        <TableItem
                            key={table.id}
                            table={table}
                            onBook={handleBookTable}
                            onCancel={handleCancelBooking}
                        />
                    ))}
                </div>

                <div className="accepted-list">
                    <h3>โต๊ะที่จองแล้ว</h3>
                    {bookedTable.map((table) => (
                        <TableItem
                            key={table.id}
                            table={table}
                            onBook={handleBookTable}
                            onCancel={handleCancelBooking}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TableBooking;