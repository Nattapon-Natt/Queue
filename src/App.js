import './App.css';
import Navbar from './components/All/Navbar';
import Home from './screens/Home';
import LoginPage from './screens/LoginPage';
import RegisterPage from './screens/RegisterPage';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProfilePage from './screens/ProfilePage';
import Footer from './components/All/Footer';
import LocationDetail from './components/Profile/LocationDetail';
import BackToTop from './components/All/BackToTop';
import { useEffect, useState } from 'react';
import Menus from './components/Menu/Menus';
import LoginCus from './components/Regis-Login/LoginCus';
import LoginEmp from './components/Regis-Login/LoginEmp';
import ProfileMenu from './components/Menu/ProfileMenu';
import MenuOrder from './components/Reservation/MenuOrder';
import Reservation from './components/Reservation/Reservation';
import CusInfo from './components/Sidebar/CusInfo';
import Sidebar from './components/Sidebar/Sidebar';
import EditMenu from './components/Sidebar/EditMenu';
import Queue from './components/Sidebar/Queue';
import Info from './components/Sidebar/Info';
import EmpInfo from './components/Sidebar/EmpInfo';
import TableBooking from './components/Sidebar/TableBooking';


function App() {
  const [userName, setUserName] = useState(localStorage.getItem('name') || '');
  const [memberType, setMemberType] = useState(localStorage.getItem('memberType') || '');

  useEffect(() => {
    const name = localStorage.getItem('name');
    const type = localStorage.getItem('memberType');
    if (name) {
      setUserName(name);
    }
    if (type) {
      setMemberType(type);
    }
  }, []);

  const isAuthenticated = !!localStorage.getItem('email');

  return (
    <Router>
      <Navbar userName={userName} setUserName={setUserName} />
      <BackToTop />

      {/* แสดง Sidebar เฉพาะเมื่อ memberType เป็น 'idol' */}
      {/* {memberType === 'idol' && <Cupid setCurrentPage={setCurrentPage} />} */}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menus />} />
        <Route path="/reservation" element={<Reservation />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* <Route path="/Profile/:id" element={<ProfilePage />} /> */}
        {/* <Route path="/location/:location" element={<LocationDetail />} /> */}
        <Route path="/logincus" element={<LoginCus setUserName={setUserName} />} />
        <Route path="/emp" element={<LoginEmp setUserName={setUserName} setMemberType={setMemberType} />} />
        <Route path="/sidebar" element={<Sidebar />} />
        <Route path="/info" element={<Info />} />
        <Route path="/editmenu" element={<EditMenu />} />
        <Route path="/profile-menu/:id" element={<ProfileMenu />} />
        <Route path="/menu-order" element={<MenuOrder />} />
        <Route path="/queue" element={<Queue />} />
        <Route path="/editcus" element={<CusInfo />} />
        <Route path="/editemp" element={<EmpInfo />} />
        <Route path="/table-booking" element={<TableBooking />} />
      </Routes>

      {/* {memberType === 'idol' && renderPage()} */}

      <Footer />
    </Router>
  );
}

export default App;
