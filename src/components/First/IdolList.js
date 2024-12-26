// import React from 'react';
// import IdolCard from './IdolCard';
// import IdolData from './IdolData';

// const IdolList = () => {
//   return (
//     <div className="container">
//       <div className="row">
//         {IdolData.map(idol => (
//           <IdolCard key={idol.id} {...idol} />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default IdolList;

import React from 'react';
import IdolCard from './IdolCard';

const IdolList = ({ idols = [] }) => {
  // ตรวจสอบว่า idols เป็น array และกรองข้อมูลที่ไม่ซ้ำกันตาม id
  const uniqueIdols = Array.from(new Set(idols.map(idol => idol.id)))
    .map(id => {
      return idols.find(idol => idol.id === id)
    });

  return (
    <div className="idol-list">
      {uniqueIdols.length > 0 && uniqueIdols.map(idol => (
        
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
        ))}
    </div>
  );
};

export default IdolList;