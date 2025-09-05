let currentColor = '#00ffcc';
let backgroundInterval;
let rainColumnInterval;

function initMatrixRain() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    function draw() {
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
    return setInterval(draw, 50);
}

function initRainColumn() {
    const canvas = document.getElementById('rain-column');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.height = window.innerHeight;
    canvas.width = 50;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    function draw() {
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
    return setInterval(draw, 50);
}

function updateBackground() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    clearInterval(backgroundInterval);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const background = document.getElementById('background').value;
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
}

function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour12: true });
    const date = now.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric' });
    document.getElementById('clock-time').textContent = time;
    document.getElementById('clock-date').textContent = date;
    document.getElementById('status-time').textContent = time;
}

async function fetchWeather() {
    try {
        const response = await fetch('https://wttr.in/New+Delhi?format=%C+%t');
        const text = await response.text();
        document.getElementById('weather-status').textContent = text.trim() + ' (New Delhi)';
    } catch (e) {
        document.getElementById('weather-status').textContent = '24°C, Clear (New Delhi)';
    }
}

const quotes = [
    "Code is poetry in motion.",
    "Hack the planet!",
    "The future is written in binary.",
    "Stay curious, stay dangerous."
];
function initQuote() {
    const quoteElement = document.getElementById('quote');
    if (quoteElement) quoteElement.textContent = quotes[Math.floor(Math.random() * quotes.length)];
}

function loadTiles() {
    const tilesContainer = document.getElementById('tiles');
    if (!tilesContainer) return;
    tilesContainer.innerHTML = '';
    const savedTiles = JSON.parse(localStorage.getItem('savedTiles')) || [
        { url: 'https://youtube.com', name: 'YouTube' },
        { url: 'https://mail.google.com', name: 'Gmail' },
        { url: 'https://github.com', name: 'GitHub' }
    ];

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
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${currentColor.slice(1)}'%3E%3Cpath d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'/%3E%3C/svg%3E" alt="+">
        <span>Add</span>
    `;
    tilesContainer.appendChild(addTile);
    addTile.addEventListener('click', showAddInput);
}

function addNewTile() {
    const newUrlInput = document.getElementById('new-url');
    const addInput = document.getElementById('add-input');
    if (!newUrlInput || !addInput) return;
    const newUrl = newUrlInput.value.trim();
    if (newUrl) {
        const name = newUrl.replace(/https?:\/\//, '').split('/')[0];
        const tile = { url: newUrl.startsWith('http') ? newUrl : 'https://' + newUrl, name };
        let savedTiles = JSON.parse(localStorage.getItem('savedTiles')) || [];
        savedTiles.push(tile);
        localStorage.setItem('savedTiles', JSON.stringify(savedTiles));
        loadTiles();
        newUrlInput.value = '';
        addInput.style.display = 'none';
    }
}

function appendToTerminal(text, isUser = false) {
    const terminalOutput = document.getElementById('terminal-output-post-login');
    if (!terminalOutput) return;
    const spanClass = isUser ? 'user-input' : 'system-output';
    terminalOutput.innerHTML += `<span class="${spanClass}">${text}</span><br>`;
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
    if (isUser && document.getElementById('terminal-sounds').checked) {
        const beep = document.getElementById('beep-sound');
        if (beep) beep.play().catch(() => {});
    }
}

function processCommand(command) {
    const [cmd, ...args] = command.trim().split(/\s+/);
    appendToTerminal(`> ${command}`, true);

    const commands = {
        help: () => appendToTerminal('Commands: help, clear, search <query>'),
        clear: () => {
            const terminalOutput = document.getElementById('terminal-output-post-login');
            if (terminalOutput) terminalOutput.innerHTML = '';
        },
        search: () => {
            if (document.getElementById('web-search-toggle').checked && args.length > 0) {
                const query = args.join(' ');
                window.open(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`, '_blank');
                appendToTerminal(`Searching for: ${query}`);
            } else {
                appendToTerminal('Web search disabled or no query provided.');
            }
        }
    };

    if (commands[cmd]) {
        commands[cmd]();
    } else if (document.getElementById('web-search-toggle').checked && cmd) {
        commands.search();
    } else {
        appendToTerminal(`Command "${cmd}" not recognized. Type 'help'.`);
    }
}

function setupTerminal() {
    const terminalInput = document.getElementById('terminal-input-post-login');
    if (!terminalInput) return;
    terminalInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const command = terminalInput.value.trim();
            if (command) processCommand(command);
            terminalInput.value = '';
        }
    });
}

function updateUsernameDisplay() {
    const username = document.getElementById('root-username').value || 'BlackArch:2.0';
    const greetingStyle = document.getElementById('greeting-style').value || 'Boss';
    document.getElementById('greeting-text').textContent = username;
    document.getElementById('terminal-prefix').textContent = `${username}:~$ `;
    const terminalOutput = document.getElementById('terminal-output-post-login');
    if (terminalOutput) {
        terminalOutput.innerHTML = `Welcome, ${greetingStyle} ${username}! Type 'help' for commands.<br>`;
    }
}

function showCustomizeModal() {
    const modal = document.getElementById('customize-modal');
    if (modal) modal.style.display = 'flex';
}

function hideCustomizeModal() {
    const modal = document.getElementById('customize-modal');
    if (modal) modal.style.display = 'none';
}

function applyToggles() {
    const showSearchBar = document.getElementById('search-bar-toggle').checked;
    const enableWebSearch = document.getElementById('web-search-toggle').checked;
    const enableTerminalSounds = document.getElementById('terminal-sounds').checked;
    const showStatusPanel = document.getElementById('status-panel').checked;
    const showRainColumn = document.getElementById('rain-column').checked;
    const showLogTicker = document.getElementById('log-ticker').checked;
    const showActionButtons = document.getElementById('action-buttons').checked;

    document.getElementById('search-bar').style.display = showSearchBar ? 'block' : 'none';
    document.getElementById('status-panel').style.display = showStatusPanel ? 'block' : 'none';
    document.getElementById('rain-column').style.display = showRainColumn ? 'block' : 'none';
    document.getElementById('log-ticker').style.display = showLogTicker ? 'block' : 'none';
    document.getElementById('action-buttons').style.display = showActionButtons ? 'flex' : 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const customizeBtn = document.getElementById('customize-btn');
    const customizeCancelBtn = document.getElementById('customize-cancel-btn');
    const addTileBtn = document.getElementById('add-tile-btn');
    const searchInput = document.getElementById('search');
    const themeSelect = document.getElementById('theme');
    const backgroundSelect = document.getElementById('background');
    const rootUsernameInput = document.getElementById('root-username');
    const greetingStyleSelect = document.getElementById('greeting-style');
    const toggleThemeBtn = document.getElementById('toggle-theme-btn');
    const clearLogsBtn = document.getElementById('clear-logs-btn');

    if (customizeBtn) customizeBtn.addEventListener('click', showCustomizeModal);
    if (customizeCancelBtn) customizeCancelBtn.addEventListener('click', hideCustomizeModal);
    if (addTileBtn) addTileBtn.addEventListener('click', addNewTile);
    if (searchInput) searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') window.open(`https://duckduckgo.com/?q=${encodeURIComponent(searchInput.value)}`, '_blank'); });
    if (themeSelect) themeSelect.addEventListener('change', (e) => { currentColor = e.target.value === 'green' ? '#00ffcc' : e.target.value === 'purple' ? '#cc00ff' : '#ff0000'; updateBackground(); loadTiles(); });
    if (backgroundSelect) backgroundSelect.addEventListener('change', (e) => { updateBackground(); });
    if (rootUsernameInput) rootUsernameInput.addEventListener('change', updateUsernameDisplay);
    if (greetingStyleSelect) greetingStyleSelect.addEventListener('change', updateUsernameDisplay);
    if (toggleThemeBtn) toggleThemeBtn.addEventListener('click', () => {
        const themes = ['green', 'purple', 'red'];
        const currentTheme = themeSelect.value;
        const nextTheme = themes[(themes.indexOf(currentTheme) + 1) % themes.length];
        themeSelect.value = nextTheme;
        themeSelect.dispatchEvent(new Event('change'));
    });
    if (clearLogsBtn) clearLogsBtn.addEventListener('click', () => {
        const terminalOutput = document.getElementById('terminal-output-post-login');
        if (terminalOutput) terminalOutput.innerHTML = '';
    });

    ['search-bar-toggle', 'web-search-toggle', 'terminal-sounds', 'status-panel', 'rain-column', 'log-ticker', 'action-buttons'].forEach(id => {
        const toggle = document.getElementById(id);
        if (toggle) toggle.addEventListener('change', applyToggles);
    });

    updateClock();
    setInterval(updateClock, 1000);
    fetchWeather();
    initQuote();
    loadTiles();
    setupTerminal();
    updateUsernameDisplay();
    backgroundInterval = initMatrixRain();
    rainColumnInterval = initRainColumn();
    applyToggles();
});