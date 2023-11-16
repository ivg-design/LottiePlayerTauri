import React, { useEffect, useState } from 'react';
import useLottieParser from './LottieParserN'; // Importing useLottieParser

const LottieInfoParser = ({ animationData, fileSize, onParsed }) => {
	const [parsedData, setParsedData] = useState(null);
	const { parseLottieJson } = useLottieParser(); // Call the hook at the top level

	useEffect(() => {
		if (animationData) {
			// Use useLottieParser directly as a function to parse the animation data
			const parsedAnimationData = parseLottieJson(animationData);
			setParsedData(parsedAnimationData);

			// Call onParsed with parsed details if needed
			if (onParsed) {
				onParsed(parsedAnimationData);
			}
		}
	}, [animationData, onParsed]);

	if (!animationData) {
		return <div>Please load a Lottie...</div>;
	}

	// Extract relevant data for display
	const durationFrames = parsedData?.BasicInfo?.DurationInFrames || 'Not specified';
	const durationSeconds = parsedData?.BasicInfo?.DurationInSeconds || 'Not specified';
	const framerate = parsedData?.BasicInfo?.FrameRate || 'Not specified';
	const markersExist = parsedData?.Markers && parsedData.Markers.length > 0 ? 'YES' : 'NO';
	const nativeDimensions = parsedData?.BasicInfo ? `${parsedData.BasicInfo.Width} x ${parsedData.BasicInfo.Height}` : 'Not specified';

	return (
		<React.Fragment>
			<div>Animation Size:</div>
			<div>{fileSize ? `${fileSize.toFixed(2)} KB` : 'Calculating...'}</div>
			<div>Framerate:</div>
			<div>{framerate} fps</div>
			<div>Duration (seconds):</div>
			<div>{durationSeconds} s</div>
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
