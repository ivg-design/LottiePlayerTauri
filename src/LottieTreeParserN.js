import React, { useState, useEffect } from 'react';
import './LottieTreeParser.css';
import useLottieParser from './LottieParserN'; // Correct path to your hook

const LottieTreeParser = ({ animationData, onClose }) => {
    const { parseLottieJson } = useLottieParser();
    const [treeData, setTreeData] = useState(null);

    useEffect(() => {
        if (animationData) {
            const parsedAnimationData = parseLottieJson(animationData);
            console.log(parsedAnimationData);
            const rootNode = {
                name: ` Name: ${parsedAnimationData.LottieName || 'Unnamed Lottie'}, Resolution: ${parsedAnimationData.BasicInfo.Width}x${parsedAnimationData.BasicInfo.Height}, Duration: ${parsedAnimationData.BasicInfo.DurationInSeconds}s`,
                children: parsedAnimationData.Layers.map(createLayerNode)
            };
            setTreeData(rootNode);
        }
        // Only re-run the effect if animationData changes
    }, [animationData]);

    return (
        <div className="modalBackdrop">
            <div className="modalContent">
                <button onClick={onClose}>Close</button>
                {treeData ? (
                    <div className="treeContainer">
                        <TreeNode item={treeData} level={0} />
                    </div>
                ) : (
                    <div>Please Load a Lottie Animation JSON!</div>
                )}
            </div>
        </div>
    );
};
const createLayerNode = (layer, isTopLevel = false) => {
    // Define the basic structure of a layer node
    const layerNode = {
        name: layer.Name || 'Unnamed Layer',
        children: [],
        details: isTopLevel ? `Layer Type: ${layer["Layer Type"] || 'Unknown'}, In/Out Point: frames ${layer["In Point"] !== undefined ? Math.round(layer["In Point"]) : 'undefined'} - ${layer["Out Point"] !== undefined ? Math.round(layer["Out Point"]) : 'undefined'}` : undefined

    };

    // Iterate over the properties of the layer
    Object.keys(layer).forEach(key => {
        // if (key === 'Name' || key === 'Type' || key === 'InPoint' || key === 'OutPoint') {
        //     // Skip these properties because they are already used in the details
        //     return;
        // }

        const value = layer[key];
        if (shouldCreateNode(value)) {
            if (key === 'precomp_contents' || key === 'shapes') {
                // Handle special cases where we have nested layers
                layerNode.children.push({
                    name: key,
                    children: value.map(innerLayer => createLayerNode(innerLayer, true)) // Treat contents as top-level layers
                });
            } else if (Array.isArray(value) || typeof value === 'object') {
                // Handle arrays and objects differently from primitive values
                layerNode.children.push(createChildNode(value, key));
            } else {
                // Add primitive values directly
                layerNode.children.push({ name: `${key}: ${value}` });
            }
        }
    });

    return layerNode;
};

const createChildNode = (value, key = '') => {
    if (Array.isArray(value)) {
        // If the value is an array, create a node for each item
        return {
            name: key || 'Unnamed Node',
            children: value.map((item, index) => createChildNode(item, item.Name || `Item ${index + 1}`))
        };
    } else if (typeof value === 'object' && value !== null) {
        // If the value is an object, iterate over its properties to create child nodes
        const children = Object.keys(value).map(propKey => {
            return createChildNode(value[propKey], propKey);
        }).filter(child => child !== undefined); // Filter out undefined children

        return { name: key || 'Unnamed Node', children };
    } else {
        // For primitives, return a node with the value
        return { name: key || 'Unnamed Node', details: `${value}` };
    }
};



// Helper function to determine if a node should be created based on the value
function shouldCreateNode(value) {
    return value !== null && value !== undefined && !(Array.isArray(value) && value.length === 0) && !(typeof value === 'object' &&! Object.keys(value).length);
}


// ... 

const TreeNode = ({ item, level }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasChildren = item.children && item.children.length > 0;

    // Calculate left padding based on the level
    const paddingLeft = `${level * 10}px`; // Increase by 20px for each level

    return (
        <div className="treeNode" style={{ paddingLeft }}>
            <div className={`nodeLabel ${hasChildren ? 'folder' : 'leaf'}`} onClick={() => hasChildren && setIsExpanded(!isExpanded)}>
                <span className="toggle">{hasChildren ? (isExpanded ? '[-]' : '[+]') : '   '}</span>
                <span className="nodeName">{item.name}</span>
                {item.details && <span className="nodeDetails">{item.details}</span>}
            </div>
            {isExpanded && hasChildren && (
                <div className="childrenContainer">
                    {item.children.map((child, index) => (
                        <TreeNode key={index} item={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default LottieTreeParser;
