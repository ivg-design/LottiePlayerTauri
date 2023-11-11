import React, { useState, useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';
import { readTextFile, readBinaryFile } from '@tauri-apps/api/fs';
import PlayerUI from './PlayerUI.js'; // Import the PlayerUI component
import 'font-awesome/css/font-awesome.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderTree, faFileImport } from '@fortawesome/free-solid-svg-icons';
import './NeumorphicButton.css';
import './App.css';
const isLoggingEnabled = true; // Set to false to disable logging
// ERROR LOGGING
function log(...messages) {
	if (isLoggingEnabled) {
		console.log(...messages);
	}
}
// updated sort function that smart sorts numbers without needing leading zeros
const sortItems = (items) => {
	return items.sort((a, b) => {
		if (a.is_dir && !b.is_dir) return -1;
		if (!a.is_dir && b.is_dir) return 1;

		// Extracting numbers from file names for comparison
		const regex = /^\d+/; // Regex to match leading numbers in a file name
		const numA = a.name.match(regex);
		const numB = b.name.match(regex);

		// If both are numeric, compare as numbers
		if (numA && numB) {
			const numberA = parseInt(numA[0], 10);
			const numberB = parseInt(numB[0], 10);
			if (numberA !== numberB) {
				return numberA - numberB;
			}
		}

		// If only one is numeric, or if numeric parts are equal, compare as strings
		return a.name.localeCompare(b.name);
	});
};
/**
 * TreeNode component represents each node in a file tree structure.
 * It is responsible for rendering individual tree nodes, handling node expansion/collapse, and node selection.
 *
 */
const TreeNode = React.forwardRef(({
		item,
		level = 0,
		onSelected,
		isSelected,
		onExpand,
		onCollapse,
		expandedPaths,
		onFileSelected,
		onHeightChange // This is a new prop to be passed from the App component
	}, ref) => {
		const [children, setChildren] = useState([]);
		const isExpanded = expandedPaths.includes(item.path);
		const itemRef = ref || React.createRef(); // Use the forwarded ref or create a new one
		const indentSize = 20;
		const nodeHeight = 18; // Assuming each node has a fixed height of 30px

		// Callback function to be passed to TreeNode, which is called when a child node is expanded
		const expand = useCallback(async (item) => {
			if (item.is_dir && !isExpanded) { // Only expand if the node is a directory and not already expanded
				try {
					const result = await invoke('read_dir', { path: item.path }); // Use Tauri's File System API to read the directory
					const sortedChildren = sortItems(Array.isArray(result) ? result : JSON.parse(result)); //
					setChildren(sortedChildren); // Update the children state
					onExpand(item.path);// Call the onExpand callback function
				} catch (error) {
					console.error('Error reading directory:', error);
				}
			}
		}, [item.is_dir, item.path, isExpanded, onExpand]); // Depend on the item path, isExpanded state, and onExpand callback function

		// Callback function to be passed to TreeNode, which is called when a child node is collapsed
		const collapse = useCallback(() => {
			if (isExpanded) { // Only collapse if the node is already expanded
				setChildren([]); // Clear the children state
				onCollapse(item.path); // Call the onCollapse callback function
			}
		}, [item.path, isExpanded, onCollapse]); // Depend on the item path, isExpanded state, and onCollapse callback function

	 	// This effect is called when the children state changes and reports the height change to the parent   
		useEffect(() => { 
			const performExpand = async () => { // Define an async function to perform the expansion
				if (item.is_dir && isExpanded) { // Only expand if the node is a directory and is expanded
					try {
						const result = await invoke('read_dir', { path: item.path });// Use Tauri's File System API to read the directory
						const sortedChildren = sortItems(Array.isArray(result) ? result : JSON.parse(result));// Sort the children
						setChildren(sortedChildren); // Update the children state
					} catch (error) {
						console.error('Error reading directory:', error);
					}
				}
			};
			performExpand();// Call the async function to perform the expansion
		}, [item, isExpanded, invoke]);// Depend on the item, isExpanded state, and invoke function

		// This effect is called when the children state changes and reports the height change to the parent
		useEffect(() => {
			// Only scroll into view if the current item is selected and not already in view 
			if (isSelected(item.path) && !isItemInView(itemRef.current)) { 
				itemRef.current.scrollIntoView({ // Scroll the item into view
					behavior: 'smooth',// Use smooth scrolling
					block: 'nearest',// Scroll to the bottom of the item
				});
			}
		}, [isSelected, item.path, itemRef]);

		// Helper function to check if the element is in view
		function isItemInView(element) {
			if (!element) {
				return false;
			}
			const rect = element.getBoundingClientRect();
			return (
				rect.top >= 0 &&
				rect.left >= 0 &&
				rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
				rect.right <= (window.innerWidth || document.documentElement.clientWidth)
			);
		}

		const handleToggle = (e) => {
			e.stopPropagation();
			if (item.is_dir) {
				if (isExpanded) {
					collapse(); // Ensure this function is called when collapsing
				} else {
					expand(item).catch(console.error);
				}
			}
		};

		const handleClick = (e) => {
			e.stopPropagation();
			onSelected(item.path); // Existing selection handling

			// If the item is a file, trigger the event to load and play the animation
			if (!item.is_dir) {
				onFileSelected(item.path); // This is a new prop function to be passed from the App component
			}
		};


		return (
			<div>
				<div
					ref={itemRef} // Attach the ref to this div
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
								onFileSelected={onFileSelected} // Pass this prop down to recursive calls

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
	const rootRef = useRef(null); // Create a ref for the root TreeNode if not already done
	const [sidebarWidth, setSidebarWidth] = useState(200);
	const [collapsed, setCollapsed] = useState(true);
	const [isResizing, setIsResizing] = useState(false);
	const [selectedPath, setSelectedPath] = useState(null);
	const [expandedPaths, setExpandedPaths] = useState([]);
	const selectedRef = useRef(null);
	const [isTreeToggled, setIsTreeToggled] = useState(false);
	const [animationData, setAnimationData] = useState(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [fileSize, setFileSize] = useState(null);
	const [isFilePickerOpen, setIsFilePickerOpen] = useState(false);


	

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
	const handleChooseFile = async () => {
		try {
			const result = await open({
				multiple: false,
				directory: false, // Ensure it's set to false to open files
			});
			if (typeof result === 'string') {
				const animationJson = await readTextFile(result);
				setAnimationData(JSON.parse(animationJson));

				// Get the file size for the selected file
				const binaryData = await readBinaryFile(result);
				const sizeInKb = binaryData.length / 1024;
				setFileSize(sizeInKb); // Update state with the file size

				// Get path segments and update tree navigation
				const pathSegments = result.split('/');
				pathSegments.pop(); // Remove the file name to navigate to the containing folder
				const directoryPath = pathSegments.join('/');
				handleSelect(directoryPath); // This should update the tree view
			}
		} catch (error) {
			console.error('Error opening file dialog:', error);
		}
	};

	const handleSelect = (path) => {
		setSelectedPath(path);
		const pathSegments = path.split('/');
		const pathsToExpand = pathSegments.reduce((acc, segment, index) => {
			const path = index === 0 ? segment : `${acc[index - 1]}/${segment}`;
			acc.push(path);
			return acc;
		}, []);

		setExpandedPaths(pathsToExpand);
	};


	const handleExpand = (path) => {
		setExpandedPaths(prevPaths => {
			if (!prevPaths.includes(path)) {
				return [...prevPaths, path];
			}
			return prevPaths;
		});
	};

	const handleCollapse = (path) => {
		setExpandedPaths(prevPaths => {
			return prevPaths.filter(p => p !== path);
		});
	};

	const handleFileSelected = async (filePath) => {
		try {
			// Check if the file has a .json extension
			if (filePath.endsWith('.json')) {
				const animationJson = await readTextFile(filePath);
				setAnimationData(JSON.parse(animationJson));

				// Additionally, get the file size using Tauri's File System API
				const binaryData = await readBinaryFile(filePath);
				const sizeInKb = binaryData.length / 1024;
				setFileSize(sizeInKb); // Update state with the file size
			} else {
			}
		} catch (error) {
		}
	};
	
	return (
		<div className="App">
			<div className="sidebar" style={{ width: `${sidebarWidth}px` }}>
				<div className="sidebar-header">
					<button
						onClick={() => {
							setCollapsed(!collapsed);
							setIsTreeToggled(!isTreeToggled); // This toggles the button state
						}}
						className={`button ${isTreeToggled ? "button-toggled" : ""}`} // Apply the toggled class based on the state
					>
						<FontAwesomeIcon icon={faFolderTree} className="icon-large" />
					</button>
					<button onClick={handleChooseFile} className="button">
						<FontAwesomeIcon icon={faFileImport} className="icon-large" />
					</button>
				</div>
				<div className = "treeContainer">
					<div className="resize-handle" onMouseDown={startResizing} />
				{!collapsed &&
					folderStructure.map((item, index) => (
						<TreeNode
							key={index}
							item={item}
							ref={isSelected(item.path) ? selectedRef : null}
							onSelected={handleSelect}
							isSelected={isSelected}
							onExpand={handleExpand}
							onCollapse={handleCollapse}
							expandedPaths={expandedPaths}
							onFileSelected={handleFileSelected}
						/>
					))}
					</div>
			</div>
			<div className="mainArea">
				<div className="appName">
				{/* <h1>Your App Title</h1> */}
				</div>
				{<PlayerUI
					animationData={animationData}
					version="5-12-2"
					fileSize={fileSize}
				/>}
			</div>
		</div>
	);
};

export default App;