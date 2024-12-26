// import React from 'react';
// import L from 'leaflet';
// import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
// import { useNavigate } from 'react-router-dom';
// import 'leaflet/dist/leaflet.css';
// import icon from 'leaflet/dist/images/marker-icon.png';
// import iconShadow from 'leaflet/dist/images/marker-shadow.png';
// import IdolData from './IdolData';
// import '../CSS/Map.css';
// const Map = () => {
//     const navigate = useNavigate();

//     let DefaultIcon = L.icon({
//         iconUrl: icon,
//         shadowUrl: iconShadow,
//         iconAnchor: [12, 41],
//     });

//     L.Marker.prototype.options.icon = DefaultIcon;

//     const locationCoordinates = {
//         'กรุงเทพมหานคร': [13.736717, 100.523186],
//         'สงขลา': [7.0056, 100.4681],
//         'นครศรีธรรมราช': [8.4294, 99.9612],
//         'เชียงใหม่': [18.7883, 98.9853],
//         'ลำปาง': [18.2902, 99.4945],
//         'เชียงราย': [19.907, 99.831],
//         'ชลบุรี': [13.3637, 100.984],
//     };

//     // หาชื่อจังหวัดที่มีใน IdolData โดยไม่ซ้ำ
//     const locations = Array.from(new Set(IdolData.map(idol => idol.location)));

//     // ฟังก์ชันในการจัดการเมื่อคลิกที่หมุด
//     const handleMarkerClick = (location) => {
//         navigate(`/location/${encodeURIComponent(location)}`); // ส่งข้อมูลจังหวัดไปยัง LocationDetail
//     };

//     return (
//         <div className="container">
//             <MapContainer
//                 center={[13.736717, 100.523186]} // พิกัดกรุงเทพ ประเทศไทย
//                 zoom={6}
//                 style={{ height: "500px", width: "100%" }}
//             >
//                 <TileLayer
//                     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                     attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
//                 />
//                 {locations.map((location, index) => {
//                     const position = locationCoordinates[location] || [13.736717, 100.523186];
//                     const count = IdolData.filter(idol => idol.location === location).length;

//                     return (
//                         <Marker
//                             key={index}
//                             position={position}
//                         >
//                             <Popup>
//                                 <div>
//                                     <span>มีผู้ใช้ {count} คนใน {location}</span>
//                                     <br />
//                                     <button 
//                                         onClick={() => handleMarkerClick(location)}
//                                     >
//                                         รายละเอียด
//                                     </button>
//                                 </div>
//                             </Popup>
//                         </Marker>

//                     );
//                 })}
//             </MapContainer>
//         </div>
//     );
// };

// export default Map;

import React from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import IdolData from './IdolData';
import '../CSS/Map.css';

const Map = () => {
    const navigate = useNavigate();

    // ตั้งค่าไอคอนของ Marker
    const DefaultIcon = L.icon({
        iconUrl: icon,
        shadowUrl: iconShadow,
        iconAnchor: [12, 41],
    });

    L.Marker.prototype.options.icon = DefaultIcon;

    // กำหนดพิกัดของสถานที่
    const locationCoordinates = {
        'กรุงเทพมหานคร': [13.736717, 100.523186],
        'สงขลา': [7.0056, 100.4681],
        'นครศรีธรรมราช': [8.4294, 99.9612],
        'เชียงใหม่': [18.7883, 98.9853],
        'ลำปาง': [18.2902, 99.4945],
        'เชียงราย': [19.907, 99.831],
        'ชลบุรี': [13.3637, 100.984],
    };

    // หาชื่อจังหวัดที่มีใน IdolData โดยไม่ซ้ำ
    const locations = Array.from(new Set(IdolData.map(idol => idol.location)));

    // ฟังก์ชันในการจัดการเมื่อคลิกที่หมุด
    const handleMarkerClick = (location) => {
        navigate(`/location/${encodeURIComponent(location)}`); // ส่งข้อมูลจังหวัดไปยัง LocationDetail
    };

    return (
        <div className="container">
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <MapContainer
                    center={[13.736717, 100.523186]} // พิกัดกรุงเทพ ประเทศไทย
                    zoom={6}
                    style={{ height: "500px", width: "80%" }}
                >

            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            {locations.map((location) => {
                const position = locationCoordinates[location] || [13.736717, 100.523186];
                const count = IdolData.filter(idol => idol.location === location).length;

                return (
                    <Marker
                        key={location}
                        position={position}
                    >
                        <Popup>
                            <div>
                                <span>มีผู้ใช้ {count} คนใน {location}</span>
                                <br />
                                <button
                                    onClick={() => handleMarkerClick(location)}
                                >
                                    ดูรายละเอียด
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
        </div>
        </div >
    );
};

export default Map;

