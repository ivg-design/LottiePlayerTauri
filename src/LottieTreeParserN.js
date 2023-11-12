import React, { useState, useEffect } from 'react';
import { Tree } from 'react-d3-tree';
import './LottieTreeParser.css';

const propertyKeyMapping = {
    // Global layer properties
    'nm': { name: 'Name', type: 'string' }, // Name of the object
    'ty': { name: 'Type', type: 'integer' }, // Type of layer (0: 'Precomp', 1: 'Solid', etc.)
    'mn': { name: 'Match Name', type: 'string' }, // Internal AE match name
    'ddd': { name: '3D Layer', type: 'boolean' }, // Indicates 3D (0: not 3D, 1: 3D)
    'ip': { name: 'In Point', type: 'integer' }, // In point frame number
    'op': { name: 'Out Point', type: 'integer' }, // Out point frame number
    'w': { name: 'Width', type: 'integer' }, // Width in pixels
    'h': { name: 'Height', type: 'integer' }, // Height in pixels
    'fr': { name: 'Frame Rate', type: 'integer' }, // Frame rate
    'ind': { name: 'Index', type: 'integer' }, // Layer index

    // Transform properties (ks)
    'ks': {
        'p': { name: 'Position', type: 'array' },
        's': { name: 'Scale', type: 'array' },
        'r': { name: 'Rotation', type: 'integer' },
        'a': { name: 'Anchor Point', type: 'array' },
        'o': { name: 'Opacity', type: 'integer' }
    },

    // Shape layer properties
    'rc': { name: 'Rectangle', type: 'string' },
    'el': { name: 'Ellipse', type: 'string' },
    'sr': { name: 'Polygon / Star', type: 'string' },
    'sh': { name: 'Path', type: 'string' },
    'fl': { name: 'Fill', type: 'string' },
    'st': { name: 'Stroke', type: 'string' },
    'gf': { name: 'Gradient Fill', type: 'string' },
    'gs': { name: 'Gradient Stroke', type: 'string' },
    'gr': { name: 'Group', type: 'string' },

    // Shape transform properties (tr)
    'tr': {
        'p': { name: 'Position', type: 'array' },
        's': { name: 'Scale', type: 'array' },
        'r': { name: 'Rotation', type: 'integer' },
        'a': { name: 'Anchor Point', type: 'array' },
        'o': { name: 'Opacity', type: 'integer' },
        'sk': { name: 'Skew', type: 'integer' },
        'sa': { name: 'Skew Axis', type: 'integer' }
    },

    // Text layer properties (when parent is 's')
    's': {
        's': { name: 'Size', type: 'integer' },
        'f': { name: 'Font Family', type: 'string' },
        't': { name: 'Text Content', type: 'string' },
        'ca': { name: 'All Caps', type: 'boolean' },
        'j': { name: 'Justify', type: 'integer' },
        'tr': { name: 'Tracking', type: 'integer' },
        'lh': { name: 'Line Height', type: 'integer' },
        'ls': { name: 'Baseline Shift', type: 'integer' },
        'fc': { name: 'Font Color', type: 'array' },
        'sc': { name: 'Stroke Color', type: 'array' }
    }
    // Add more mappings as needed for other specific properties and contexts
};
const parseProperties = (properties, context = '') => {
    const parsed = {};
    for (const key in properties) {
        if (!properties.hasOwnProperty(key)) continue;

        const propertyContext = context ? context[key] : propertyKeyMapping[key];
        if (propertyContext) {
            if (typeof propertyContext === 'object' && propertyContext.type === 'object') {
                // Recursive parsing for nested objects
                parsed[propertyContext.name] = parseProperties(properties[key], propertyContext);
            } else if (Array.isArray(properties[key])) {
                // Recursive parsing for arrays
                parsed[propertyContext.name] = properties[key].map(item => {
                    if (typeof item === 'object') {
                        return parseProperties(item, context);
                    }
                    return item;
                });
            } else {
                // Direct mapping for simple properties
                const propertyName = propertyContext.name || key;
                parsed[propertyName] = properties[key];
            }
        } else {
            // Default handling for unmapped keys
            if (typeof properties[key] === 'object' && properties[key] !== null) {
                // Recursive parsing for unmapped nested objects
                parsed[key] = parseProperties(properties[key]);
            } else {
                parsed[key] = properties[key];
            }
        }
    }
    return parsed;
};

/**************** LAYER PARSING HADNLERS **************/

const parseLayerTransforms = (layer) => {
    const parsedTransforms = {
        Name: layer.nm,
        Type: propertyKeyMapping[layer.ty]?.name || `Type ${layer.ty}`,
        InPoint: layer.ip,
        OutPoint: layer.op
    };

    // Parse keyframe transform properties
    for (const key in layer.ks) {
        const propertyInfo = propertyKeyMapping.ks[key];
        if (propertyInfo) {
            const propertyName = propertyInfo.name || key;
            const transformProperty = layer.ks[key];

            // Check if the property is keyframed
            if (transformProperty.a === 1) {
                // Property is keyframed; parse each keyframe
                parsedTransforms[propertyName] = transformProperty.k.map(keyframe => {
                    // Parse each keyframe object
                    return keyframe;
                });
            } else {
                // Static property; not keyframed
                parsedTransforms[propertyName] = transformProperty.k;
            }
        } else {
            // Default handling for unmapped keys
            parsedTransforms[key] = layer.ks[key];
        }
    }

    return parsedTransforms;
};
const parseShapeLayer = (layer) => {
    const parseShapeProperties = (shape) => {
        const parsedShape = { Name: shape.nm, Type: propertyKeyMapping[shape.ty]?.name || shape.ty };

        for (const key in shape) {
            if (shape.hasOwnProperty(key)) {
                const propertyInfo = propertyKeyMapping[key];
                if (propertyInfo) {
                    const propertyName = propertyInfo.name || key;
                    parsedShape[propertyName] = shape[key];
                } else {
                    parsedShape[key] = shape[key];
                }
            }
        }

        return parsedShape;
    };

    return {
        ...parseLayerTransforms(layer),
        Shapes: layer.shapes.map(parseShapeProperties)
    };
};
const parseTextLayer = (layer) => {
    const parseTextData = (textData) => {
        const parsedTextData = {};
        for (const key in textData) {
            if (textData.hasOwnProperty(key)) {
                const propertyInfo = propertyKeyMapping[key] || propertyKeyMapping['s'][key];
                if (propertyInfo) {
                    const propertyName = propertyInfo.name || key;
                    parsedTextData[propertyName] = textData[key];
                } else {
                    parsedTextData[key] = textData[key];
                }
            }
        }
        return parsedTextData;
    };

    return {
        ...parseLayerTransforms(layer),
        TextData: parseTextData(layer.t.d)
    };
};
// Main function to parse layers based on their type
const parseLayers = (layers) => {
    return layers.map(layer => {
        switch (layer.ty) {
            case 4: // Shape Layer
                return parseShapeLayer(layer);
            case 5: // Text Layer
                return parseTextLayer(layer);
            default:
                // For all other layer types, parse only the keyframe transform properties
                return parseLayerTransforms(layer);
        }
    });
};

const LottieDataParser = ({ animationData, onClose }) => {
    const [treeData, setTreeData] = useState(null);

    useEffect(() => {
        if (animationData) {
            const parsedData = parseLayers(animationData.layers);
            console.log('Parsed Lottie Data:', parsedData); // Log the parsed data

            setTreeData([{
                name: 'Lottie Animation',
                children: parsedData
            }]);
        }
    }, [animationData]);

    const renderCustomNodeElement = ({ nodeDatum, toggleNode }) => (
        <g>
            <circle r={15} onClick={toggleNode} />
            <text fill="black" strokeWidth="1" x="20" y="5">
                {nodeDatum.name}
            </text>
            {/* Additional custom rendering logic */}
        </g>
    );

    return (
        <div className="modalBackdrop">
            <div className="modalContent">
                <button onClick={onClose}>Close</button>
                {treeData && (
                    <div className="treeContainer">
                        <Tree
                            data={treeData}
                            translate={{ x: 300, y: 200 }}
                            scaleExtent={{ min: 0.1, max: 1 }}
                            nodeSize={{ x: 200, y: 100 }}
                            orientation="vertical"
                            renderCustomNodeElement={renderCustomNodeElement}
                            pathFunc="straight"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default LottieDataParser;