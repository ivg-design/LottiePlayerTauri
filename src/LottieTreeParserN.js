import React, { useState, useEffect } from 'react';
import './LottieTreeParser.css';

//TODO: retrieve information base information about the animation its name and duration in frames and seconds, set that info as the root node of the tree

const parseKeyframe = (keyframe) => {
    return {
        frame: keyframe.t,
        value: keyframe.s.map(value => parseFloat(value.toFixed(2)))
    };
};


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
    },
    layerTypes: {
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
    },
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

// Function to format the keyframe data for animated properties
const formatKeyframes = (keyframes) => {
    return keyframes.map(kf => {
        const frame = kf.t;
        const value = kf.s.map(v => parseFloat(v.toFixed(2))); // Ensure values have at most 2 decimal places
        return { frame, value };
    });
};

// Function to handle both static and animated properties
const parseProperty = (property) => {
    if (property.a === 1 && Array.isArray(property.k)) { // Check if property is animated
        const formattedKeyframes = formatKeyframes(property.k);
        // Create an array of startKey/endKey pairs
        return formattedKeyframes.map((kf, index, array) => {
            const nextKf = array[index + 1] || null;
            return {
                startKey: { frame: kf.frame, value: kf.value },
                endKey: nextKf ? { frame: nextKf.frame, value: nextKf.value } : null
            };
        });
    } else {
        // Static property; not keyframed
        const value = Array.isArray(property.k)
            ? property.k.map(v => parseFloat(v.toFixed(2))) // Ensure values have at most 2 decimal places
            : property.k;
        return { frame: 0, value }; // Static values are at frame 0
    }
};

// Modify the parseLayerTransforms function to use the new parseProperty function
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

            // Now use the parseProperty function to parse the property
            parsedTransforms[propertyName] = parseProperty(transformProperty);
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

/**************** MAIN FUNCTION **************/
// Updated parseLayers function to handle precomp layers
const parseLayers = (layers) => {
    return layers.map(layer => {
        if (layer.ty === 0) { // Precomp Layer
            return {
                ...parseLayerTransforms(layer),
                LayerType: propertyKeyMapping.layerTypes[layer.ty],
                precomp_contents: parseLayers(layer.layers) // Recursively parse nested layers
            };
        }

        switch (layer.ty) {
            case 4: // Shape Layer
                return parseShapeLayer(layer);
            case 5: // Text Layer
                return parseTextLayer(layer);
            default:
                return {
                    ...parseLayerTransforms(layer),
                    LayerType: propertyKeyMapping.layerTypes[layer.ty] || `Unknown Type (${layer.ty})`,
                };
        }
    });
};

// Helper function to check if the property is animated and to format values
const formatValue = (value) => {
    // Check if the value is a number and format it
    if (typeof value === 'number') {
        return Number(value.toFixed(2));
    }
    // If the value is an array, format each element
    if (Array.isArray(value)) {
        return value.map(formatValue);
    }
    // If the value is an object, check for an animated property which is usually indicated by an 'a' key with value 1
    if (typeof value === 'object' && value !== null) {
        if (value.a === 1) {
            // Format the keyframe values (assuming they are in an array under the 'k' key)
            return `Animated: ${value.k.map(kf => formatValue(kf)).join(', ')}`;
        } else {
            // If it's a complex object, we may need to handle it according to the expected structure
            // For now, let's try to JSON stringify the object
            return JSON.stringify(value);
        }
    }
    // Return the value as is if it's neither an array nor an object
    return value;
};

// Function to create a node for the tree
const createNode = (item, depth = 0) => {
    // Check if the item is a layer and has a Name or Match Name, otherwise use 'Unnamed Node'
    const nodeName = item.Name || item.mn || 'Unnamed Node';
    // Determine the layer type
    const layerType = item.LayerType || '';
    // Create the node label
    const nodeLabel = `${nodeName} || (${layerType})`;

    // Create the base node object
    const node = {
        id: item.id || `node-${Math.random().toString(36).substr(2, 9)}`,
        Name: nodeLabel.trim(),
        children: [],
        isFolder: false
    };

    // Add the properties as children if they exist
    ['Position', 'Rotation', 'Opacity', 'Scale', 'Skew', 'Skew Axis'].forEach(prop => {
        if (item[prop] !== undefined) {
            node.children.push({
                id: `${node.id}-${prop}`,
                Name: `${prop}: ${formatValue(item[prop])}`,
                children: [],
                isFolder: false
            });
            node.isFolder = true; // Mark as a folder since it has children
        }
    });

    // Recursively add precomp_contents and Shapes if they exist
    if (item.precomp_contents) {
        node.children.push(...item.precomp_contents.map(child => createNode(child, depth + 1)));
        node.isFolder = true;
    } else if (item.Shapes) {
        node.children.push(...item.Shapes.map(shape => createNode(shape, depth + 1)));
        node.isFolder = true;
    }

    return node;
};


const convertToTreeStructure = (parsedData) => {
    return parsedData.map((layer, index) => createNode(layer, '', 0));
};

const PropertyRenderer = ({ property }) => {
    if (Array.isArray(property)) {
        return property.map((kf, index) => (
            <div key={index}>
                <div>startKey: frame: {kf.startKey.frame}, value: [{kf.startKey.value.join(', ')}]</div>
                {kf.endKey && <div>endKey: frame: {kf.endKey.frame}, value: [{kf.endKey.value.join(', ')}]</div>}
            </div>
        ));
    } else {
        return <div>Value: {property.value}</div>; // Static property
    }
};

const LottieTreeNode = ({ item, level = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasChildren = item.children && item.children.length > 0;
    const nodeClass = hasChildren ? 'treeNode folder' : 'treeNode leaf';

    const toggleExpand = () => {
        if (hasChildren) {
            setIsExpanded(!isExpanded);
        }
    };

    return (
        <div className={`node-level-${level}`}>
            <div className={nodeClass} onClick={toggleExpand} style={{ paddingLeft: `${level * 20}px` }}>
                {hasChildren && (
                    <span className="toggle">
                        {isExpanded ? '[-]' : '[+]'}
                    </span>
                )}
                <span className="nodeName">{item.Name || 'Unnamed Node'}</span>
            </div>
            {isExpanded && hasChildren && (
                <div style={{ paddingLeft: `${level * 20 + 20}px` }}>
                    {item.children.map((child, index) => (
                        // Check if the child is a property to be rendered
                        typeof child === 'object' && child.hasOwnProperty('frame') ?
                            <PropertyRenderer key={index} property={child} /> :
                            <LottieTreeNode key={child.id} item={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

const LottieTreeParser = ({ animationData, onClose }) => {
    const [treeData, setTreeData] = useState([]);

    useEffect(() => {
        if (animationData) {
            const parsedData = parseLayers(animationData.layers);
            console.log("Parsed Data:", parsedData);  // Log the parsed data
            const treeStructure = convertToTreeStructure(parsedData);
            setTreeData(treeStructure);
        }
    }, [animationData]);

    return (
        <div className="modalBackdrop">
            <div className="modalContent">
                <button onClick={onClose}>Close</button>
                <div className="treeContainer">
                    {console.log("Tree Data:", treeData)}
                    {treeData.map((item, index) => (
                        <LottieTreeNode
                            key={index}
                            item={item}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LottieTreeParser;