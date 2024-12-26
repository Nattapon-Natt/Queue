import React, { useEffect } from 'react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../CSS/Profile.css';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BookingDetail from './BookingDetail';
import Share from './Share';
import MenuData from '../Menu/MenuData';

const MenuDetail = () => {
    const { id } = useParams();
    const menu = MenuData.find(menu => menu.id === id);

    const navigate = useNavigate();

    const handleBackToHome = (e) => {
        e.preventDefault();
        navigate('/');
        window.scrollTo(0, 0);
    };

    useEffect(() => {
        window.scrollTo(0, 0); // เลื่อนหน้าจอไปที่ด้านบนสุด
    }, []);

    if (!idol) {
        return <div>ไม่พบโปรไฟล์</div>;
    }

    return (
        <main>
            <div className="container">
                <div className="row justify-content-center profile-idol">
                    <div className="col-lg-6">
                        <div className="profile-idol-box">
                            <img
                                className="profile-idol-bg"
                                src={idol.imgSrc}
                                alt={idol.name}
                            />
                        </div>
                    </div>

                    <div className="col-lg-5">
                        <h1 className="idol-name">{idol.name}</h1>
                        <p className="adv-word">{idol.description}</p>

                        <div className="location">
                            <div className="location-row">
                                {/* <img className="pin" src="/project/masu/images/loc-pin2.png" alt="Location Pin" /> */}
                                <img className="pin" src="/assets/pic/loc-pin2.png" alt="Location Pin" />
                                <button className="des"><span className="loc">{idol.location}</span></button>
                            </div>
                            <div className="location-row">
                                <button className="des"><span>{idol.details}</span></button>
                            </div>
                            <div className="location-row">
                                <button className="des"><span>{idol.age}</span></button>
                                <button className="des">
                                    {/* <img className="gender" src="/project/masu/images/gender.png" alt="Gender Icon" /> */}
                                    <img className="gender" src="/assets/pic/gender.png" alt="Gender Icon" />
                                    <span>{idol.gender}</span>

                                </button>
                            </div>
                        </div>

                        <div className="col-lg-12">

                            <h2 className="detail">ประวัติ</h2>
                            <p>{idol.background}</p>
                            <h2 className="detail">ปรัชญาในการจับคู่</h2>
                            <p>{idol.philosophy}</p>

                        </div>

                        <Share />
                    </div>

                </div>

                <BookingDetail />

                <div className="row justify-content-center">
                    <div className="col-md-4 col-lg-3">
                        <Link className="backto-home" to="/" onClick={handleBackToHome}>
                            {/* <img src="/project/masu/images/idol-arrow.png" alt="Back to Home" /> */}
                            <img src="/assets/pic/idol-arrow.png" alt="Back to Home" />
                            กลับหน้าแรก
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default MenuDetail;