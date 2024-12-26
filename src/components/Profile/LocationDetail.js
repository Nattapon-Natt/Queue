// import React from 'react';
// import { useParams } from 'react-router-dom';
// import IdolData from '../First/IdolData'; 
// import IdolCard from '../First/IdolCard'; 
// import '../CSS/LocationDetail.css';

// const LocationDetail = () => {
//     const { location } = useParams(); // ดึงข้อมูลจังหวัดจาก URL
//     const decodedLocation = decodeURIComponent(location); // ถอดรหัสจังหวัด
//     const idolsInLocation = IdolData.filter(idol => idol.location === decodedLocation);

//     return (
//         <main>
//             <div className="container">
//                 <h1>ข้อมูล Idol ในจังหวัด {decodedLocation}</h1>
//                 <div className="row">
//                     {idolsInLocation.length > 0 ? (
//                         idolsInLocation.map(idol => (
//                             <IdolCard
//                                 key={idol.id}
//                                 id={idol.id}
//                                 name={idol.name}
//                                 age={idol.age}
//                                 gender={idol.gender}
//                                 location={idol.location}
//                                 description={idol.description}
//                                 imgSrc={idol.imgSrc}
//                                 details={idol.details}
//                             />
//                         ))
//                     ) : (
//                         <p>ไม่มีข้อมูล Idol ในจังหวัดนี้</p>
//                     )}
//                 </div>
//             </div>
//         </main>
//     );
// };

// export default LocationDetail;

import React from 'react';
import { Link, useParams } from 'react-router-dom';
import IdolData from '../First/IdolData';
import IdolCard from '../First/IdolCard';
import '../CSS/LocationDetail.css';

const LocationDetail = () => {
    const { location } = useParams();

    const filteredIdols = IdolData.filter(idol => idol.location === decodeURIComponent(location));

    return (
        <main>
            <div className="container">
                <h1>ข้อมูลแม่สื่อในจังหวัด {location}</h1>
                <div className="row">
                    {filteredIdols.length > 0 ? (
                        filteredIdols.map(idol => (
                            <IdolCard
                                key={idol.id}
                                id={idol.id}
                                name={idol.name}
                                age={idol.age}
                                gender={idol.gender}
                                location={idol.location}
                                description={idol.description}
                                imgSrc={idol.imgSrc}
                                details={idol.details}
                            />
                        ))
                    ) : (
                        <p>ไม่มีข้อมูลสำหรับ {location}</p>
                    )}
                </div>
            </div>
            <div className="row justify-content-center">
                <div className="col-md-4 col-lg-3">
                    <Link
                        className="backto-home"
                        to="/"
                        onClick={() => {
                            window.scrollTo(0, 0);
                        }}
                    >
                        {/* <img src="/project/masu/images/idol-arrow.png" alt="Back to Home" /> */}
                        <img src="/assets/pic/idol-arrow.png" alt="Back to Home" />
                        กลับหน้าแรก
                    </Link>
                </div>
            </div>
        </main>
    );
};

export default LocationDetail;

