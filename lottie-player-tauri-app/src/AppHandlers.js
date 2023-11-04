import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';
import { debug } from './utils';


export const useHandlers = ({ setSelectedPath, setExpandedPaths, debug }) => {
    const handleSelect = (path) => {
        setSelectedPath(path);
        const pathSegments = path.split('/');
        const pathsToExpand = pathSegments.slice(0, -1).reduce((acc, segment, index) => {
            const path = acc.length === 0 ? segment : `${acc[index - 1]}/${segment}`;
            acc.push(path);
            return acc;
        }, []);

        setExpandedPaths(pathsToExpand);
        debug('Selected path:', path);
        debug('Expanded paths:', pathsToExpand);
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
                } catch {
                    const pathSegments = result.split('/');
                    pathSegments.pop();
                    const directoryPath = pathSegments.join('/');
                    handleSelect(directoryPath);
                }
            } else {
                debug('No file or folder selected');
            }
        } catch (error) {
            console.error('Error opening file dialog:', error);
        }
    };

    const handleExpand = (path) => {
        setExpandedPaths((prevPaths) => [...prevPaths, path]);
        debug('Expanded path:', path);
    };

    const handleCollapse = (path) => {
        setExpandedPaths((prevPaths) => prevPaths.filter((p) => p !== path));
        debug('Collapsed path:', path);
    };

    return {
        handleSelect,
        handleExpand,
        handleCollapse,
        handleChooseFile
    };
};
