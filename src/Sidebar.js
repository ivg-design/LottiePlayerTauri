// sidebar.js
import React, { useState, useCallback, useEffect } from 'react';
import TreeNode from './TreeNode';
import './NeumorphicButton.css';
import { debug } from './utils';

const Sidebar = ({
    folderStructure,
    handleSelect,
    isSelected, // This should be a function
    handleExpand,
    handleCollapse,
    expandedPaths,
    handleChooseFile,
    selectedPath // This prop should be passed down from App.js to indicate the currently selected path
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

    useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);

        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [resize, stopResizing]);

    // Effect to handle the expansion of the tree based on the selected path
    useEffect(() => {
        if (selectedPath && folderStructure.length > 0) {
            // Logic to ensure the tree is expanded to show the selected path
            handleExpand(selectedPath);
        }
    }, [selectedPath, folderStructure, handleExpand]);

    return (
        <div className="sidebar" style={{ width: `${sidebarWidth}px` }}>
            <div className="sidebar-header">
                <button
                    onClick={() => {
                        setCollapsed(!collapsed);
                        setIsTreeToggled(!isTreeToggled);
                    }}
                    className={`button ${isTreeToggled ? "button-toggled" : ""}`}
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
                        isSelected={isSelected} // Pass the function
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
