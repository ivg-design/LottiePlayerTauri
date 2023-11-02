import React, { useState, useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';
import 'font-awesome/css/font-awesome.min.css';
import './NeumorphicButton.css';
import './App.css';

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
	expandedPaths
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
						/>
					))}
				</div>
			)}
		</div>
	);
});

// App component
const App = () => {
	const [folderStructure, setFolderStructure] = useState([]);
	const [sidebarWidth, setSidebarWidth] = useState(200);
	const [collapsed, setCollapsed] = useState(true);
	const [isResizing, setIsResizing] = useState(false);
	const [selectedPath, setSelectedPath] = useState(null);
	const [expandedPaths, setExpandedPaths] = useState([]);
	const selectedRef = useRef(null);
	
	useEffect(() => {
		const fetchDir = async () => {
			const rootPath = '/'; // Use your desired initial path
			try {
				const result = await invoke('read_dir', { path: rootPath });
				const sortedRoot = sortItems(Array.isArray(result) ? result : JSON.parse(result));
				setFolderStructure(sortedRoot);
			} catch (error) {
				console.error('Error fetching root directory:', error);
			}
		};
		fetchDir();
	}, []);

	useEffect(() => {
		if (selectedRef.current) {
			selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}
	}, [selectedPath]); // Only re-run if selectedPath changes


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

	const isSelected = (path) => {
		return selectedPath === path;
	};

	const handleSelect = (path) => {
		setSelectedPath(path);

		const pathSegments = path.split('/');
		const pathsToExpand = pathSegments.slice(0, -1).reduce((acc, segment, index) => {
			const path = acc.length === 0 ? segment : `${acc[index - 1]}/${segment}`;
			acc.push(path);
			return acc;
		}, []);

		setExpandedPaths(pathsToExpand);
	};

	const handleChooseFile = async () => {
		try {
			const result = await open({
				multiple: false,
				// filters can be added here if you need to filter for specific file types
			});
			if (typeof result === 'string') {
				// Try to read the directory to check if the path is a directory
				try {
					await invoke('read_dir', { path: result });
					// If no error is thrown, then it's a directory
					handleSelect(result);
				} catch {
					// If an error is thrown, then it's likely a file
					handleSelectFile(result);
				}
			} else {
				console.log('No file or folder selected');
			}
		} catch (error) {
			console.error('Error opening file dialog:', error);
		}
	};


	const handleSelectFile = (filePath) => {
		// This function should be responsible for selecting the file
		// and updating the expandedPaths to include the file's parent directory
		setSelectedPath(filePath);

		const pathSegments = filePath.split('/');
		// Remove the file name to get the directory path
		pathSegments.pop();
		const directoryPath = pathSegments.join('/');

		// Update expanded paths to include the parent directory of the file
		setExpandedPaths(prevPaths => {
			const newPaths = new Set(prevPaths);
			let cumulativePath = '';
			for (const segment of pathSegments) {
				cumulativePath = cumulativePath ? `${cumulativePath}/${segment}` : segment;
				newPaths.add(cumulativePath);
			}
			return Array.from(newPaths);
		});
	};
	
	const handleExpand = (path) => {
		setExpandedPaths((prevPaths) => [...prevPaths, path]);
	};

	const handleCollapse = (path) => {
		setExpandedPaths((prevPaths) => prevPaths.filter(p => p !== path));
	};

	return (
		<div className="App">
			<div className="sidebar" style={{ width: `${sidebarWidth}px` }}>
				<div className="sidebar-header">
					<button onClick={() => setCollapsed(!collapsed)} className="neu-button-sidebar">
						Toggle Tree
					</button>
					<button onClick={handleChooseFile} className="neu-button-sidebar">
						Choose File/Folder
					</button>
				</div>
				{!collapsed &&
					folderStructure.map((item, index) => (
						<TreeNode
							key={index}
							item={item}
							ref={isSelected(item.path) ? selectedRef : null} // Pass the ref here
							onSelected={handleSelect}
							isSelected={isSelected}
							onExpand={handleExpand}
							onCollapse={handleCollapse}
							expandedPaths={expandedPaths}
						/>
					))}
				<div className="resize-handle" onMouseDown={startResizing} />
			</div>
			<div className="mainArea">
				<h1>Your App Title</h1>
				{/* Main content will go here */}
			</div>
		</div>
	);
};

export default App;
