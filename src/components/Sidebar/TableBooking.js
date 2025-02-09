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
    const [bookedTables, setBookedTables] = useState([]);

    useEffect(() => {
        if (!order) {
            navigate('/queue', { replace: true });
        }
    }, [order, navigate]);

    useEffect(() => {
        if (location.state?.bookedOrderIds && location.state?.order) {
          const bookedOrder = location.state.order;

          setTables((prevTables) => {
            return prevTables.map((table) => {
                if(
                  !bookedTables.some(bookedTable => bookedTable.id === table.id) &&
                    table.capacity === String(bookedOrder?.reservationDetails?.numPeople)
                ) {
                  return { ...table, isBooked: true};
                }
                 return table;
               });
          });

          const bookingTable = tables.find(table=> {
            return  !bookedTables.some((bookedTable) => bookedTable.id === table.id) &&
                    table.capacity === String(bookedOrder?.reservationDetails?.numPeople);
            });

          if (bookingTable) {
                setBookedTables((prevBookedTables) => [...prevBookedTables, { ...bookingTable, orderId: bookedOrder.id }]);
          }
        }
    }, [location.state, tables, bookedTables]);

    const handleBookTable = async (tableId) => {
        if (!order) return;
        setLoading(true);
        try {
            // อัปเดตสถานะใน backend
            await axios.put(`http://localhost:8081/ordering/${order.id}`, {
                status: 'booked',
            });

            setTables((prevTables) => {
              return prevTables.map((table) =>
                  table.id === tableId ? { ...table, isBooked: true } : table
              );
            });

             const bookedTable = tables.find(table => table.id === tableId);

            setBookedTables((prevBookedTables) =>
              [...prevBookedTables, { ...bookedTable, orderId: order.id}]
            );

           navigate('/queue', {
              state: {
                bookedOrderIds: [order.id],
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
          setBookedTables((prevBookedTables) =>
             prevBookedTables.filter(table => table.id !== tableId)
        );
        setTables((prevTables) =>
          prevTables.map((table) =>
              table.id === tableId ? { ...table, isBooked: false } : table
          )
        );
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
                        .filter((table) => !table.isBooked)
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
                    {bookedTables.map((table) => (
                         <div key={table.id} className="accepted-item">
                            <p>Order ID: {table.orderId}</p>
                            <p>Table ID: {table.id} </p>
                            <p>Capacity: {table.capacity}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TableBooking;