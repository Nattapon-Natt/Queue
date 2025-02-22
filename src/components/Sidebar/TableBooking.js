import React, { useState, useEffect } from 'react';
import '../CSS/TableBooking.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const TableBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(location.state?.order || null);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchTables = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8081/tables');
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setError('Failed to load table data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleBookTable = async (tableId) => {
    if (!order) return;
    if (!tableId) {
      console.error("Error: tableId is undefined or null");
      return;
    }

    setLoading(true);
    try {
      console.log(`Booking Table API: http://localhost:8081/tables/${tableId}`);
      console.log(`Order ID being sent: ${order.id}`); // เพิ่ม log เพื่อตรวจสอบ order.id
      console.log(`Request Body:`, {
        status: 'booked',
        orderId: order.id
      });

      await axios.put(`http://localhost:8081/tables/${tableId}`, {
        status: 'booked',
        orderId: order.id
      });

      await axios.put(`http://localhost:8081/ordering/${order.id}`, {
        status: 'booked'
      });

      const response = await axios.get('http://localhost:8081/tables');
      console.log('Fetched tables after booking:', response.data); // เพิ่ม log เพื่อตรวจสอบ tables
      setTables(response.data);

      navigate('/queue', {
        state: {
          tables: response.data  // ส่ง tables ที่อัปเดตไปให้ Queue
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

      // Update the status of the table to 'available'
      await axios.put(`http://localhost:8081/tables/${tableId}`, {
        status: 'available',
      });

      await axios.put(`http://localhost:8081/ordering/${order.id}`, {
        status: 'pending'
      });

      // Refetch tables to update the local state
      const response = await axios.get('http://localhost:8081/tables');
      setTables(response.data);

      navigate('/queue', {
        state: {
          tables: response.data  // ส่ง tables ที่อัปเดตไปให้ Queue
        },
      });
    } catch (error) {
      console.error('Error cancelling booking table:', error);
      setError('Failed to cancel booking table. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // TableItem Component (Inline)
  const TableItem = ({ table, onBook, onCancel }) => {
    const handleBookingClick = () => {
      if (table.isBooked) {
        if (window.confirm(`คุณต้องการยกเลิกการจองโต๊ะ ${table.id} หรือไม่?`)) {
          onCancel(table.id);
        }
      } else {
        onBook(table.id);
      }};

    return (
      <div className={`table-item ${table.isBooked ? 'booked' : ''}`}>
        <div className={`table-info ${table.isBooked ? 'booked-info' : ''}`}>
          <h3>โต๊ะ {table.table_number}</h3>
          <p>ความจุ: {table.capacity} คน</p>
          <p>สถานะ: {table.status === 'booked' ? (
            <span style={{ color: 'red' }}>จองแล้ว</span>
          ) : (
            <span style={{ color: 'green' }}>ว่าง</span>
          )}</p>
          <button onClick={handleBookingClick} className={`btn ${table.isBooked ? 'btn-cancel' : 'btn-book'}`}>
            {table.status === 'booked' ? 'ยกเลิก' : 'จอง'}
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
      <div className="table-list">
        <h3>โต๊ะที่ยังไม่ได้จอง</h3>
        {tables.filter((table) => table.status === 'available').map((table) => (
          <TableItem
            key={table.id}
            table={{ ...table, isBooked: false }}
            onBook={handleBookTable}
            onCancel={handleCancelBooking}
          />
        ))}
      </div>
      <div className="table-list">
        <h3>โต๊ะที่จองแล้ว</h3>
        {tables.filter((table) => table.status === 'booked').map((table) => (
          <TableItem
            key={table.id}
            table={{ ...table, isBooked: true }}
            onBook={handleBookTable}
            onCancel={handleCancelBooking}
          />
        ))}
      </div>
    </div>
  );
};

export default TableBooking;