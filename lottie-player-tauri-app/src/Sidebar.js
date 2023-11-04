// sidebar.js
import React, { useState, useCallback } from 'react';
import TreeNode from './TreeNode';
import './NeumorphicButton.css';
import { debug } from './utils';


const Sidebar = ({
    folderStructure,
    handleSelect,
    isSelected,
    handleExpand,
    handleCollapse,
    expandedPaths,
    handleChooseFile,
    debug
}) => {
    const [sidebarWidth, setSidebarWidth] = useState(440);
    const [collapsed, setCollapsed] = useState(true);
    const [isResizing, setIsResizing] = useState(false);
    const [isTreeToggled, setIsTreeToggled] = useState(false);

    const startResizing = useCallback((e) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback((e) => {
        if (isResizing) {
            setSidebarWidth(e.clientX);
        }
    }, [isResizing]);

    React.useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);

        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [resize, stopResizing]);

    if (debug) {
        console.log('Sidebar render', { folderStructure, collapsed, sidebarWidth });
    }

    return (
        <div className="sidebar" style={{ width: `${sidebarWidth}px` }}>
            <div className="sidebar-header">
                <button
                    onClick={() => {
                        setCollapsed(!collapsed);
                        setIsTreeToggled(!isTreeToggled); // This toggles the button state
                    }}
                    className={`button ${isTreeToggled ? "button-toggled" : ""}`} // Apply the toggled class based on the state
                >
                    Toggle Tree
                </button>
                <button onClick={handleChooseFile} className="button">
                    Choose File/Folder
                </button>
            </div>
            {!collapsed &&
                folderStructure.map((item, index) => (
                    <TreeNode
                        key={index}
                        item={item}
                        onSelected={handleSelect}
                        isSelected={isSelected}
                        onExpand={handleExpand}
                        onCollapse={handleCollapse}
                        expandedPaths={expandedPaths}
                    />
                ))}
            <div className="resize-handle" onMouseDown={startResizing} />
        </div>
    );
};

export default Sidebar;
