import React from 'react';
import '../CSS/Footer.css';

const Footer = () => {
  return (
    <div className="copy">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="copyright-section">
              {/* <img src="/project/masu/images/copyright.png" alt="Copyright Icon" /> */}
              <img src="/assets/pic/copyright.png" alt="Copyright Icon" />
              <p className="copyright-text">สงวนลิขสิทธิ์</p>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12 text-center p-4">
            <p>168 Thai Restaurant</p>            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
