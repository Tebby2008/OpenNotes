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
        // Dynamic import for Octokit (ESM module)
        const { Octokit } = await import('@octokit/rest');
        const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
        const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
        const notesPath = 'Notes';

        console.log(`Scanning notes in ${owner}/${repo}/${notesPath}...`);

        const { data: fileData } = await octokit.repos.getContent({
            owner, repo, path: notesPath, ref: 'main',
        });

        const notesMetadata = [];
        for (const file of fileData) {
            if (file.type === 'file') {
                const { data: commitsData } = await octokit.repos.listCommits({
                    owner, repo, path: file.path, per_page: 1,
                });

                const lastCommit = commitsData[0];
                const commitMsg = lastCommit.commit.message;
                const committerName = lastCommit.commit.author.name; // Git config name
                const githubUser = lastCommit.author; // GitHub API user object (contains login)

                // Initialize variables
                let authorDisplay = committerName;
                let authorUsername = null; 
                let isAiGenerated = file.name.includes('(AI)');

                // Check if the file was uploaded by our Worker Bot
                const isBot = committerName === 'NotesPlatformBot' || committerName === 'github-actions[bot]';

                if (isBot) {
                    // --- CASE 1: Uploaded via Cloudflare Worker ---
                    // Try to regex the info from the commit message
                    // Expected format: "Upload: file.pdf | Author: Bob | AI: true"
                    const authorMatch = commitMsg.match(/Author:\s*([^|]+)/);
                    const aiMatch = commitMsg.match(/AI:\s*(true|false)/i);

                    if (authorMatch && authorMatch[1]) {
                        authorDisplay = authorMatch[1].trim();
                    }
                    if (aiMatch && aiMatch[1]) {
                        isAiGenerated = (aiMatch[1].toLowerCase() === 'true');
                    }
                    // authorUsername remains NULL here to indicate "Guest/External Upload"
                } else {
                    // --- CASE 2: Direct GitHub Upload (Web/Desktop) ---
                    // If a GitHub user exists, capture their username
                    if (githubUser && githubUser.login) {
                        authorUsername = githubUser.login;
                    }
                    // Fallback: If committerName is generic, try to use login as display name
                    if (!authorDisplay && authorUsername) {
                        authorDisplay = authorUsername;
                    }
                }
                
                // Final safety fallback
                if (!authorDisplay) authorDisplay = "Unknown";

                // --- THUMBNAIL LOGIC ---
                const fileNameWithoutExt = path.basename(file.name);
                const thumbnailName = fileNameWithoutExt.replace(/\.([^.]+)$/, '_$1');
                const thumbnailUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/resources/thumbnails/${encodeURIComponent(thumbnailName)}.jpg`;
                
                notesMetadata.push({
                    name: file.name,
                    path: file.path,
                    download_url: file.download_url,
                    thumbnail_url: thumbnailUrl,
                    author: authorDisplay,          // The display name (e.g., "John" or "Tebby")
                    author_username: authorUsername, // The GitHub handle (e.g., "tebby2008") or null
                    last_updated: lastCommit.commit.author.date,
                    file_size: formatBytes(file.size),
                    is_ai_generated: isAiGenerated,
                });
            }
        }

        // Write to resources folder (ensure path exists relative to script execution)
        const targetPath = path.join('resources', 'notes_metadata.json');
        fs.writeFileSync(targetPath, JSON.stringify(notesMetadata, null, 2));
        
        console.log(`Successfully generated ${targetPath}!`);
    } catch (error) {
        console.error('Failed to generate notes data:', error);
        process.exit(1);
    }
}

generateNotesData();
