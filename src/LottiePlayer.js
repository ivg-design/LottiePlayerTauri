/* global bodymovin */

import React, { useEffect, useRef } from 'react';

const LottiePlayer = ({ animationData, version, isPlaying }) => {
    const lottieContainerRef = useRef(null);
    const animationInstanceRef = useRef(null); // Ref to hold the instance of the animation

    useEffect(() => {
        // Load the Lottie script
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

            // Initialize the animation and store the instance
            animationInstanceRef.current = bodymovin.loadAnimation(params);
        };

        document.body.appendChild(script);

        // Cleanup function
        return () => {
            document.body.removeChild(script);
            if (animationInstanceRef.current) {
                animationInstanceRef.current.destroy();
            }
        };
    }, [animationData, version]);

    useEffect(() => {
        // Play or pause the animation when isPlaying changes
        if (animationInstanceRef.current) {
            if (isPlaying) {
                animationInstanceRef.current.play();
            } else {
                animationInstanceRef.current.pause();
            }
        }
    }, [isPlaying]); // Only re-run if isPlaying changes

    return (
        <div ref={lottieContainerRef} style={{ width: '100%', height: '100%' }}></div>
    );
};

export default LottiePlayer;
