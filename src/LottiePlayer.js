import React, { useEffect, useRef } from 'react';

const LottiePlayer = ({ animationData, version, isPlaying, animationRef, onEnterFrame }) => {
    const lottieContainerRef = useRef(null);

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
                autoplay: false, // Set to false to manage play state via React state
                animationData: animationData,
            };

            // Initialize the animation and store the instance
            animationRef.current = window.bodymovin.loadAnimation(params);

            // Add event listener to update parent component with animation progress
            animationRef.current.addEventListener('enterFrame', () => {
                const currentProgress = animationRef.current.currentFrame / animationRef.current.totalFrames;
                onEnterFrame(currentProgress);
            });
        };

        document.body.appendChild(script);

        // Cleanup function
        return () => {
            document.body.removeChild(script);
            if (animationRef.current) {
                animationRef.current.removeEventListener('enterFrame');
                animationRef.current.destroy();
                animationRef.current = null;
            }
        };
    }, [animationData, version, onEnterFrame, animationRef]);

    useEffect(() => {
        // Play or pause the animation based on the isPlaying prop
        if (animationRef.current) {
            isPlaying ? animationRef.current.play() : animationRef.current.pause();
        }
    }, [isPlaying]);

    return <div ref={lottieContainerRef} style={{ width: '100%', height: '100%' }} />;
};

export default LottiePlayer;
