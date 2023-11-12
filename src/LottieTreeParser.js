import React, { useState, useEffect } from 'react';
import { Tree } from 'react-d3-tree';
import './LottieTreeParser.css';

const LottieTreeParser = ({ animationData, onClose }) => {
    const [treeData, setTreeData] = useState(null);

    // Your provided property mappings
    const basePropertyMappings = {
        fr: 'framerate',
        ip: 'inPoint',
        op: 'outPoint',
        w: 'width',
        h: 'height',
        nm: 'name',
        mn: 'matchName',
        ddd: 'is3D',
    };

    const layerPropertyMappings = {
        ddd: 'is3D',
        ind: 'index',
        ty: 'type',
        nm: 'name',
        ip: 'inPoint',
        op: 'outPoint',
        st: 'startTime',
        hd: 'isHidden',
    };

    const ksPropertyMappings = {
        o: 'opacity',
        r: 'rotation',
        p: 'position',
        a: 'anchor',
        s: 'scale',
        sk: 'skew',
        sa: 'skewAxis',
    };

    const fontPropertyMappings = {
        fFamily: 'fontFamily',
        fWeight: 'fontWeight',
        fStyle: 'fontStyle',
        fName: 'fontName',
    };

    const assetPropertyMappings = {
        id: 'id',
        nm: 'name',
        p: 'datapath',
        u: 'path',
        e: 'isEmbedded',
        w: 'width',
        h: 'height',
    };

    const mapProperties = (properties, mappings) => {
        return Object.keys(mappings).reduce((acc, key) => {
            if (properties[key] !== undefined) {
                acc[mappings[key]] = properties[key];
            }
            return acc;
        }, {});
    };

    const mapLayerToTreeNode = (layer) => {
        const node = {
            name: layer.nm || 'Unnamed Layer',
            type: getLayerType(layer.ty),
            properties: mapProperties(layer, layerPropertyMappings),
            children: []
        };

        if (layer.ks) {
            node.transform = mapProperties(layer.ks, ksPropertyMappings);
        }

        if (layer.shapes) { // For shape layers
            layer.shapes.forEach(shape => {
                node.children.push(mapShapeProperties(shape));
            });
        } else if (layer.t) { // For text layers
            node.textData = mapProperties(layer.t.d, fontPropertyMappings);
        }

        return node;
    };

    const getLayerType = (typeCode) => {
        const types = {
            0: 'Precomp', 1: 'Solid', 2: 'Image', 3: 'Null', 4: 'Shape',
            5: 'Text', 6: 'Audio', 7: 'Video placeholder', 8: 'Image sequence',
            9: 'Video', 10: 'Image placeholder', 11: 'Guide',
            12: 'Adjustment', 13: 'Camera', 14: 'Light', 15: 'Data'
        };
        return types[typeCode] || `Type ${typeCode}`;
    };

    const mapShapeProperties = (shape) => {
        return {
            name: shape.nm,
            type: shape.ty,
            properties: mapProperties(shape, assetPropertyMappings)
        };
    };

    const renderCustomNodeElement = ({ nodeDatum, toggleNode }) => (
        <g>
            <circle r={15} onClick={toggleNode} />
            <text fill="black" strokeWidth="1" x="20" y="5">
                {nodeDatum.name}
            </text>
            <foreignObject x="20" y="-15" width="100" height="50">
                <div style={{ border: "1px solid black", backgroundColor: "white" }}>
                    <p>{nodeDatum.type}</p>
                    {Object.entries(nodeDatum.properties || {}).map(([key, value]) => (
                        <p key={key}>{key}: {value}</p>
                    ))}
                </div>
            </foreignObject>
        </g>
    );

    useEffect(() => {
        if (animationData && animationData.layers) {
            const root = {
                name: animationData.nm || 'Root',
                properties: mapProperties(animationData, basePropertyMappings),
                children: animationData.layers.map(mapLayerToTreeNode)
            };
            setTreeData([root]); // Note: Tree expects an array
        }
    }, [animationData]);

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

export default LottieTreeParser;