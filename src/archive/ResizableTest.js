import React, { useState, useEffect } from 'react';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';

const ResizableTest = () => {
    const [dimensions, setDimensions] = useState({ width: 200, height: window.innerHeight });

    const onResize = (event, { node, size }) => {
        setDimensions({ width: size.width, height: window.innerHeight });
    };

    // Update the height if the window is resized
    useEffect(() => {
        const handleResize = () => {
            setDimensions({ width: dimensions.width, height: window.innerHeight });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [dimensions.width]);

    return (
        <Resizable
            width={dimensions.width}
            height={dimensions.height}
            onResize={onResize}
        >
            <div
                className="box"
                style={{
                    width: `${dimensions.width}px`,
                    height: `${dimensions.height}px`,
                    backgroundColor: 'lightgray',
                }}
            >
                <span>Contents</span>
            </div>
        </Resizable>
    );
};

export default ResizableTest;
