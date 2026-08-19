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

// Parses Instagram Reel and Post URLs to embeddable links
function parseInstagram(url) {
    // Matches patterns like: instagram.com/reel/C8Xy12345/ or instagram.com/p/C8Xy12345/
    const regex = /(?:instagram\.com\/(?:p|reel)\/)([a-zA-Z0-9_-]+)/;
    const match = url.match(regex);
    if (match && match[1]) {
        return {
            embedUrl: `https://www.instagram.com/p/${match[1]}/embed`,
            id: match[1]
        };
    }
    return null;
}

// Parses TikTok URLs to embeddable links
function parseTikTok(url) {
    // Matches patterns like: tiktok.com/@username/video/7381234567890123456 or tiktok.com/video/7381234567890123456
    const regex = /(?:tiktok\.com\/@[^\/]+\/video\/|tiktok\.com\/video\/)(\d+)/;
    const match = url.match(regex);
    if (match && match[1]) {
        return {
            embedUrl: `https://www.tiktok.com/embed/v2/${match[1]}`,
            id: match[1]
        };
    }
    return null;
}

// Parses YouTube Shorts and Video URLs to embeddable links
function parseYouTube(url) {
    // Matches shorts: youtube.com/shorts/abc123xyz
    // Matches normal watch links: youtube.com/watch?v=abc123xyz
    // Matches short links: youtu.be/abc123xyz
    const shortsRegex = /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/;
    const watchRegex = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/;
    const shortUrlRegex = /youtu\.be\/([a-zA-Z0-9_-]+)/;
    
    let match = url.match(shortsRegex);
    if (match && match[1]) {
        return {
            embedUrl: `https://www.youtube.com/embed/${match[1]}`,
            id: match[1]
        };
    }
    
    match = url.match(watchRegex);
    if (match && match[1]) {
        return {
            embedUrl: `https://www.youtube.com/embed/${match[1]}`,
            id: match[1]
        };
    }
    
    match = url.match(shortUrlRegex);
    if (match && match[1]) {
        return {
            embedUrl: `https://www.youtube.com/embed/${match[1]}`,
            id: match[1]
        };
    }
    
    return null;
}

// --- FOLDER RENDER & MANAGEMENT ---

// Returns the number of items in a folder, filtered by current page context
function getFolderItemCount(folderId) {
    if (folderId === 'all') {
        if (currentPage === 'dashboard') return savedItems.length;
        return savedItems.filter(item => item.type === currentPage).length;
    }
    
    if (currentPage === 'dashboard') {
        return savedItems.filter(item => item.folderId === folderId).length;
    } else {
        return savedItems.filter(item => item.folderId === folderId && item.type === currentPage).length;
    }
}

// Renders the list of folders in the left sidebar
function renderFolders() {
    const folderList = document.getElementById('folder-list');
    if (!folderList) return;
    
    const allCount = getFolderItemCount('all');
    let html = `
        <div class="folder-item ${activeFolderId === null ? 'active' : ''}" data-id="all">
            <div class="folder-name-container">${getIcon('folder')} All Saves (${allCount})</div>
        </div>
    `;
    
    folders.forEach(folder => {
        const isActive = activeFolderId === folder.id;
        const count = getFolderItemCount(folder.id);
        html += `
            <div class="folder-item ${isActive ? 'active' : ''}" data-id="${folder.id}">
                <div class="folder-name-container" title="${folder.name}">${getIcon('folder')} ${folder.name} (${count})</div>
                <button class="delete-folder-btn" data-id="${folder.id}" title="Delete Folder">&times;</button>
            </div>
        `;
    });
    
    folderList.innerHTML = html;
    
    // Add folder click handlers for filtering
    const items = folderList.querySelectorAll('.folder-item');
    items.forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-folder-btn')) return;
            
            const id = item.getAttribute('data-id');
            if (id === 'all') {
                activeFolderId = null;
            } else {
                activeFolderId = id;
            }
            sessionStorage.setItem('reel_vault_active_folder', activeFolderId || '');
            renderFolders();
            renderGrid();
        });
    });
    
    // Add folder delete buttons click handlers
    const deleteBtns = folderList.querySelectorAll('.delete-folder-btn');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            deleteFolder(id);
        });
    });
}

// Renders folder selector options in the input top controls
function renderFolderSelect() {
    const select = document.getElementById('select-folder');
    if (!select) return;
    
    let html = '<option value="">Uncategorized</option>';
    folders.forEach(folder => {
        html += `<option value="${folder.id}">${folder.name}</option>`;
    });
    
    select.innerHTML = html;
}

// Prompts the user to create a new folder
function createNewFolder() {
    const name = prompt("Enter a name for the new folder:");
    if (name === null) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
        alert("Folder name cannot be empty!");
        return;
    }
    
    // Prevent duplicate folder names
    if (folders.some(f => f.name.toLowerCase() === trimmedName.toLowerCase())) {
        alert("A folder with this name already exists!");
        return;
    }
    
    const newFolder = {
        id: 'folder_' + Date.now().toString(),
        name: trimmedName
    };
    
    folders.push(newFolder);
    localStorage.setItem('reel_vault_folders', JSON.stringify(folders));
    
    renderFolders();
    renderFolderSelect();
}

// Deletes a folder and shifts items in it to 'Uncategorized'
function deleteFolder(id) {
    if (confirm("Are you sure you want to delete this folder? The saved videos in it will NOT be deleted, they will become Uncategorized.")) {
        folders = folders.filter(f => f.id !== id);
        localStorage.setItem('reel_vault_folders', JSON.stringify(folders));
        
        // Clear folderId from items in this folder
        savedItems = savedItems.map(item => {
            if (item.folderId === id) {
                return { ...item, folderId: "" };
            }
            return item;
        });
        localStorage.setItem('reel_vault_saved_items', JSON.stringify(savedItems));
        
        if (activeFolderId === id) {
            activeFolderId = null;
            sessionStorage.setItem('reel_vault_active_folder', '');
        }
        
        renderFolders();
        renderFolderSelect();
        renderGrid();
        if (currentPage === 'dashboard') {
            renderDashboardStats();
        }
    }
}

// --- VIDEO SAVING & RENDERING GRID ---

// Saves a new video URL to the specified category & folder
function saveItem() {
    const inputUrl = document.getElementById('input-url');
    if (!inputUrl) return;
    
    const url = inputUrl.value.trim();
    if (!url) {
        alert("Please paste a URL first!");
        return;
    }
    
    const selectFolder = document.getElementById('select-folder');
    const folderId = selectFolder ? selectFolder.value : "";
    
    let type = '';
    let parsed = null;
    
    if (currentPage === 'dashboard') {
        // Auto-detect brand from url
        if (url.includes('instagram.com')) {
            type = 'instagram';
            parsed = parseInstagram(url);
        } else if (url.includes('tiktok.com')) {
            type = 'tiktok';
            parsed = parseTikTok(url);
        } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
            type = 'youtube';
            parsed = parseYouTube(url);
        } else {
            alert("Could not automatically detect the platform. Please make sure it's a valid Instagram Reel, TikTok, or YouTube link!");
            return;
        }
    } else {
        type = currentPage;
        if (type === 'instagram') {
            parsed = parseInstagram(url);
            if (!parsed) {
                alert("Please paste a valid Instagram Reel URL! (e.g., instagram.com/reel/...)");
                return;
            }
        } else if (type === 'tiktok') {
            parsed = parseTikTok(url);
            // Graceful degrade if URL is a shortened TikTok or cannot be fully parsed client-side
            if (!parsed) {
                if (url.includes('tiktok.com')) {
                    parsed = { embedUrl: null, id: Date.now().toString() };
                } else {
                    alert("Please paste a valid TikTok URL!");
                    return;
                }
            }
        } else if (type === 'youtube') {
            parsed = parseYouTube(url);
            if (!parsed) {
                alert("Please paste a valid YouTube Shorts/Video URL!");
                return;
            }
        }
    }
    
    // Prompt for title (optional)
    let title = prompt("Enter a title/label for this video (optional):");
    if (title === null) return; // Cancel saves
    title = title.trim();
    
    if (!title) {
        const count = savedItems.filter(item => item.type === type).length + 1;
        if (type === 'instagram') title = `Instagram Reel #${count}`;
        else if (type === 'tiktok') title = `TikTok Video #${count}`;
        else if (type === 'youtube') title = `YouTube Short #${count}`;
        else title = `Saved Video #${count}`;
    }
    
    const newItem = {
        id: Date.now().toString(),
        url: url,
        embedUrl: parsed.embedUrl,
        videoId: parsed.id,
        type: type,
        folderId: folderId,
        timestamp: Date.now(),
        title: title
    };
    
    savedItems.unshift(newItem);
    localStorage.setItem('reel_vault_saved_items', JSON.stringify(savedItems));
    
    inputUrl.value = '';
    if (selectFolder) selectFolder.value = '';
    
    renderGrid();
    renderFolders();
    if (currentPage === 'dashboard') {
        renderDashboardStats();
    }
}

// Renders the media cards grid
function renderGrid() {
    const grid = document.getElementById('reels-grid');
    if (!grid) return;
    
    let itemsToRender = [];
    
    if (currentPage === 'dashboard') {
        itemsToRender = [...savedItems];
    } else {
        itemsToRender = savedItems.filter(item => item.type === currentPage);
    }
    
    // Filter by active folder
    if (activeFolderId !== null) {
        itemsToRender = itemsToRender.filter(item => item.folderId === activeFolderId);
    }
    
    // On the dashboard, we only show the 6 most recent files
    if (currentPage === 'dashboard') {
        itemsToRender = itemsToRender.slice(0, 6);
    }
    
    if (itemsToRender.length === 0) {
        let platformName = 'videos';
        if (currentPage === 'instagram') platformName = 'Instagram Reels';
        else if (currentPage === 'tiktok') platformName = 'TikToks';
        else if (currentPage === 'youtube') platformName = 'YouTube Shorts';
        
        let folderName = '';
        if (activeFolderId !== null) {
            const folder = folders.find(f => f.id === activeFolderId);
            folderName = folder ? ` in "${folder.name}"` : '';
        }
        
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📥</div>
                <h3>No saved ${platformName}${folderName} yet!</h3>
                <p>Paste a URL and click save to start organizing your catalog.</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    itemsToRender.forEach(item => {
        const folder = folders.find(f => f.id === item.folderId);
        const folderName = folder ? folder.name : 'Uncategorized';
        
        let mediaHtml = '';
        if (item.embedUrl) {
            mediaHtml = `<iframe src="${item.embedUrl}" allowfullscreen></iframe>`;
        } else {
            // Fallback display card
            let iconName = 'inbox';
            let platformLabel = 'Video';
            if (item.type === 'instagram') { iconName = 'instagram'; platformLabel = 'Instagram Reel'; }
            else if (item.type === 'tiktok') { iconName = 'tiktok'; platformLabel = 'TikTok Video'; }
            else if (item.type === 'youtube') { iconName = 'youtube'; platformLabel = 'YouTube Short'; }
            
            mediaHtml = `
                <div class="reel-fallback-card">
                    <div class="reel-fallback-icon">${getIcon(iconName)}</div>
                    <div class="reel-fallback-title" title="${item.title}">${item.title}</div>
                    <p style="font-size: 12px; opacity: 0.8; margin-bottom: 16px;">Direct preview unavailable for this format.</p>
                    <a href="${item.url}" target="_blank" class="reel-fallback-button">Watch on ${platformLabel} ↗</a>
                </div>
            `;
        }
        
        // Brand badges (Dashboard specific)
        let badgeHtml = '';
        if (currentPage === 'dashboard') {
            let badgeClass = '';
            let badgeText = '';
            if (item.type === 'instagram') { badgeClass = 'badge-instagram'; badgeText = 'Instagram'; }
            else if (item.type === 'tiktok') { badgeClass = 'badge-tiktok'; badgeText = 'TikTok'; }
            else if (item.type === 'youtube') { badgeClass = 'badge-youtube'; badgeText = 'YouTube'; }
            
            badgeHtml = `<span class="badge ${badgeClass}">${badgeText}</span>`;
        }
        
        html += `
            <div class="reel-card" data-id="${item.id}">
                ${badgeHtml}
                <button class="delete-reel-btn" data-id="${item.id}" title="Delete video">&times;</button>
                <div class="reel-media-container">
                    ${mediaHtml}
                </div>
                <div class="reel-details">
                    <div class="reel-details-title" title="${item.title}">${item.title}</div>
                    <div class="reel-details-folder">📁 ${folderName}</div>
                </div>
            </div>
        `;
    });
    
    grid.innerHTML = html;
    
    // Attach event listeners to delete buttons
    const deleteBtns = grid.querySelectorAll('.delete-reel-btn');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            deleteItem(id);
        });
    });
}

// Deletes a saved video item
function deleteItem(id) {
    if (confirm("Are you sure you want to delete this saved video?")) {
        savedItems = savedItems.filter(item => item.id !== id);
        localStorage.setItem('reel_vault_saved_items', JSON.stringify(savedItems));
        
        renderGrid();
        renderFolders();
        if (currentPage === 'dashboard') {
            renderDashboardStats();
        }
    }
}

// --- DASHBOARD COUNTERS ---

// Renders stats values on Dashboard page
function renderDashboardStats() {
    if (currentPage !== 'dashboard') return;
    
    const totalVal = document.getElementById('stat-total-val');
    const instaVal = document.getElementById('stat-instagram-val');
    const tiktokVal = document.getElementById('stat-tiktok-val');
    const youtubeVal = document.getElementById('stat-youtube-val');
    
    if (totalVal) totalVal.textContent = savedItems.length;
    if (instaVal) instaVal.textContent = savedItems.filter(item => item.type === 'instagram').length;
    if (tiktokVal) tiktokVal.textContent = savedItems.filter(item => item.type === 'tiktok').length;
    if (youtubeVal) youtubeVal.textContent = savedItems.filter(item => item.type === 'youtube').length;
}

// --- DOM READY INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    // Read the page type from body dataset
    currentPage = document.body.dataset.page || 'dashboard';
    
    // Load active folder from sessionStorage (helps retain selected folder on page swaps)
    const storedActiveFolder = sessionStorage.getItem('reel_vault_active_folder');
    if (storedActiveFolder) {
        if (folders.some(f => f.id === storedActiveFolder)) {
            activeFolderId = storedActiveFolder;
        } else {
            activeFolderId = null;
            sessionStorage.setItem('reel_vault_active_folder', '');
        }
    } else {
        activeFolderId = null;
    }
    
    // Hook up "+ New" button
    const actionCreateFolder = document.getElementById('action-create-folder');
    if (actionCreateFolder) {
        actionCreateFolder.addEventListener('click', createNewFolder);
    }
    
    // Hook up "Save Video" button
    const actionSaveVideo = document.getElementById('action-save-video');
    if (actionSaveVideo) {
        actionSaveVideo.addEventListener('click', saveItem);
    }
    
    // Support pressing 'Enter' in url inputs
    const inputVideoUrl = document.getElementById('input-video-url');
    if (inputVideoUrl) {
        inputVideoUrl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveItem();
            }
        });
    }
    
    // Render and bootstrap elements
    renderFolders();
    renderFolderSelect();
    renderGrid();
    
    if (currentPage === 'dashboard') {
        renderDashboardStats();
    }
});

// Helper functions for updating DOM
function getFolderCollectionElement() {
    return document.getElementById('sidebar-folder-collection');
}

function getVideoGridElement() {
    return document.getElementById('video-grid');
}

function getInputUrlElement() {
    return document.getElementById('input-video-url');
}

function getSelectFolderElement() {
    return document.getElementById('select-target-folder');
}

// Update other functions to use these helpers (truncated for brevity)...
