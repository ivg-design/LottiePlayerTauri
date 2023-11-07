import React, { useState, useRef } from 'react';
import LottiePlayer from './LottiePlayer';
import PlayPauseButton from './playPauseBtn'; // Import the new button component
import './PlayerUI.css';

const PlayerUI = ({ animationData, version }) => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const animationRef = useRef(null);

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const updateProgress = (value) => {
        setProgress(value);
        if (animationRef.current) {
            const frame = animationRef.current.totalFrames * value;
            animationRef.current.goToAndStop(frame, true);
        }
    };

    return (
        <div className="playbackContainer">
            <LottiePlayer
                animationData={animationData}
                version={version}
                isPlaying={isPlaying}
                progress={progress}
                animationRef={animationRef} // Pass the ref to LottiePlayer
            />
            <div className="player-controls">
                {/* Replace the previous button with PlayPauseButton */}
                <PlayPauseButton
                    size={100}
                    animationPath="/lottieUIElements/playPauseBtn.json"
                    onToggle={togglePlay}
                />
                {/* Slider control for animation progress */}
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

export default PlayerUI;
