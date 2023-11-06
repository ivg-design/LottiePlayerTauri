// TreeNode.js
import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { debug, sortItems } from './utils';

// TreeNode component
const TreeNode = ({
    item,
    level = 0,
    onSelected,
    isSelected,
    onExpand,
    onCollapse,
    expandedPaths // [/, /userus, /userus/ivg, / ]
}) => {
    const [children, setChildren] = useState([]);
    const isExpanded = expandedPaths.includes(item.path);
    const expand = async (item) => { 
        const result = await invoke('read_dir', { path: item.path });
        const sortedChildren = sortItems(Array.isArray(result) ? result : JSON.parse(result));
        setChildren(sortedChildren);
        onExpand(item.path);
    };
    isExpanded && expand(item);

    debug('TreeNode render', { path: item.path, isExpanded, expendedPaths: expandedPaths });
    const handleToggle = async (e) => {
        e.stopPropagation();
        if (!isExpanded && item.is_dir) {
            try {
                expand(item);  
            } catch (error) {
                console.error('Error reading directory:', error);
                debug('Error reading directory:', item.path, error);
            }
        } else {
            onCollapse(item.path);
            debug('Directory collapsed:', item.path);
        }
    };

    const handleClick = (e) => {
        e.stopPropagation();
        onSelected(item.path);
        debug('Item selected:', item.path);
    };

    const indentSize = 20;

    return (
        <div>
            <div
                className={`treeNode ${isSelected(item.path) ? 'selected' : ''}`}
                onClick={handleClick}
                onDoubleClick={handleToggle}
                style={{ paddingLeft: `${level * indentSize}px` }}
            >
                {item.is_dir ? (
                    <>
                        <i className={`fa ${isExpanded ? 'fa-folder-open' : 'fa-folder'}`} />
                        <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                    </>
                ) : (
                    <>
                        <i className="fa fa-file" />
                        <span>{item.name}</span>
                    </>
                )}
            </div>
            {isExpanded && (
                <div className="treeChildren">
                    {children.map((child, index) => (
                        <TreeNode
                            key={index}
                            item={child}
                            level={level + 1}
                            onSelected={onSelected}
                            isSelected={isSelected}
                            onExpand={onExpand}
                            onCollapse={onCollapse}
                            expandedPaths={expandedPaths}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TreeNode;
