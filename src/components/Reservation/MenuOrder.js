import React, { useState, useEffect, useMemo } from 'react';
import '../CSS/MenuOrder.css';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const MenuOrder = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [cartItems, setCartItems] = useState({});
    const [selectedCategory, setSelectedCategory] = useState("อาหารหลัก"); // Initial category
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
        'Main course (อาหารหลัก)': 'อาหารหลัก',
        'Dessert (ขนมหวาน)': 'ขนมหวาน',
        'Drinks (เครื่องดื่ม)': 'เครื่องดื่ม'
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
            <p>price : {item.price} baht</p>
            <button onClick={onAddToCart}>Add to Cart</button>
        </div>
    );

    const openPopup = (item) => {
        setSelectedItem(item);
        setSpicinessLevel("Not Spicy (ไม่เผ็ด)");
        setSweetnessLevel("No Sweetness (ไม่หวาน)");
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
                    spicinessLevel: selectedItem.category !== "เครื่องดื่ม" && selectedItem.category !== "ขนมหวาน" ? spicinessLevel : "",
                    sweetnessLevel: selectedItem.category === "เครื่องดื่ม" ? sweetnessLevel : "",
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
            <h1 className="menu-title">Choose food according to your needs</h1>

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
                    {selectedCategory !== "ขนมหวาน" && selectedCategory !== "เครื่องดื่ม" && (
                        <label>
                            Spice Levels (ระดับความเผ็ด):
                            <select value={spicinessLevel} onChange={e => setSpicinessLevel(e.target.value)}>
                                <option value="Not Spicy (ไม่เผ็ด)">Not Spicy (ไม่เผ็ด)</option>
                                <option value="Mild Spicy (เผ็ดน้อย)">Mild Spicy (เผ็ดน้อย)</option>
                                <option value="Medium Spicy (เผ็ดกลาง)">Medium Spicy (เผ็ดกลาง)</option>
                                <option value="Very Spicy (เผ็ดมาก)">Very Spicy (เผ็ดมาก)</option>
                            </select>
                        </label>
                    )}
                    {selectedCategory === "เครื่องดื่ม" && (
                        <label>
                            Sweetness Levels (ระดับความหวาน) :
                            <select value={sweetnessLevel} onChange={e => setSweetnessLevel(e.target.value)}>
                                <option value="No Sweetness (ไม่หวาน)">No Sweetness (ไม่หวาน)</option>
                                <option value="Very Slightly Sweet (หวานน้อยมาก)">Very Slightly Sweet (หวานน้อยมาก)</option>
                                <option value="Less Sweet (หวานน้อย)">Less Sweet (หวานน้อย)</option>
                                <option value="Regular Sweetness (หวานปกติ)">Regular Sweetness (หวานปกติ)</option>
                                <option value="Extra Sweet (หวานมาก)">Extra Sweet (หวานมาก)</option>
                            </select>
                        </label>
                    )}
                    <label>
                    quantity :
                        <input type="number" value={quantity} min="1" onChange={e => setQuantity(parseInt(e.target.value, 10))} />
                    </label>
                    <label>
                        More Details :
                        <input type="text" value={additionalDetails} onChange={e => setAdditionalDetails(e.target.value)} placeholder='Add More Details' />
                    </label>
                    <button onClick={handleAddToCart}>Add to Cart</button>
                    <button onClick={closePopup}>Cancel</button>
                </div>
            )}

            {/* Cart Summary */}
            <h2>Your Cart</h2>
            {Object.keys(cartItems).length === 0 ? (
                <p>Empty Cart</p>
            ) : (
                <div className="sum">
                    <ul>
                        {Object.entries(cartItems).map(([uniqueId, cartItem]) => {
                            const itemId = parseInt(uniqueId.split('-')[0], 10); 
                            const item = menuItems.find(item => item.id === itemId);

                            return item ? (
                                <li key={uniqueId}>
                                    <p>{item.foodname} x {cartItem.quantity} - {item.price * cartItem.quantity} baht</p>
                                    {item.category !== "ขนมหวาน" && cartItem.spicinessLevel && <p>Spicy : {cartItem.spicinessLevel}</p>}
                                    {item.category === "เครื่องดื่ม" && cartItem.sweetnessLevel && <p>Sweetness : {cartItem.sweetnessLevel}</p>}
                                    <p>Details: {cartItem.additionalDetails}</p>
                                    <button className="delete-menu" onClick={() => removeFromCart(uniqueId)}>delete</button>
                                </li>
                            ) : null;
                        })}
                    </ul>
                    <p>Total : {totalPrice} baht</p>
                    <button className="order-menu" onClick={handleOrder}>Order food</button>
                </div>
            )}
        </div>
    );
};

export default MenuOrder;