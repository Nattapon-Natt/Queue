import React from 'react';
import '../CSS/Gallery.css';
import { Link } from 'react-router-dom';

const Gallery = () => {
    const images = [
        '/assets/pic/padthai.png',
        '/assets/pic/sour.jpg',
        '/assets/pic/pineapple.jpg',
    ];

    return (
        <div className="gallery-container">
            {images.map((image, index) => (
                <Link to="/menu">
                    <img
                        key={index}
                        src={image}
                        alt={`Dish ${index + 1}`}
                        className="gallery-image"
                    />
                </Link>
            ))}
        </div>
    );
};

export default Gallery;
