let currentColor = '#00ffcc';
let backgroundInterval;
let rainColumnInterval;

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
        return null;
    }
}

// Rain Column (Left Side)
function initRainColumn() {
    try {
        const canvas = document.getElementById('rain-column');
        if (!canvas) throw new Error('Rain column canvas not found');
        const ctx = canvas.getContext('2d');
        canvas.height = window.innerHeight;
        canvas.width = 50;

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()';
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);

        function drawRain() {
            ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
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
        return setInterval(drawRain, 50);
    } catch (e) {
        console.error('Rain column initialization failed:', e);
        return null;
    }
}

let background = 'matrix';
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
        const statusTime = document.getElementById('status-time');
        if (clockTime && clockDate && statusTime) {
            clockTime.textContent = time;
            clockDate.textContent = date;
            statusTime.textContent = time;
        } else {
            throw new Error('Clock elements not found');
        }
    } catch (e) {
        console.error('Clock update failed:', e);
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
            searchInput.value = '';
        }
    } catch (e) {
        console.error('Search failed:', e);
    }
}

// Weather
let currentWeather = 'Loading...';
async function fetchWeather() {
    try {
        const res = await fetch('https://wttr.in/New+Delhi?format=%C+%t');
        const text = await res.text();
        currentWeather = text.trim() + ' (New Delhi)';
        const weatherStatus = document.getElementById('weather-status');
        if (weatherStatus) weatherStatus.textContent = currentWeather;
    } catch (e) {
        console.error('Weather fetch failed:', e);
        currentWeather = '24°C, Clear (New Delhi)';
        const weatherStatus = document.getElementById('weather-status');
        if (weatherStatus) weatherStatus.textContent = currentWeather;
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
    }
}

// Terminal Login
let terminalHistory = [];
let lastBookmarkList = null;

// Username Management
function updateUsernameDisplay() {
    try {
        const username = localStorage.getItem('rootUsername') || 'BlackArch:2.0';
        const greetingStyle = localStorage.getItem('greetingStyle') || 'Boss';
        const greetingText = document.getElementById('greeting-text');
        const terminalPrefix = document.getElementById('terminal-prefix');
        const rootUsernameInput = document.getElementById('root-username');
        const terminalOutput = document.getElementById('terminal-output-post-login');
        const greetingStyleSelect = document.getElementById('greeting-style');
        if (!greetingText || !terminalPrefix || !rootUsernameInput || !terminalOutput || !greetingStyleSelect) throw new Error('Username elements not found');

        greetingText.textContent = username;
        terminalPrefix.textContent = `${username}:~$ `;
        rootUsernameInput.value = username;
        greetingStyleSelect.value = greetingStyle;

        // Typing effect for welcome message
        const welcomeMessage = `Welcome, ${greetingStyle} ${username}! Mai aapki kya help kar sakta hu?\n[SYSTEM] Type 'help' for commands`;
        terminalOutput.innerHTML = '';
        let i = 0;
        const typeMessage = () => {
            if (i < welcomeMessage.length) {
                terminalOutput.innerHTML += welcomeMessage[i] === '\n' ? '<br>' : `<span class="system-output">${welcomeMessage[i]}</span>`;
                i++;
                setTimeout(typeMessage, 50);
            }
        };
        typeMessage();
    } catch (e) {
        console.error('Username update failed:', e);
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
    }
}

function hideCustomizeModal() {
    try {
        const modal = document.getElementById('customize-modal');
        if (!modal) throw new Error('Customize modal not found');
        modal.style.display = 'none';
    } catch (e) {
        console.error('Hide customize modal failed:', e);
    }
}

// Toggle Search Bar and Username
function applyToggles() {
    try {
        const showSearchBar = localStorage.getItem('showSearchBar') === 'true';
        const enableWebSearch = localStorage.getItem('enableWebSearch') !== 'false';
        const enableTerminalSounds = localStorage.getItem('terminalSounds') !== 'false';
        const showStatusPanel = localStorage.getItem('statusPanel') === 'true';
        const showRainColumn = localStorage.getItem('rainColumn') === 'true';
        const showLogTicker = localStorage.getItem('logTicker') === 'true';
        const showActionButtons = localStorage.getItem('actionButtons') === 'true';

        const searchBarToggle = document.getElementById('search-bar-toggle');
        const webSearchToggle = document.getElementById('web-search-toggle');
        const terminalSoundsToggle = document.getElementById('terminal-sounds');
        const statusPanelToggle = document.getElementById('status-panel');
        const rainColumnToggle = document.getElementById('rain-column');
        const logTickerToggle = document.getElementById('log-ticker');
        const actionButtonsToggle = document.getElementById('action-buttons');
        const searchBar = document.getElementById('search-bar');
        const statusPanel = document.getElementById('status-panel');
        const rainColumn = document.getElementById('rain-column');
        const logTicker = document.getElementById('log-ticker');
        const actionButtons = document.getElementById('action-buttons');

        if (searchBarToggle) searchBarToggle.checked = showSearchBar;
        if (webSearchToggle) webSearchToggle.checked = enableWebSearch;
        if (terminalSoundsToggle) terminalSoundsToggle.checked = enableTerminalSounds;
        if (statusPanelToggle) statusPanelToggle.checked = showStatusPanel;
        if (rainColumnToggle) rainColumnToggle.checked = showRainColumn;
        if (logTickerToggle) logTickerToggle.checked = showLogTicker;
        if (actionButtonsToggle) actionButtonsToggle.checked = showActionButtons;

        if (searchBar) searchBar.style.display = showSearchBar ? 'block' : 'none';
        if (statusPanel) statusPanel.style.display = showStatusPanel ? 'block' : 'none';
        if (rainColumn) rainColumn.style.display = showRainColumn ? 'block' : 'none';
        if (logTicker) logTicker.style.display = showLogTicker ? 'block' : 'none';
        if (actionButtons) actionButtons.style.display = showActionButtons ? 'flex' : 'none';

        updateUsernameDisplay();
    } catch (e) {
        console.error('Apply toggles failed:', e);
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
    hack: 'Initiates a fun hacking simulation.',
    setgreeting: 'Sets greeting style. Usage: setgreeting <boss|sir|hacker>',
    setsound: 'Enables/disables terminal sounds. Usage: setsound <on|off>'
};

function handleTerminalKeydown(event) {
    try {
        const input = document.getElementById('terminal-input-post-login');
        const terminal = document.getElementById('terminal-widget');
        if (!input || !terminal) throw new Error('Terminal input not found');
        if (event.key === 'Enter') {
            if (localStorage.getItem('terminalSounds') !== 'false') {
                const beep = document.getElementById('beep-sound');
                if (beep) beep.play();
            }
            terminal.classList.add('glitch-active');
            setTimeout(() => terminal.classList.remove('glitch-active'), 200);
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
            postOutput.innerHTML += `<br><span class="user-input">> </span>`;
            postOutput.scrollTop = postOutput.scrollHeight;
            postInput.value = '';
            return;
        }

        terminalHistory.push(command);
        postOutput.innerHTML += `<br><span class="user-input">> ${postInput.value}</span>`;

        if (command === 'help') {
            response = '[SYSTEM] Commands:\n' + Object.keys(commandHelp).join(', ');
        } else if (command.startsWith('help ')) {
            const cmd = command.slice(5).trim();
            response = commandHelp[cmd] || `[ERROR] No help available for '${cmd}'`;
        } else if (command === 'whoami') {
            response = '[SYSTEM] You are ' + (localStorage.getItem('rootUsername') || 'BlackArch:2.0') + ', the cyberpunk coder!';
        } else if (command === 'clear') {
            postOutput.innerHTML = '';
            response = '[SYSTEM] Terminal cleared';
            lastBookmarkList = null;
            updateUsernameDisplay();
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
                postOutput.innerHTML += `<br><span class="system-output">${response}</span>`;
                postOutput.scrollTop = postOutput.scrollHeight;
                window.open(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`, '_blank');
                response = '[OK] Query sent to network';
            } else {
                response = '[ERROR] Search query required. Usage: search <query>';
            }
        } else if (command.startsWith('web.')) {
            const query = command.slice(4).trim();
            if (query) {
                response = `[SYSTEM] Searching for: ${query} ...`;
                postOutput.innerHTML += `<br><span class="system-output">${response}</span>`;
                postOutput.scrollTop = postOutput.scrollHeight;
                window.open(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`, '_blank');
                response = '[OK] Query sent to network';
            } else {
                response = '[ERROR] Search query required after "web."';
            }
        } else if (command.startsWith('open ')) {
            const bookmarkName = command.slice(5).trim().toLowerCase();
            const tile = savedTiles.find(t => t.name.toLowerCase() === bookmarkName);
            if (tile) {
                response = `[SYSTEM] Opening ${tile.name} ...`;
                postOutput.innerHTML += `<br><span class="system-output">${response}</span>`;
                postOutput.scrollTop = postOutput.scrollHeight;
                window.open(tile.url, '_blank');
                response = '[OK] Bookmark opened';
            } else {
                response = `[ERROR] Bookmark '${bookmarkName}' not found`;
            }
        } else if (command.startsWith('b.')) {
            const bookmarkName = command.slice(2).trim().toLowerCase();
            const tile = savedTiles.find(t => t.name.toLowerCase() === bookmarkName);
            if (tile) {
                response = `[SYSTEM] Opening ${tile.name} ...`;
                postOutput.innerHTML += `<br><span class="system-output">${response}</span>`;
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
                postOutput.innerHTML += `<br><span class="system-output">${response}</span>`;
                postOutput.scrollTop = postOutput.scrollHeight;
                window.open(tile.url, '_blank');
                response = '[OK] Bookmark opened';
                lastBookmarkList = null;
            } else {
                response = '[ERROR] Invalid bookmark number';
                lastBookmarkList = null;
            }
        } else if (command.startsWith('addbookmark ')) {
            const args = command.slice(11).trim().split(' ');
            const url = args[0];
            const name = args[1] || url.replace(/https?:\/\//, '').split('/')[0];
            if (url) {
                response = `[SYSTEM] Adding bookmark: ${name} ...`;
                postOutput.innerHTML += `<br><span class="system-output">${response}</span>`;
                postOutput.scrollTop = postOutput.scrollHeight;
                const savedTiles = JSON.parse(localStorage.getItem('savedTiles')) || defaultTiles;
                savedTiles.push({ url: url.startsWith('http') ? url : 'https://' + url, name });
                localStorage.setItem('savedTiles', JSON.stringify(savedTiles));
                loadTiles();
                response = '[OK] Bookmark added';
            } else {
                response = '[ERROR] URL required. Usage: addbookmark <url> [name]';
            }
        } else if (command === 'clearbookmarks') {
            response = '[SYSTEM] Clearing bookmarks ...';
            postOutput.innerHTML += `<br><span class="system-output">${response}</span>`;
            postOutput.scrollTop = postOutput.scrollHeight;
            localStorage.removeItem('savedTiles');
            loadTiles();
            response = '[OK] All bookmarks cleared. Default tiles restored.';
        } else if (command === 'weather') {
            response = '[SYSTEM] Fetching weather ...';
            postOutput.innerHTML += `<br><span class="system-output">${response}</span>`;
            postOutput.scrollTop = postOutput.scrollHeight;
            response = `[OK] Weather: ${currentWeather}`;
        } else if (command === 'quote') {
            response = '[SYSTEM] Generating quote ...';
            postOutput.innerHTML += `<br><span class="system-output">${response}</span>`;
            postOutput.scrollTop = postOutput.scrollHeight;
            const newQuote = quotes[Math.floor(Math.random() * quotes.length)];
            document.getElementById('quote').textContent = newQuote;
            response = `[OK] Quote: ${newQuote}`;
        } else if (command.startsWith('theme ')) {
            const color = command.slice(6).trim().toLowerCase();
            if (['green', 'purple', 'red'].includes(color)) {
                response = `[SYSTEM] Changing theme to ${color} ...`;
                postOutput.innerHTML += `<br><span class="system-output">${response}</span>`;
                postOutput.scrollTop = postOutput.scrollHeight;
                document.getElementById('theme').value = color;
                document.getElementById('theme').dispatchEvent(new Event('change'));
                response = '[OK] Theme changed';
            } else {
                response = '[ERROR] Invalid theme. Options: green, purple, red';
            }
        } else if (command.startsWith('background ')) {
            const style = command.slice(11).trim().toLowerCase();
            if (['matrix', 'grid', 'city'].includes(style)) {
                response = `[SYSTEM] Changing background to ${style} ...`;
                postOutput.innerHTML += `<br><span class="system-output">${response}</span>`;
                postOutput.scrollTop = postOutput.scrollHeight;
                document.getElementById('background').value = style;
                document.getElementById('background').dispatchEvent(new Event('change'));
                response = '[OK] Background changed';
            } else {
                response = '[ERROR] Invalid background. Options: matrix, grid, city';
            }
        } else if (command === 'clearhistory') {
            response = '[SYSTEM] Clearing history ...';
            postOutput.innerHTML += `<br><span class="system-output">${response}</span>`;
            postOutput.scrollTop = postOutput.scrollHeight;
            terminalHistory = [];
            postOutput.innerHTML = '';
            updateUsernameDisplay();
            response = '';
        } else if (command.startsWith('addcommand ')) {
            const args = command.slice(10).trim().split(' ');
            const name = args[0];
            const action = args.slice(1).join(' ');
            if (name && action) {
                response = `[SYSTEM] Adding command '${name}' ...`;
                postOutput.innerHTML += `<br><span class="system-output">${response}</span>`;
                postOutput.scrollTop = postOutput.scrollHeight;
                let customCommands = JSON.parse(localStorage.getItem('customCommands')) || {};
                customCommands[name] = action;
                localStorage.setItem('customCommands', JSON.stringify(customCommands));
                response = '[OK] Command added';
            } else {
                response = '[ERROR] Name and action required. Usage: addcommand <name> <action>';
            }
        } else if (command.startsWith('setgreeting ')) {
            const style = command.slice(12).trim().toLowerCase();
            if (['boss', 'sir', 'hacker'].includes(style)) {
                response = `[SYSTEM] Setting greeting style to ${style} ...`;
                postOutput.innerHTML += `<br><span class="system-output">${response}</span>`;
                postOutput.scrollTop = postOutput.scrollHeight;
                localStorage.setItem('greetingStyle', style);
                document.getElementById('greeting-style').value = style;
                updateUsernameDisplay();
                response = '[OK] Greeting style changed';
            } else {
                response = '[ERROR] Invalid greeting style. Options: boss, sir, hacker';
            }
        } else if (command.startsWith('setsound ')) {
            const state = command.slice(9).trim().toLowerCase();
            if (['on', 'off'].includes(state)) {
                response = `[SYSTEM] Setting terminal sounds to ${state} ...`;
                postOutput.innerHTML += `<br><span class="system-output">${response}</span>`;
                postOutput.scrollTop = postOutput.scrollHeight;
                localStorage.setItem('terminalSounds', state === 'on' ? 'true' : 'false');
                document.getElementById('terminal-sounds').checked = state === 'on';
                response = '[OK] Terminal sounds updated';
            } else {
                response = '[ERROR] Invalid state. Usage: setsound <on|off>';
            }
        } else if (customCommands[command]) {
            const action = customCommands[command];
            if (action.startsWith('http')) {
                response = `[SYSTEM] Executing custom command '${command}' ...`;
                postOutput.innerHTML += `<br><span class="system-output">${response}</span>`;
                postOutput.scrollTop = postOutput.scrollHeight;
                window.open(action, '_blank');
                response = '[OK] Executed';
            } else {
                response = `[SYSTEM] ${action}`;
            }
        } else if (command === 'hack') {
            response = '[SYSTEM] Initiating hack ...';
            postOutput.innerHTML += `<br><span class="system-output">${response}</span>`;
            postOutput.scrollTop = postOutput.scrollHeight;
            setTimeout(() => {
                postOutput.innerHTML += `<br><span class="system-output">[OK] 1337 systems breached!\n[SUCCESS] You are now in the mainframe!</span>`;
                postOutput.scrollTop = postOutput.scrollHeight;
            }, 1000);
            response = '';
        } else if (webSearchEnabled) {
            response = `[SYSTEM] Searching for: ${command} ...`;
            postOutput.innerHTML += `<br><span class="system-output">${response}</span>`;
            postOutput.scrollTop = postOutput.scrollHeight;
            window.open(`https://duckduckgo.com/?q=${encodeURIComponent(command)}`, '_blank');
            response = '[OK] Query sent to network';
        } else {
            response = `[ERROR] Unknown command: ${command}. Use 'search <query>' or 'web.<query>' for web searches.`;
        }

        if (response) {
            postOutput.innerHTML += `<br><span class="system-output">${response}</span>`;
        }
        postOutput.scrollTop = postOutput.scrollHeight;
        postInput.value = '';
    } catch (e) {
        console.error('Run post-login command failed:', e);
        const postOutput = document.getElementById('terminal-output-post-login');
        if (postOutput) {
            postOutput.innerHTML += `<br><span class="system-output">[ERROR] Command execution failed: ${e.message}</span>`;
            postOutput.scrollTop = postOutput.scrollHeight;
        }
    }
}

// Add New Tile
function showAddInput() {
    try {
        const addInput = document.getElementById('add-input');
        if (!addInput) throw new Error('Add input element not found');
        addInput.style.display = 'flex';
    } catch (e) {
        console.error('Show add input failed:', e);
    }
}

// Log Ticker (Right Side)
function updateLogTicker() {
    try {
        const logText = document.getElementById('log-text');
        if (!logText) throw new Error('Log ticker element not found');
        const logs = ['Access Granted', 'System Online', 'Data Sync', 'Firewall Check'];
        logText.textContent = logs[Math.floor(Math.random() * logs.length)];
    } catch (e) {
        console.error('Log ticker update failed:', e);
    }
}

// Action Buttons (Right Side)
function setupActionButtons() {
    try {
        const toggleThemeBtn = document.getElementById('toggle-theme-btn');
        const clearLogsBtn = document.getElementById('clear-logs-btn');
        if (toggleThemeBtn) {
            toggleThemeBtn.addEventListener('click', () => {
                const themes = ['green', 'purple', 'red'];
                const themeSelect = document.getElementById('theme');
                const currentTheme = themeSelect.value;
                const nextTheme = themes[(themes.indexOf(currentTheme) + 1) % themes.length];
                themeSelect.value = nextTheme;
                themeSelect.dispatchEvent(new Event('change'));
            });
        }
        if (clearLogsBtn) {
            clearLogsBtn.addEventListener('click', () => {
                const terminalOutput = document.getElementById('terminal-output-post-login');
                if (terminalOutput) terminalOutput.innerHTML = '';
            });
        }
    } catch (e) {
        console.error('Action buttons setup failed:', e);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('DOMContentLoaded: Initializing dashboard...');
        loadTiles();
        updateBackground();
        updateClock();
        applyToggles();
        initQuote();
        fetchWeather();
        setInterval(updateClock, 1000);
        setInterval(updateLogTicker, 2000); // Update log ticker every 2 seconds
        backgroundInterval = initMatrixRain();
        rainColumnInterval = initRainColumn();
        setupActionButtons();

        const addTileBtn = document.getElementById('add-tile-btn');
        const customizeBtn = document.getElementById('customize-btn');
        const customizeCancelBtn = document.getElementById('customize-cancel-btn');
        const backgroundSelect = document.getElementById('background');
        const themeSelect = document.getElementById('theme');
        const searchBarToggle = document.getElementById('search-bar-toggle');
        const webSearchToggle = document.getElementById('web-search-toggle');
        const terminalSoundsToggle = document.getElementById('terminal-sounds');
        const statusPanelToggle = document.getElementById('status-panel');
        const rainColumnToggle = document.getElementById('rain-column');
        const logTickerToggle = document.getElementById('log-ticker');
        const actionButtonsToggle = document.getElementById('action-buttons');
        const rootUsernameInput = document.getElementById('root-username');
        const greetingStyleSelect = document.getElementById('greeting-style');
        const searchInput = document.getElementById('search');
        const terminalInput = document.getElementById('terminal-input-post-login');

        if (!addTileBtn || !customizeBtn || !customizeCancelBtn || !backgroundSelect || !themeSelect ||
            !searchBarToggle || !webSearchToggle || !terminalSoundsToggle || !statusPanelToggle ||
            !rainColumnToggle || !logTickerToggle || !actionButtonsToggle || !rootUsernameInput ||
            !greetingStyleSelect || !searchInput || !terminalInput) {
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
                document.querySelectorAll('.terminal').forEach(el => {
                    el.style.background = `linear-gradient(45deg, ${currentColor}, ${e.target.value === 'purple' ? '#ff00ff' : '#cc00ff'})`;
                    el.style.boxShadow = `0 0 10px ${currentColor}`;
                });
                document.querySelectorAll('pre').forEach(el => {
                    el.style.color = currentColor;
                });
                const addTileImg = document.querySelector('.add-tile img');
                if (addTileImg) {
                    addTileImg.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${colorHex}'%3E%3Cpath d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'/%3E%3C/svg%3E`;
                }
            } catch (e) {
                console.error('Theme change failed:', e);
            }
        });
        searchBarToggle.addEventListener('change', (e) => localStorage.setItem('showSearchBar', e.target.checked));
        webSearchToggle.addEventListener('change', (e) => localStorage.setItem('enableWebSearch', e.target.checked));
        terminalSoundsToggle.addEventListener('change', (e) => localStorage.setItem('terminalSounds', e.target.checked));
        statusPanelToggle.addEventListener('change', (e) => localStorage.setItem('statusPanel', e.target.checked));
        rainColumnToggle.addEventListener('change', (e) => localStorage.setItem('rainColumn', e.target.checked));
        logTickerToggle.addEventListener('change', (e) => localStorage.setItem('logTicker', e.target.checked));
        actionButtonsToggle.addEventListener('change', (e) => localStorage.setItem('actionButtons', e.target.checked));
        rootUsernameInput.addEventListener('change', (e) => localStorage.setItem('rootUsername', e.target.value));
        greetingStyleSelect.addEventListener('change', (e) => localStorage.setItem('greetingStyle', e.target.value));
        searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') search(); });
        terminalInput.addEventListener('keydown', handleTerminalKeydown);
    } catch (e) {
        console.error('DOM content loaded initialization failed:', e);
    }
});