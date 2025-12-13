const fs = require('fs');
const path = require('path');

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

function appendLog(message, level = 'INFO', event = 'Metadata') {
    const logPath = path.join('resources', 'system_log.md');
    const date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    
    // Define icons based on level
    let icon = '🔵';
    if (level === 'ADD') icon = '✨';
    if (level === 'DEL') icon = '❌';

    const logLine = `| ${date} | ${icon} ${level} | ${event} | ${message} |\n`;
    
    try {
        fs.appendFileSync(logPath, logLine);
    } catch (e) {
        console.error("Could not write to log:", e);
    }
}

async function generateNotesData() {
    try {
        const { Octokit } = await import('@octokit/rest');
        const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
        const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
        const notesPath = 'Notes';
        const metadataPath = path.join('resources', 'notes_metadata.json');

        // 1. Load Previous Metadata (for diff logging)
        let oldFiles = new Set();
        try {
            if (fs.existsSync(metadataPath)) {
                const rawOld = fs.readFileSync(metadataPath, 'utf8');
                const oldJson = JSON.parse(rawOld);
                oldJson.forEach(item => oldFiles.add(item.name));
            }
        } catch (e) {
            console.log("No previous metadata found, starting fresh.");
        }

        console.log(`Scanning notes in ${owner}/${repo}/${notesPath}...`);

        // 2. Get list of all current files from GitHub API
        const { data: fileData } = await octokit.repos.getContent({
            owner, repo, path: notesPath, ref: 'main',
        });

        const notesMetadata = [];
        const currentFiles = new Set();

        for (const file of fileData) {
            if (file.type === 'file') {
                currentFiles.add(file.name);

                // Fetch commit history
                const { data: commitsData } = await octokit.repos.listCommits({
                    owner, repo, path: file.path, per_page: 10,
                });

                let lastUpdated = commitsData[0].commit.author.date;
                let authorDisplay = "Unknown";
                let authorUsername = null;
                let isAiGenerated = file.name.includes('(AI)');

                // Search history for Worker Metadata
                let metadataFound = false;
                const metadataRegex = /Author:\s*([^|]+)\|\s*AI:\s*(true|false)/i;

                for (const commit of commitsData) {
                    const msg = commit.commit.message;
                    const match = msg.match(metadataRegex);

                    if (match) {
                        authorDisplay = match[1].trim();
                        isAiGenerated = (match[2].toLowerCase() === 'true');
                        authorUsername = null; 
                        metadataFound = true;
                        break; 
                    }
                }

                if (!metadataFound) {
                    const realUserCommit = commitsData.find(c => 
                        c.commit.author.name !== 'github-actions[bot]' && 
                        c.commit.author.name !== 'NotesPlatformBot'
                    ) || commitsData[0]; 

                    authorDisplay = realUserCommit.commit.author.name;
                    if (realUserCommit.author && realUserCommit.author.login) {
                        authorUsername = realUserCommit.author.login;
                        if (!authorDisplay || authorDisplay === "GitHub Action") {
                            authorDisplay = authorUsername;
                        }
                    }
                }

                // Check if this is a NEW file
                if (!oldFiles.has(file.name)) {
                    appendLog(`New note added: **${file.name}** by ${authorDisplay}`, 'ADD', 'New Entry');
                }

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

        // 3. Check for DELETED files
        oldFiles.forEach(oldName => {
            if (!currentFiles.has(oldName)) {
                appendLog(`Note deleted from repo: **${oldName}**`, 'DEL', 'Removal');
            }
        });

        // 4. Save
        fs.writeFileSync(metadataPath, JSON.stringify(notesMetadata, null, 2));
        console.log(`Successfully generated ${metadataPath}!`);

    } catch (error) {
        console.error('Failed to generate notes data:', error);
        process.exit(1);
    }
}

generateNotesData();
