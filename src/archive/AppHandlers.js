import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';
import { debug } from './utils';


export const useHandlers = ({ setSelectedPath, setExpandedPaths, selectedPath, debug }) => {
    // Define isSelected as a function
    const isSelected = (path) => {
        return selectedPath === path;
    };

    const handleSelect = (path) => {
        setSelectedPath(path);
        const pathSegments = path.split('/');
        const pathsToExpand = pathSegments.
            // slice(0, -1).
            reduce((acc, segment, index) => {
            const path = acc.length === 0 ? segment : `${acc[index - 1]}/${segment}`;
            acc.push(path);
            return acc;
        }, []);

        setExpandedPaths(pathsToExpand);
        // debug && debug('Selected path:', path);
        // debug && debug('Expanded paths:', pathsToExpand);
    };

    const handleChooseFile = async () => {
        try {
            const result = await open({
                multiple: false,
            });
            if (typeof result === 'string') {
                try {
                    await invoke('read_dir', { path: result });
                    handleSelect(result);
                } catch  {
                    // this will be executed for files 
                    const pathSegments = result.split('/');
                    pathSegments.pop(); //pop the file name
                    const directoryPath = pathSegments.join('/');
                    handleSelect(directoryPath);
                }
            } else {
                debug && debug('No file or folder selected');
            }
        } catch (error) {
            console.error('Error opening file dialog:', error);
        }
    };

    const handleExpand = (path) => {
        setExpandedPaths((prevPaths) => {
            const newPaths = prevPaths.includes(path) ? prevPaths : [...prevPaths, path];
            debug && debug('Expanded path:', path);
            return newPaths;
        });
    };

    const handleCollapse = (path) => {
        
        setExpandedPaths((prevPaths) => {
            const newPaths = prevPaths.filter((p) => p !== path);
            debug && debug('Collapsed path:', path);
            return newPaths;
        });
    };

    return {
        handleSelect,
        handleExpand,
        handleCollapse,
        handleChooseFile,
        isSelected // Now we return it so it can be passed down
    };
};
