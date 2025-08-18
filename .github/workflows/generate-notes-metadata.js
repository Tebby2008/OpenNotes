const fs = require('fs');
const path = require('path');

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

async function generateNotesData() {
    try {
        const { Octokit } = await import('@octokit/rest');
        const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
        const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
        const notesPath = 'Notes';

        console.log(`Scanning notes in ${owner}/${repo}/${notesPath}...`);

        const { data: fileData } = await octokit.repos.getContent({
            owner,
            repo,
            path: notesPath,
            ref: 'main',
        });

        const notesMetadata = [];
        for (const file of fileData) {
            if (file.type === 'file') {
                const { data: commitsData } = await octokit.repos.listCommits({
                    owner,
                    repo,
                    path: file.path,
                    per_page: 1,
                });

                const lastCommit = commitsData[0];
                
                const isAiGenerated = file.name.includes('(AI)');
                const commitAuthor = lastCommit.commit.author || {};
                const authorData = lastCommit.author || {};

                // Construct the thumbnail URL
                const fileNameWithoutExt = path.basename(file.name);
                const thumbnailName = fileNameWithoutExt.replace(/\.([^.]+)$/, '_$1');
                const thumbnailUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/resources/thumbnails/${encodeURIComponent(thumbnailName)}.jpg`;
                
                notesMetadata.push({
                    name: file.name,
                    path: file.path,
                    download_url: file.download_url,
                    thumbnail_url: thumbnailUrl,
                    author: commitAuthor.name,
                    author_username: authorData.login || null,
                    last_updated: commitAuthor.date,
                    file_size: formatBytes(file.size),
                    is_ai_generated: isAiGenerated,
                });
            }
        }

        fs.writeFileSync(
            path.join(__dirname, '../../resources/notes_metadata.json'),
            JSON.stringify(notesMetadata, null, 2)
        );
        console.log('Successfully generated resources/notes_metadata.json!');
    } catch (error) {
        console.error('Failed to generate notes data:', error);
        process.exit(1);
    }
}

generateNotesData();
