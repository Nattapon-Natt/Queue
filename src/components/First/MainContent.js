import React from 'react';
import '../CSS/MainContent.css';
import Gallery from './Gallery';
import { Link } from 'react-router-dom';

const MainContent = () => {
    return (
        <div className="main-content">
            {/* รูปภาพขนาดใหญ่ด้านบน */}
            <Link to="/menu">
            {/* <img className="icon" src="/assets/pic/user_icon.png" alt="User Icon" /> */}
                <img
                    src="/assets/pic/icon/image.png"
                    alt="Main Dish"
                    className="main-image"
                />
            </Link>

            {/* ข้อความและแกลเลอรี่ในแนวนอน */}
            <div className="content-row">
                <div className="text-content">
                    <p className="description">
                        168 Thai restaurant, please indulging in fresh, local flavors is a
                        must for locals and visitors alike. We make sure that guests will
                        have a memorable experience as they enjoy our Thai restaurant in
                        Bangkok.
                    </p>
                </div>
                <div className="gallery">
                    <Gallery />
                </div>
            </div>
        </div>
    );
};

export default MainContent;
