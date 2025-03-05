import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../CSS/Navbar.css';

function Navbar({ userName, setUserName }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMasuLogin, setIsMasuLogin] = useState(false); 
    const navigate = useNavigate();

    useEffect(() => {
        const memberType = localStorage.getItem('memberType');
        if (memberType === 'emp') {
            setIsMasuLogin(true); 
        }
    }, []);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    // const handleLogout = () => {
    //     localStorage.removeItem('name');
    //     localStorage.removeItem('memberType');
    //     setUserName('');
    //     navigate('/');
    //     window.location.reload();
    //     localStorage.clear();
    // };

    const handleLogout = () => {
        localStorage.removeItem('name');
        localStorage.removeItem('memberType');
        localStorage.removeItem('email');
        localStorage.removeItem('password');
    
        setUserName('');
        navigate('/');
        window.location.reload();
    };

    return (
        <nav className="nav">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <img src="/assets/pic/icon/logo.jpg" alt="MASU-Logo" />
                    168 THAI RESTAURANT
                </Link>
                <div className="menu-icon" onClick={toggleMenu}>
                    <i className={isOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
                </div>
                <ul className={isOpen ? 'nav-menu active' : 'nav-menu'}>
                    {!isMasuLogin && (
                        <>
                            <li className="nav-item">
                                <Link to="/" className="nav-links" onClick={toggleMenu}>HOME</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/menu" className="nav-links" onClick={toggleMenu}>MENU</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/reservation" className="nav-links" onClick={toggleMenu}>RESERVE</Link>
                            </li>
                        </>
                    )}

                    {/* แสดงเมนูสำหรับผู้ใช้งาน */}
                    {userName ? (
                        <>
                            <li className="nav-item">
                                <span className="nav-links">ยินดีต้อนรับคุณ {userName}</span>
                            </li>
                            <li className="nav-item">
                                <button className="nav-links logout" onClick={handleLogout}>Logout</button>
                            </li>
                        </>
                    ) : (
                        !isMasuLogin && (
                            <>
                                <li className="nav-item">
                                    <Link to="/logincus" className="nav-links" onClick={toggleMenu}>LOGIN</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/register" className="nav-links" onClick={toggleMenu}>REGISTER</Link>
                                </li>
                            </>
                        )
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;