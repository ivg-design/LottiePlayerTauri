import React, { useState, useRef, useEffect, useCallback } from 'react';
import LottiePlayer from './LottiePlayer';
import './PlayerUI.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faPalette, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { ReactComponent as ProgressBar } from './svgUIelements/progressBar.svg';
import { ReactComponent as ProgressBarHandle } from './svgUIelements/progressBarHandle.svg';
import { enableDebugging, debugLog } from './debugger.js';
import ColorPicker from 'react-best-gradient-color-picker';
import LottieInfoParser from './LottieInfoParser';


// enable imported debug logger
enableDebugging();

const PlayerUI = ({ animationData, version }) => {
    const animationRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const progressBarRef = useRef(null);
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [background, setBackground] = useState('linear-gradient(180deg, #3B3D4B 0%, #272934 100%)');
    const [initialColor, setInitialColor] = useState(background); // Store initial color before opening picker
    const [showInfoOverlay, setShowInfoOverlay] = useState(false);

    // Function to toggle the visibility of the info overlay
    const toggleInfoOverlay = () => {
        setShowInfoOverlay(!showInfoOverlay);
    };

    // Prevent default behavior on mouse down to stop text selection cursor
    const handleMouseDownPreventDefault = (event) => {
        event.preventDefault();
    };

    // Play or pause the animation based on isPlaying state
    useEffect(() => {
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

    // Update progress when animation updates
    const handleAnimationUpdate = useCallback((animationProgress) => {
        setProgress(animationProgress);
    }, []);

    // Toggle play state
    const togglePlay = () => {
        debugLog('Toggling play. Current state is: ', isPlaying);
        setIsPlaying(!isPlaying);
    };

    // Update the animation frame based on progress
    useEffect(() => {
        debugLog('useEffect for progress', progress);
        if (animationRef.current && !isPlaying) {
            const frame = Math.floor(animationRef.current.totalFrames * progress);
            debugLog(`Going to frame ${frame}`);
            animationRef.current.goToAndStop(frame, true);
        }
    }, [progress, isPlaying]);

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

    // Open the color picker and store the current color
    const toggleColorPicker = (e) => {
        e.stopPropagation();
        if (!isPickerVisible) {
            setInitialColor(background); // Store the current color before opening the picker
        }
        setIsPickerVisible(!isPickerVisible);
    };

    // Close the color picker and revert to the initial color
    const closeAndRevertColorPicker = () => {
        setBackground(initialColor); // Revert to the color before the picker was opened
        setIsPickerVisible(false);
    };
    // Handle color changes
    const handleColorChange = (newColor) => {
        setBackground(newColor);
    };

    // Close the color picker
    const closeColorPicker = () => {
        setIsPickerVisible(false);
    };

    // Stop propagation when clicking inside the modal
    const handleModalClick = (e) => {
        e.stopPropagation();
    };

    const handleApplyColorPicker = () => {
        setBackground(background);
        setIsPickerVisible(false);
    }

    useEffect(() => {
        document.addEventListener('click', closeColorPicker);
        return () => {
            document.removeEventListener('click', closeColorPicker);
        };
    }, []);

    return (
        <div className="playbackContainer" style={{ background: background }}
            onMouseDown={handleMouseDownPreventDefault}>
            
            <LottiePlayer
                animationData={animationData}
                version={version}
                isPlaying={isPlaying}
                progress={progress}
                animationRef={animationRef}
                onEnterFrame={handleAnimationUpdate}
            />
            <div className={`infoOverlay noSelect ${showInfoOverlay ? '' : 'hidden'}`}>
                {showInfoOverlay && (
                    <LottieInfoParser animationData={animationData} />        
                )}
            </div>
            <div className="player-controls noSelect">
                <button
                    className={isPlaying ? 'playBtn noSelect' : 'pauseBtn noSelect'}
                    onClick={togglePlay}
                >
                    <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
                    {isPlaying ? ' Pause' : ' Play'}
                </button>
                <div
                    className="progress-bar-container noSelect"
                    ref={progressBarRef}
                    onMouseDown={handleMouseDown}
                >
                    <ProgressBar className="progress-bar-svg noSelect" />
                    <ProgressBarHandle
                        className="progress-bar-handle noSelect"
                        style={{ left: `${progress * 100}%` }}
                    />
                </div>
                <div className="colorPickerContainer">
                    <button onClick={toggleColorPicker} className="colorPickerButton noSelect">
                        <FontAwesomeIcon icon={faPalette} className="icon-large" />
                    </button>
                    <button onClick={toggleInfoOverlay} className="infoButton noSelect">
                        <FontAwesomeIcon icon={faInfoCircle} className = "icon-large" />
                    </button>
                    {isPickerVisible && (
                        <div className="colorPickerModal noSelect" onClick={handleModalClick} style={{ backgroundColor: 'white' }}>
                            <ColorPicker
                                value={background}
                                onChange={handleColorChange}
                            />
                            <button onClick={handleApplyColorPicker} className="applyColorPicker noSelect">
                                Apply
                            </button>
                            <button onClick={closeAndRevertColorPicker} className="closeColorPicker noSelect">
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlayerUI;
