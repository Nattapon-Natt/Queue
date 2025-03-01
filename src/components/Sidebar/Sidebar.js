import React from 'react';
import { Link } from 'react-router-dom';
import '../CSS/Sidebar.css';

function Sidebar() {
    return (
        // <div className="container">
            <div className="sidebar">
                <ul>
                    <li>
                        <Link to="/info">Profile</Link>
                    </li>
                    <li>
                        <Link to="/editmenu">Menu</Link>
                    </li>
                    <li>
                        <Link to="/queue">Queue</Link>
                    </li>
                    <li>
                        <Link to="/editcus">Customer</Link>
                    </li>
                    <li>
                        <Link to="/editemp">Employee</Link>
                    </li>
                     <li>
                        <Link to="/Reservation">Reservation</Link>
                    </li>
                    <li>  
                        <Link to="/report">Report</Link>
                    </li>
                </ul>
            </div>
        // </div>
    );
}

export default Sidebar;