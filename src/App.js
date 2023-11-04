/*
	App.js
		|
		+-- AppHandlers.js --+--> utils.js
		|                    |
		|                    +--> (Other potential dependencies)
		|
		+-- AppEffects.js ---+--> utils.js
		|                    |
		|                    +--> (Other potential dependencies)
		|
		+-- Sidebar.js ------+--> TreeNode.js
		|   |                    |
		|   |                    +--> utils.js
		|   |                    |
		|   |                    +--> (Other potential dependencies)
		|   |
		|   +--> utils.js
		|
		+-- MainApp.js
*/

import React, { useState, useRef } from 'react';
import Sidebar from './Sidebar';
import MainApp from './MainApp';
import { useFetchDirEffect, useScrollToSelectedEffect } from './AppEffects';
import { useHandlers } from './AppHandlers';
import { debug } from './utils';
import 'font-awesome/css/font-awesome.min.css';
import './App.css';

const App = () => {
	const [folderStructure, setFolderStructure] = useState([]);
	const [selectedPath, setSelectedPath] = useState(null);
	const [expandedPaths, setExpandedPaths] = useState([]);
	const selectedRef = useRef(null);

	const { handleSelect, handleExpand, handleCollapse, handleChooseFile, isSelected } = useHandlers({
		setSelectedPath,
		setExpandedPaths,
		selectedPath, // Assuming this is the state that holds the current selected path
		debug
	});


	useFetchDirEffect(setFolderStructure, debug);
	useScrollToSelectedEffect(selectedRef, selectedPath);

	return (
		<div className="App">
			<Sidebar
				folderStructure={folderStructure}
				handleSelect={handleSelect}
				isSelected={(path) => selectedPath === path}
				handleExpand={handleExpand}
				handleCollapse={handleCollapse}
				expandedPaths={expandedPaths}
				handleChooseFile={handleChooseFile}
				selectedRef={selectedRef}
				debug={debug}
			/>
			<MainApp />
		</div>
	);
};

export default App;
