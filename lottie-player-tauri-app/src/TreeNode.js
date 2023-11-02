import React, { useState } from 'react';
import { sortItems } from './utils';

export const TreeNode = React.forwardRef(({
    item,
    level = 0,
    onSelected,
    isSelected,
    onExpand,
    onCollapse,
    expandedPaths
}, ref) => {
    const [children, setChildren] = useState([]);
    const isExpanded = expandedPaths.includes(item.path);

    const handleToggle = async () => {
        if (!isExpanded && item.is_dir) {
            try {
                const result = await window.api.readDir(item.path);
                setChildren(sortItems(result));
                onExpand(item.path);
            } catch (error) {
                console.error('Error reading directory:', error);
            }
        } else {
            onCollapse(item.path);
        }
    };

    const handleClick = () => {
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
                        />
                    ))}
                </div>
            )}
        </div>
    );
});
