import React, { useEffect } from 'react';
const isLoggingEnabled = true;  // Set to false to disable logging

//ERROR LOGGING
function log(...messages) {
	if (isLoggingEnabled) {
		console.log(...messages);
	}
}

const LottieInfoParser = ({ animationData, fileSize, onParsed }) => {
	useEffect(() => {
		if (animationData) {
			// Parse the animation data and calculate necessary details
			const framerate = animationData.fr || 'Not specified';
			const durationFrames = animationData.op || 0;
			const durationSeconds = (animationData.op / animationData.fr) || 0;
			const markersExist = animationData.markers && animationData.markers.length > 0 ? 'YES' : 'NO';
			const nativeDimensions = `${animationData.w} x ${animationData.h}`;

			// Extract markers if present
			const markers = animationData.markers ? animationData.markers.map(marker => ({
				name: marker.cm, // Use 'cm' for marker name
				startFrame: marker.tm, // Use 'tm' for start frame/time
				endFrame: marker.tm + marker.dr // Calculate end frame using 'tm' and 'dr'
			})) : [];
			log(markers);

			// Recursive function to parse layer information
			const parseLayers = (layers, level = 0) => {
				return layers.map(layer => {
					const layerInfo = {
						name: layer.nm,
						type: layer.ty, // Determine layer type
						inPoint: layer.ip,
						outPoint: layer.op,
						animatedProperties: layer.ks, // Example: keyframes
						level: level
					};

					if (layer.ty === 'precomp' && layer.layers) {
					layerInfo.sublayers = parseLayers(layer.layers, level + 1);
				}

				return layerInfo;
			});
};

const layersHierarchy = parseLayers(animationData.layers);

// If an onParsed callback is provided, call it with the parsed details
if (onParsed) {
	onParsed({
		framerate,
		durationFrames,
		durationSeconds,
		markersExist,
		nativeDimensions,
		markers,
		layersHierarchy
	});
}
        }
    }, [animationData, onParsed]);

	// Return JSX to display the parsed details
	return (
		<React.Fragment>
			<div>Animation Size:</div>
			<div>{fileSize ? `${fileSize.toFixed(2)} KB` : 'Calculating...'}</div>
			<div>Framerate:</div>
			<div>{typeof animationData.fr === 'number' ? `${animationData.fr} fps` : 'Not specified'}</div>
			<div>Duration (seconds):</div>
			<div>{typeof animationData.fr === 'number' ? `${(animationData.op / animationData.fr).toFixed(2)} s` : 'Not specified'}</div>
			<div>Duration (frames):</div>
			<div>{animationData.op || 'Not specified'} fr.</div>
			<div>Markers Exist:</div>
			<div>{animationData.markers && animationData.markers.length > 0 ? 'YES' : 'NO'}</div>
			<div>Native Dimensions:</div>
			<div>{animationData.w && animationData.h ? `${animationData.w} x ${animationData.h}` : 'Not specified'}</div>
		</React.Fragment>
	);
};

export default LottieInfoParser;
