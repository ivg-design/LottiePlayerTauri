import React, { useState, useRef, useEffect, useCallback } from 'react';
import LottiePlayer from './LottiePlayer';
import './PlayerUI.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import { ReactComponent as ProgressBar } from './svgUIelements/progressBar.svg';
import { ReactComponent as ProgressBarHandle } from './svgUIelements/progressBarHandle.svg';

const PlayerUI = ({ animationData, version }) => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const animationRef = useRef(null);
    const progressBarRef = useRef(null);

    useEffect(() => {
        if (animationRef.current) {
            isPlaying ? animationRef.current.play() : animationRef.current.pause();
        }
    }, [isPlaying]);


    useEffect(() => {
        if (animationRef.current) {
            const frame = Math.floor(animationRef.current.totalFrames * progress);
            animationRef.current.goToAndStop(frame, true);
        }
    }, [progress]);

    const togglePlay = () => setIsPlaying(!isPlaying);

    const setProgressFromEvent = useCallback((e) => {
        if (progressBarRef.current) {
            const bounds = progressBarRef.current.getBoundingClientRect();
            const newProgress = (e.clientX - bounds.left) / bounds.width;
            setProgress(Math.min(Math.max(0, newProgress), 1));
        } else {
            console.log('progressBarRef.current is null during setProgressFromEvent');
        }
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (progressBarRef.current) {
            setProgressFromEvent(e);
        } else {
            console.log('progressBarRef.current is null during handleMouseMove');
        }
    }, [setProgressFromEvent]);

    const handleMouseUp = useCallback(() => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);

    const handleMouseDown = useCallback((event) => {
        event.preventDefault();
        setProgressFromEvent(event);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [setProgressFromEvent, handleMouseMove, handleMouseUp]);

    // Function to update progress when animation updates
    const handleAnimationUpdate = (animationProgress) => {
        setProgress(animationProgress);
    };

    return (
        <div className="playbackContainer">
            <LottiePlayer
                animationData={animationData}
                version={version}
                isPlaying={isPlaying}
                progress={progress}
                animationRef={animationRef}
                onEnterFrame={({ currentTime, totalTime }) => handleAnimationUpdate(currentTime / totalTime)}
            />
            <div className="player-controls">
                <button
                    className={isPlaying ? 'playBtn' : 'pauseBtn'}
                    onClick={togglePlay}
                >
                    <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
                    {isPlaying ? ' Pause' : ' Play'}
                </button>
                <div
                    className="progress-bar-container"
                    ref={progressBarRef}
                    onMouseDown={handleMouseDown}
                >
                    <ProgressBar className="progress-bar-svg" />
                    <ProgressBarHandle
                        className="progress-bar-handle"
                        style={{ left: `${progress * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default PlayerUI;
