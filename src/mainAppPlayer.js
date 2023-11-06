/* global bodymovin */

import React, { useEffect, useRef } from 'react';

const LottiePlayer = ({ animationData, version }) => {
    const lottieContainerRef = useRef(null);

    useEffect(() => {
        // Correct the template literal syntax for embedding the version
        const script = document.createElement('script');
        script.src = `${process.env.PUBLIC_URL}/lottiePlayer/bodymovin_${version}.min.js`;
        script.async = true;
        script.onload = () => {
            // Once the script is loaded, initialize the animation
            const params = {
                container: lottieContainerRef.current,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                animationData: animationData,
            };

            // Use the global bodymovin variable to initialize the animation
            const anim = bodymovin.loadAnimation(params);

            // Additional Bodymovin code can go here
        };

        document.body.appendChild(script);

        return () => {
            // Cleanup
            document.body.removeChild(script);
            if (window.bodymovin && window.bodymovin.destroy) {
                window.bodymovin.destroy();
            }
        };
    }, [animationData, version]);

    return (
        <div ref={lottieContainerRef} style={{ width: '100%', height: '100%' }} id="lottie"></div>
    );
};

export default LottiePlayer;
