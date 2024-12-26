// import React from 'react';
// import '../CSS/IdolCard.css';
// import { Link } from 'react-router-dom';

// const IdolCard = ({ id, name, age, gender, location, description, imgSrc, details }) => {
//     return (
//         <div className="col-md-4 col-lg-3">
//             <div className="home-idol">
//                 <div className="home-idol-box">
//                     <Link to={`/Profile/${id}`}>
//                         <img src={imgSrc} alt={name} />
//                     </Link>
//                 </div>

//                 <div className="home-idol-des">
//                     <div className="des-location">
//                         <button className="des-btn">{name}</button>
//                         <button className="des-btn">{age}</button>
//                         <button className="des-btn">
//                             <img className="gender" src="/assets/pic/gender.png" alt="gender" />
//                             {gender}
//                         </button>
//                     </div>
//                 </div>

//                 <div className="home-idol-des">
//                     <label className="main-loc des-btn">{location}</label>
//                 </div>

//                 <div className="home-idol-des">
//                     <button className="des-btn">{details}</button>
//                     <div className="des">
//                         <p>{description}</p>
//                     </div>
//                 </div>
//             </div> 
//         </div>
//     );
// };

// export default IdolCard;


import React from 'react';
import '../CSS/IdolCard.css';
import { Link } from 'react-router-dom';

const IdolCard = ({ 
    id, 
    name = 'Unknown', 
    age = 'Unknown', 
    gender = 'Unknown', 
    location = 'Unknown', 
    description = 'No description available', 
    imgSrc = 'assets/default-idol.png', 
    details = 'No details available' 
}) => {
    return (
        <div className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div className="home-idol">
                <div className="home-idol-box">
                    <Link to={`/Profile/${id}`}>
                        <img src={imgSrc} alt={name} className="idol-image" />
                    </Link>
                </div>

                <div className="home-idol-des">
                    <div className="des-location">
                        <button className="des-btn" aria-label={`Name: ${name}`} title={name}>{name}</button>
                        <button className="des-btn" aria-label={`Age: ${age}`} title={`Age: ${age}`}>{age}</button>
                        <button className="des-btn" aria-label={`Gender: ${gender}`} title={`Gender: ${gender}`}>
                            {/* <img className="gender-icon" src="/project/masu/images/gender.png" alt="gender icon" /> */}
                            <img className="gender-icon" src="/assets/pic/gender.png" alt="gender icon" />
                            {gender}
                        </button>
                    </div>
                </div>

                <div className="home-idol-des">
                    <label className="main-loc des-btn" aria-label={`Location: ${location}`} title={`Location: ${location}`}>{location}</label>
                </div>

                <div className="home-idol-des">
                    <button className="des-btn" aria-label={`Details: ${details}`} title={`Details: ${details}`}>{details}</button>
                    <div className="description">
                        <p>{description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IdolCard;



