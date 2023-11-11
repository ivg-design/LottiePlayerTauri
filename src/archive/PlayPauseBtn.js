// playPauseBtn.js
import React, { useEffect, useRef, useState } from 'react';
import lottie from 'lottie-web';

const PlayPauseBtn = ({ size = 100, onToggle }) => {
    const [isPlaying, setIsPlaying] = useState(true); // true for play, false for pause
    const animationContainer = useRef(null);
    const animationInstance = useRef(null);

    useEffect(() => {
        // Load the animation
        animationInstance.current = lottie.loadAnimation({
            container: animationContainer.current,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            path: 'lottieUIElements/playPauseBtn.json' // Path is relative to the public folder
        });

        // Event listener for when the animation completes a segment
        animationInstance.current.addEventListener('complete', () => {
            if (!isPlaying) {
                animationInstance.current.pause();
            }
        });

        // Cleanup function
        return () => {
            if (animationInstance.current) {
                animationInstance.current.destroy();
            }
        };
    }, []);

    useEffect(() => {
        // Play the animation for the current state
        const direction = isPlaying ? -1 : 1; // Play in reverse if it is playing
        animationInstance.current.setDirection(direction);
        animationInstance.current.play();
    }, [isPlaying]);

    const togglePlayPause = () => {
        setIsPlaying(!isPlaying);
        onToggle(!isPlaying);
    };

    return (
        <div
            ref={animationContainer}
            style={{ width: size, height: size, cursor: 'pointer' }}
            onClick={togglePlayPause}
        ></div>
    );
};

export default PlayPauseBtn;
