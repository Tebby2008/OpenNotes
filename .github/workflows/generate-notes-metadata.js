const fs = require('fs');
const path = require('path');

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

                // Get author info with a single check
                const authorData = lastCommit.author || {};
                const commitAuthor = lastCommit.commit.author || {};

                notesMetadata.push({
                    name: file.name,
                    path: file.path,
                    download_url: file.download_url,
                    author: commitAuthor.name,
                    last_updated: commitAuthor.date,
                    is_ai_generated: isAiGenerated,
                    author_username: authorData.login || null,
                });
            }
        }

        fs.writeFileSync(
            path.join(__dirname, '../../notes_metadata.json'),
            JSON.stringify(notesMetadata, null, 2)
        );
        console.log('Successfully generated notes_metadata.json!');
    } catch (error) {
        console.error('Failed to generate notes data:', error);
        process.exit(1);
    }
}

generateNotesData();
