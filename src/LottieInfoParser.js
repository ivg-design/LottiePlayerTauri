// LottieInfoParser.js
import React from 'react';

const LottieInfoParser = ({ animationData }) => {
	if (!animationData) {
		return <div>No Animation Data</div>;
	}

	// Calculating the size of the JSON data
	const animationSizeKB = JSON.stringify(animationData).length / 1024;

	// Extracting necessary information from the animationData
	const framerate = animationData.fr || 'Not specified';
	const durationFrames = animationData.op || 0;
	const durationSeconds = durationFrames / framerate;
	const markersExist = animationData.markers && animationData.markers.length > 0 ? 'YES' : 'NO';
	const nativeDimensions = animationData.w && animationData.h ? `${animationData.w} x ${animationData.h}` : 'Not specified';

	return (
		<React.Fragment>
			<div>Animation Size:</div>
			<div>{animationSizeKB.toFixed(2)}KB</div>
			<div>Framerate:</div>
			<div>{framerate}fps</div>
			<div>Duration (seconds):</div>
			<div>{durationSeconds.toFixed(2)} s.</div>
			<div>Duration (frames):</div>
			<div>{durationFrames} fr.</div>
			<div>Markers Exist:</div>
			<div>{markersExist}</div>
			<div>Native Dimensions:</div>
			<div>{nativeDimensions}</div>
			
		</React.Fragment>
	);
};

export default LottieInfoParser;
