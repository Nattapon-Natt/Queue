import React from 'react';
import IdolCard from './IdolCard';

const IdolGrid = ({ idols }) => {
    return (
        <div className="idol-grid">
            {idols.map(idol => (
                <IdolCard key={idol.id} {...idol} />
            ))}
        </div>
    );
};

export default IdolGrid;