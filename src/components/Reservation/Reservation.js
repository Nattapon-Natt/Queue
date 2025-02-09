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
        // ` ${item.foodname} x ${cartItem.quantity}   ความเผ็ด: ${cartItem.spicinessLevel}   รายละเอียด: ${cartItem.additionalDetails}  `
        <div className="order-item">
            <span className="foodname">{item.foodname} x {cartItem.quantity}</span>
            {!isDessert && (
                <span className="spicinessLevel">
                    {isDrink ? `ความหวาน: ${cartItem.sweetnessLevel || 'ไม่ระบุ'}` : `ความเผ็ด: ${cartItem.spicinessLevel || 'ไม่ระบุ'}`}
                </span>
            )}
            {/* <span className="spicinessLevel">ความเผ็ด: {cartItem.spicinessLevel}</span> */}
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

// Component สำหรับ Form จอง
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
    );
}

// Component สำหรับแสดงสรุปการจอง
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

// Component สำหรับแสดงผลลัพธ์การจอง
function ResultBox({ reservationDetails, handleBackToHome, handleClearReservation, menuItems }) {
    const getData = (path, defaultValue) => {
        try {
            const value = path.reduce((obj, key) => (obj && obj[key] !== 'undefined') ? obj[key] : defaultValue, reservationDetails || {});
            return value;
        } catch (e) {
            return defaultValue;
        }
    };

    // **ดึงข้อมูลจาก LocalStorage**
    const storedReservationDetails = localStorage.getItem('reservationDetails');
    const parsedReservationDetails = storedReservationDetails ? JSON.parse(storedReservationDetails) : {};
    const storedReservationTime = localStorage.getItem('reservationTime');
    const parsedReservationTime = storedReservationTime ? JSON.parse(storedReservationTime) : {};

    const name = parsedReservationDetails.name || 'N/A';
    const numPeople = parsedReservationDetails.numPeople || 'N/A';
    const foodnameString = localStorage.getItem('foodname');
    const foodname = foodnameString ? JSON.parse(foodnameString) : [];
    const bookingDate = parsedReservationTime.bookingDate || 'N/A'; // ดึงจาก object
    const queueNumber = localStorage.getItem('queueNumber') || 'N/A';
    const bookingTime = parsedReservationTime.bookingTime || 'N/A'; // ดึงจาก object

    return (
        <div className="result-box">
            <h2>Successfully reserved the queue</h2>
            <p>Your queue has been entered into the system.</p>

            <p>Your Name: {name} ({numPeople}P)</p>

            <p>Your Order:</p>
            <div className="order-container">
                {foodname && Array.isArray(foodname) && foodname.length > 0 ? (
                    foodname.map((item, index) => {
                        const parts = item.split(' - ');
                        const foodName = parts[0] || '';

                        console.log("ITEM", item);
                        console.log(`Parts for ${foodName}:`, parts);

                        const sweetnessOrSpiciness = parts[1] || ''; // Rename the variable for clarity
                        const additionalDetails = parts[2] || '';

                        // Find the menu item by food name
                        const menuItem = menuItems.find(m => m.foodname === foodName.split(' x ')[0].trim());
                        const isDrink = menuItem && menuItem.category === 'เครื่องดื่ม';
                        const isDessert = menuItem && menuItem.category === 'ขนมหวาน';

                        return (
                            <div className="order-item" key={index}>
                                <span className="foodname">{foodName}</span>
                                {isDessert ? null : ( // If isDessert remove code from here
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
    );
}

function Reservation() {
    const [queueData, setQueueData] = useState([]);
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

    const getQueueNumber = (peopleCount) => {
        if (peopleCount >= 4) {
            return `B${queueCounterB}`;
        } else {
            return `A${queueCounterA}`;
        }
    };
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

        fetchMenuItems();

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

    useEffect(() => {
        localStorage.setItem('showResult', showResult.toString()); // Convert boolean to string
    }, [showResult]);

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

    const handleConfirm = useCallback(async () => {
        if (reservationDetails && isTimeSelected) {
            const selectedDateTime = `${selectedDate} ${selectedTime}`;
            const currentBookedCount = bookedSlots[selectedDateTime] || 0;
    
            if (currentBookedCount >= restaurantConfig.maxTables) {
                setError("เวลานี้มีคนจองเต็มแล้ว กรุณาเลือกเวลาอื่น");
                return;
            }
    
            const peopleCount = parseInt(reservationDetails.numPeople, 10);
            const queue = getQueueNumber(peopleCount);
    
            if (peopleCount >= 4) {
                setQueueCounterB(queueCounterB + 1);
            } else {
                setQueueCounterA(queueCounterA + 1);
            }
    
            setQueueNumber(queue);
    
            const now = new Date();
            const bookingTime = format(new Date(`${selectedDate}T${selectedTime}`), 'HH:mm:ss');
            const bookingDate = format(now, 'yyyy-MM-dd');
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
                return newBookedSlots;
            });
    
            const queueData = {
                queueNumber: queue,
                reservationTime: formattedTime,
                reservationDetails: { ...reservationDetails, selectedTime: selectedTime },
                cartItems: reservationDetails?.cartItems || {}
            };
    
            const stringifiedQueueData = JSON.stringify(queueData);
            localStorage.setItem('queueData', stringifiedQueueData);
            localStorage.setItem('queueNumber', queue);
            localStorage.setItem('reservationTime', JSON.stringify(formattedTime));
            localStorage.setItem('reservationDetails', JSON.stringify(queueData.reservationDetails));
    
            // Format foodname for ordering table
            const foodname = Object.entries(reservationDetails?.cartItems || {}).map(([itemId, cartItem]) => {
                const item = menuItems.find((item) => item.id === parseInt(itemId, 10));
                let orderString = `${item.foodname} x ${cartItem.quantity}`;
                if (item.category === 'เครื่องดื่ม') {
                    orderString += ` -  ${cartItem.sweetnessLevel || 'ไม่ระบุ'}`;
                } else if (item.category !== 'ขนมหวาน') {
                    orderString += ` -  ${cartItem.spicinessLevel || 'ไม่ระบุ'}`;
                }
                orderString += ` -  ${cartItem.additionalDetails || 'ไม่มี'}`;
                return orderString;
            });
    
            localStorage.setItem('foodname', JSON.stringify(foodname));
    
            setShowSummary(false);
    
            // Prepare data for ordering table
            const orderDataForDB = {
                user_name: reservationDetails?.name,
                foodname: foodname.join('\n'), // Join array into a single string
                BookTime: formattedTime.bookingDate,
                ArrivalTime: format(new Date(selectedDateTime), 'yyyy-MM-dd HH:mm'),
                user_phone: reservationDetails.phone,
                selectedTime: selectedTime,
            };
    
            try {
                console.log('Sending data to ordering table:', orderDataForDB);
                await axios.post('http://localhost:8081/ordering', { orders: [orderDataForDB] });
                console.log('Data sent to ordering table successfully!');
                setShowResult(true);
                setReservationDetails(queueData);
                localStorage.setItem('showResult', 'true');
            } catch (error) {
                console.error('Error sending data to ordering table:', error);
                setError('Failed to save the order data to database');
            }
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
        bookedSlots,
        menuItems,
        phone,
    ]);

    const handleBackToHome = () => {
        navigate('/');
    };
    const isTimeValid = (time) => {
        if (!time) return false;
        const [hour] = time.split(':').map(Number);
        const [openingHour] = restaurantConfig.openingTime.split(':').map(Number);
        return parseInt(hour) >= parseInt(openingHour);
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
                            handleReserveOnly={handleReserveOnly}
                            handleReserveAndOrder={handleReserveAndOrder}
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