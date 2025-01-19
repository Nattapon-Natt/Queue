import React, { useState, useEffect, useMemo } from 'react';
import '../CSS/MenuOrder.css';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const MenuOrder = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [cartItems, setCartItems] = useState({});
    const [selectedCategory, setSelectedCategory] = useState("Main course"); // Initial category
    const [selectedItem, setSelectedItem] = useState(null);
    const [spicinessLevel, setSpicinessLevel] = useState("ไม่เผ็ด");
    const [sweetnessLevel, setSweetnessLevel] = useState("ไม่หวาน");
    const [quantity, setQuantity] = useState(1);
    const [additionalDetails, setAdditionalDetails] = useState("");
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [error, setError] = useState(null);
    const [reservationDetails, setReservationDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const categoryMapping = {
        'อาหารหลัก': 'Main course',
        'ขนมหวาน': 'Dessert',
        'เครื่องดื่ม': 'Drinks'
    };

    useEffect(() => {
        const fetchMenu = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:8081/menu');
                console.log("Menu Data:", response.data);
                if (Array.isArray(response.data)) {
                    const menuItemsWithImages = response.data.map(item => ({
                        ...item,
                        id: parseInt(item.id, 10), // Make sure id is integer
                        image: item.image ? `http://localhost:8081/uploads/${item.image}` : '/assets/pic/logo.jpg',
                        category: item.category ? categoryMapping[item.category] || item.category : 'Main course',
                    }));
                    setMenuItems(menuItemsWithImages);
                } else {
                    throw new Error("Invalid data format from API");
                }
            } catch (err) {
                setError("ไม่สามารถโหลดเมนูได้ กรุณาลองใหม่อีกครั้ง");
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();

        if (location.state && location.state.reservationDetails) {
            setReservationDetails(location.state.reservationDetails);
        }
    }, [location.state]);

    const filteredMenuItems = useMemo(() => {
        return menuItems.filter(item => String(item.category) === String(selectedCategory));
    }, [menuItems, selectedCategory])


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
        setSweetnessLevel("ไม่หวาน");
        setQuantity(1);
        setAdditionalDetails("");
        setIsPopupVisible(true);
    };

    const closePopup = () => {
        setIsPopupVisible(false);
        setSelectedItem(null);
    };

    const generateUniqueId = (item, spicinessLevel, sweetnessLevel, additionalDetails) => {
        return `${item.id}-${spicinessLevel}-${sweetnessLevel}-${additionalDetails}`;
    };

    const handleAddToCart = () => {
        if (selectedItem) {
            const uniqueId = generateUniqueId(selectedItem, spicinessLevel, sweetnessLevel, additionalDetails);
            setCartItems((prevCartItems) => {
                const existingItem = prevCartItems[uniqueId];
                const updatedItem = {
                    quantity: (existingItem?.quantity || 0) + quantity,
                    spicinessLevel: selectedItem.category !== "Drinks" && selectedItem.category !== "Dessert" ? spicinessLevel : "",
                    sweetnessLevel: selectedItem.category === "Drinks" ? sweetnessLevel : "",
                    additionalDetails,
                };

                return { ...prevCartItems, [uniqueId]: updatedItem };
            });
        }
        closePopup();
    };

    const removeFromCart = (uniqueId) => {
        setCartItems((prevCartItems) => {
            const { [uniqueId]: removedItem, ...rest } = prevCartItems;
            return rest;
        });
    };

    const totalPrice = useMemo(() => {
        return Object.entries(cartItems)
            .reduce((total, [itemId, { quantity }]) => {
                const item = menuItems.find(item => item.id === parseInt(itemId, 10));
                return total + (item ? item.price * quantity : 0);
            }, 0);
    }, [cartItems, menuItems]);

    const handleOrder = () => {
        if (!reservationDetails) {
            console.error("Reservation details are missing!");
            setError("ข้อมูลการจองไม่ถูกต้อง กรุณาทำการจองใหม่");
            return;
        }

        const orderDetails = {
            cartItems: cartItems,
            reservationDetails: reservationDetails
        };
        navigate('/reservation', { state: { orderDetails } });
    };


    if (error) {
        return <p className="error-message">{error}</p>;
    }

    return (
        <div className="menu-container">
            <h1 className="menu-title">เลือกอาหารที่ต้องการสั่ง</h1>

            <nav className="menu-navbar">
                {Object.keys(categoryMapping).map(key => (
                    <button
                        key={key}
                        className={selectedCategory === categoryMapping[key] ? "active" : ""}
                        onClick={() => setSelectedCategory(categoryMapping[key])}
                    >
                        {key}
                    </button>
                ))}
            </nav>


            {loading ? (
                <p>กำลังโหลดรายการอาหาร...</p>
            ) : (
                <div className="menu-grid">
                    {filteredMenuItems.length === 0 ? (
                        <p>ไม่มีรายการอาหารในหมวดหมู่นี้</p>
                    ) : (
                        filteredMenuItems.map((menuItem) => (
                            <MenuItem key={menuItem.id} item={menuItem} onAddToCart={() => openPopup(menuItem)} />
                        ))
                    )}
                </div>
            )}

            {/* Popup for adding items */}
            {isPopupVisible && (
                <div className="sum-popup">
                    <h3>{selectedItem?.foodname}</h3>
                    {selectedCategory !== "Dessert" && selectedCategory !== "Drinks" && (
                        <label>
                            ระดับความเผ็ด:
                            <select value={spicinessLevel} onChange={e => setSpicinessLevel(e.target.value)}>
                                <option value="ไม่เผ็ด">ไม่เผ็ด</option>
                                <option value="เผ็ดน้อย">เผ็ดน้อย</option>
                                <option value="เผ็ดกลาง">เผ็ดกลาง</option>
                                <option value="เผ็ดมาก">เผ็ดมาก</option>
                            </select>
                        </label>
                    )}
                    {selectedCategory === "Drinks" && (
                        <label>
                            ระดับความหวาน:
                            <select value={sweetnessLevel} onChange={e => setSweetnessLevel(e.target.value)}>
                                <option value="ไม่หวาน">ไม่หวาน</option>
                                <option value="หวานน้อยมาก">หวานน้อยมาก</option>
                                <option value="หวานน้อย">หวานน้อย</option>
                                <option value="หวานปกติ">หวานปกติ</option>
                                <option value="หวานมาก">หวานมาก</option>
                            </select>
                        </label>
                    )}
                    <label>
                        จำนวน:
                        <input type="number" value={quantity} min="1" onChange={e => setQuantity(parseInt(e.target.value, 10))} />
                    </label>
                    <label>
                        รายละเอียดเพิ่มเติม:
                        <input type="text" value={additionalDetails} onChange={e => setAdditionalDetails(e.target.value)} placeholder='ใส่รายละเอียดเพิ่มเติม' />
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
                        {Object.entries(cartItems).map(([uniqueId, cartItem]) => {
                            const itemId = parseInt(uniqueId.split('-')[0], 10); // Extract itemId from uniqueId
                            const item = menuItems.find(item => item.id === itemId);

                            return item ? (
                                <li key={uniqueId}>
                                    <p>{item.foodname} x {cartItem.quantity} - {item.price * cartItem.quantity} บาท</p>
                                    {item.category !== "Dessert" && cartItem.spicinessLevel && <p>ระดับความเผ็ด: {cartItem.spicinessLevel}</p>}
                                    {item.category === "Drinks" && cartItem.sweetnessLevel && <p>ระดับความหวาน: {cartItem.sweetnessLevel}</p>}
                                    <p>รายละเอียดเพิ่มเติม: {cartItem.additionalDetails}</p>
                                    <button className="delete-menu" onClick={() => removeFromCart(uniqueId)}>ลบ</button>
                                </li>
                            ) : null;
                        })}
                    </ul>
                    <p>ราคารวม: {totalPrice} บาท</p>
                    <button className="order-menu" onClick={handleOrder}>สั่งอาหาร</button>
                </div>
            )}
        </div>
    );
};

export default MenuOrder;