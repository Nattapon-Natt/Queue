import React from 'react';
import '../CSS/MenuItem.css';

function MenuItem({ item: { id, image, foodname, price }, onViewDetail }) {
    return (
        <div 
            className="item" 
            onClick={() => onViewDetail(id)} 
            role="button" 
            tabIndex="0" 
            aria-label={`View details of ${foodname || 'this menu item'}`}
        >
            <img 
                src={image || '/assets/pic/logo.jpg'} 
                alt={foodname || 'ไม่มีชื่อเมนู'} 
                className="menu-image" 
                onError={(e) => e.target.src = '/assets/pic/logo.jpg'} 
            />
            <div className="item-info">
                <h3 className="food-name">{foodname || 'ชื่อเมนูไม่ระบุ'}</h3>
                <p className="food-price">
                    ราคา: {price !== undefined ? `${price} บาท` : 'ไม่ระบุราคา'}
                </p>
            </div>
        </div>
    );
}

export default MenuItem;