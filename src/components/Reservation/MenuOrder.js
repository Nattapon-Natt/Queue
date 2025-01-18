import React, { useState, useEffect } from 'react';
import '../CSS/MenuOrder.css';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const MenuOrder = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [cartItems, setCartItems] = useState({});
    const [selectedItem, setSelectedItem] = useState(null);
    const [spicinessLevel, setSpicinessLevel] = useState("ปกติ");
    const [quantity, setQuantity] = useState(1);
    const [additionalDetails, setAdditionalDetails] = useState("");
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [error, setError] = useState(null);
    const [reservationDetails, setReservationDetails] = useState(null); //Keep reservation details
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await axios.get('http://localhost:8081/menu');
                if (Array.isArray(response.data)) {
                    const menuItemsWithImages = response.data.map(item => ({
                        ...item,
                        image: item.image ? `http://localhost:8081/uploads/${item.image}` : '/assets/pic/logo.jpg' //Default image
                    }));
                    setMenuItems(menuItemsWithImages);
                } else {
                    throw new Error("Invalid data format from API"); //More specific error
                }
            } catch (err) {
                setError(err.message);
            }
        };

        fetchMenu();

        // Get reservation details from location state.  No need to store user data here.
        if (location.state && location.state.reservationDetails) {
            setReservationDetails(location.state.reservationDetails);
        }
    }, [location.state]);


    const MenuItem = ({ item, onAddToCart }) => (
        <div className="menu-item">
            <img src={item.image} alt={item.foodname} />
            <h3>{item.foodname}</h3>
            <p>{item.detail}</p>
            <p>ราคา: {item.price} บาท</p>
            <button onClick={onAddToCart}>เพิ่มลงตะกร้า</button>
        </div>
    );

    const openPopup = (item) => {
        setSelectedItem(item);
        setSpicinessLevel("ไม่เผ็ด");
        setQuantity(1);
        setAdditionalDetails("");
        setIsPopupVisible(true);
    };

    const closePopup = () => {
        setIsPopupVisible(false);
        setSelectedItem(null);
    };

    const handleAddToCart = () => {
        if (selectedItem) {
            setCartItems((prevCartItems) => ({
                ...prevCartItems,
                [selectedItem.id]: {
                    ...prevCartItems[selectedItem.id], // Preserve existing data
                    quantity: (prevCartItems[selectedItem.id]?.quantity || 0) + quantity,
                    spicinessLevel,
                    additionalDetails
                }
            }));
        }
        closePopup();
    };

    const removeFromCart = (itemId) => {
        setCartItems(prevCartItems => {
            const { [itemId]: removedItem, ...rest } = prevCartItems;
            return rest;
        });
    };


    const calculateTotalPrice = () => {
        return Object.entries(cartItems)
            .reduce((total, [itemId, { quantity }]) => {
                const item = menuItems.find(item => item.id === parseInt(itemId, 10));
                return total + (item ? item.price * quantity : 0);
            }, 0);
    };

    // const handleOrder = () => {
    //     const orderDetails = { cartItems, reservationDetails };
    //     navigate('/reservation', { state: orderDetails }); 
    // };

    const handleOrder = () => {
        const orderDetails = {
            cartItems: cartItems,  //Pass cartItems directly
            reservationDetails: location.state.reservationDetails
        };
        navigate('/reservation', { state: { orderDetails } });
    };

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    return (
        <div className="menu-container">
            <h1 className="menu-title">เลือกอาหารที่ต้องการสั่ง</h1>
            <div className="menu-grid">
                {menuItems.map((menuItem) => (
                    <MenuItem key={menuItem.id} item={menuItem} onAddToCart={() => openPopup(menuItem)} />
                ))}
            </div>

            {/* Popup for adding items */}
            {isPopupVisible && (
                <div className="sum-popup">
                    <h3>{selectedItem?.foodname}</h3> {/*Optional Chaining*/}
                    <label>
                        ระดับความเผ็ด:
                        <select value={spicinessLevel} onChange={e => setSpicinessLevel(e.target.value)}>
                            <option value="ไม่เผ็ด">ไม่เผ็ด</option>
                            <option value="เผ็ดน้อย">เผ็ดน้อย</option>
                            <option value="เผ็ดกลาง">เผ็ดกลาง</option>
                            <option value="เผ็ดมาก">เผ็ดมาก</option>
                        </select>
                    </label>
                    <label>
                        จำนวน:
                        <input type="number" value={quantity} min="1" onChange={e => setQuantity(parseInt(e.target.value, 10))} />
                    </label>
                    <label>
                        รายละเอียดเพิ่มเติม:
                        <input type="text" value={additionalDetails} onChange={e => setAdditionalDetails(e.target.value)} placeholder='ไม่ใส่ผัก' />
                    </label>
                    <button onClick={handleAddToCart}>เพิ่มลงตะกร้า</button>
                    <button onClick={closePopup}>ยกเลิก</button>
                </div>
            )}

            {/* Cart Summary */}
            <h2>ตะกร้าสินค้า</h2>
            {Object.keys(cartItems).length === 0 ? (
                <p>ตะกร้าสินค้าว่างเปล่า</p>
            ) : (
                <div className="sum">
                    <ul>
                        {Object.entries(cartItems).map(([itemId, cartItem]) => {
                            const item = menuItems.find(item => item.id === parseInt(itemId, 10));
                            return item ? (
                                <li key={itemId}>
                                    <p>{item.foodname} x {cartItem.quantity} - {item.price * cartItem.quantity} บาท</p>
                                    <p>ระดับความเผ็ด: {cartItem.spicinessLevel}</p>
                                    <p>รายละเอียดเพิ่มเติม: {cartItem.additionalDetails}</p>
                                    <button className="delete-menu" onClick={() => removeFromCart(itemId)}>ลบ</button>
                                </li>
                            ) : null;
                        })}
                    </ul>
                    <p>ราคารวม: {calculateTotalPrice()} บาท</p>
                    <button className="order-menu" onClick={handleOrder}>สั่งอาหาร</button>
                </div>
            )}
        </div>
    );
};

export default MenuOrder;