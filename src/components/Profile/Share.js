import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../CSS/Share.css';

function Share() {
  const navigate = useNavigate(); // สำหรับนำทางไปหน้าอื่น
  const shareUrl = window.location.href; // ดึงลิงก์ปัจจุบัน

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank');
  };

  const handleTwitterShare = () => {
    window.open(`https://twitter.com/intent/tweet?text=${shareUrl}`, '_blank');
  };

  const handleLineShare = () => {
    window.open(`https://social-plugins.line.me/share?url=${shareUrl}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        // แสดงข้อความแจ้งให้ทราบว่าคัดลอกสำเร็จ
        //   alert('ลิงก์ถูกคัดลอกแล้ว!');
      })
      .catch(err => {
        console.error('ไม่สามารถคัดลอกลิงก์ได้', err);
      });
  };

  const handleTalkToMasu = () => {
    const memberType = localStorage.getItem('memberType');
    if (memberType === 'cus') {
      window.open('https://line.me/ti/p/F_oeXkqtZG', '_blank');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="regis-share">
      <div className="share-container">
        <Link className="backto-home" to="#" onClick={() => {
          handleTalkToMasu();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}>
          พูดคุยกับแม่สื่อ
        </Link>
        <div className="share-link">
          <strong>SHARE :</strong>
          <a className="img-link" onClick={handleFacebookShare}>
            {/* <img src="/project/masu/images/facebook-app-symbol.png" width="18px" alt="Share on Facebook" /> */}
            <img src="/assets/pic/facebook-app-symbol.png" width="18px" alt="Share on Facebook" />
          </a>
          <a className="img-link" onClick={handleTwitterShare}>
            {/* <img src="/project/masu/images/twitter.png" width="18px" alt="Share on Twitter" /> */}
            <img src="/assets/pic/twitter.png" width="18px" alt="Share on Twitter" />
          </a>
          <a className="img-link" onClick={handleLineShare}>
            {/* <img src="/project/masu/images/line (2).png" width="18px" alt="Share on Line" /> */}
            <img src="/assets/pic/line (2).png" width="18px" alt="Share on Line" />
          </a>
          <a className="img-link" onClick={handleCopyLink}>
            {/* <img src="/project/masu/images/network.png" width="18px" alt="Copy Link" /> */}
            <img src="/assets/pic/network.png" width="18px" alt="Copy Link" />
          </a>
        </div>

      </div>
    </div >
  );
}

export default Share;