import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri'
import { debug } from './utils';


// Helper function to sort items
const sortItems = (items) => {
    return items.sort((a, b) => {
        if (a.is_dir && !b.is_dir) return -1;
        if (!a.is_dir && b.is_dir) return 1;
        return a.name.localeCompare(b.name);
    });
};

// TreeNode component
const TreeNode = React.forwardRef(({
    item,
    level = 0,
    onSelected,
    isSelected,
    onExpand,
    onCollapse,
    expandedPaths,
    debug
}, ref) => {
    const [children, setChildren] = useState([]);
    const isExpanded = expandedPaths.includes(item.path);

    const handleToggle = async (e) => {
        e.stopPropagation();
        if (!isExpanded && item.is_dir) {
            try {
                const result = await invoke('read_dir', { path: item.path });
                const sortedChildren = sortItems(Array.isArray(result) ? result : JSON.parse(result));
                setChildren(sortedChildren);
                onExpand(item.path);
            } catch (error) {
                console.error('Error reading directory:', error);
            }
        } else {
            onCollapse(item.path);
        }
    };

    const handleClick = (e) => {
        e.stopPropagation();
        onSelected(item.path);
    };

    const indentSize = 20;

    return (
        <div>
            <div
                ref={isSelected(item.path) ? ref : null}
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
                            debug={debug}
                        />
                    ))}
                </div>
            )}
        </div>
    );
});

export default TreeNode;
