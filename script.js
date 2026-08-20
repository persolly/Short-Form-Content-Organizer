// --- ICON DEFINITIONS ---
const ICONS = {
    folder: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
    dashboard: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
    instagram: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
    tiktok: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>`,
    youtube: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>`,
    inbox: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>`
};

function getIcon(name, className = "icon") {
    return `<span class="${className}">${ICONS[name] || ''}</span>`;
}

// --- GLOBAL STATE ---
let folders = JSON.parse(localStorage.getItem('reel_vault_folders')) || [];
let savedItems = JSON.parse(localStorage.getItem('reel_vault_saved_items')) || [];
let activeFolderId = null;
let currentPage = 'dashboard';

// --- PLATFORM REGEX AND PARSING HELPERS ---

function parseInstagram(url) {
    const match = url.match(/(?:instagram\.com|instagr\.am)\/(?:p|reel|reels)\/([a-zA-Z0-9_-]+)/i);
    return match ? { embedUrl: `https://www.instagram.com/p/${match[1]}/embed`, id: match[1] } : null;
}

function parseTikTok(url) {
    const match = url.match(/(?:tiktok\.com\/(?:@[^\/]+\/video|video|v)\/|tiktok\.com\/embed\/v2\/|m\.tiktok\.com\/v\/)(\d+)/i);
    return match ? { embedUrl: `https://www.tiktok.com/embed/v2/${match[1]}`, id: match[1] } : null;
}

function parseYouTube(url) {
    const match = url.match(/(?:youtube\.com\/shorts\/|youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/i);
    return match ? { embedUrl: `https://www.youtube.com/embed/${match[1]}`, id: match[1] } : null;
}

// ...
function openErrorModal(title, message) {
    const overlay = document.getElementById('modal-overlay');
    const titleEl = document.getElementById('modal-title');
    const inputEl = document.getElementById('modal-input');
    const confirmBtn = document.getElementById('modal-confirm-btn');
    
    titleEl.textContent = title;
    if (inputEl) inputEl.style.display = 'none';
    
    let msgEl = document.getElementById('modal-message');
    if (!msgEl) {
        msgEl = document.createElement('p');
        msgEl.id = 'modal-message';
        msgEl.style.marginBottom = '16px';
        msgEl.style.color = 'var(--text-secondary)';
        msgEl.style.fontSize = '14.5px';
        titleEl.parentNode.insertBefore(msgEl, inputEl);
    }
    msgEl.textContent = message;
    msgEl.style.display = 'block';
    
    confirmBtn.textContent = 'OK';
    confirmBtn.className = 'btn btn-primary';
    
    overlay.style.display = 'flex';
    confirmBtn.focus();
    
    confirmBtn.onclick = () => {
        closeModal();
    };
}

// --- FOLDER RENDER & MANAGEMENT ---

function getFolderItemCount(folderId) {
    if (folderId === 'all') {
        return (currentPage === 'dashboard') ? savedItems.length : savedItems.filter(item => item.type === currentPage).length;
    }
    return (currentPage === 'dashboard') 
        ? savedItems.filter(item => item.folderId === folderId).length 
        : savedItems.filter(item => item.folderId === folderId && item.type === currentPage).length;
}

function renderFolders() {
    const folderCollection = document.getElementById('sidebar-folder-collection');
    if (!folderCollection) return;
    
    let html = `
        <div class="folder-item ${activeFolderId === null ? 'active' : ''}" data-id="all">
            <div class="folder-name-container">${getIcon('folder')} All Saves (${getFolderItemCount('all')})</div>
        </div>
    `;
    
    folders.forEach(folder => {
        const count = getFolderItemCount(folder.id);
        html += `
            <div class="folder-item ${activeFolderId === folder.id ? 'active' : ''}" data-id="${folder.id}">
                <div class="folder-name-container" title="${folder.name}">${getIcon('folder')} ${folder.name} (${count})</div>
                <button class="delete-folder-btn" data-id="${folder.id}" title="Delete Folder">&times;</button>
            </div>
        `;
    });
    
    folderCollection.innerHTML = html;
    
    folderCollection.querySelectorAll('.folder-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-folder-btn')) return;
            const id = item.getAttribute('data-id');
            activeFolderId = (id === 'all') ? null : id;
            sessionStorage.setItem('reel_vault_active_folder', activeFolderId || '');
            renderFolders();
            renderGrid();
        });
    });
    
    folderCollection.querySelectorAll('.delete-folder-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteFolder(btn.getAttribute('data-id'));
        });
    });
}

function renderFolderSelect() {
    const select = document.getElementById('select-target-folder');
    if (!select) return;
    
    let html = '<option value="">Uncategorized</option>';
    folders.forEach(folder => {
        html += `<option value="${folder.id}">${folder.name}</option>`;
    });
    select.innerHTML = html;
}

function createNewFolder() {
    openModal("Create New Folder", "Folder Name", (name) => {
        if (!name.trim()) return alert("Folder name cannot be empty!");
        if (folders.some(f => f.name.toLowerCase() === name.trim().toLowerCase())) return alert("Already exists!");
        
        folders.push({ id: 'folder_' + Date.now().toString(), name: name.trim() });
        localStorage.setItem('reel_vault_folders', JSON.stringify(folders));
        renderFolders();
        renderFolderSelect();
    });
}

function deleteFolder(id) {
    if (confirm("Are you sure? Items will be moved to Uncategorized.")) {
        folders = folders.filter(f => f.id !== id);
        localStorage.setItem('reel_vault_folders', JSON.stringify(folders));
        savedItems = savedItems.map(item => item.folderId === id ? { ...item, folderId: "" } : item);
        localStorage.setItem('reel_vault_saved_items', JSON.stringify(savedItems));
        
        if (activeFolderId === id) { activeFolderId = null; sessionStorage.setItem('reel_vault_active_folder', ''); }
        renderFolders();
        renderFolderSelect();
        renderGrid();
        if (currentPage === 'dashboard') renderDashboardStats();
    }
}

// --- VIDEO SAVING & RENDERING GRID ---

function saveItem() {
    const inputUrl = document.getElementById('input-video-url');
    if (!inputUrl || !inputUrl.value.trim()) return openErrorModal("Error", "Please paste a URL first!");
    
    const url = inputUrl.value.trim();
    const folderId = document.getElementById('select-target-folder')?.value || "";
    
    let type = currentPage === 'dashboard' ? ((url.includes('instagram.com') || url.includes('instagr.am')) ? 'instagram' : url.includes('tiktok.com') ? 'tiktok' : 'youtube') : currentPage;
    let parsed = (type === 'instagram') ? parseInstagram(url) : (type === 'tiktok') ? parseTikTok(url) : parseYouTube(url);
    
    if (!parsed) return openErrorModal("Invalid URL", "The link you pasted is not a valid " + type + " URL.");
    
    openModal("Enter Video Title", "Title", (title) => {
        const newItem = {
            id: Date.now().toString(),
            url: url,
            embedUrl: parsed.embedUrl,
            videoId: parsed.id,
            type: type,
            folderId: folderId,
            timestamp: Date.now(),
            title: title || (type + " Video #" + (savedItems.length + 1))
        };
        
        savedItems.unshift(newItem);
        localStorage.setItem('reel_vault_saved_items', JSON.stringify(savedItems));
        
        inputUrl.value = '';
        renderGrid();
        renderFolders();
        if (currentPage === 'dashboard') renderDashboardStats();
    });
}

function renderGrid() {
    const grid = document.getElementById('video-grid');
    if (!grid) return;
    
    let itemsToRender = (currentPage === 'dashboard') ? [...savedItems] : savedItems.filter(item => item.type === currentPage);
    if (activeFolderId !== null) itemsToRender = itemsToRender.filter(item => item.folderId === activeFolderId);
    if (currentPage === 'dashboard') itemsToRender = itemsToRender.slice(0, 6);
    
    if (itemsToRender.length === 0) {
        grid.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📥</div><h3>No saved items yet!</h3></div>`;
        return;
    }
    
    let html = '';
    itemsToRender.forEach(item => {
        const folderName = folders.find(f => f.id === item.folderId)?.name || 'Uncategorized';
        let mediaHtml = item.embedUrl ? `<iframe src="${item.embedUrl}" allowfullscreen></iframe>` : `<div class="reel-fallback-card"><div class="reel-fallback-icon">${getIcon(item.type)}</div><p>Preview unavailable</p></div>`;
        
        html += `
            <div class="reel-card" data-id="${item.id}">
                <div class="card-menu-container">
                    <button class="card-menu-btn" title="More actions">&#8942;</button>
                    <div class="card-menu-dropdown">
                        <button class="menu-item copy-link-btn" data-url="${item.url}">${getIcon('copy')} Copy Link</button>
                        <button class="menu-item delete-card-btn" data-id="${item.id}"><span style="color:var(--danger-red)">${ICONS['trash']}</span> Delete</button>
                    </div>
                </div>
                <div class="reel-media-container">${mediaHtml}</div>
                <div class="reel-details">
                    <div class="reel-details-title" title="${item.title}">${item.title}</div>
                    <div class="reel-details-folder">${getIcon('folder')} ${folderName}</div>
                </div>
            </div>
        `;
    });
    
    grid.innerHTML = html;
    
    // Toggle card menus
    grid.querySelectorAll('.card-menu-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.card-menu-dropdown').forEach(d => {
                if (d !== btn.nextElementSibling) d.classList.remove('show');
            });
            btn.nextElementSibling.classList.toggle('show');
        });
    });
    
    // Copy link button handler
    grid.querySelectorAll('.copy-link-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            copyToClipboard(btn.getAttribute('data-url'));
            btn.closest('.card-menu-dropdown').classList.remove('show');
        });
    });
    
    // Delete item button handler
    grid.querySelectorAll('.delete-card-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteItem(btn.getAttribute('data-id'));
            btn.closest('.card-menu-dropdown').classList.remove('show');
        });
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast("Link copied to clipboard! 📋");
    });
}

function showToast(message) {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = 'show';
    setTimeout(() => { toast.className = ''; }, 2500);
}

function deleteItem(id) {
    if (confirm("Are you sure?")) {
        savedItems = savedItems.filter(item => item.id !== id);
        localStorage.setItem('reel_vault_saved_items', JSON.stringify(savedItems));
        renderGrid();
        renderFolders();
        if (currentPage === 'dashboard') renderDashboardStats();
    }
}

// --- MODAL LOGIC ---
function openModal(title, placeholder, onConfirm) {
    const overlay = document.getElementById('modal-overlay');
    const titleEl = document.getElementById('modal-title');
    const inputEl = document.getElementById('modal-input');
    const confirmBtn = document.getElementById('modal-confirm-btn');
    
    titleEl.textContent = title;
    inputEl.placeholder = placeholder;
    inputEl.value = '';
    overlay.style.display = 'flex';
    inputEl.focus();
    
    confirmBtn.onclick = () => {
        onConfirm(inputEl.value);
        closeModal();
    };
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}

// --- DASHBOARD COUNTERS ---
function renderDashboardStats() {
    if (currentPage !== 'dashboard') return;
    
    document.getElementById('stat-total-count').textContent = savedItems.length;
    document.getElementById('stat-instagram-count').textContent = savedItems.filter(item => item.type === 'instagram').length;
    document.getElementById('stat-tiktok-count').textContent = savedItems.filter(item => item.type === 'tiktok').length;
    document.getElementById('stat-youtube-count').textContent = savedItems.filter(item => item.type === 'youtube').length;
}

// --- DOM READY INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    currentPage = document.body.dataset.page || 'dashboard';
    activeFolderId = sessionStorage.getItem('reel_vault_active_folder') || null;
    
    // Safety check for dashboard page which might not have these elements
    document.getElementById('action-create-folder')?.addEventListener('click', createNewFolder);
    document.getElementById('action-save-video')?.addEventListener('click', saveItem);
    document.getElementById('input-video-url')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') saveItem(); });
    
    renderFolders();
    renderFolderSelect();
    renderGrid();
    if (currentPage === 'dashboard') renderDashboardStats();
});
