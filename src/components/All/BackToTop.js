import React, { useEffect, useState } from 'react';
import '../CSS/BackToTop.css';

function BackToTop() {
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.pageYOffset > 300) {
                setShowButton(true);
            } else {
                setShowButton(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // const scrollToTop = () => {
    //     window.scrollTo({
    //         top: 0,
    //         behavior: 'smooth' 
    //     });
    // };

    // const scrollToTop = () => {
    //     const isMobile = window.innerWidth <= 768; 
    //     window.scrollTo({
    //         top: 0,
    //         behavior: isMobile ? 'smooth' : 'auto'
    //     });
    // };

    const scrollToTop = () => {
        const isMobile = window.innerWidth <= 768; // ตรวจสอบว่าเป็นมือถือหรือไม่

        if (isMobile) {
            // บนมือถือ ใช้การเลื่อนแบบ smooth
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            // บนคอมพิวเตอร์ ใช้การเลื่อนแบบ manual พร้อมปรับความเร็ว
            const scrollStep = -window.scrollY / (1000 / 30); // ปรับความเร็วของการเลื่อน
            const scrollInterval = setInterval(() => {
                if (window.scrollY !== 0) {
                    window.scrollBy(0, scrollStep);
                } else {
                    clearInterval(scrollInterval);
                }
            }, 15); // กำหนด interval การเลื่อน
        }
    };


    return (
        <>
            {showButton && (
                <div
                    className="back-to-top"
                    onClick={scrollToTop}
                >
                    {/* <img src="/project/masu/images/idol-arrow.png" alt="Back to Top" /> */}
                    <img src="/assets/pic/icon/idol-arrow.png" alt="Back to Top" />
                </div>
            )}
        </>
    );
}

export default BackToTop;