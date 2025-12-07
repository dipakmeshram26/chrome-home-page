let currentColor = '#00ffcc';
let backgroundInterval;
let background = 'matrix';

// Matrix Rain Background
function initMatrixRain() {
    try {
        const canvas = document.getElementById('canvas');
        if (!canvas) throw new Error('Canvas element not found');
        const ctx = canvas.getContext('2d');
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()';
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);

        function drawMatrix() {
            ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = currentColor;
            ctx.font = fontSize + 'px VT323';

            for (let i = 0; i < drops.length; i++) {
                const text = chars.charAt(Math.floor(Math.random() * chars.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        }
        return setInterval(drawMatrix, 50);
    } catch (e) {
        console.error('Matrix rain initialization failed:', e);
        showErrorPopup(e.message);
        return null;
    }
}

function updateBackground() {
    try {
        clearInterval(backgroundInterval);
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (background === 'matrix') {
            backgroundInterval = initMatrixRain();
        } else if (background === 'grid') {
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = 0.5;
            for (let x = 0; x < canvas.width; x += 50) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += 50) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
        } else if (background === 'city') {
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#000');
            gradient.addColorStop(1, currentColor + '66');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = currentColor;
            for (let i = 0; i < 20; i++) {
                ctx.beginPath();
                ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
                ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
                ctx.stroke();
            }
        }
    } catch (e) {
        console.error('Background update failed:', e);
        showErrorPopup(e.message);
    }
}

// Clock
function updateClock() {
    try {
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour12: true });
        const date = now.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric' });
        const clockTime = document.getElementById('clock-time');
        const clockDate = document.getElementById('clock-date');
        if (clockTime && clockDate) {
            clockTime.textContent = time;
            clockDate.textContent = date;
        } else {
            throw new Error('Clock elements not found');
        }
    } catch (e) {
        console.error('Clock update failed:', e);
        showErrorPopup(e.message);
    }
}

// Search
function search() {
    try {
        const searchInput = document.getElementById('search');
        if (!searchInput) throw new Error('Search input not found');
        const query = searchInput.value.trim();
        if (query) {
            window.open(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`, '_blank');
        }
    } catch (e) {
        console.error('Search failed:', e);
        showErrorPopup(e.message);
    }
}

// Weather
let currentWeather = 'Loading...';
async function fetchWeather() {
    try {
        const res = await fetch('https://wttr.in/New+Delhi?format=%C+%t');
        const text = await res.text();
        currentWeather = text.trim() + ' (New Delhi)';
    } catch (e) {
        console.error('Weather fetch failed:', e);
        currentWeather = '24°C, Clear (New Delhi)';
        showErrorPopup(e.message);
    }
}

// Quotes
const quotes = [
    "Code is poetry in motion.",
    "Hack the planet!",
    "The future is written in binary.",
    "Stay curious, stay dangerous."
];
function initQuote() {
    try {
        const quoteElement = document.getElementById('quote');
        if (!quoteElement) throw new Error('Quote element not found');
        quoteElement.textContent = quotes[Math.floor(Math.random() * quotes.length)];
    } catch (e) {
        console.error('Quote initialization failed:', e);
        showErrorPopup(e.message);
    }
}

// Bookmarks Persistence
const defaultTiles = [
    { url: 'https://youtube.com', name: 'YouTube' },
    { url: 'https://mail.google.com', name: 'Gmail' },
    { url: 'https://chat.openai.com', name: 'ChatGPT' },
    { url: 'https://github.com', name: 'GitHub' }
];

function loadTiles() {
    try {
        const tilesContainer = document.getElementById('tiles');
        if (!tilesContainer) throw new Error('Tiles container not found');
        tilesContainer.innerHTML = '';
        let savedTiles = JSON.parse(localStorage.getItem('savedTiles')) || defaultTiles;

        savedTiles.forEach((tile) => {
            const tileElement = document.createElement('a');
            tileElement.href = tile.url;
            tileElement.className = 'tile glitch';
            tileElement.innerHTML = `
                <img src="https://www.google.com/s2/favicons?domain=${tile.url}" alt="${tile.name}">
                <span>${tile.name}</span>
            `;
            tilesContainer.appendChild(tileElement);
        });

        const addTile = document.createElement('div');
        addTile.className = 'tile add-tile glitch';
        addTile.innerHTML = `
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${encodeURIComponent(currentColor.slice(1))}'%3E%3Cpath d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'/%3E%3C/svg%3E" alt="+">
            <span>Add</span>
        `;
        tilesContainer.appendChild(addTile);
        addTile.addEventListener('click', showAddInput);
    } catch (e) {
        console.error('Tile loading failed:', e);
        showErrorPopup(e.message);
    }
}

function addNewTile() {
    try {
        const newUrlInput = document.getElementById('new-url');
        const addInput = document.getElementById('add-input');
        if (!newUrlInput || !addInput) throw new Error('Add tile inputs not found');
        const newUrl = newUrlInput.value.trim();
        if (newUrl) {
            const name = newUrl.replace(/https?:\/\//, '').split('/')[0];
            const tile = { url: newUrl.startsWith('http') ? newUrl : 'https://' + newUrl, name };
            let savedTiles = JSON.parse(localStorage.getItem('savedTiles')) || defaultTiles;
            savedTiles.push(tile);
            localStorage.setItem('savedTiles', JSON.stringify(savedTiles));
            loadTiles();
            newUrlInput.value = '';
            addInput.style.display = 'none';
        }
    } catch (e) {
        console.error('Add tile failed:', e);
        showErrorPopup(e.message);
    }
}

// Terminal Login
let terminalHistory = [];
let lastBookmarkList = null;

// Username Management
function updateUsernameDisplay() {
    try {
        const username = localStorage.getItem('rootUsername') || 'BlackArch:2.0';
        const greetingText = document.getElementById('greeting-text');
        const terminalPrefix = document.getElementById('terminal-prefix');
        const rootUsernameInput = document.getElementById('root-username');
        if (!greetingText || !terminalPrefix || !rootUsernameInput) throw new Error('Username elements not found');
        greetingText.textContent = username;
        terminalPrefix.textContent = `${username}:~$ `;
        rootUsernameInput.value = username;
    } catch (e) {
        console.error('Username update failed:', e);
        showErrorPopup(e.message);
    }
}

// Customization Modal
function showCustomizeModal() {
    try {
        const modal = document.getElementById('customize-modal');
        if (!modal) throw new Error('Customize modal not found');
        modal.style.display = 'flex';
    } catch (e) {
        console.error('Show customize modal failed:', e);
        showErrorPopup(e.message);
    }
}

function hideCustomizeModal() {
    try {
        const modal = document.getElementById('customize-modal');
        if (!modal) throw new Error('Customize modal not found');
        modal.style.display = 'none';
    } catch (e) {
        console.error('Hide customize modal failed:', e);
        showErrorPopup(e.message);
    }
}

// Toggle Search Bar and Username
function applyToggles() {
    try {
        const showSearchBar = localStorage.getItem('showSearchBar') === 'true';
        const enableWebSearch = localStorage.getItem('enableWebSearch') !== 'false';
        const searchBarToggle = document.getElementById('search-bar-toggle');
        const webSearchToggle = document.getElementById('web-search-toggle');
        const searchBar = document.getElementById('search-bar');
        const terminalWidget = document.getElementById('terminal-widget');
        if (!searchBarToggle || !webSearchToggle || !searchBar || !terminalWidget) {
            throw new Error('Toggle elements not found');
        }
        searchBarToggle.checked = showSearchBar;
        webSearchToggle.checked = enableWebSearch;
        searchBar.style.display = showSearchBar ? 'block' : 'none';
        terminalWidget.style.display = 'block';
        updateUsernameDisplay();
    } catch (e) {
        console.error('Apply toggles failed:', e);
        showErrorPopup(e.message);
    }
}

// Terminal Commands
const commandHelp = {
    help: 'Shows this help message or details about a specific command. Usage: help [command]',
    whoami: 'Displays user information.',
    clear: 'Clears the terminal output.',
    listbookmarks: 'Lists all saved bookmarks.',
    search: 'Searches the web. Usage: search <query> (or any input when Web Search is enabled)',
    open: 'Opens a bookmark. Usage: open <bookmark-name>',
    addbookmark: 'Adds a new bookmark. Usage: addbookmark <url> [name]',
    clearbookmarks: 'Clears all bookmarks and restores defaults.',
    weather: 'Shows current weather for New Delhi.',
    quote: 'Displays a random quote.',
    theme: 'Changes the dashboard theme. Usage: theme <green|purple|red>',
    background: 'Changes the background style. Usage: background <matrix|grid|city>',
    clearhistory: 'Clears terminal command history.',
    addcommand: 'Adds a custom command. Usage: addcommand <name> <action>',
    hack: 'Initiates a fun hacking simulation.'
};

function handleTerminalKeydown(event) {
    try {
        const input = document.getElementById('terminal-input-post-login');
        if (!input) throw new Error('Terminal input not found');
        if (event.key === 'Enter') {
            runPostLoginCommand();
        } else if (event.key === 'Tab') {
            event.preventDefault();
            const text = input.value.trim().toLowerCase();
            const commands = Object.keys(commandHelp);
            const savedTiles = JSON.parse(localStorage.getItem('savedTiles')) || defaultTiles;
            const bookmarkNames = savedTiles.map(t => t.name.toLowerCase());
            const webSearchEnabled = document.getElementById('web-search-toggle')?.checked || false;
            let suggestions = commands.filter(c => c.startsWith(text));

            if (text.startsWith('b.')) {
                const partial = text.slice(2);
                suggestions = bookmarkNames.filter(name => name.startsWith(partial));
                if (suggestions.length > 0) {
                    input.value = 'b.' + suggestions[0];
                }
            } else if (!webSearchEnabled && suggestions.length > 0) {
                input.value = suggestions[0];
            }
        }
    } catch (e) {
        console.error('Terminal keydown handler failed:', e);
        showErrorPopup(e.message);
    }
}

function runPostLoginCommand() {
    try {
        const postInput = document.getElementById('terminal-input-post-login');
        const postOutput = document.getElementById('terminal-output-post-login');
        if (!postInput || !postOutput) throw new Error('Terminal elements not found');
        const command = postInput.value.trim().toLowerCase();
        let response = '';
        const savedTiles = JSON.parse(localStorage.getItem('savedTiles')) || defaultTiles;
        const customCommands = JSON.parse(localStorage.getItem('customCommands')) || {};
        const webSearchEnabled = document.getElementById('web-search-toggle')?.checked || false;

        if (!command) {
            postOutput.textContent += `\n> `;
            postOutput.scrollTop = postOutput.scrollHeight;
            postInput.value = '';
            return;
        }

        terminalHistory.push(command);
        postOutput.textContent += `\n> ${postInput.value}`;

        if (command === 'help') {
            response = '[SYSTEM] Commands:\n' + Object.keys(commandHelp).join(', ');
        } else if (command.startsWith('help ')) {
            const cmd = command.slice(5).trim();
            response = commandHelp[cmd] || `[ERROR] No help available for '${cmd}'`;
        } else if (command === 'whoami') {
            response = '[SYSTEM] You are ' + (localStorage.getItem('rootUsername') || 'BlackArch:2.0') + ', the cyberpunk coder!';
        } else if (command === 'clear') {
            postOutput.textContent = '';
            response = '[SYSTEM] Terminal cleared';
            lastBookmarkList = null;
        } else if (command === 'listbookmarks') {
            if (savedTiles.length > 0) {
                response = '[SYSTEM] Bookmarks:\n' + savedTiles.map((tile, index) => `${index + 1}. ${tile.name} (${tile.url})`).join('\n');
                lastBookmarkList = savedTiles;
            } else {
                response = '[SYSTEM] No bookmarks found.';
                lastBookmarkList = null;
            }
        } else if (command.startsWith('search ')) {
            const query = command.slice(7).trim();
            if (query) {
                response = `[SYSTEM] Searching for: ${query} ...`;
                postOutput.textContent += `\n${response}`;
                postOutput.scrollTop = postOutput.scrollHeight;
                window.open(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`, '_blank');
                response = '[OK] Query sent to network';
            } else {
                response = '[ERROR] Search query required. Usage: search <query>';
                showErrorPopup(response);
            }
        } else if (command.startsWith('web.')) {
            const query = command.slice(4).trim();
            if (query) {
                response = `[SYSTEM] Searching for: ${query} ...`;
                postOutput.textContent += `\n${response}`;
                postOutput.scrollTop = postOutput.scrollHeight;
                window.open(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`, '_blank');
                response = '[OK] Query sent to network';
            } else {
                response = '[ERROR] Search query required after "web."';
                showErrorPopup(response);
            }
        } else if (command.startsWith('open ')) {
            const bookmarkName = command.slice(5).trim().toLowerCase();
            const tile = savedTiles.find(t => t.name.toLowerCase() === bookmarkName);
            if (tile) {
                response = `[SYSTEM] Opening ${tile.name} ...`;
                postOutput.textContent += `\n${response}`;
                postOutput.scrollTop = postOutput.scrollHeight;
                window.open(tile.url, '_blank');
                response = '[OK] Bookmark opened';
            } else {
                response = `[ERROR] Bookmark '${bookmarkName}' not found`;
                showErrorPopup(response);
            }
        } else if (command.startsWith('b.')) {
            const bookmarkName = command.slice(2).trim().toLowerCase();
            const tile = savedTiles.find(t => t.name.toLowerCase() === bookmarkName);
            if (tile) {
                response = `[SYSTEM] Opening ${tile.name} ...`;
                postOutput.textContent += `\n${response}`;
                postOutput.scrollTop = postOutput.scrollHeight;
                window.open(tile.url, '_blank');
                response = '[OK] Bookmark opened';
            } else {
                response = `[SYSTEM] Bookmarks:\n${savedTiles.map((tile, index) => `${index + 1}. ${tile.name} (${tile.url})`).join('\n') || 'None'}`;
                lastBookmarkList = savedTiles;
            }
        } else if (/^\d+$/.test(command) && lastBookmarkList) {
            const index = parseInt(command) - 1;
            if (index >= 0 && index < lastBookmarkList.length) {
                const tile = lastBookmarkList[index];
                response = `[SYSTEM] Opening ${tile.name} ...`;
                postOutput.textContent += `\n${response}`;
                postOutput.scrollTop = postOutput.scrollHeight;
                window.open(tile.url, '_blank');
                response = '[OK] Bookmark opened';
                lastBookmarkList = null;
            } else {
                response = '[ERROR] Invalid bookmark number';
                showErrorPopup(response);
                lastBookmarkList = null;
            }
        } else if (command.startsWith('addbookmark ')) {
            const args = command.slice(11).trim().split(' ');
            const url = args[0];
            const name = args[1] || url.replace(/https?:\/\//, '').split('/')[0];
            if (url) {
                response = `[SYSTEM] Adding bookmark: ${name} ...`;
                postOutput.textContent += `\n${response}`;
                postOutput.scrollTop = postOutput.scrollHeight;
                const savedTiles = JSON.parse(localStorage.getItem('savedTiles')) || defaultTiles;
                savedTiles.push({ url: url.startsWith('http') ? url : 'https://' + url, name });
                localStorage.setItem('savedTiles', JSON.stringify(savedTiles));
                loadTiles();
                response = '[OK] Bookmark added';
            } else {
                response = '[ERROR] URL required. Usage: addbookmark <url> [name]';
                showErrorPopup(response);
            }
        } else if (command === 'clearbookmarks') {
            response = '[SYSTEM] Clearing bookmarks ...';
            postOutput.textContent += `\n${response}`;
            postOutput.scrollTop = postOutput.scrollHeight;
            localStorage.removeItem('savedTiles');
            loadTiles();
            response = '[OK] All bookmarks cleared. Default tiles restored.';
        } else if (command === 'weather') {
            response = '[SYSTEM] Fetching weather ...';
            postOutput.textContent += `\n${response}`;
            postOutput.scrollTop = postOutput.scrollHeight;
            response = `[OK] Weather: ${currentWeather}`;
        } else if (command === 'quote') {
            response = '[SYSTEM] Generating quote ...';
            postOutput.textContent += `\n${response}`;
            postOutput.scrollTop = postOutput.scrollHeight;
            const newQuote = quotes[Math.floor(Math.random() * quotes.length)];
            document.getElementById('quote').textContent = newQuote;
            response = `[OK] Quote: ${newQuote}`;
        } else if (command.startsWith('theme ')) {
            const color = command.slice(6).trim().toLowerCase();
            if (['green', 'purple', 'red'].includes(color)) {
                response = `[SYSTEM] Changing theme to ${color} ...`;
                postOutput.textContent += `\n${response}`;
                postOutput.scrollTop = postOutput.scrollHeight;
                document.getElementById('theme').value = color;
                document.getElementById('theme').dispatchEvent(new Event('change'));
                response = '[OK] Theme changed';
            } else {
                response = '[ERROR] Invalid theme. Options: green, purple, red';
                showErrorPopup(response);
            }
        } else if (command.startsWith('background ')) {
            const style = command.slice(11).trim().toLowerCase();
            if (['matrix', 'grid', 'city'].includes(style)) {
                response = `[SYSTEM] Changing background to ${style} ...`;
                postOutput.textContent += `\n${response}`;
                postOutput.scrollTop = postOutput.scrollHeight;
                document.getElementById('background').value = style;
                document.getElementById('background').dispatchEvent(new Event('change'));
                response = '[OK] Background changed';
            } else {
                response = '[ERROR] Invalid background. Options: matrix, grid, city';
                showErrorPopup(response);
            }
        } else if (command === 'clearhistory') {
            response = '[SYSTEM] Clearing history ...';
            postOutput.textContent += `\n${response}`;
            postOutput.scrollTop = postOutput.scrollHeight;
            terminalHistory = [];
            postOutput.textContent = '[SYSTEM] Terminal history cleared';
            response = '';
        } else if (command.startsWith('addcommand ')) {
            const args = command.slice(10).trim().split(' ');
            const name = args[0];
            const action = args.slice(1).join(' ');
            if (name && action) {
                response = `[SYSTEM] Adding command '${name}' ...`;
                postOutput.textContent += `\n${response}`;
                postOutput.scrollTop = postOutput.scrollHeight;
                let customCommands = JSON.parse(localStorage.getItem('customCommands')) || {};
                customCommands[name] = action;
                localStorage.setItem('customCommands', JSON.stringify(customCommands));
                response = '[OK] Command added';
            } else {
                response = '[ERROR] Name and action required. Usage: addcommand <name> <action>';
                showErrorPopup(response);
            }
        } else if (customCommands[command]) {
            const action = customCommands[command];
            if (action.startsWith('http')) {
                response = `[SYSTEM] Executing custom command '${command}' ...`;
                postOutput.textContent += `\n${response}`;
                postOutput.scrollTop = postOutput.scrollHeight;
                window.open(action, '_blank');
                response = '[OK] Executed';
            } else {
                response = `[SYSTEM] ${action}`;
            }
        } else if (command === 'hack') {
            response = '[SYSTEM] Initiating hack ...';
            postOutput.textContent += `\n${response}`;
            postOutput.scrollTop = postOutput.scrollHeight;
            setTimeout(() => {
                postOutput.textContent += '\n[OK] 1337 systems breached!\n[SUCCESS] You are now in the mainframe!';
                postOutput.scrollTop = postOutput.scrollHeight;
            }, 1000);
            response = '';
        } else if (webSearchEnabled) {
            response = `[SYSTEM] Searching for: ${command} ...`;
            postOutput.textContent += `\n${response}`;
            postOutput.scrollTop = postOutput.scrollHeight;
            window.open(`https://duckduckgo.com/?q=${encodeURIComponent(command)}`, '_blank');
            response = '[OK] Query sent to network';
        } else {
            response = `[ERROR] Unknown command: ${command}. Use 'search <query>' or 'web.<query>' for web searches.`;
            showErrorPopup(response);
        }

        if (response) {
            postOutput.textContent += `\n${response}`;
        }
        postOutput.scrollTop = postOutput.scrollHeight;
        postInput.value = '';
    } catch (e) {
        console.error('Run post-login command failed:', e);
        const postOutput = document.getElementById('terminal-output-post-login');
        if (postOutput) {
            postOutput.textContent += `\n[ERROR] Command execution failed: ${e.message}`;
            postOutput.scrollTop = postOutput.scrollHeight;
        }
        showErrorPopup(e.message);
    }
}

function showAddInput() {
    try {
        const addInput = document.getElementById('add-input');
        if (!addInput) throw new Error('Add input element not found');
        addInput.style.display = 'flex';
    } catch (e) {
        console.error('Show add input failed:', e);
        showErrorPopup(e.message);
    }
}

function showErrorPopup(message) {
    const terminal = document.getElementById('terminal-widget');
    if (!terminal) return;

    const terminalRect = terminal.getBoundingClientRect();
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const popupWidth = 300; // Approximate width
    const popupHeight = 100; // Approximate height
    const padding = 20;

    // Random position avoiding terminal area
    let x, y;
    const maxAttempts = 50;
    let attempts = 0;

    do {
        x = Math.random() * (screenWidth - popupWidth - 2 * padding) + padding;
        y = Math.random() * (screenHeight - popupHeight - 2 * padding) + padding;

        // Add slight offset for natural tab-like behavior
        const offsetX = (Math.random() - 0.5) * 50; // Random offset between -25 and +25
        const offsetY = (Math.random() - 0.5) * 50;
        x += offsetX;
        y += offsetY;

        // Keep within bounds
        x = Math.max(padding, Math.min(screenWidth - popupWidth - padding, x));
        y = Math.max(padding, Math.min(screenHeight - popupHeight - padding, y));

        attempts++;
    } while ((x >= terminalRect.left - padding && x <= terminalRect.right + padding &&
              y >= terminalRect.top - padding && y <= terminalRect.bottom + padding) && attempts < maxAttempts);

    // Fallback to safe position if too many attempts
    if (attempts >= maxAttempts) {
        x = screenWidth / 2 - popupWidth / 2; // Center horizontally
        y = padding; // Top with padding
    }

    const popup = document.createElement('div');
    popup.className = 'error-popup';
    popup.style.position = 'fixed';
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    popup.innerHTML = `
        <div class="drag-handle">
            <span>${message}</span>
            <button class="close-btn" onclick="this.parentElement.parentElement.remove()">✖</button>
        </div>
    `;
    document.body.appendChild(popup);

    // Drag functionality
    let isDragging = false;
    let currentX = x;
    let currentY = y;
    let initialX;
    let initialY;

    const dragHandle = popup.querySelector('.drag-handle');
    dragHandle.addEventListener('mousedown', startDragging);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);

    function startDragging(e) {
        initialX = e.clientX - currentX;
        initialY = e.clientY - currentY;
        isDragging = true;
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            // Keep within screen bounds
            currentX = Math.max(padding, Math.min(screenWidth - popupWidth - padding, currentX));
            currentY = Math.max(padding, Math.min(screenHeight - popupHeight - padding, currentY));

            // Avoid terminal area while dragging
            if (currentX >= terminalRect.left - padding && currentX <= terminalRect.right + padding &&
                currentY >= terminalRect.top - padding && currentY <= terminalRect.bottom + padding) {
                currentY = terminalRect.top - popupHeight - padding; // Move above terminal
            }

            popup.style.left = `${currentX}px`;
            popup.style.top = `${currentY}px`;
        }
    }

    function stopDragging() {
        isDragging = false;
    }

    setTimeout(() => popup.remove(), 10000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('DOMContentLoaded: Initializing dashboard...');
        loadTiles();
        backgroundInterval = initMatrixRain();
        updateBackground();
        updateClock();
        applyToggles();
        initQuote();
        fetchWeather();
        setInterval(updateClock, 1000);

        const addTileBtn = document.getElementById('add-tile-btn');
        const customizeBtn = document.getElementById('customize-btn');
        const customizeCancelBtn = document.getElementById('customize-cancel-btn');
        const backgroundSelect = document.getElementById('background');
        const themeSelect = document.getElementById('theme');
        const searchBarToggle = document.getElementById('search-bar-toggle');
        const webSearchToggle = document.getElementById('web-search-toggle');
        const rootUsernameInput = document.getElementById('root-username');
        const searchInput = document.getElementById('search');
        const terminalInput = document.getElementById('terminal-input-post-login');

        if (!addTileBtn || !customizeBtn || !customizeCancelBtn || !backgroundSelect || !themeSelect ||
            !searchBarToggle || !webSearchToggle || !rootUsernameInput || !searchInput || !terminalInput) {
            throw new Error('One or more DOM elements not found');
        }

        addTileBtn.addEventListener('click', addNewTile);
        customizeBtn.addEventListener('click', showCustomizeModal);
        customizeCancelBtn.addEventListener('click', hideCustomizeModal);
        backgroundSelect.addEventListener('change', (e) => {
            background = e.target.value;
            updateBackground();
        });
        themeSelect.addEventListener('change', (e) => {
            try {
                currentColor = e.target.value === 'purple' ? '#cc00ff' : e.target.value === 'red' ? '#ff0000' : '#00ffcc';
                const colorHex = currentColor.slice(1);
                const elements = document.querySelectorAll('.neon-text, .tile, .search-bar input, .customization select, .customization input[type="text"], .customization input[type="checkbox"], .terminal input[type="text"], .terminal .prefix, .terminal input[type="checkbox"], .quote p, #terminal-input-post-login, .customize-btn');
                elements.forEach(el => {
                    el.style.color = currentColor;
                    if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'BUTTON' || el.classList.contains('tile') || el.classList.contains('customize-btn')) {
                        el.style.borderColor = currentColor;
                    }
                    if (el.classList.contains('neon-text') || el.tagName === 'P') {
                        el.style.textShadow = `0 0 8px ${currentColor}, 0 0 15px ${currentColor}, 0 0 25px ${currentColor}`;
                    }
                    if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'BUTTON') {
                        el.style.boxShadow = `0 0 15px ${currentColor}`;
                    }
                });
                document.querySelectorAll('.widget, .tile, #add-input, .terminal-input-wrapper').forEach(el => {
                    el.style.borderColor = currentColor;
                    el.style.boxShadow = `0 0 20px ${currentColor}80`;
                });
                document.querySelectorAll('pre').forEach(el => {
                    el.style.color = currentColor;
                });
                const addTileImg = document.querySelector('.add-tile img');
                if (addTileImg) {
                    addTileImg.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${colorHex}'%3E%3Cpath d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'/%3E%3C/svg%3E`;
                }
                loadTiles();
                updateBackground();
            } catch (e) {
                console.error('Theme change failed:', e);
                showErrorPopup(e.message);
            }
        });
        searchBarToggle.addEventListener('change', (e) => {
            try {
                localStorage.setItem('showSearchBar', e.target.checked);
                applyToggles();
            } catch (e) {
                console.error('Search bar toggle failed:', e);
                showErrorPopup(e.message);
            }
        });
        webSearchToggle.addEventListener('change', (e) => {
            try {
                localStorage.setItem('enableWebSearch', e.target.checked);
                applyToggles();
            } catch (e) {
                console.error('Web search toggle failed:', e);
                showErrorPopup(e.message);
            }
        });
        rootUsernameInput.addEventListener('change', (e) => {
            try {
                const username = e.target.value.trim() || 'BlackArch:2.0';
                localStorage.setItem('rootUsername', username);
                updateUsernameDisplay();
            } catch (e) {
                console.error('Username change failed:', e);
                showErrorPopup(e.message);
            }
        });
        searchInput.addEventListener('keydown', (e) => {
            try {
                if (e.key === 'Enter') {
                    search();
                }
            } catch (e) {
                console.error('Search keydown failed:', e);
                showErrorPopup(e.message);
            }
        });
        terminalInput.addEventListener('keydown', handleTerminalKeydown);
        document.addEventListener('keydown', (e) => {
            try {
                if (e.ctrlKey && e.key === 't') {
                    e.preventDefault();
                    if (document.getElementById('search-bar').style.display !== 'none') {
                        document.getElementById('search').focus();
                    } else {
                        document.getElementById('terminal-input-post-login').focus();
                    }
                }
                if (e.ctrlKey && e.key === 'q') {
                    e.preventDefault();
                    document.getElementById('quote').textContent = quotes[Math.floor(Math.random() * quotes.length)];
                }
                if (e.ctrlKey && e.key === 'c') {
                    e.preventDefault();
                    showCustomizeModal();
                }
            } catch (e) {
                console.error('Global keydown failed:', e);
                showErrorPopup(e.message);
            }
        });
        window.addEventListener('resize', () => {
            try {
                const canvas = document.getElementById('canvas');
                if (!canvas) throw new Error('Canvas element not found');
                canvas.height = window.innerHeight;
                canvas.width = window.innerWidth;
                updateBackground();
            } catch (e) {
                console.error('Window resize failed:', e);
                showErrorPopup(e.message);
            }
        });
        console.log('DOMContentLoaded: Initialization complete');
    } catch (e) {
        console.error('DOMContentLoaded handler failed:', e);
        showErrorPopup(e.message);
    }
});