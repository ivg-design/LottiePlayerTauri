/* global bodymovin */

// LottiePlayer.js
import React, { useEffect, useRef } from 'react';

const LottiePlayer = ({ animationData, version, isPlaying, progress }) => {
    const lottieContainerRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = `${process.env.PUBLIC_URL}/lottiePlayer/bodymovin_${version}.min.js`;
        console.log(`Loading script from: ${script.src}`); // Log the URL being used

        script.async = true;
        script.onload = () => {
            const params = {
                container: lottieContainerRef.current,
                renderer: 'svg',
                loop: true,
                autoplay: isPlaying, // Use isPlaying to control autoplay
                animationData: animationData,
            };

            // Initialize the animation and store the reference
            animationRef.current = bodymovin.loadAnimation(params);
        };

        document.body.appendChild(script);

        return () => {
            // Clean up the script and animation instance
            document.body.removeChild(script);
            if (animationRef.current) {
                animationRef.current.destroy();
            }
        };
    }, [animationData, version, animationRef]);

    useEffect(() => {
        // Control play/pause state
        if (animationRef.current) {
            if (isPlaying) {
                animationRef.current.play();
            } else {
                animationRef.current.pause();
            }
        }
    }, [isPlaying]);

    useEffect(() => {
        // Control animation progress
        if (animationRef.current) {
            const frame = animationRef.current.totalFrames * progress;
            animationRef.current.goToAndStop(frame, true);
        }
    }, [progress]);

    return (
        <div ref={lottieContainerRef} style={{ width: '100%', height: '100%' }} />
    );
};

export default LottiePlayer;

