// Import the necessary hooks and components from React and other libraries.
import React, { useState, useRef, useEffect } from 'react';  // React hooks and React base import
import LottiePlayer from './LottiePlayer'; // Importing a custom component for rendering Lottie animations
import './PlayerUI.css'; // Importing CSS for styling the player UI
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Component for Font Awesome icons
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons'; // Specific icons from Font Awesome

// Defining the PlayerUI component with props for animation data and version
const PlayerUI = ({ animationData, version }) => {
    // State hooks for play state and progress
    const [isPlaying, setIsPlaying] = useState(true); // State for if the animation is playing
    const [progress, setProgress] = useState(0); // State for the progress of the animation
    const animationRef = useRef(null); // Ref hook to reference the animation DOM element

    // Effect hook to handle play/pause changes
    useEffect(() => {
        if (animationRef.current) {
            if (isPlaying) {
                animationRef.current.play(); // Play animation if isPlaying is true
            } else {
                animationRef.current.pause(); // Pause animation if isPlaying is false
            }
        }
    }, [isPlaying]); // This effect depends on the isPlaying state

    // Effect hook to handle progress changes
    useEffect(() => {
        if (animationRef.current) {
            const frame = Math.floor(animationRef.current.totalFrames * progress);
            animationRef.current.goToAndStop(frame, true); // Go to a specific frame based on progress
        }
    }, [progress]); // This effect depends on the progress state

    // Function to toggle the play state
    const togglePlay = () => {
        setIsPlaying(!isPlaying); // Sets isPlaying to the opposite of its current state
    };

    // Function to update the progress state
    const updateProgress = (value) => {
        setProgress(parseFloat(value)); // Parses the string value to a float and updates the progress state
    };

    // Function to determine the button class based on the play state
    const getButtonClass = () => {
        return isPlaying ? "playBtn" : "pauseBtn"; // Returns the appropriate class name based on isPlaying
    };

    // The component returns a UI structure rendered as JSX
    return (
        <div className="playbackContainer">
            <LottiePlayer
                animationData={animationData}
                version={version}
                isPlaying={isPlaying}
                progress={progress}
                animationRef={animationRef}
            />
            <div className="player-controls">
                <button
                    className={getButtonClass()}
                    onClick={togglePlay}
                >
                    <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} /> 
                    {isPlaying ? ' Pause' : ' Play'} 
                </button>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="any"
                    value={progress}
                    onChange={(e) => updateProgress(e.target.value)}
                />
            </div>
        </div>
    );
};

export default PlayerUI; // Exports the component for use in other parts of the application
