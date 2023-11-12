import React, { useState, useRef, useEffect, useCallback } from 'react';
import LottiePlayer from './LottiePlayer';
import './PlayerUI.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faPalette, faInfoCircle, faDiagramPredecessor, faCodeCompare, faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { ReactComponent as ProgressBar } from './svgUIelements/progressBar.svg';
import { ReactComponent as ProgressBarHandle } from './svgUIelements/progressBarHandle.svg';
import ColorPicker from 'react-best-gradient-color-picker';
import LottieInfoParser from './LottieInfoParser';
import LottieTreeParser from './LottieTreeParserN';

const isLoggingEnabled = true;  // Set to false to disable logging

// ERROR LOGGING
function log(...messages) {
    if (isLoggingEnabled) {
        console.log(...messages);
    }
}

const PlayerUI = ({ animationData, version, fileSize }) => {
    const animationRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const progressBarRef = useRef(null);
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [background, setBackground] = useState('linear-gradient(180deg, #3B3D4B 0%, #272934 100%)');
    const [initialColor, setInitialColor] = useState(background);
    const [showInfoOverlay, setShowInfoOverlay] = useState(false);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [markers, setMarkers] = useState([]);
    const [showMarkers, setShowMarkers] = useState(false);
    const [animationDetails, setAnimationDetails] = useState({
        framerate: 0,
        durationFrames: 0,
        durationSeconds: 0,
    });
    const [isTreeModalVisible, setIsTreeModalVisible] = useState(false);
    const toggleTreeModal = () => {
        setIsTreeModalVisible(!isTreeModalVisible);
    };
    const [markerStartFrame, setMarkerStartFrame] = useState(null);


    // ************** Markers **************
        useEffect(() => {
            if (animationData && animationData.markers) {
                setMarkers(animationData.markers.map(marker => ({
                    name: marker.cm,
                    startFrame: marker.tm,
                    endFrame: marker.tm + marker.dr
                })));
            }
        }, [animationData]);

        const playMarker = (startFrame, endFrame) => {
            if (animationRef.current) {
                animationRef.current.playSegments([startFrame, endFrame], true);
                setMarkerStartFrame(startFrame); // Track the start frame of the marker
            }
        };
        
        // Function to reset the animation playback
        const resetAnimationPlayback = () => {
            if (animationRef.current) {
                animationRef.current.playSegments([0, animationRef.current.totalFrames], true);
                setMarkerStartFrame(null); // Reset the marker start frame
            }
        };

    // ************* Color Picker **************
        const toggleColorPicker = (e) => {
            e.stopPropagation();
            if (!isPickerVisible) {
                setInitialColor(background);
            }
            setIsPickerVisible(!isPickerVisible);
        };

        const closeAndRevertColorPicker = () => {
            setBackground(initialColor);
            setIsPickerVisible(false);
        };

        const handleColorChange = (newColor) => {
            setBackground(newColor);
        };

        const closeColorPicker = () => {
            setIsPickerVisible(false);
        };

        const handleModalClick = (e) => {
            e.stopPropagation();
        };

        const handleApplyColorPicker = () => {
            setBackground(background);
            setIsPickerVisible(false);
        };

        useEffect(() => {
            document.addEventListener('click', closeColorPicker);
            return () => {
                document.removeEventListener('click', closeColorPicker);
            };
        }, []);

    // ************* Progress Bar **************
        const setProgressFromEvent = useCallback((e) => {
            if (progressBarRef.current) {
                const bounds = progressBarRef.current.getBoundingClientRect();
                const newProgress = (e.clientX - bounds.left) / bounds.width;
                setProgress(Math.min(Math.max(0, newProgress), 1));
            }
        }, []);

        const handleMouseMove = useCallback((e) => {
            setProgressFromEvent(e);
        }, [setProgressFromEvent]);

        const handleMouseUp = useCallback(() => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }, [handleMouseMove]);

        const handleMouseDown = useCallback((event) => {
            event.preventDefault();
            setIsPlaying(false);
            setProgressFromEvent(event);
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }, [setProgressFromEvent, handleMouseMove, handleMouseUp]);

    // ************* Animation Control **************
        const togglePlay = () => {
            setIsPlaying(!isPlaying);
        };

        const handleAnimationDataParsed = useCallback((details) => {
            setAnimationDetails(details);
            log(details);
            // Additional logic if needed, markers are already set in the above useEffect
        }, []);
    
        useEffect(() => {
            if (animationRef.current) {
                if (isPlaying) {
                    animationRef.current.play();
                } else {
                    animationRef.current.pause();
                }
            }
        }, [isPlaying]);

        const handleAnimationUpdate = useCallback((animationProgress) => {
            setProgress(animationProgress);
        }, []);

        useEffect(() => {
            if (animationRef.current && !isPlaying) {
                const frame = Math.floor(animationRef.current.totalFrames * progress);
                animationRef.current.goToAndStop(frame, true);
            }
        }, [progress, isPlaying]);



        useEffect(() => {
            const handleFrameChange = () => {
                if (animationRef.current) {
                    let frame = animationRef.current.currentFrame;

                    // If playing a marker, adjust the frame to be relative to the marker's start
                    if (markerStartFrame !== null) {
                        frame = frame + markerStartFrame;
                    }

                    setCurrentFrame(Math.round(frame));
                    setCurrentTime((frame / animationDetails.framerate).toFixed(2));
                }
            };

            if (animationRef.current) {
                animationRef.current.addEventListener('enterFrame', handleFrameChange);
            }

            return () => {
                if (animationRef.current) {
                    animationRef.current.removeEventListener('enterFrame', handleFrameChange);
                }
            };
        }, [animationDetails.framerate, markerStartFrame]);

        // Prevent default behavior on mouse down to stop text selection cursor
        const handleMouseDownPreventDefault = (event) => {
            event.preventDefault();
        };

    // ************* Info Overlay **************
        const toggleInfoOverlay = () => {
            setShowInfoOverlay(!showInfoOverlay);
        };

    // ************* UI Render **************
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
                        <LottieInfoParser animationData={animationData} fileSize={fileSize} onParsed={handleAnimationDataParsed} />
                    )}
                </div>
                <div className={`progressInfoBox noSelect ${showInfoOverlay ? '' : 'hidden'}`}>
                    <div>Current Time: </div>
                    <div>{currentTime} s</div>
                    <div>Current Frame: </div>
                    <div>{currentFrame}</div>
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
                    <button onClick={toggleColorPicker} className="colorPickerButton noSelect">
                        <FontAwesomeIcon icon={faPalette} className="icon-large" />
                    </button>
                    <button onClick={toggleInfoOverlay} className="infoButton noSelect">
                        <FontAwesomeIcon icon={faInfoCircle} className="icon-large" />
                    </button>

                    {/* New Diagram Predecessor button */}
                    <button className="markersButton noSelect" onClick={() => setShowMarkers(!showMarkers)}>
                        <FontAwesomeIcon icon={faDiagramPredecessor} className="icon-large" />
                    </button>
                    {showMarkers && (
                        <div className="modalBackdrop" onClick={() => setShowMarkers(false)}>
                            <div className="markersModal" onClick={e => e.stopPropagation()}>
                                <table className="markersTable">
                                    <thead>
                                        <tr>
                                            <th>Marker</th>
                                            <th>Start Frame</th>
                                            <th>End Frame</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {markers.map((marker, index) => (
                                            <tr key={index} onClick={() => playMarker(marker.startFrame, marker.endFrame)}>
                                                <td>{marker.name}</td>
                                                <td>{marker.startFrame}</td>
                                                <td>{marker.endFrame}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <button onClick={resetAnimationPlayback} className="resetButton">
                                    <FontAwesomeIcon icon={faArrowRotateLeft} /> Reset Marker
                                </button>
                            </div>
                        </div>
                    )}
                    {/* New Code Compare button */}
                    <button className="segmentsButton noSelect" onClick={toggleTreeModal}>
                        <FontAwesomeIcon icon={faCodeCompare} className="icon-large" />
                    </button>

                    {isTreeModalVisible && (
                        <LottieTreeParser
                            animationData={animationData}
                            onClose={toggleTreeModal} // Pass the function to close the modal
                        />
                    )}

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
        );

};

export default PlayerUI;