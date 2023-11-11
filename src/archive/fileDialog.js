import { open } from '@tauri-apps/api/dialog';
import { handleSelectFile } from './utils';

export const handleChooseFile = async (setSelectedPath, setExpandedPaths) => {
    try {
        const result = await open({
            multiple: false,
            directory: true,
            // filters can be added here if you need to filter for specific file types
        });
        if (typeof result === 'string') {
            handleSelectFile(result, setSelectedPath, setExpandedPaths);
        } else {
            console.log('No file or folder selected');
        }
    } catch (error) {
        console.error('Error opening file dialog:', error);
    }
};
