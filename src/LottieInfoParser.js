import React, { useEffect } from 'react';

// Map numerical layer types to descriptive names
const layerTypeMapping = {
	0: 'Precomp',
	1: 'Solid',
	2: 'Image',
	3: 'Null',
	4: 'Shape',
	5: 'Text',
	6: 'Audio',
	7: 'Video placeholder',
	8: 'Image sequence',
	9: 'Video',
	10: 'Image placeholder',
	11: 'Guide',
	12: 'Adjustment',
	13: 'Camera',
	14: 'Light',
	15: 'Data',
	// Add additional layer types as needed
};

// Map property keys to human-readable names
const propertyKeyMapping = {
	s: 'Start Value',
	e: 'End Value',
	i: 'In Tangent',
	o: 'Out Tangent',
	t: 'Time',
	a: 'Anchor Point',
	ix: 'Property Index',
	x: 'Expression',
	l: 'Length',
	d: "Dashes",
	k: 'Keyframes',
	ks: 'Transform',
	p: 'Position',
	r: 'Rotation',
	s: 'Scale',
	o: 'Opacity',
	c: 'Color',
	ty: 'Type',
	sk: 'Skew',
	sa: 'Skew Axis',
	rc: "Rectangle",
	el: "Ellipse",
	sr: "Polygon / Star",
	sh: "Path",
	fl: "Fill",
	st: "Stroke",
	gf: "Gradient fill",
	gs: "Gradient stroke",
	gr: "Group",
	tr: "Transform",
	st: "Stroke",
	// Add additional property mappings as needed
};

// Improved property parsing with context-specific handling of 'a' and 'k'
const parseProperties = (properties, parentKey = '') => {
	const parsed = {};
	for (const key in properties) {
		let readableKey = propertyKeyMapping[key] || key;

		// Context-specific renaming
		if (parentKey === 'ks') {
			if (key === 'p') readableKey = 'Position';
			else if (key === 'r') readableKey = 'Rotation';
			else if (key === 's') readableKey = 'Scale';
			else if (key === 'a') readableKey = 'Anchor Point';
			else if (key === 'o') readableKey = 'Opacity';
		} else {
			if (key === 'a') {
				readableKey = 'Animated';
				parsed[readableKey] = properties[key] === 1;
				continue;
			}
		}

		// Handle 'k' property based on the value of 'a'
		if (key === 'k') {
			if (properties.a === 1) {
				// 'k' contains arrays of keyframes
				parsed[readableKey] = properties[key];
			} else {
				// 'k' contains a static value
				parsed[readableKey] = Array.isArray(properties[key]) ? properties[key] : [properties[key]];
			}
		} else {
			parsed[readableKey] = properties[key];
		}
	}
	return parsed;
};

// ... rest of the shape and layer parsing functions remain the same

// Updated shape parsing to properly handle properties
const parseShapeProperties = (shapes) => {
	return shapes.map(shape => {
		const parsedShape = {
			name: shape.nm,
			type: shape.ty,
			properties: {}
		};

		// Parse each property in the shape
		for (const propKey in shape) {
			if (propKey === 'it') {
				parsedShape.properties = shape[propKey].map(item => parseProperties(item, propKey));
			} else {
				parsedShape.properties[propKey] = shape[propKey];
			}
		}

		return parsedShape;
	});
};

// Update layer parsing to handle shape properties
const parseLayers = (layers, level = 0) => {
	return layers.map(layer => {
		const parsedLayer = {
			name: layer.nm,
			type: layerTypeMapping[layer.ty] || `Type ${layer.ty}`,
			inPoint: layer.ip,
			outPoint: layer.op,
			level: level,
			properties: parseProperties(layer.ks, 'ks'),
			// sublayers: layer.layers ? parseLayers(layer.layers, level + 1) : []
		};

		if (layer.ty === 4) { // Shape layers
			parsedLayer.shapes = parseShapeProperties(layer.shapes);
		}

		return parsedLayer;
	});
};

const LottieInfoParser = ({ animationData, fileSize, onParsed }) => {
	useEffect(() => {
		if (animationData) {
			// Extract relevant data from animationData
			const layersHierarchy = parseLayers(animationData.layers);
			const durationFrames = animationData.op || 0;
			const durationSeconds = (animationData.op / animationData.fr) || 0;
			const markersExist = animationData.markers && animationData.markers.length > 0 ? 'YES' : 'NO';
			const nativeDimensions = `${animationData.w} x ${animationData.h}`;

			// Call onParsed with parsed details
			if (onParsed) {
				onParsed({
					durationFrames,
					durationSeconds,
					framerate: animationData.fr,
					layersHierarchy,
					markersExist,
					nativeDimensions
				});
			}
		}
	}, [animationData, onParsed]);

	if (!animationData) {
		return (
			<React.Fragment>
				<div>Please load a Lottie...</div>
			</React.Fragment>
		);
	}


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
