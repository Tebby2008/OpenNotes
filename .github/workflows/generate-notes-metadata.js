const fs = require('fs');
const path = require('path');

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

async function generateNotesData() {
    try {
        const { Octokit } = await import('@octokit/rest');
        const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
        const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
        const notesPath = 'Notes';

        console.log(`Scanning notes in ${owner}/${repo}/${notesPath}...`);

        // 1. Get list of all current files
        const { data: fileData } = await octokit.repos.getContent({
            owner, repo, path: notesPath, ref: 'main',
        });

        const notesMetadata = [];

        for (const file of fileData) {
            if (file.type === 'file') {
                // 2. Fetch the LAST 10 COMMITS for this file
                // We need history because the very last commit might be the "Compression Bot"
                const { data: commitsData } = await octokit.repos.listCommits({
                    owner, repo, path: file.path, per_page: 10,
                });

                // Default values (from the very latest commit, usually the bot or the file state)
                let lastUpdated = commitsData[0].commit.author.date;
                
                // Variables to determine
                let authorDisplay = "Unknown";
                let authorUsername = null;
                let isAiGenerated = file.name.includes('(AI)'); // Fallback to filename check

                // 3. Search history for the "Source of Truth"
                // We look for the commit that introduced the Metadata Message
                let metadataFound = false;
                const metadataRegex = /Author:\s*([^|]+)\|\s*AI:\s*(true|false)/i;

                for (const commit of commitsData) {
                    const msg = commit.commit.message;
                    const match = msg.match(metadataRegex);

                    if (match) {
                        // FOUND IT! This is the upload commit from the Worker.
                        // We use this data regardless of who compressed it later.
                        authorDisplay = match[1].trim();
                        isAiGenerated = (match[2].toLowerCase() === 'true');
                        
                        // Worker uploads have no GitHub username linked
                        authorUsername = null; 
                        
                        metadataFound = true;
                        break; // Stop looking, we found the definitive info
                    }
                }

                // 4. Fallback: Direct GitHub Upload (Web/Desktop)
                // If we didn't find the special worker message, we assume it's a normal user upload.
                if (!metadataFound) {
                    // Find the most recent commit that IS NOT a bot
                    const realUserCommit = commitsData.find(c => 
                        c.commit.author.name !== 'github-actions[bot]' && 
                        c.commit.author.name !== 'NotesPlatformBot'
                    ) || commitsData[0]; // If all are bots, take the first one

                    authorDisplay = realUserCommit.commit.author.name;
                    if (realUserCommit.author && realUserCommit.author.login) {
                        authorUsername = realUserCommit.author.login;
                        // If display name is generic, use username
                        if (!authorDisplay || authorDisplay === "GitHub Action") {
                            authorDisplay = authorUsername;
                        }
                    }
                }

                // --- THUMBNAIL LOGIC ---
                const fileNameWithoutExt = path.basename(file.name);
                const thumbnailName = fileNameWithoutExt.replace(/\.([^.]+)$/, '_$1');
                const thumbnailUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/resources/thumbnails/${encodeURIComponent(thumbnailName)}.jpg`;
                
                notesMetadata.push({
                    name: file.name,
                    path: file.path,
                    download_url: file.download_url,
                    thumbnail_url: thumbnailUrl,
                    author: authorDisplay,
                    author_username: authorUsername,
                    last_updated: lastUpdated,
                    file_size: formatBytes(file.size),
                    is_ai_generated: isAiGenerated,
                });
            }
        }

        const targetPath = path.join('resources', 'notes_metadata.json');
        fs.writeFileSync(targetPath, JSON.stringify(notesMetadata, null, 2));
        
        console.log(`Successfully generated ${targetPath}!`);
    } catch (error) {
        console.error('Failed to generate notes data:', error);
        process.exit(1);
    }
}

generateNotesData();
