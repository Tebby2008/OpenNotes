// upload.js

let uploadTags = [];

/**
 * Initializes the upload system (Tags, Form Submission, Validation).
 * @param {Object} ctx - The context containing globals from index.html
 * { currentUser, API_URL, allItems, showPopup, toggleOverlay, render, turnstileTokenPtr }
 */
export function initUploadSystem(ctx) {
    const uploadEls = {
        form: document.getElementById('uploadForm'),
        file: document.getElementById('fileInput'),
        drop: document.getElementById('dropArea'),
        msg: document.querySelector('.file-msg'),
        title: document.getElementById('upTitle'),
        author: document.getElementById('upAuthor'),
        aiCheck: document.getElementById('upAiCheck'),
        aiBtn: document.getElementById('upAiToggle'),
        submit: document.getElementById('submitUploadBtn'),
        status: document.getElementById('uploadStatus'),
        overlay: document.getElementById('uploadOverlay')
    };

    const tagInput = document.getElementById('upTagsInput');
    const chipContainer = document.getElementById('tagChips');
    const container = document.getElementById('tagInputContainer');

    
    container.onclick = () => tagInput.focus();

    function renderTags() {
        chipContainer.innerHTML = '';
        uploadTags.forEach((tag, index) => {
            const chip = document.createElement('div');
            chip.className = 'tag-chip';
            chip.innerHTML = `${escapeHtml(tag)} <span class="material-symbols-rounded" style="font-size:14px">close</span>`;
            chip.querySelector('span').onclick = (e) => {
                e.stopPropagation();
                uploadTags.splice(index, 1);
                renderTags();
            };
            chipContainer.appendChild(chip);
        });
    }

    tagInput.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(tagInput.value);
        } else if (e.key === 'Backspace' && !tagInput.value && uploadTags.length > 0) {
            uploadTags.pop();
            renderTags();
        }
    };

    tagInput.onblur = () => {
        addTag(tagInput.value);
    };

    function addTag(val) {
        const clean = val.trim().replace(/,/g, '');
        if (clean && !uploadTags.includes(clean)) {
            if (/[#{}]/.test(clean)) {
                ctx.showPopup("Tags cannot contain #, { or }", "error");
                return;
            }
            uploadTags.push(clean);
            tagInput.value = '';
            renderTags();
        } else {
            tagInput.value = '';
        }
    }


    uploadEls.file.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const lowerName = file.name.toLowerCase();
        if (!lowerName.endsWith('.pdf') && !lowerName.endsWith('.docx')) {
            ctx.showPopup("Invalid file type. Only .pdf and .docx allowed.", "error");
            this.value = '';
            return;
        }

        if (file.size > 35 * 1024 * 1024) {
            ctx.showPopup("File too large (Max 35MB).", "error");
            this.value = '';
            return;
        }

        uploadEls.drop.classList.add('has-file');
        uploadEls.msg.innerHTML = `<strong>${escapeHtml(file.name)}</strong>`;
        
        if (!uploadEls.title.value) {
            uploadEls.title.value = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
        }
    });


    uploadEls.form.onsubmit = async (e) => {
        e.preventDefault();
        
        const token = ctx.getTurnstileToken(); 

        if (!token) { ctx.showPopup("Please complete the security check.", "error"); return; }
        
        const file = uploadEls.file.files[0];
        if (!file) { ctx.showPopup("Please select a file.", "error"); return; }
        
        const rawTitle = uploadEls.title.value;
        if (rawTitle.includes('#{') || rawTitle.includes('{AI}')) {
            ctx.showPopup("Title cannot contain reserved patterns '#{' or '{AI}'", "error");
            return;
        }

        uploadEls.submit.classList.add('btn-loading');
        uploadEls.submit.querySelector('span:last-child').textContent = "Uploading...";
        uploadEls.status.textContent = "Processing file...";

        try {
            const cleanText = (txt) => txt.replace(/[^a-zA-Z0-9\-\s\(\)]/g, '').trim().replace(/\s+/g, ' ');
            const safeTitle = cleanText(rawTitle);
            const safeAuthor = cleanText(uploadEls.author.value);
            const ext = file.name.split('.').pop();
            const isAi = uploadEls.aiCheck.checked;

            if (safeTitle.length > 60) throw new Error("Title too long");

            let finalBase = safeTitle;
            
            if (uploadTags.length > 0) {
                finalBase += ` #{${uploadTags.join(', ')}}`;
            }

            if (isAi) {
                finalBase += ` {AI}`; 
            }
            
            finalBase += ` (by ${safeAuthor})`;

            let finalFileName = `${finalBase}.${ext}`;
            
            let counter = 1;
            while (ctx.allItems.some(item => item.name === finalFileName)) {
                finalFileName = `${finalBase} (${counter}).${ext}`;
                counter++;
            }

            const toBase64 = file => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result.split(',')[1]);
                reader.onerror = error => reject(error);
            });

            const base64Content = await toBase64(file);
            uploadEls.status.textContent = "Uploading...";
            
            const payload = {
                fileName: finalFileName,
                fileContent: base64Content,
                author: safeAuthor,
                isAi: isAi,
                token: token
            };

            const response = await fetch(`${ctx.API_URL}?type=upload`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ctx.currentUser.token}` },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Upload failed");

            ctx.showPopup("Upload successful!", "success");
            ctx.toggleOverlay(uploadEls.overlay, false);
            
            uploadEls.form.reset();
            uploadTags = [];
            renderTags();
            uploadEls.drop.classList.remove('has-file');
            uploadEls.msg.textContent = "Drag & drop to upload";
            
            if (window.turnstile) turnstile.reset();
            
            setTimeout(() => window.location.reload(), 1500);

        } catch (err) {
            console.error(err);
            ctx.showPopup(err.message, "error");
            if (window.turnstile) turnstile.reset();
        } finally {
            uploadEls.submit.classList.remove('btn-loading');
            uploadEls.submit.querySelector('span:last-child').textContent = "Upload Note";
            uploadEls.status.textContent = "";
        }
    };

    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }
}