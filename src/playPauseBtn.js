import React, { useEffect, useRef, useState } from 'react';
import lottie from 'lottie-web';

const PlayPauseButton = ({ size = 100, animationPath, onToggle }) => {
    const [isPlaying, setIsPlaying] = useState(true); // Start in play state
    const animationContainer = useRef(null);
    const anim = useRef(null);

    useEffect(() => {
        // Load the animation by path
        anim.current = lottie.loadAnimation({
            container: animationContainer.current,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            path: animationPath
        });

        // Go to the last frame (assuming the last frame is the "play" state)
        anim.current.goToAndStop(anim.current.totalFrames - 1, true);

        // Add an event listener to handle the end of the animation
        anim.current.addEventListener('complete', () => {
            if (onToggle) {
                onToggle(isPlaying);
            }
        });

        // Clean up
        return () => {
            anim.current.destroy();
        };
    }, [animationPath, onToggle]);

    const togglePlayPause = () => {
        setIsPlaying(!isPlaying);
        if (isPlaying) {
            anim.current.setDirection(-1); // Play in reverse if we are pausing
        } else {
            anim.current.setDirection(1); // Play forward if we are playing
        }
        anim.current.play();
    };

    return (
        <div
            ref={animationContainer}
            onClick={togglePlayPause}
            style={{ width: size, height: size, cursor: 'pointer' }}
        />
    );
};

export default PlayPauseButton;
