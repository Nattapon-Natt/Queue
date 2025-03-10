import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { format, isPast } from 'date-fns';
import '../CSS/Reservation.css';

const OrderItem = ({ item, cartItem, menuItems }) => {
    const menuItem = menuItems.find(menuItem => menuItem.id === item.id);
    const isDrink = menuItem && menuItem.category === 'เครื่องดื่ม';
    const isDessert = menuItem && menuItem.category === 'ขนมหวาน';

    return (
        <div className="order-item">
            <span className="foodname">{item.foodname} x {cartItem.quantity}</span>
            {!isDessert && (
                <span className="spicinessLevel">
                    {isDrink ? `ความหวาน: ${cartItem.sweetnessLevel || 'ไม่ระบุ'}` : `ความเผ็ด: ${cartItem.spicinessLevel || 'ไม่ระบุ'}`}
                </span>
            )}
            <span className="additionalDetails">รายละเอียด: {cartItem.additionalDetails}</span>
        </div>
    )
}

const restaurantConfig = {
    openingTime: '00:00',
    closingTime: '22:00',
    maxPeoplePerReservation: 10,
    cancellationDeadlineHours: 2,
    maxTables: 7,
};

const timeSlots = [
    "10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30", "11:45",
    "12:00", "12:15", "12:30", "12:45", "13:00", "13:15", "13:30", "13:45",
    "14:00", "14:15", "14:30", "14:45", "15:00", "15:15", "15:30", "15:45",
    "16:00", "16:15", "16:30", "16:45", "17:00"
];

function ReservationForm({
    numPeople,
    setNumPeople,
    selectedDate,
    setSelectedDate,
    selectedTime,
    handleTimeChange,
    handleReserveOnly,
    handleReserveAndOrder,
    isAfterClosingTime,
    isTimeSlotBooked,
    isDisabled,
    minDate,
    loggedInUser,
}) {
    return (
        <div className="first">
            <h2>Reserve</h2>
            <p>Welcome, {loggedInUser === 'Guest' ? 'Guest' : loggedInUser} !</p>
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
                {timeSlots.map(time => (
                    <option key={time} value={time} disabled={isTimeSlotBooked(time)}>
                        {format(new Date(`2000-01-01 ${time}`), 'hh:mm a')}
                    </option>
                ))}
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
    );
}

function ReservationSummary({ reservationDetails, menuItems, setShowSummary, handleConfirm, setReservationDetails, phone, setPhone }) {
    const [localPhone, setLocalPhone] = useState(phone || '');

    const handleGoBack = () => {
        setReservationDetails(prevDetails => ({
            ...prevDetails,
            phone: localPhone
        }))
        setPhone(localPhone);
        setShowSummary(false);

    };
    return (
        <div>
            <h1>Booking Summary</h1>
            {reservationDetails?.cartItems && Object.keys(reservationDetails.cartItems).length > 0 ? (
                <div className="sum-reservation">
                    <h4>Order</h4>
                    <div className="order-list">
                        {Object.entries(reservationDetails.cartItems).map(
                            ([itemId, cartItem]) => {
                                const item = menuItems.find(
                                    (item) => item.id === parseInt(itemId, 10)
                                );
                                return item ? (
                                    <OrderItem key={itemId} item={item} cartItem={cartItem} menuItems={menuItems} />
                                ) : null;
                            }
                        ).reduce((acc, curr) => {
                            if (curr) {
                                acc.push(curr);
                            }
                            return acc;
                        }, [])}
                    </div>
                </div>
            ) : (
                <p>No items ordered</p>
            )}
            <div className="contact">
                <ul>
                    <li>
                        <p>Name : {reservationDetails?.name || 'ไม่มีข้อมูล'}</p>
                        <p>Quantity : {reservationDetails?.numPeople || 'ไม่มีข้อมูล'}</p>
                        <p>Tel : {localPhone}</p>
                        <p>Email : {reservationDetails?.email || 'ไม่มีข้อมูล'}</p>
                    </li>
                </ul>
                <p>Date: {reservationDetails?.selectedDate}</p>
                <p>Time: {reservationDetails?.selectedTime}</p>
                <button
                    className="reserve-btn"
                    onClick={handleGoBack}
                >
                    Go back and edit
                </button>
                <button className="reserve-btn" onClick={handleConfirm}>
                    Confirm
                </button>
            </div>
        </div>
    );
}

function ResultBox({ reservationDetails, handleBackToHome, handleClearReservation, menuItems }) {
    const foodname = JSON.parse(localStorage.getItem('foodname') || '[]');
    const { bookingDate = 'N/A', bookingTime = 'N/A' } = JSON.parse(localStorage.getItem('reservationTime') || '{}');
    const { name = 'N/A', numPeople = 'N/A' } = JSON.parse(localStorage.getItem('reservationDetails') || '{}');
    const queueNumber = localStorage.getItem('queueNumber') || 'N/A';

    return (
        <div className="result-box">
            <h2>Successfully reserved the queue</h2>
            <p>Your queue has been entered into the system.</p>
            <p>Your Name: {name} ({numPeople}P)</p>
            <p>Your Order:</p>
            <div className="order-container">
                {foodname.length > 0 ? (
                    foodname.map((item, index) => {
                        const [foodName, sweetnessOrSpiciness = '', additionalDetails = ''] = item.split(' - ');
                        const menuItem = menuItems.find(m => m.foodname === foodName.split(' x ')[0].trim());
                        const isDrink = menuItem && menuItem.category === 'เครื่องดื่ม';
                        const isDessert = menuItem && menuItem.category === 'ขนมหวาน';

                        return (
                            <div className="order-item" key={index}>
                                <span className="foodname">{foodName}</span>
                                {!isDessert && (
                                    <span className="spicinessLevel">
                                        {isDrink ? `ความหวาน: ${sweetnessOrSpiciness}` : `ความเผ็ด: ${sweetnessOrSpiciness}`}
                                    </span>
                                )}
                                <span className="additionalDetails">{additionalDetails}</span>
                            </div>
                        );
                    })
                ) : (
                    <p>No items ordered</p>
                )}
            </div>
            <p>Booked on: {bookingDate}</p>
            <p>Your Queue: {queueNumber}</p>
            <p>Time of arrival: {bookingTime}</p>
            <button className="reserve-btn" onClick={handleBackToHome}>Back</button>
            <button className="reserve-btn" onClick={handleClearReservation}>Cancel</button>
        </div>
    );
}

function Reservation() {
    const [numPeople, setNumPeople] = useState('');
    const [reservationDetails, setReservationDetails] = useState(null);
    const [showSummary, setShowSummary] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState('Guest');
    const [phone, setPhone] = useState('');
    const [menuItems, setMenuItems] = useState([]);
    const [error, setError] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [queueCounterA, setQueueCounterA] = useState(1);
    const [queueCounterB, setQueueCounterB] = useState(1);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [isTimeSelected, setIsTimeSelected] = useState(false);
    const [minDate, setMinDate] = useState('');
    const [bookedSlots, setBookedSlots] = useState({});
    const navigate = useNavigate();
    const location = useLocation();

    const fetchMenuItems = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:8081/menu');
            setMenuItems(response.data);
        } catch (err) {
            setError("ไม่สามารถโหลดเมนูอาหารได้");
            console.error("Error fetching menu items:", err);
        }
    }, []);

    useEffect(() => {
        setLoggedInUser(localStorage.getItem('name') || 'Guest');
        setPhone(localStorage.getItem('phone') || '');
        fetchMenuItems();

        const storedShowResult = localStorage.getItem('showResult') === 'true';
        if (storedShowResult) {
            setShowResult(true);
            return;
        }

        if (location.state?.orderDetails) {
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
    }, [location.state, fetchMenuItems]);

    useEffect(() => {
        localStorage.setItem('showResult', showResult.toString());
    }, [showResult]);

    useEffect(() => {
        setBookedSlots(JSON.parse(localStorage.getItem('bookedSlots') || '{}'));
    }, []);

    const handleClearReservation = () => {
        localStorage.removeItem('showResult');
        localStorage.removeItem('queueData');
        localStorage.removeItem('queueNumber');
        localStorage.removeItem('reservationTime');
        localStorage.removeItem('reservationDetails');
        localStorage.removeItem('foodname');
        setShowResult(false);
    };

    useEffect(() => {
        const today = new Date();
        setMinDate(format(today, 'yyyy-MM-dd'));
    }, []);

    const handleReservation = (order = false) => {
        if (!localStorage.getItem('name')) {
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
            email: localStorage.getItem('email'),
            cartItems: {},
            selectedDate: selectedDate,
            selectedTime: selectedTime,
        };

        setReservationDetails(updatedReservationDetails);

        if (order) {
            localStorage.setItem('reservationDetails', JSON.stringify(updatedReservationDetails));
            navigate(`/menu-order`, { state: { reservationDetails: updatedReservationDetails } });
            setShowSummary(false);
        } else {
            setShowSummary(true);
        }
    };

    const handleTimeChange = (event) => {
        const time = event.target.value;
        setSelectedTime(time);
        setIsTimeSelected(isTimeValid(time));
        setError(isTimeValid(time) ? null : "กรุณาเลือกเวลาตั้งแต่ 6:00 เป็นต้นไป");
    };

    const handleConfirm = useCallback(async () => {
        if (!reservationDetails || !isTimeSelected) return;

        const selectedDateTime = `${selectedDate} ${selectedTime}`;
        const currentBookedCount = bookedSlots[selectedDateTime] || 0;

        if (currentBookedCount >= restaurantConfig.maxTables) {
            setError("เวลานี้มีคนจองเต็มแล้ว กรุณาเลือกเวลาอื่น");
            return;
        }

        const queue = parseInt(reservationDetails.numPeople, 10) >= 4 ? `B${queueCounterB}` : `A${queueCounterA}`;
        const formattedTime = {
            bookingTime: format(new Date(`${selectedDate}T${selectedTime}`), 'HH:mm:ss'),
            bookingDate: format(new Date(), 'yyyy-MM-dd')
        };

        const orderDataForDB = {
            user_name: reservationDetails?.name,
            foodname: Object.entries(reservationDetails?.cartItems || {})
                .map(([itemId, cartItem]) => {
                    const item = menuItems.find((item) => item.id === parseInt(itemId, 10));
                    let orderString = `${item.foodname} x ${cartItem.quantity}`;
                    if (item.category === 'เครื่องดื่ม') {
                        orderString += ` -  ${cartItem.sweetnessLevel || 'ไม่ระบุ'}`;
                    } else if (item.category !== 'ขนมหวาน') {
                        orderString += ` -  ${cartItem.spicinessLevel || 'ไม่ระบุ'}`;
                    }
                    orderString += ` -  ${cartItem.additionalDetails || 'ไม่มี'}`;
                    return orderString;
                }).join('\n'),
            BookTime: formattedTime.bookingDate,
            ArrivalTime: format(new Date(selectedDateTime), 'yyyy-MM-dd HH:mm'),
            user_phone: reservationDetails.phone,
            selectedTime: selectedTime,
        };

        try {
            await axios.post('http://localhost:8081/ordering', { orders: [orderDataForDB] });

            localStorage.setItem('queueNumber', queue);
            localStorage.setItem('reservationTime', JSON.stringify(formattedTime));
            localStorage.setItem('reservationDetails', JSON.stringify({ ...reservationDetails, selectedTime }));
            localStorage.setItem('foodname', JSON.stringify(orderDataForDB.foodname.split('\n')));

            setQueueCounterA(prev => parseInt(reservationDetails.numPeople, 10) < 4 ? prev + 1 : prev);
            setQueueCounterB(prev => parseInt(reservationDetails.numPeople, 10) >= 4 ? prev + 1 : prev);
            setBookedSlots(prevBookedSlots => ({ ...prevBookedSlots, [selectedDateTime]: currentBookedCount + 1 }));
            localStorage.setItem('bookedSlots', JSON.stringify({ ...bookedSlots, [selectedDateTime]: currentBookedCount + 1 }));

            setShowSummary(false);
            setShowResult(true);
            localStorage.setItem('showResult', 'true');

        } catch (err) {
            console.error('Error saving data:', err);
            setError('Failed to save data');
        }
    }, [
        reservationDetails,
        queueCounterA,
        queueCounterB,
        selectedDate,
        selectedTime,
        isTimeSelected,
        bookedSlots,
        menuItems,
        phone,
        fetchMenuItems
    ]);

    const handleBackToHome = () => {
        navigate('/');
    };

    const isTimeValid = (time) => time && parseInt(time.split(':')[0]) >= parseInt(restaurantConfig.openingTime.split(':')[0]);

    const isWithinOperatingHours = (time) => {
        if (!time) return false;
        const hour = parseInt(time.split(':')[0]);
        const openingHour = parseInt(restaurantConfig.openingTime.split(':')[0]);
        const closingHour = parseInt(restaurantConfig.closingTime.split(':')[0]);
        return hour >= openingHour && hour < closingHour;
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

    const isPastDate = (date, time) => date && time && isPast(new Date(`${date}T${time}`));
    const isTimeSlotBooked = (time) => bookedSlots[`${selectedDate} ${time}`] >= restaurantConfig.maxTables;

    const isDisabled =
        !numPeople ||
        Number(numPeople) < 1 ||
        !selectedDate ||
        !isTimeSelected ||
        isPastDate(selectedDate, selectedTime);

    return (
        <div className="container">
            <div className="reservation-container">
                <h1>MAKE A RESERVARION</h1>
                <div className="reservation-box">
                    {error && <div className="error">Error: {error}</div>}
                    {showResult ? (
                        <ResultBox
                            reservationDetails={reservationDetails}
                            menuItems={menuItems}
                            handleBackToHome={handleBackToHome}
                            handleClearReservation={handleClearReservation}
                        />
                    ) : showSummary ? (
                        <ReservationSummary
                            reservationDetails={reservationDetails}
                            menuItems={menuItems}
                            setShowSummary={setShowSummary}
                            handleConfirm={handleConfirm}
                            setReservationDetails={setReservationDetails}
                            phone={phone}
                            setPhone={setPhone}
                        />
                    ) : (
                        <ReservationForm
                            numPeople={numPeople}
                            setNumPeople={setNumPeople}
                            selectedDate={selectedDate}
                            setSelectedDate={setSelectedDate}
                            selectedTime={selectedTime}
                            handleTimeChange={handleTimeChange}
                            handleReserveOnly={() => handleReservation(false)}
                            handleReserveAndOrder={() => handleReservation(true)}
                            isAfterClosingTime={isAfterClosingTime}
                            isTimeSlotBooked={isTimeSlotBooked}
                            isDisabled={isDisabled}
                            minDate={minDate}
                            loggedInUser={loggedInUser}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Reservation;