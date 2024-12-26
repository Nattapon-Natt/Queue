import React from 'react';
import '../CSS/BookingDetail.css';
import { useParams } from 'react-router-dom';
import IdolData from '../First/IdolData';

function BookingDetail() {
    const { id } = useParams();
    const idol = IdolData.find(idol => idol.id === id);
    return (
        // <div className="container">
        <div className="booking-detail row">
            <div className="booking-icon col-lg-3 col-md-6 col-sm-12">
                {/* <img src="/project/masu/images/Tear-Off Calendar.png" width="60px" alt="Calendar Icon" /> */}
                <img src="/assets/pic/Tear-Off Calendar.png" width="60px" alt="Calendar Icon" />
                <div className="text-booking">เข้าร่วมวันที่</div>
                <div className="text-booking-primary">{idol.participate}</div>
            </div>
            <div className="booking-icon col-lg-3 col-md-6 col-sm-12">
                {/* <img src="/project/masu/images/single.png" width="60px" alt="Single Icon" /> */}
                <img src="/assets/pic/single.png" width="60px" alt="Single Icon" />
                <div className="text-booking">มีน้องที่รู้จักจำนวน </div>
                <div className="text-booking-primary">{idol.single}</div>
            </div>
            <div className="booking-icon col-lg-3 col-md-6 col-sm-12">
                {/* <img src="/project/masu/images/heart.png" width="60px" alt="Heart Icon" /> */}
                <img src="/assets/pic/heart.png" width="60px" alt="Heart Icon" />
                <div className="text-booking">แมทช์มาแล้ว</div>
                <div className="text-booking-primary">{idol.matched}</div>
            </div>
            <div className="booking-icon col-lg-3 col-md-6 col-sm-12">
                {/* <img src="/project/masu/images/married.png" width="95px" alt="Married Icon" /> */}
                <img src="/assets/pic/married.png" width="95px" alt="Married Icon" />
                <div className="text-booking">สำเร็จจนแต่งงาน</div>
                <div className="text-booking-primary">{idol.married}</div>
            </div>
        </div>
        // </div>

    );
}

export default BookingDetail;