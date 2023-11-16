import React, { useState } from 'react';
import PropertyKeyMapping from './propertyKeyMapping';

const parseAssets = (assets) => {
    const assetProps = PropertyKeyMapping.assets.properties;

    return assets.map((asset) => {
        // Start with an empty object for each parsed asset
        const parsedAsset = {};

        // Loop through each property in the assetProps mapping
        Object.entries(assetProps).forEach(([key, { name, type }]) => {
            const value = asset[key];

            // Skip undefined values
            if (value !== undefined) {
                // Translate boolean 1/0 to 'YES'/'NO'
                if (type === 'boolean') {
                    parsedAsset[name] = value ? 'YES' : 'NO';
                } else {
                    parsedAsset[name] = value;
                }
            }
        });

        // Parse layers if they exist and are not an empty array
        // We need to assume there's a parseLayers function that correctly parses the layers
        if (asset.layers && asset.layers.length > 0) {
            parsedAsset.Layers = parseLayers(asset.layers);
        }

        return parsedAsset;
    }).filter(asset => Object.keys(asset).length > 0); // Filter out empty assets
};


// Function to parse all fonts
const parseFonts = (fontsList) => {
    // Access the font properties mapping from PropertyKeyMapping
    const fontProps = PropertyKeyMapping.fonts.properties.list.properties;

    return fontsList.map((font) => {
        // Map each font property based on the PropertyKeyMapping
        const parsedFont = Object.keys(fontProps).reduce((parsed, key) => {
            const propertyMapping = fontProps[key];
            const value = font[key];

            // Only add to parsedFont if the value is not undefined
            if (value !== undefined) {
                parsed[propertyMapping.name] = value;
            }

            return parsed;
        }, {});

        return parsedFont;
    }).filter(font => Object.keys(font).length > 0); // Filter out fonts that would be empty objects
};

// Function to parse all markers
const parseMarkers = (markers) => {
    const markerProps = PropertyKeyMapping.markers.properties;

    return markers.map(marker => {
        const parsedMarker = {
            "Time": marker.tm, // Accessing directly as 'tm'
            "Comment": marker.cm, // Accessing directly as 'cm'
            "Duration": marker.dr, // Accessing directly as 'dr'
            "ID": marker.id ? marker.id : 'Unknown ID', // Accessing directly as 'id', with a default value
        };

        return parsedMarker;
    });
};

const parseKeyframes = (property) => {
    // Check if keyframes are present
    if (property.a === 1 && Array.isArray(property.k)) {
        // Handle animated property with keyframes
        return property.k.map(kf => {
            const frame = kf.t; // Keyframe frame number
            const value = Array.isArray(kf.s) ? kf.s.map(v => parseFloat(v.toFixed(2))) : kf.s;
            // Add more properties from the keyframe as needed
            return { frame, value };
        });
    } else {
        // Handle static property without keyframes
        const value = Array.isArray(property.k) ? property.k.map(v => parseFloat(v.toFixed(2))) : property.k;
        return [{ frame: 0, value }]; // Return a single keyframe at frame 0
    }
};

const parseLayerTransforms = (layer) => {
    const parsedTransforms = {};

    // Directly map the known top-level properties using PropertyKeyMapping
    for (const key in PropertyKeyMapping) {
        const propertyMapping = PropertyKeyMapping[key];

        // Exclude 'ty' from direct mapping to avoid duplication with 'Layer Type'
        if (key !== 'ty' && layer[key] !== undefined) {
            parsedTransforms[propertyMapping.name] = propertyMapping.type === 'boolean'
                ? (layer[key] ? 'YES' : 'NO')
                : layer[key];
        }
    }

    // Parse the 'ks' (transform) properties if they exist
    if (layer.ks) {
        parsedTransforms.Transform = {};
        const transformProps = PropertyKeyMapping.ks.properties;

        for (const key in transformProps) {
            const transformMapping = transformProps[key];
            const transformValue = layer.ks[key];

            if (transformValue !== undefined) {
                // Parse keyframes or assign static values
                parsedTransforms.Transform[transformMapping.name] = typeof transformValue === 'object' && 'k' in transformValue
                    ? parseKeyframes(transformValue)
                    : transformValue;
            }
        }
    }

    // Set the Layer Type using the type mapping
    if (PropertyKeyMapping.ty && PropertyKeyMapping.ty.properties) {
        const typeMapping = PropertyKeyMapping.ty.properties[layer.ty];
        parsedTransforms['Layer Type'] = typeMapping ? typeMapping : `Unknown Type (${layer.ty})`;
    } else {
        parsedTransforms['Layer Type'] = `Unknown Type (${layer.ty})`;
    }

    return parsedTransforms;
};

// a function to parse the shape layer
const parseShapeLayer = (layer) => {
    // a function to parse the properties of a shape layer (including transforms) by mapping them to the propertyKeyMapping
    const parseShapeLayerProperties = (properties, context = PropertyKeyMapping) => {
        const parsed = {};
        for (const key in properties) {
            if (!properties.hasOwnProperty(key)) continue;

            const propertyContext = context.properties ? context.properties[key] : context[key];
            if (propertyContext) {
                if (propertyContext.type === 'object' && properties[key] !== null && typeof properties[key] === 'object') {
                    // Recursive parsing for nested objects
                    parsed[propertyContext.name || key] = parseShapeLayerProperties(properties[key], propertyContext);
                } else if (Array.isArray(properties[key])) {
                    // Recursive parsing for arrays
                    parsed[propertyContext.name || key] = properties[key].map(item => {
                        if (typeof item === 'object' && item !== null) {
                            return parseShapeLayerProperties(item, propertyContext);
                        }
                        return item;
                    });
                } else {
                    // Direct mapping for simple properties
                    parsed[propertyContext.name || key] = properties[key];
                }
            } else {
                // Default handling for unmapped keys
                if (typeof properties[key] === 'object' && properties[key] !== null) {
                    // Recursive parsing for unmapped nested objects
                    parsed[key] = parseShapeLayerProperties(properties[key]);
                } else {
                    parsed[key] = properties[key];
                }
            }
        }
        return parsed;
    };


    const parseShapeProperties = (shape) => {
        const parsedShape = parseShapeLayerProperties(shape);

        // Special handling for group type 'gr'
        if (shape.ty === 'gr') {
            parsedShape.Items = shape.it
                .filter(item => item.ty !== 'tr')
                .map(parseShapeProperties);

            const transformProperties = shape.it.find(item => item.ty === 'tr');
            if (transformProperties) {
                parsedShape.Transform = parseShapeLayerProperties(transformProperties, PropertyKeyMapping['shapeLayer'].properties['tr'].properties);
            }
        } else {
            // For non-group types, additional specific parsing logic can be included here
            // This section can handle specific cases unique to non-group types
            for (const key in shape) {
                if (shape.hasOwnProperty(key) && key !== 'it') {
                    const propertyInfo = PropertyKeyMapping[key];
                    if (propertyInfo) {
                        const propertyName = propertyInfo.name || key;
                        parsedShape[propertyName] = shape[key];
                    } else {
                        // If property is not in mapping, parse it as it is
                        parsedShape[key] = shape[key];
                    }
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

const parseTextLayer = (properties, context = PropertyKeyMapping) => {
    const parsed = {};
    for (const key in properties) {
        if (!properties.hasOwnProperty(key)) continue;

        const propertyContext = context.properties ? context.properties[key] : context[key];
        if (propertyContext) {
            if (propertyContext.type === 'object' && properties[key] !== null && typeof properties[key] === 'object') {
                // Recursive parsing for nested objects
                parsed[propertyContext.name || key] = parseTextLayer(properties[key], propertyContext);
            } else if (Array.isArray(properties[key])) {
                // Recursive parsing for arrays
                parsed[propertyContext.name || key] = properties[key].map(item => {
                    if (typeof item === 'object' && item !== null) {
                        return parseTextLayer(item, propertyContext);
                    }
                    return item;
                });
            } else {
                // Direct mapping for simple properties
                parsed[propertyContext.name || key] = properties[key];
            }
        } else {
            // Default handling for unmapped keys
            if (typeof properties[key] === 'object' && properties[key] !== null) {
                // Recursive parsing for unmapped nested objects
                parsed[key] = parseTextLayer(properties[key]);
            } else {
                parsed[key] = properties[key];
            }
        }
    }
    return parsed;
};

const parseLayers = (layers, assets) => {
    return layers.map(layer => {
        const layerTransforms = parseLayerTransforms(layer);
        let additionalLayerInfo = {};

        switch (layer.ty) {
            case 0: // Precomp Layer
                const precompAsset = assets.find(asset => asset.id === layer.refId);
                if (precompAsset && precompAsset.layers) {
                    additionalLayerInfo = {
                        precomp_contents: parseLayers(precompAsset.layers, assets),
                    };
                } else {
                    additionalLayerInfo = { precomp_contents: [] };
                }
                break;
            case 4: // Shape Layer
                additionalLayerInfo = parseShapeLayer(layer);
                break;
            case 5: // Text Layer
                additionalLayerInfo = parseTextLayer(layer);
                break;
            // ... other cases for different layer types ...
        }

        return { ...layerTransforms, ...additionalLayerInfo };
    });
};

const formatLottieRoot = (json) => {
    // Early checks to ensure json.layers and json.assets are arrays
    if (!Array.isArray(json.layers)) {
        console.error('json.layers is not an array:', json.layers);
        json.layers = []; // Set to empty array to avoid further errors
    }
    if (!Array.isArray(json.assets)) {
        console.error('json.assets is not an array:', json.assets);
        json.assets = []; // Set to empty array to avoid further errors
    }

    const formattedRoot = {
        LottieName: json.nm || 'Unnamed Lottie',
        BasicInfo: {
            '3D': json.ddd,
            FrameRate: json.fr,
            Height: json.h,
            Width: json.w,
            DurationInFrames: json.op - json.ip,
            DurationInSeconds: (json.op - json.ip) / json.fr,
        },
        // Ensure parseAssets is called before parseLayers to prepare the assets array
        Assets: parseAssets(json.assets),
        Fonts: json.fonts ? parseFonts(json.fonts.list || []) : [],
        Markers: parseMarkers(json.markers || []),
        // Now we're sure json.assets is an array, pass it to parseLayers
        Layers: parseLayers(json.layers, json.assets)
    };

    return formattedRoot;
};

// Update the main parsing logic
const parseLottieJson = (json) => {
    return formatLottieRoot(json);
};
