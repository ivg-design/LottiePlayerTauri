export const sortItems = (items) => {
    return items.sort((a, b) => {
        if (a.is_dir && !b.is_dir) return -1;
        if (!a.is_dir && b.is_dir) return 1;
        return a.name.localeCompare(b.name);
    });
};

export const handleSelect = (path, setSelectedPath, setExpandedPaths) => {
    setSelectedPath(path);
    const pathSegments = path.split('/');
    const pathsToExpand = pathSegments.slice(0, -1).reduce((acc, segment, index) => {
        const path = acc.length === 0 ? segment : `${acc[index - 1]}/${segment}`;
        acc.push(path);
        return acc;
    }, []);
    setExpandedPaths(pathsToExpand);
};

export const handleSelectFile = (path, setSelectedPath, setExpandedPaths) => {
    setSelectedPath(path);
    const pathSegments = path.split('/');
    // Remove the file name to get the directory path
    pathSegments.pop();
    const directoryPath = pathSegments.join('/');
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
