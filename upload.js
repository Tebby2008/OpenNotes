// --- upload.js ---

let uploadTags = [];

export function initUpload(API_URL, currentUserGetter, turnstileTokenGetter, allItemsGetter, onUploadSuccess, showPopup) {
    const els = {
        overlay: document.getElementById('uploadOverlay'),
        btn: document.getElementById('uploadBtn'),
        back: document.getElementById('uploadBackBtn'),
        form: document.getElementById('uploadForm'),
        file: document.getElementById('fileInput'),
        drop: document.getElementById('dropArea'),
        msg: document.querySelector('.file-msg'),
        title: document.getElementById('upTitle'),
        author: document.getElementById('upAuthor'),
        aiBtn: document.getElementById('upAiToggle'),
        aiCheck: document.getElementById('upAiCheck'),
        submit: document.getElementById('submitUploadBtn'),
        status: document.getElementById('uploadStatus'),
        tagInput: document.getElementById('upTagInput'),
        tagContainer: document.getElementById('upTagContainer')
    };

    function renderTags() {
        if (!els.tagContainer) return;
        els.tagContainer.innerHTML = '';
        uploadTags.forEach((tag, index) => {
            const chip = document.createElement('div');
            chip.className = 'tag-chip';
            chip.innerHTML = `<span>#${tag}</span><span class="material-symbols-rounded close">close</span>`;
            const closeBtn = chip.querySelector('.close');
            if (closeBtn) {
                closeBtn.onclick = () => {
                    uploadTags.splice(index, 1);
                    renderTags();
                };
            }
            els.tagContainer.appendChild(chip);
        });
    }

    function addTagsFromInput(rawVal) {
        if (!rawVal) return;
        
        const parts = rawVal.split(',');

        parts.forEach(part => {
            const clean = part.replace(/[^a-zA-Z0-9\s\-]/g, '').trim();
            
            if (clean && !uploadTags.includes(clean) && uploadTags.length < 10) {
                uploadTags.push(clean);
            }
        });
        
        renderTags();
        if (els.tagInput) els.tagInput.value = '';
    }

    if (els.tagInput) {
        els.tagInput.addEventListener('keydown', (e) => {
            if (e.key === ',') {
                e.preventDefault();
                addTagsFromInput(els.tagInput.value);
            }
            else if (e.key === 'Enter') {
                e.preventDefault();
                addTagsFromInput(els.tagInput.value);
            }
            else if (e.key === 'Backspace' && els.tagInput.value === '' && uploadTags.length > 0) {
                uploadTags.pop();
                renderTags();
            }
        });

        els.tagInput.addEventListener('blur', () => {
            if (els.tagInput && els.tagInput.value.trim()) {
                addTagsFromInput(els.tagInput.value);
            }
        });
        
        els.tagInput.addEventListener('paste', (e) => {
            setTimeout(() => {
                if (els.tagInput.value.includes(',')) {
                    addTagsFromInput(els.tagInput.value);
                }
            }, 50);
        });
    }

    if (els.title) {
        els.title.addEventListener('input', (e) => {
            const val = e.target.value;
            if (val.includes('#{') || val.includes('{AI}')) {
                e.target.classList.add('input-error');
                showPopup("Do not include tags or {AI} in the title manually. Use the options below.", "error");
            } else {
                e.target.classList.remove('input-error');
            }
        });
    }

    if (els.aiBtn) {
        els.aiBtn.onclick = () => {
            els.aiCheck.checked = !els.aiCheck.checked;
            const isAi = els.aiCheck.checked;
            els.aiBtn.classList.toggle('active-ai', isAi);
            els.aiBtn.querySelector('span:last-child').textContent = isAi ? "Yes {AI}" : "No";
        };
    }

    if (els.file) {
        els.file.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            if (file.size > 35 * 1024 * 1024) {
                showPopup("File too large (>35MB).", "error");
                e.target.value = '';
                return;
            }

            const ext = file.name.split('.').pop().toLowerCase();
            if (ext !== 'pdf' && ext !== 'docx') {
                showPopup("Only .pdf and .docx allowed.", "error");
                e.target.value = '';
                return;
            }

            els.drop.classList.add('has-file');
            els.msg.innerHTML = `<strong>${file.name}</strong>`;
            
            if (!els.title.value) {
                els.title.value = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
            }
        });
    }

    if (els.form) {
        els.form.onsubmit = async (e) => {
            e.preventDefault();
            
            const currentUser = currentUserGetter();
            const turnstileToken = turnstileTokenGetter();
            const allItems = allItemsGetter();

            if (!currentUser) return showPopup("You must log in first.", "error");
            if (!turnstileToken) return showPopup("Please complete the security check.", "error");
            
            const file = els.file.files[0];
            if (!file) return showPopup("Please select a file.", "error");

            if (els.title.value.includes('#{') || els.title.value.includes('{AI}')) {
                return showPopup("Invalid characters in title.", "error");
            }

            els.submit.classList.add('btn-loading');
            els.submit.querySelector('span:last-child').textContent = "Uploading...";
            els.status.textContent = "Processing file...";

            try {
                const cleanText = (txt) => txt.replace(/[^a-zA-Z0-9\-\s\(\)]/g, '').trim().replace(/\s+/g, ' ');
                const safeTitle = cleanText(els.title.value);
                const safeAuthor = cleanText(els.author.value);
                const ext = file.name.split('.').pop();

                let tagString = "";
                if (uploadTags.length > 0) {
                    tagString = " #{" + uploadTags.join(", ") + "}";
                }
                
                let aiString = els.aiCheck.checked ? " {AI}" : "";
                
                let baseName = `${safeTitle} (by ${safeAuthor})${tagString}${aiString}`;
                let finalFileName = `${baseName}.${ext}`;
                
                let counter = 1;
                while (allItems.some(item => item.name === finalFileName)) {
                    finalFileName = `${baseName} (${counter}).${ext}`;
                    counter++;
                }

                const toBase64 = file => new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result.split(',')[1]);
                    reader.onerror = reject;
                });

                const base64Content = await toBase64(file);
                els.status.textContent = "Uploading to servers...";

                const token = currentUser?.token || "";

                const payload = {
                    fileName: finalFileName,
                    fileContent: base64Content,
                    author: safeAuthor,
                    isAi: els.aiCheck.checked,
                    token: turnstileToken
                };

                const response = await fetch(`${API_URL}?type=upload`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const result = await response.json();
                    throw new Error(result.error || "Upload failed");
                }

                showPopup("Upload successful!", "success");
                els.form.reset();
                uploadTags = [];
                renderTags();
                els.drop.classList.remove('has-file');
                els.msg.textContent = "Drag & drop or click to upload PDF/DOCX (MAX. 35MiB)";
                els.aiBtn.classList.remove('active-ai');
                els.aiBtn.querySelector('span:last-child').textContent = "No";
                
                if (onUploadSuccess) onUploadSuccess();

            } catch (err) {
                console.error(err);
                showPopup(err.message || "Error", "error");
            } finally {
                els.submit.classList.remove('btn-loading');
                els.submit.querySelector('span:last-child').textContent = "Upload Note";
                els.status.textContent = "";
            }
        };
    }
}