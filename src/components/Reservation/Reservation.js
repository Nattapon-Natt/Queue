import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../CSS/Reservation.css';
import { format, isPast } from 'date-fns';

const OrderItem = ({ item, cartItem }) => (
    <li key={item.id}>
        <p> {item.foodname} x {cartItem.quantity}</p>
        <p>ความเผ็ด: {cartItem.spicinessLevel}</p>
        <p>รายละเอียด: {cartItem.additionalDetails}</p>
    </li>
);

const restaurantConfig = {
    openingTime: '00:00',
    closingTime: '20:00',
    maxPeoplePerReservation: 10,
    cancellationDeadlineHours: 2,
    maxTables: 7,
};

function Reservation() {
    const [numPeople, setNumPeople] = useState('');
    const [reservationDetails, setReservationDetails] = useState(null);
    const [showSummary, setShowSummary] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState('Guest');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [menuItems, setMenuItems] = useState([]);
    const [error, setError] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [queueNumber, setQueueNumber] = useState('');
    const [reservationTime, setReservationTime] = useState('');
    const [queueList, setQueueList] = useState([]);
    const [queueCounterA, setQueueCounterA] = useState(1);
    const [queueCounterB, setQueueCounterB] = useState(1);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [isTimeSelected, setIsTimeSelected] = useState(false);
    const [minDate, setMinDate] = useState('');
    const [bookedSlots, setBookedSlots] = useState({});

    const navigate = useNavigate();
    const location = useLocation();

    const fetchMenuItems = async () => {
        try {
            const response = await axios.get('http://localhost:8081/menu');
            setMenuItems(response.data);
        } catch (err) {
            setError("ไม่สามารถโหลดเมนูอาหารได้");
            console.error("Error fetching menu items:", err);
        }
    };

    useEffect(() => {
    const storedName = localStorage.getItem('name');
    const storedEmail = localStorage.getItem('email');
    const storedPhone = localStorage.getItem('phone');
    const storedShowResult = localStorage.getItem('showResult') === 'true';
    const storedQueueData = localStorage.getItem('queueData');
    const storedReservationTime = localStorage.getItem('reservationTime');
    const storedQueueNumber = localStorage.getItem('queueNumber');
    const storedReservationDetails = localStorage.getItem('reservationDetails');

    setLoggedInUser(storedName || 'Guest');
    setPhone(storedPhone || '');
    setEmail(storedEmail || '');
    setIsLoggedIn(!!storedName && !!storedEmail);

    // เรียก fetchMenuItems ในทุกกรณี
    fetchMenuItems();

    // ถ้ามี showResult = true
    if (storedShowResult) {
        setShowResult(true);
        if (storedQueueData) {
            const queueData = JSON.parse(storedQueueData);
            setReservationDetails(queueData.reservationDetails);
        }
        if (storedReservationTime) {
            setReservationTime(JSON.parse(storedReservationTime));
        }
        if (storedQueueNumber) {
            setQueueNumber(storedQueueNumber);
        }
        if (storedReservationDetails) {
            setReservationDetails(JSON.parse(storedReservationDetails));
        }
        return;
    }

    // ถ้าไม่มี showResult แต่มี orderDetails จาก navigation
    if (location.state && location.state.orderDetails) {
        const { cartItems, reservationDetails } = location.state.orderDetails;
        setReservationDetails({ ...reservationDetails, cartItems });
        setShowSummary(true);
        setIsTimeSelected(true);
        setSelectedDate(reservationDetails.selectedDate);
        setSelectedTime(reservationDetails.selectedTime);
        setNumPeople(reservationDetails.numPeople);
        return;
    }

    const today = new Date();
    setMinDate(format(today, 'yyyy-MM-dd'));
}, [location.state]);

    const handleClearReservation = () => {
        localStorage.removeItem('showResult');
        localStorage.removeItem('queueData');
        localStorage.removeItem('queueNumber');
        localStorage.removeItem('reservationTime');
        localStorage.removeItem('reservationDetails');
        setShowResult(false);
    };

    useEffect(() => {
        const today = new Date();
        if (isAfterClosingTime()) {
            setMinDate(format(today, 'yyyy-MM-dd'));
        } else {
            setMinDate(format(today, 'yyyy-MM-dd'));
        }
    }, []);

    useEffect(() => {
        // Load booked slots from localStorage on component mount
        const storedBookedSlots = localStorage.getItem('bookedSlots');
        if (storedBookedSlots) {
            setBookedSlots(JSON.parse(storedBookedSlots));
        }
    }, []);

    const handleReserveOnly = () => {
        if (!isLoggedIn) {
            navigate('/logincus');
            return;
        }

        if (!isWithinOperatingHours(selectedTime)) {
            setError("กรุณาเลือกช่วงเวลาที่ร้านเปิด (10:00 - 17:00)");
            return;
        }

        if (parseInt(numPeople) > restaurantConfig.maxPeoplePerReservation) {
            setError("จำนวนคนเกินกว่าที่กำหนด");
            return;
        }

        const updatedReservationDetails = {
            name: loggedInUser,
            numPeople: numPeople,
            phone: phone,
            email: email,
            cartItems: {},
            selectedDate: selectedDate,
            selectedTime: selectedTime,
        };

        setReservationDetails(updatedReservationDetails);
        setShowSummary(true);
    };
    const handleReserveAndOrder = () => {
        if (!isLoggedIn) {
            navigate('/logincus');
            return;
        }

        if (!isWithinOperatingHours(selectedTime)) {
            setError("กรุณาเลือกช่วงเวลาที่ร้านเปิด (10:00 - 17:00)");
            return;
        }

        if (parseInt(numPeople) > restaurantConfig.maxPeoplePerReservation) {
            setError("จำนวนคนเกินกว่าที่กำหนด");
            return;
        }
        const updatedReservationDetails = {
            name: loggedInUser,
            numPeople: numPeople,
            phone: phone,
            email: email,
            cartItems: {},
            selectedDate: selectedDate,
            selectedTime: selectedTime,
        };
        setReservationDetails(updatedReservationDetails);
        localStorage.setItem('reservationDetails', JSON.stringify(updatedReservationDetails));
        navigate(`/menu-order`, { state: { reservationDetails: updatedReservationDetails } });
        setShowSummary(false);
    };

    const handleTimeChange = (event) => {
        const selectedTime = event.target.value;
        if (!isTimeValid(selectedTime)) {
            setError("กรุณาเลือกเวลาตั้งแต่ 6:00 เป็นต้นไป");
            setIsTimeSelected(false);
            return;
        }
        setSelectedTime(selectedTime);
        setIsTimeSelected(true);
        setError(null);
    };

    const handleConfirm = useCallback(() => {
        if (reservationDetails && isTimeSelected) {
            const selectedDateTime = `${selectedDate} ${selectedTime}`;
            const currentBookedCount = bookedSlots[selectedDateTime] || 0;

            if (currentBookedCount >= restaurantConfig.maxTables) {
                setError("เวลานี้มีคนจองเต็มแล้ว กรุณาเลือกเวลาอื่น");
                return;
            }
            const peopleCount = parseInt(reservationDetails.numPeople, 10);
            let queue;

            if (peopleCount >= 4) {
                queue = `B${queueCounterB}`;
                setQueueCounterB(queueCounterB + 1);
            } else {
                queue = `A${queueCounterA}`;
                setQueueCounterA(queueCounterA + 1);
            }
            setQueueNumber(queue);
            const now = new Date();
            const bookingTime = new Date(`${selectedDate}T${selectedTime}`).toLocaleString('en-TH', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            const bookingDate = now.toLocaleString('en-TH', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            const formattedTime = {
                bookingTime,
                bookingDate
            };

            setReservationTime(formattedTime);
            const newOrder = {
                reservationDetails,
                queueNumber: queue,
                reservationTime: formattedTime,
            };
            setQueueList(prevList => [...prevList, newOrder]);

            setBookedSlots((prevBookedSlots) => {
                const newBookedSlots = { ...prevBookedSlots, [selectedDateTime]: currentBookedCount + 1 };
                localStorage.setItem('bookedSlots', JSON.stringify(newBookedSlots));
                return newBookedSlots
            });

            const queueData = {
                queueNumber: queue,
                reservationTime: formattedTime,
                reservationDetails: reservationDetails,
                cartItems: reservationDetails?.cartItems || {}
            };

            const stringifiedQueueData = JSON.stringify(queueData);
            localStorage.setItem('queueData', stringifiedQueueData);
            localStorage.setItem('queueNumber', queue);
            localStorage.setItem('reservationTime', JSON.stringify(formattedTime));
            localStorage.setItem('reservationDetails', JSON.stringify(reservationDetails));
            localStorage.setItem('showResult', 'true');
            setShowResult(true)
            setShowSummary(false)

        }
        setError(null);
    }, [
        reservationDetails,
        queueCounterA,
        setQueueCounterA,
        queueCounterB,
        setQueueCounterB,
        selectedDate,
        selectedTime,
        setQueueList,
        isTimeSelected,
        bookedSlots
    ]);

    const handleBackToHome = () => {
        navigate('/');
    };

    const isTimeValid = (time) => {
        if (!time) return false;
        const [hour] = time.split(':').map(Number); // Use only the hour
        const [openingHour] = restaurantConfig.openingTime.split(':').map(Number); // Split only once

        // Convert hours to a single number (e.g. 10:15 => 10)
        return parseInt(hour) >= parseInt(openingHour); // Compare only the hour part
    };

    const isWithinOperatingHours = (time) => {
        if (!time) return false;
        const [hour] = time.split(':').map(Number); // Use only the hour
        const [openingHour] = restaurantConfig.openingTime.split(':').map(Number);
        const [closingHour] = restaurantConfig.closingTime.split(':').map(Number);


        return parseInt(hour) >= parseInt(openingHour) && parseInt(hour) < parseInt(closingHour); // Compare only the hour part
    };
    const isAfterClosingTime = () => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const closingTime = restaurantConfig.closingTime.split(':');
        const closingHour = parseInt(closingTime[0]);
        const closingMinute = parseInt(closingTime[1]);

        if (currentHour > closingHour) {
            return true;
        } else if (currentHour === closingHour) {
            return currentMinute >= closingMinute;
        }
        return false;
    };


    const isPastDate = (date, time) => {
        if (!date || !time) {
            return false;
        }
        const selectedDateTime = new Date(`${date}T${time}`);
        return isPast(selectedDateTime);
    };


    const isTimeSlotBooked = (time) => {
        if (!selectedDate || !time) {
            return false;
        }
        const selectedDateTime = `${selectedDate} ${time}`;
        return (bookedSlots[selectedDateTime] || 0) >= restaurantConfig.maxTables;
    };

    const isDisabled =
        !numPeople ||
        Number(numPeople) < 1 ||
        !selectedDate ||
        !isTimeSelected ||
        isPastDate(selectedDate, selectedTime);

    if (error) {
        return (
            <div className="container">
                <h2>Error: {error}</h2>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="reservation-container">
                <h1>MAKE A RESERVARION</h1>
                <div className="reservation-box">
                    {showResult ? (
                        <div className="result-box">
                            <h2>Successfully reserved the queue</h2>
                            <p>Your queue has been entered into the system.</p>
                            <p>
                                Your Name: {reservationDetails?.name || 'N/A'} (
                                {reservationDetails?.numPeople}P)
                            </p>
                            <p>Your Order:</p>
                            {reservationDetails?.cartItems && Object.keys(reservationDetails.cartItems).length > 0 ? (
                                <ul>
                                    {Object.entries(reservationDetails.cartItems).map(
                                        ([itemId, cartItem]) => {
                                            const item = menuItems.find(
                                                (item) => item.id === parseInt(itemId, 10)
                                            );
                                            return item ? (
                                                <OrderItem key={itemId} item={item} cartItem={cartItem} />
                                            ) : null;
                                        }
                                    )}
                                </ul>
                            ) : (
                                <p>No items ordered</p>
                            )}
                            <p>DateTime: {reservationTime?.bookingDate}</p>
                            <p>Your Queue: {queueNumber}</p>
                            <p>Time: {reservationTime?.bookingTime}</p>
                            <button className="reserve-btn" onClick={handleBackToHome}>
                                Back
                            </button>
                            <button
                                className="reserve-btn"
                                onClick={handleClearReservation}
                            >
                                Cancel
                            </button>
                        </div>
                    ) : showSummary ? (
                        <div>
                            <h1>Booking Summary</h1>
                            {reservationDetails?.cartItems && Object.keys(reservationDetails.cartItems).length > 0 ? (
                                <div className="sum-reservarion">
                                    <h4>Order</h4>
                                    <ul>
                                        {Object.entries(reservationDetails.cartItems).map(
                                            ([itemId, cartItem]) => {
                                                const item = menuItems.find(
                                                    (item) => item.id === parseInt(itemId, 10)
                                                );
                                                return item ? (
                                                    <OrderItem key={itemId} item={item} cartItem={cartItem} />
                                                ) : null;
                                            }
                                        )}
                                    </ul>
                                </div>
                            ) : (
                                <p>No items ordered</p>
                            )}
                            <div className="contact">
                                <ul>
                                    <li>
                                        <p>Name : {reservationDetails?.name || 'ไม่มีข้อมูล'}</p>
                                        <p>Quantity : {reservationDetails?.numPeople || 'ไม่มีข้อมูล'}</p>
                                        <p>Tel : {reservationDetails?.phone || 'ไม่มีข้อมูล'}</p>
                                        <p>Email : {reservationDetails?.email || 'ไม่มีข้อมูล'}</p>
                                    </li>
                                </ul>
                                <p>Date: {reservationDetails?.selectedDate}</p>
                                <p>Time: {reservationDetails?.selectedTime}</p>
                                <button
                                    className="reserve-btn"
                                    onClick={() => setShowSummary(false)}
                                >
                                    Go back and edit
                                </button>
                                <button className="reserve-btn" onClick={handleConfirm}>
                                    Confirm
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="first">
                            <h2>Reserve</h2>
                            <p>
                                Welcome, {loggedInUser === 'Guest' ? 'Guest' : loggedInUser} !
                            </p>
                            <p>Enter the number of people</p>
                            <input
                                type="number"
                                min="1"
                                value={numPeople}
                                onChange={(e) => setNumPeople(e.target.value)}
                                className="people-input"
                                placeholder="Number of people"
                            />
                            <p>Select Date:</p>
                            <input
                                type="date"
                                value={selectedDate}
                                min={minDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="date-input"
                                disabled={isAfterClosingTime()}
                            />
                            <p>Select Time:</p>
                            <select
                                className="time-input"
                                value={selectedTime}
                                onChange={handleTimeChange}
                                disabled={isAfterClosingTime()}
                            >
                                <option value="" disabled>Select a time</option>
                                <option value="10:00" disabled={isTimeSlotBooked("10:00")}>10:00 AM</option>
                                <option value="10:15" disabled={isTimeSlotBooked("10:15")}>10:15 AM</option>
                                <option value="10:30" disabled={isTimeSlotBooked("10:30")}>10:30 AM</option>
                                <option value="10:45" disabled={isTimeSlotBooked("10:45")}>10:45 AM</option>
                                <option value="11:00" disabled={isTimeSlotBooked("11:00")}>11:00 AM</option>
                                <option value="11:15" disabled={isTimeSlotBooked("11:15")}>11:15 AM</option>
                                <option value="11:30" disabled={isTimeSlotBooked("11:30")}>11:30 AM</option>
                                <option value="11:45" disabled={isTimeSlotBooked("11:45")}>11:45 AM</option>
                                <option value="12:00" disabled={isTimeSlotBooked("12:00")}>12:00 PM</option>
                                <option value="12:15" disabled={isTimeSlotBooked("12:15")}>12:15 PM</option>
                                <option value="12:30" disabled={isTimeSlotBooked("12:30")}>12:30 PM</option>
                                <option value="12:45" disabled={isTimeSlotBooked("12:45")}>12:45 PM</option>
                                <option value="01:00" disabled={isTimeSlotBooked("01:00")}>01:00 PM</option>
                                <option value="01:15" disabled={isTimeSlotBooked("01:15")}>01:15 PM</option>
                                <option value="01:30" disabled={isTimeSlotBooked("01:30")}>01:30 PM</option>
                                <option value="01:45" disabled={isTimeSlotBooked("01:45")}>01:45 PM</option>
                                <option value="02:00" disabled={isTimeSlotBooked("02:00")}>02:00 PM</option>
                                <option value="02:15" disabled={isTimeSlotBooked("02:15")}>02:15 PM</option>
                                <option value="02:30" disabled={isTimeSlotBooked("02:30")}>02:30 PM</option>
                                <option value="02:45" disabled={isTimeSlotBooked("02:45")}>02:45 PM</option>
                                <option value="03:00" disabled={isTimeSlotBooked("03:00")}>03:00 PM</option>
                                <option value="03:15" disabled={isTimeSlotBooked("03:15")}>03:15 PM</option>
                                <option value="03:30" disabled={isTimeSlotBooked("03:30")}>03:30 PM</option>
                                <option value="03:45" disabled={isTimeSlotBooked("03:45")}>03:45 PM</option>
                                <option value="04:00" disabled={isTimeSlotBooked("04:00")}>04:00 PM</option>
                                <option value="04:15" disabled={isTimeSlotBooked("04:15")}>04:15 PM</option>
                                <option value="04:30" disabled={isTimeSlotBooked("04:30")}>04:30 PM</option>
                                <option value="04:45" disabled={isTimeSlotBooked("04:45")}>04:45 PM</option>
                                <option value="05:00" disabled={isTimeSlotBooked("05:00")}>05:00 PM</option>
                            </select>
                            <button
                                className="reserve-btn"
                                onClick={handleReserveOnly}
                                disabled={isDisabled}
                            >
                                Reserve only <span className="arrow">→</span>
                            </button>
                            <button
                                className="reserve-btn"
                                onClick={handleReserveAndOrder}
                                disabled={isDisabled}
                            >
                                Reserve and Order <span className="arrow">→</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Reservation;