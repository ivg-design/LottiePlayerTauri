module.exports = {
    branches: [
        'main', // Standard release branch
        {
            name: 'beta', // Example prerelease branch
            prerelease: true
        },
        {
            name: 'alpha', // Your existing alpha prerelease branch
            prerelease: true
        }
        // Add more branches as needed
    ],
    plugins: [
        ['@semantic-release/commit-analyzer', {
            preset: 'angular',
            releaseRules: [
                { type: 'docs', scope: 'README', release: 'patch', hidden: true },
                { type: 'refactor', release: 'patch' },
                { type: 'feat', release: 'minor' },
                { type: 'fix', release: 'patch' },
                // Add more custom rules as needed
            ],
        }],
        ['@semantic-release/release-notes-generator', {
            preset: 'angular',
            writerOpts: {
                transform: (commit, context) => {
                    const isRelevantChange = (line) => line.startsWith('fix:') || line.startsWith('feat:');

                    if (commit && commit.message) {
                        const lines = commit.message.split('\n');
                        const relevantLines = lines.filter(isRelevantChange);

                        return relevantLines.map(line => {
                            const [type, ...messageParts] = line.split(':');
                            const message = messageParts.join(':').trim();

                            return {
                                ...commit,
                                type,
                                subject: message
                            };
                        });
                    }

                    return null;
                }, 
            }, 
        }],
        '@semantic-release/changelog',
        ['@semantic-release/git', {
            assets: ['CHANGELOG.md', 'package.json', 'package-lock.json'],
            message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
        }],
        ['@semantic-release/github', {
            assets: 'dist/*.zip' // Adjust according to your build artifacts
        }],
        // Add more plugins as necessary
    ],
    ci: false, //  Set to true if you are using CI
};
