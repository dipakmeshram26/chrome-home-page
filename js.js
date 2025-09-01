 // Initialize currentColor at the top
        let currentColor = '#00ffcc';

        // Hacker-Themed Icons
        const hackerIcons = [
            // Terminal Icon
            `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${encodeURIComponent(currentColor.slice(1))}'%3E%3Cpath d='M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h2v2H7V7zm0 4h2v2H7v-2zm0 4h2v2H7v-2zm4-8h6v2h-6V7zm0 4h6v2h-6v-2zm0 4h4v2h-4v-2z'/%3E%3C/svg%3E`,
            // Skull Icon
            `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${encodeURIComponent(currentColor.slice(1))}'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-10c-.83 0-1.5-.67-1.5-1.5S9.17 7 10 7s1.5.67 1.5 1.5S10.83 10 10 10zm4 0c-.83 0-1.5-.67-1.5-1.5S13.17 7 14 7s1.5.67 1.5 1.5S14.83 10 14 10zm-2 5c-1.38 0-2.5-1.12-2.5-2.5h1c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5h1c0 1.38-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E`,
            // Circuit Icon
            `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${encodeURIComponent(currentColor.slice(1))}'%3E%3Cpath d='M2 8h4v4H2V8zm4 6h4v4H6v-4zm6-6h4v4h-4V8zm4 6h4v4h-4v-4zM8 2h8v4H8V2zm0 16h8v4H8v-4z'/%3E%3C/svg%3E`,
            // Data Stream Icon
            `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${encodeURIComponent(currentColor.slice(1))}'%3E%3Cpath d='M12 2v4l4 4-4 4v4l-4-4-4 4V12l4-4-4-4v4l4 4 4-4V2h-4zm0 8a2 2 0 100 4 2 2 0 000-4z'/%3E%3C/svg%3E`,
            // Binary Code Icon
            `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${encodeURIComponent(currentColor.slice(1))}'%3E%3Cpath d='M7 5h2v2H7V5zm0 4h2v2H7V9zm0 4h2v2H7v-2zm4-8h2v2h-2V5zm0 4h2v2h-2V9zm0 4h2v2h-2v-2zm4-8h2v2h-2V5zm0 4h2v2h-2V9zm0 4h2v2h-2v-2z'/%3E%3C/svg%3E`
        ];

        // Matrix Rain Background
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()';
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops = [];

        for (let x = 0; x < columns; x++) drops[x] = 1;

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

        let backgroundInterval;
        let background = 'matrix';
        function updateBackground() {
            clearInterval(backgroundInterval);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (background === 'matrix') {
                backgroundInterval = setInterval(drawMatrix, 50);
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

        // Clock
        function updateClock() {
            const now = new Date();
            document.getElementById('clock').textContent = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        }
        setInterval(updateClock, 1000);

        // Search
        function search() {
            const query = document.getElementById('search').value;
            window.open(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`, '_blank');
        }

        // Weather
        let currentWeather = 'Loading...';
        async function fetchWeather() {
            try {
                const res = await fetch('https://wttr.in/New+Delhi?format=%C+%t');
                const text = await res.text();
                currentWeather = text.trim() + ' (New Delhi)';
            } catch (e) {
                currentWeather = '24°C, Clear (New Delhi)';
            }
        }
        fetchWeather();

        // Quotes
        const quotes = [
            "Code is poetry in motion.",
            "Hack the planet!",
            "The future is written in binary.",
            "Stay curious, stay dangerous."
        ];
        document.getElementById('quote').textContent = quotes[Math.floor(Math.random() * quotes.length)];

        // Bookmarks Persistence
        const defaultTiles = [
            { url: 'https://youtube.com', name: 'YouTube' },
            { url: 'https://mail.google.com', name: 'Gmail' },
            { url: 'https://chat.openai.com', name: 'ChatGPT' },
            { url: 'https://github.com', name: 'GitHub' }
        ];

        function loadTiles() {
            const tilesContainer = document.getElementById('tiles');
            tilesContainer.innerHTML = ''; // Clear existing tiles
            let savedTiles = JSON.parse(localStorage.getItem('savedTiles')) || defaultTiles;

            savedTiles.forEach((tile, index) => {
                const tileElement = document.createElement('a');
                tileElement.href = tile.url;
                tileElement.className = 'tile glitch';
                const iconIndex = index % hackerIcons.length; // Cycle through hacker icons
                tileElement.innerHTML = `
                    <img src="${hackerIcons[iconIndex]}" alt="${tile.name}">
                    <span>${tile.name}</span>
                `;
                tilesContainer.appendChild(tileElement);
            });

            const addTile = document.createElement('div');
            addTile.className = 'tile add-tile glitch';
            addTile.onclick = showAddInput;
            addTile.innerHTML = `
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${encodeURIComponent(currentColor.slice(1))}'%3E%3Cpath d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'/%3E%3C/svg%3E" alt="+">
                <span>Add</span>
            `;
            tilesContainer.appendChild(addTile);
        }

        function addNewTile() {
            const newUrl = document.getElementById('new-url').value.trim();
            if (newUrl) {
                const name = newUrl.replace(/https?:\/\//, '').split('/')[0];
                const tile = { url: newUrl.startsWith('http') ? newUrl : 'https://' + newUrl, name };
                let savedTiles = JSON.parse(localStorage.getItem('savedTiles')) || defaultTiles;
                savedTiles.push(tile);
                localStorage.setItem('savedTiles', JSON.stringify(savedTiles));
                loadTiles();
                document.getElementById('new-url').value = '';
                document.getElementById('add-input').style.display = 'none';
            }
        }

        // Terminal Login
        const input = document.getElementById('terminal-input');
        const output = document.getElementById('terminal-output');
        let terminalHistory = [];
        let lastBookmarkList = null;



        // Username Management
        function updateUsernameDisplay() {
            const username = localStorage.getItem('rootUsername') || 'BlackArch:2.0';
            document.getElementById('greeting-text').textContent = `Hello ${username} ⚡`;
            document.getElementById('terminal-prefix').textContent = `${username}:~$ `;
            document.getElementById('root-username').value = username;
        }

        // Customization Modal
        function showCustomizeModal() {
            document.getElementById('customize-modal').style.display = 'flex';
        }

        function hideCustomizeModal() {
            document.getElementById('customize-modal').style.display = 'none';
        }

        // Toggle Search Bar and Username
        function applyToggles() {
            const showSearchBar = localStorage.getItem('showSearchBar') === 'true';
            document.getElementById('search-bar-toggle').checked = showSearchBar;
            document.getElementById('search-bar').style.display = showSearchBar ? 'block' : 'none';
            document.getElementById('terminal-widget').style.display = isLoggedIn ? 'block' : 'none';
            updateUsernameDisplay();
        }

        document.getElementById('search-bar-toggle').addEventListener('change', (e) => {
            localStorage.setItem('showSearchBar', e.target.checked);
            applyToggles();
        });

        document.getElementById('root-username').addEventListener('change', (e) => {
            const username = e.target.value.trim() || 'BlackArch:2.0';
            localStorage.setItem('rootUsername', username);
            updateUsernameDisplay();
        });

        // Terminal Commands
        const commandHelp = {
            help: 'Shows this help message or details about a specific command. Usage: help [command]',
            whoami: 'Displays user information.',
            clear: 'Clears the terminal output.',
            listbookmarks: 'Lists all saved bookmarks.',
            search: 'Searches the web. Usage: search <query>',
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
            if (event.key === 'Enter') {
                runPostLoginCommand();
            } else if (event.key === 'Tab') {
                event.preventDefault();
                const input = document.getElementById('terminal-input-post-login');
                const text = input.value.trim().toLowerCase();
                const commands = Object.keys(commandHelp);
                const savedTiles = JSON.parse(localStorage.getItem('savedTiles')) || defaultTiles;
                const bookmarkNames = savedTiles.map(t => t.name.toLowerCase());
                let suggestions = [...commands, ...bookmarkNames].filter(c => c.startsWith(text));

                if (text.startsWith('b.')) {
                    const partial = text.slice(2);
                    suggestions = bookmarkNames.filter(name => name.startsWith(partial));
                    if (suggestions.length > 0) {
                        input.value = 'b.' + suggestions[0];
                    }
                } else if (text.startsWith('web.')) {
                    // No auto-complete for web., as it's a search query
                } else if (suggestions.length > 0) {
                    input.value = suggestions[0];
                }
            }
        }

        function runPostLoginCommand() {
            const postInput = document.getElementById('terminal-input-post-login');
            const postOutput = document.getElementById('terminal-output-post-login');
            const command = postInput.value.trim().toLowerCase();
            let response = '';
            const savedTiles = JSON.parse(localStorage.getItem('savedTiles')) || defaultTiles;
            const customCommands = JSON.parse(localStorage.getItem('customCommands')) || {};

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
            } else {
                response = `[ERROR] Unknown command: ${command}`;
            }

            if (response) {
                postOutput.textContent += `\n${response}`;
            }
            postOutput.scrollTop = postOutput.scrollHeight;
            postInput.value = '';
        }

        // Add New Tile
        function showAddInput() {
            document.getElementById('add-input').style.display = 'flex';
        }

        // Update Hacker Icons with Current Theme
        function updateHackerIcons() {
            const colorHex = currentColor.slice(1);
            hackerIcons.length = 0; // Clear existing icons
            hackerIcons.push(
                // Terminal Icon
                `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${colorHex}'%3E%3Cpath d='M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h2v2H7V7zm0 4h2v2H7v-2zm0 4h2v2H7v-2zm4-8h6v2h-6V7zm0 4h6v2h-6v-2zm0 4h4v2h-4v-2z'/%3E%3C/svg%3E`,
                // Skull Icon
                `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${colorHex}'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-10c-.83 0-1.5-.67-1.5-1.5S9.17 7 10 7s1.5.67 1.5 1.5S10.83 10 10 10zm4 0c-.83 0-1.5-.67-1.5-1.5S13.17 7 14 7s1.5.67 1.5 1.5S14.83 10 14 10zm-2 5c-1.38 0-2.5-1.12-2.5-2.5h1c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5h1c0 1.38-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E`,
                // Circuit Icon
                `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${colorHex}'%3E%3Cpath d='M2 8h4v4H2V8zm4 6h4v4H6v-4zm6-6h4v4h-4V8zm4 6h4v4h-4v-4zM8 2h8v4H8V2zm0 16h8v4H8v-4z'/%3E%3C/svg%3E`,
                // Data Stream Icon
                `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${colorHex}'%3E%3Cpath d='M12 2v4l4 4-4 4v4l-4-4-4 4V12l4-4-4-4v4l4 4 4-4V2h-4zm0 8a2 2 0 100 4 2 2 0 000-4z'/%3E%3C/svg%3E`,
                // Binary Code Icon
                `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${colorHex}'%3E%3Cpath d='M7 5h2v2H7V5zm0 4h2v2H7V9zm0 4h2v2H7v-2zm4-8h2v2h-2V5zm0 4h2v2h-2V9zm0 4h2v2h-2v-2zm4-8h2v2h-2V5zm0 4h2v2h-2V9zm0 4h2v2h-2v-2z'/%3E%3C/svg%3E`
            );
        }

        // Customization
        document.getElementById('background').addEventListener('change', (e) => {
            background = e.target.value;
            updateBackground();
        });

        document.getElementById('theme').addEventListener('change', (e) => {
            currentColor = e.target.value === 'purple' ? '#cc00ff' : e.target.value === 'red' ? '#ff0000' : '#00ffcc';
            const colorHex = currentColor.slice(1);
            const elements = document.querySelectorAll('.neon-text, .tile, .search-bar input, .customization select, .customization input[type="text"], .customization input[type="checkbox"], .terminal input, .terminal .prefix, .quote p, #terminal-input-post-login, .customize-btn');
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
            // Update hacker icons and reload tiles
            updateHackerIcons();
            loadTiles();
            updateBackground();
        });

        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 't') {
                e.preventDefault();
                if (document.getElementById('search-bar').style.display !== 'none') {
                    document.getElementById('search').focus();
                } else if (isLoggedIn) {
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
        });

        window.addEventListener('resize', () => {
            canvas.height = window.innerHeight;
            canvas.width = window.innerWidth;
            updateBackground();
        });

        // Load tiles and apply toggles on page load
        window.onload = () => {
            updateHackerIcons(); // Initialize icons with default color
            loadTiles();
            updateBackground();
            updateClock();
            applyToggles();
        };