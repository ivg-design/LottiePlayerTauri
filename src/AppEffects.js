import { useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
// import { readDir, BaseDirectory } from '@tauri-apps/api/fs';

import { sortItems, debug } from './utils';

export const useFetchDirEffect = (setFolderStructure, debug) => {
    useEffect(() => {
        const fetchDir = async () => {
            const rootPath = '/';
            try {
                const result = await invoke('read_dir', { path: rootPath});
                // const result = await readDir(rootPath, { recursive:true});
                const sortedRoot = sortItems(Array.isArray(result) ? result : JSON.parse(result));
                setFolderStructure(sortedRoot);
                debug('Fetched and sorted root directory:', sortedRoot);
            } catch (error) {
                console.error('Error fetching root directory:', error);
            }
        };
        fetchDir();
    }, [setFolderStructure, debug]);
};

export const useScrollToSelectedEffect = (selectedRef, selectedPath) => {
    useEffect(() => {
        if (selectedRef.current) {
            selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [selectedRef, selectedPath]);
};
