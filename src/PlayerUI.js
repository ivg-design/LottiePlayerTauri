import React, { useState, useRef, useEffect, useCallback } from 'react';
import LottiePlayer from './LottiePlayer';
import './PlayerUI.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import { ReactComponent as ProgressBar } from './svgUIelements/progressBar.svg';
import { ReactComponent as ProgressBarHandle } from './svgUIelements/progressBarHandle.svg';
import {enableDebugging, disableDebugging, debugLog} from './debugger.js';

// enable imported debug logger
enableDebugging();

const PlayerUI = ({ animationData, version, }) => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const animationRef = useRef(null);
    const progressBarRef = useRef(null);

    // Play or pause the animation based on isPlaying state
    useEffect(() => {
        // This will run when the `isPlaying` state changes.
        if (animationRef.current) {
            debugLog('Toggling play state to:', isPlaying);
            if (isPlaying) {
                debugLog('Playing animation');
                animationRef.current.play();
            } else {
                debugLog('Pausing animation');
                animationRef.current.pause();
            }
        }
    }, [isPlaying]);

    // Function to update progress when animation updates
    const handleAnimationUpdate = useCallback((animationProgress) => {
        setProgress(animationProgress);
    }, []);
    // Toggle play state
    const togglePlay = () => {
        debugLog('Toggling play. Current state is: ', isPlaying);;
        setIsPlaying(!isPlaying);
    };

    // Update the animation frame based on progress
    useEffect(() => {
        debugLog('useEffect for progress', progress);
        if (animationRef.current && !isPlaying) {
            const frame = Math.floor(animationRef.current.totalFrames * progress);
            debugLog(`Going to frame ${frame}`);
            animationRef.current.goToAndStop(frame, true);
            debugLog("frame is ", frame)
        }
    }, [progress]);

    // Update progress from mouse events
    const setProgressFromEvent = useCallback((e) => {
        if (progressBarRef.current) {
            const bounds = progressBarRef.current.getBoundingClientRect();
            const newProgress = (e.clientX - bounds.left) / bounds.width;
            setProgress(Math.min(Math.max(0, newProgress), 1));
        } else {
            debugLog('progressBarRef.current is null during setProgressFromEvent');
        }
    }, []);

    // Mouse event handlers
    const handleMouseMove = useCallback((e) => {
        debugLog('Handling mouse move');
        setProgressFromEvent(e);
    }, [setProgressFromEvent]);

    const handleMouseUp = useCallback(() => {
        debugLog('Mouse up, removing event listeners');
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);

    const handleMouseDown = useCallback((event) => {
        event.preventDefault();
        setIsPlaying(false); // Pause the animation when dragging starts
        setProgressFromEvent(event);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [setProgressFromEvent, handleMouseMove, handleMouseUp]);





    return (
        <div className="playbackContainer">
            <LottiePlayer
                animationData={animationData}
                version={version}
                isPlaying={isPlaying}
                progress={progress}
                animationRef={animationRef}
                onEnterFrame={handleAnimationUpdate}
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
