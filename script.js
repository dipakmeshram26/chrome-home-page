let currentColor = '#00ffcc';
let backgroundInterval;
let background = 'matrix';
let customWallpaperData = localStorage.getItem('customWallpaperData') || '';
let customWallpaperGallery = [];
let devModeEnabled = localStorage.getItem('devModeEnabled') === 'true';
let devWidgetInterval = null;
let errorPopupSpawnRight = localStorage.getItem('errorPopupSpawnRight') === 'true';
let showMicButton = localStorage.getItem('showMicButton') === 'true';
let speechRecognition = null;
let isVoiceListening = false;
const MAX_WALLPAPER_BYTES = 3 * 1024 * 1024;
const MAX_WALLPAPER_ITEMS = 8;

try {
    const storedGallery = JSON.parse(localStorage.getItem('customWallpaperGallery') || '[]');
    if (Array.isArray(storedGallery)) {
        customWallpaperGallery = storedGallery.filter(item => typeof item === 'string' && item.startsWith('data:image/'));
    }
} catch (error) {
    customWallpaperGallery = [];
}

if (customWallpaperData && !customWallpaperGallery.includes(customWallpaperData)) {
    customWallpaperGallery.unshift(customWallpaperData);
}

// Themes
const themes = {
    neonGreen: '#00ffcc',
    purpleHaze: '#cc00ff',
    bloodRed: '#ff0000',
    electricBlue: '#00ccff',
    goldenGlow: '#ffd700',
    cyberPink: '#ff69b4',
    midnightBlack: '#1a1a2e',
    lavaOrange: '#ff4500',
    multiColor: null
};

// Backgrounds
const backgrounds = {
    matrix: 'matrix',
    grid: 'grid',
    cityscape: 'cityscape',
    glitch: 'glitch',
    neonGrid: 'neonGrid',
    starryNight: 'starryNight',
    pixelRain: 'pixelRain',
    digitalWaves: 'digitalWaves',
    cosmicFlow: 'cosmicFlow',
    customWallpaper: 'customWallpaper'
};

function applyBodyWallpaper(imageData) {
    document.body.style.backgroundImage = `url("${imageData}")`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center center';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundAttachment = 'fixed';
}

function clearBodyWallpaper() {
    document.body.style.backgroundImage = '';
    document.body.style.backgroundSize = '';
    document.body.style.backgroundPosition = '';
    document.body.style.backgroundRepeat = '';
    document.body.style.backgroundAttachment = '';
}

function saveWallpaperState() {
    try {
        localStorage.setItem('customWallpaperData', customWallpaperData || '');
        localStorage.setItem('customWallpaperGallery', JSON.stringify(customWallpaperGallery));
    } catch (e) {
        console.error('Wallpaper state save failed:', e);
        showErrorPopup('Wallpaper save failed. Storage may be full.');
    }
}

function setWallpaperControlsVisible(isVisible) {
    const wallpaperControls = document.getElementById('wallpaper-controls');
    const customBackgroundToggle = document.getElementById('custom-background-toggle');
    const removeWallpaperBtn = document.getElementById('remove-wallpaper-btn');
    if (!wallpaperControls || !removeWallpaperBtn || !customBackgroundToggle) return;

    wallpaperControls.style.display = isVisible ? 'flex' : 'none';
    wallpaperControls.setAttribute('data-visible', isVisible ? 'true' : 'false');
    customBackgroundToggle.textContent = isVisible ? 'Custom Backgrounds (Hide)' : 'Custom Backgrounds';
    removeWallpaperBtn.disabled = !customWallpaperData;
}

function toggleWallpaperControls() {
    const wallpaperControls = document.getElementById('wallpaper-controls');
    if (!wallpaperControls) return;
    const isVisible = wallpaperControls.getAttribute('data-visible') === 'true';
    setWallpaperControlsVisible(!isVisible);
}

function renderWallpaperGallery() {
    const gallery = document.getElementById('wallpaper-gallery');
    const removeWallpaperBtn = document.getElementById('remove-wallpaper-btn');
    if (!gallery) return;

    gallery.innerHTML = '';
    if (removeWallpaperBtn) {
        removeWallpaperBtn.disabled = !customWallpaperData;
    }

    if (customWallpaperGallery.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'wallpaper-gallery-empty';
        emptyState.textContent = 'No images uploaded yet.';
        gallery.appendChild(emptyState);
        return;
    }

    customWallpaperGallery.forEach((imageData, index) => {
        const thumbButton = document.createElement('button');
        thumbButton.type = 'button';
        thumbButton.className = 'wallpaper-thumb';
        if (imageData === customWallpaperData) {
            thumbButton.classList.add('active');
        }
        thumbButton.title = `Set image ${index + 1}`;
        thumbButton.innerHTML = `
            <img src="${imageData}" alt="Wallpaper ${index + 1}">
            <span class="wallpaper-thumb-delete" aria-hidden="true">x</span>
        `;
        thumbButton.addEventListener('click', () => {
            customWallpaperData = imageData;
            background = 'customWallpaper';
            localStorage.setItem('selectedBackground', background);
            const backgroundSelect = document.getElementById('background');
            if (backgroundSelect) {
                backgroundSelect.value = 'customWallpaper';
            }
            saveWallpaperState();
            renderWallpaperGallery();
            updateBackground();
            playSound('click');
        });

        const deleteIcon = thumbButton.querySelector('.wallpaper-thumb-delete');
        if (deleteIcon) {
            deleteIcon.addEventListener('click', (event) => {
                event.stopPropagation();
                removeWallpaperByData(imageData);
            });
        }

        gallery.appendChild(thumbButton);
    });
}

function addWallpaperToGallery(file) {
    if (!file.type.startsWith('image/')) {
        showErrorPopup('Only image files are allowed.');
        return;
    }

    if (file.size > MAX_WALLPAPER_BYTES) {
        showErrorPopup('Image too large. Please keep it under 3MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        const imageData = String(reader.result || '');
        if (!imageData.startsWith('data:image/')) {
            showErrorPopup('Invalid image file.');
            return;
        }

        customWallpaperGallery = [imageData, ...customWallpaperGallery.filter((item) => item !== imageData)].slice(0, MAX_WALLPAPER_ITEMS);
        customWallpaperData = imageData;
        background = 'customWallpaper';
        localStorage.setItem('selectedBackground', background);

        const backgroundSelect = document.getElementById('background');
        if (backgroundSelect) {
            backgroundSelect.value = 'customWallpaper';
        }

        saveWallpaperState();
        renderWallpaperGallery();
        setWallpaperControlsVisible(true);
        updateBackground();
        playSound('success');
    };
    reader.onerror = () => {
        showErrorPopup('Wallpaper upload failed. Try another image.');
    };
    reader.readAsDataURL(file);
}

function removeWallpaperByData(imageDataToRemove) {
    if (!imageDataToRemove) return;

    customWallpaperGallery = customWallpaperGallery.filter((item) => item !== imageDataToRemove);
    if (customWallpaperData === imageDataToRemove) {
        customWallpaperData = customWallpaperGallery[0] || '';
    }

    if (customWallpaperData) {
        background = 'customWallpaper';
        localStorage.setItem('selectedBackground', background);
        const backgroundSelect = document.getElementById('background');
        if (backgroundSelect) {
            backgroundSelect.value = 'customWallpaper';
        }
    } else if (background === 'customWallpaper') {
        background = 'matrix';
        localStorage.setItem('selectedBackground', background);
        const backgroundSelect = document.getElementById('background');
        if (backgroundSelect) {
            backgroundSelect.value = 'matrix';
        }
    }

    saveWallpaperState();
    renderWallpaperGallery();
    updateBackground();
    playSound('click');
}

function removeSelectedWallpaper() {
    if (!customWallpaperData) return;
    removeWallpaperByData(customWallpaperData);
}

function setActiveCustomizeSection(sectionName = 'appearance') {
    const menuItems = document.querySelectorAll('.customize-menu-item');
    const panels = document.querySelectorAll('.settings-panel');

    menuItems.forEach((button) => {
        const isActive = button.getAttribute('data-settings-section') === sectionName;
        button.classList.toggle('active', isActive);
    });

    panels.forEach((panel) => {
        panel.classList.toggle('active', panel.id === `settings-${sectionName}`);
    });
}

function getSpeechRecognitionCtor() {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function normalizeVoiceCommand(transcript = '') {
    const clean = transcript
        .toLowerCase()
        .replace(/[.,!?]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (!clean) return '';

    const searchPrefixes = ['search ', 'google ', 'find ', 'web ', 'sarch ', 'khoj ', 'khojo ', 'khojho ', 'sarch karo ', 'search karo '];
    const hindiSearchPrefixes = ['खोज ', 'ढूंढ ', 'ढूंढो ', 'सर्च ', 'गूगल '];
    const openPrefixes = ['open ', 'khol ', 'kholo ', 'open website ', 'site open '];
    const hindiOpenPrefixes = ['खोल ', 'खोलो '];

    for (const prefix of searchPrefixes) {
        if (clean.startsWith(prefix)) {
            return `search ${clean.slice(prefix.length).trim()}`;
        }
    }

    for (const prefix of hindiSearchPrefixes) {
        if (clean.startsWith(prefix)) {
            return `search ${clean.slice(prefix.length).trim()}`;
        }
    }

    for (const prefix of openPrefixes) {
        if (clean.startsWith(prefix)) {
            return `open ${clean.slice(prefix.length).trim()}`;
        }
    }

    for (const prefix of hindiOpenPrefixes) {
        if (clean.startsWith(prefix)) {
            return `open ${clean.slice(prefix.length).trim()}`;
        }
    }

    if (clean === 'mausam' || clean === 'मौसम') return 'weather';
    if (clean === 'quote' || clean === 'कोट') return 'quote';
    if (clean === 'help' || clean === 'मदद') return 'help';

    return clean;
}

function setVoicePopupVisible(isVisible) {
    const popup = document.getElementById('voice-popup');
    if (!popup) return;
    popup.style.display = isVisible ? 'block' : 'none';
    popup.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
}

function stopVoiceRecognition() {
    if (speechRecognition && isVoiceListening) {
        try {
            speechRecognition.stop();
        } catch (e) {
            console.error('Voice stop failed:', e);
        }
    }
}

function startVoiceRecognition() {
    const popup = document.getElementById('voice-popup');
    const status = document.getElementById('voice-status');
    const transcriptBox = document.getElementById('voice-transcript');
    const micBtn = document.getElementById('mic-toggle-btn');
    const terminalInput = document.getElementById('terminal-input-post-login');

    const SpeechCtor = getSpeechRecognitionCtor();
    if (!SpeechCtor) {
        if (status) status.textContent = 'Voice commands are not supported in this browser.';
        showErrorPopup('Voice recognition not supported in this browser. Use Chrome.');
        return;
    }

    if (!speechRecognition) {
        speechRecognition = new SpeechCtor();
        speechRecognition.continuous = false;
        speechRecognition.interimResults = true;
        speechRecognition.maxAlternatives = 1;
        speechRecognition.lang = 'hi-IN';

        speechRecognition.onstart = () => {
            isVoiceListening = true;
            if (popup) popup.classList.add('listening');
            if (status) status.textContent = 'Listening... Hindi or English boliye.';
            if (micBtn) micBtn.classList.add('active');
        };

        speechRecognition.onresult = (event) => {
            let latestTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const text = event.results[i][0].transcript.trim();
                latestTranscript = text || latestTranscript;
                if (event.results[i].isFinal) {
                    finalTranscript += `${text} `;
                }
            }

            const visibleText = (finalTranscript || latestTranscript).trim();
            if (transcriptBox && visibleText) {
                transcriptBox.textContent = visibleText;
            }

            if (finalTranscript.trim()) {
                const mappedCommand = normalizeVoiceCommand(finalTranscript);
                if (terminalInput && mappedCommand) {
                    terminalInput.value = mappedCommand;
                    if (status) status.textContent = `Command recognized: ${mappedCommand}`;
                    runPostLoginCommand();
                }
            }
        };

        speechRecognition.onerror = (event) => {
            isVoiceListening = false;
            if (popup) popup.classList.remove('listening');
            if (micBtn) micBtn.classList.remove('active');
            if (status) status.textContent = `Voice error: ${event.error}`;
            if (event.error !== 'no-speech') {
                showErrorPopup(`Voice error: ${event.error}`);
            }
        };

        speechRecognition.onend = () => {
            isVoiceListening = false;
            if (popup) popup.classList.remove('listening');
            if (micBtn) micBtn.classList.remove('active');
            if (status && status.textContent.startsWith('Listening')) {
                status.textContent = 'Stopped. Click Start to speak again.';
            }
        };
    }

    if (transcriptBox) {
        transcriptBox.textContent = 'Listening transcript will appear here...';
    }

    try {
        speechRecognition.start();
    } catch (e) {
        console.error('Voice start failed:', e);
        if (status) status.textContent = 'Voice start failed. Try again.';
    }
}

function getApproxRamUsage() {
    if (performance && performance.memory) {
        const usedMb = Math.round(performance.memory.usedJSHeapSize / (1024 * 1024));
        const limitMb = Math.round(performance.memory.jsHeapSizeLimit / (1024 * 1024));
        return `${usedMb} MB / ${limitMb} MB`;
    }

    if (navigator.deviceMemory) {
        return `Approx ${navigator.deviceMemory} GB device memory`;
    }

    return 'Not available in this browser';
}

function getNetworkSummary() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const linkType = connection?.effectiveType || 'unknown';
    const downlink = connection?.downlink ? `${connection.downlink} Mbps` : 'n/a';
    const rtt = connection?.rtt ? `${connection.rtt} ms` : 'n/a';
    const speedDownload = currentNetworkSpeed?.download ? `${currentNetworkSpeed.download.toFixed(2)} Mbps` : 'n/a';
    const speedPing = currentNetworkSpeed?.ping ? `${currentNetworkSpeed.ping} ms` : 'n/a';

    return {
        linkType,
        downlink,
        rtt,
        speedDownload,
        speedPing
    };
}

function updateDevWidget() {
    const output = document.getElementById('dev-widget-output');
    if (!output) return;

    const network = getNetworkSummary();
    const lines = [
        `[SYSTEM] ${navigator.platform || 'Unknown platform'} | ${navigator.language || 'en-US'}`,
        `[BROWSER] ${navigator.userAgent}`,
        `[SCREEN] ${window.screen.width}x${window.screen.height}`,
        `[TIMEZONE] ${Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown'}`,
        `[RAM] ${getApproxRamUsage()}`,
        `[NETWORK] Link: ${network.linkType} | Downlink: ${network.downlink} | RTT: ${network.rtt}`,
        `[SPEED TEST] Download: ${network.speedDownload} | Ping: ${network.speedPing}`
    ];

    output.textContent = lines.join('\n');
}

function toggleDevMode(forceState) {
    const devWidget = document.getElementById('dev-widget');
    if (!devWidget) return;

    devModeEnabled = typeof forceState === 'boolean' ? forceState : !devModeEnabled;
    localStorage.setItem('devModeEnabled', devModeEnabled ? 'true' : 'false');

    if (devModeEnabled) {
        devWidget.style.display = 'block';
        updateDevWidget();
        if (devWidgetInterval) {
            clearInterval(devWidgetInterval);
        }
        devWidgetInterval = setInterval(updateDevWidget, 3000);
        playSound('success');
    } else {
        devWidget.style.display = 'none';
        if (devWidgetInterval) {
            clearInterval(devWidgetInterval);
            devWidgetInterval = null;
        }
        playSound('click');
    }
}

// ===== AUTHENTICATION SYSTEM =====
let isAuthenticated = false;
let isPasswordSet = false;
let authMode = 'login'; // 'login' or 'setup'
let systemPassword = '800700'; // Global fallback password

function initializeAuthSystem() {
    // Try to get password from sessionStorage first
    let passphrase = sessionStorage.getItem('systemPassword');
    
    if (!passphrase) {
        // Set default password
        passphrase = '800700';
        systemPassword = '800700';
        sessionStorage.setItem('systemPassword', '800700');
    } else {
        systemPassword = passphrase;
    }
    
    const authenticated = sessionStorage.getItem('isAuthenticated');
    
    if (passphrase) {
        isPasswordSet = true;
        authMode = 'login';
    } else {
        isPasswordSet = false;
        authMode = 'setup';
    }
    
    // Check localStorage for authenticated status (persists across tabs)
    const localAuthenticated = localStorage.getItem('isAuthenticated');
    if (localAuthenticated === 'true') {
        isAuthenticated = true;
        hideAuthModal();
    } else {
        isAuthenticated = false;
        applyLockTheme();
        showAuthModal();
    }
}

function applyLockTheme() {
    document.body.classList.add('auth-locked');
    currentColor = '#ff0000';
    updateBackground();
}

function removeLockTheme() {
    document.body.classList.remove('auth-locked');
    const savedTheme = localStorage.getItem('selectedTheme') || 'neonGreen';
    currentColor = themes[savedTheme] || '#00ffcc';
    updateBackground();
}

function showAuthModal() {
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
        authModal.style.display = 'flex';
        document.getElementById('auth-password').focus();
    }
}

function hideAuthModal() {
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
        authModal.style.display = 'none';
    }
}

function updateAuthMessage() {
    const msg = document.getElementById('auth-message');
    if (!msg) return;
    
    if (authMode === 'setup') {
        msg.innerHTML = `
            >> SYSTEM INITIALIZATION MODE<br>
            >> New passphrase not detected<br>
            >> Enter secure authentication code:<br>
            >> This code will be your gateway key
        `;
    } else {
        msg.innerHTML = `
            >> SYSTEM: Access Terminal Protocol Engaged<br>
            >> SECURITY: Multi-layer encryption active<br>
            >> AUTHENTICATE: Input your passphrase code:
        `;
    }
}

function validatePassword(password) {
    if (authMode === 'setup') {
        return password.length >= 4;
    } else {
        const savedPass = sessionStorage.getItem('systemPassword') || systemPassword;
        console.log('Saved Password:', savedPass, 'Input:', password, 'Match:', password === savedPass);
        return password === savedPass;
    }
}

function handleAuthSubmit() {
    const passwordInput = document.getElementById('auth-password');
    const password = passwordInput.value.trim();
    const statusDiv = document.getElementById('auth-status');
    
    if (!password) {
        statusDiv.textContent = '⚠️ PASSPHRASE REQUIRED';
        statusDiv.className = 'auth-status error';
        playSound('error');
        return;
    }
    
    if (validatePassword(password)) {
        playSound('success');
        
        if (authMode === 'setup') {
            sessionStorage.setItem('systemPassword', password);
            systemPassword = password;
            isPasswordSet = true;
            authMode = 'login';
        }
        
        isAuthenticated = true;
        localStorage.setItem('isAuthenticated', 'true');
        
        statusDiv.textContent = '✅ ACCESS GRANTED';
        statusDiv.className = 'auth-status success';
        
        setTimeout(() => {
            removeLockTheme();
            hideAuthModal();
            initializeDashboard(); // Initialize dashboard after successful auth
        }, 800);
    } else {
        playSound('error');
        statusDiv.textContent = '❌ ACCESS DENIED';
        statusDiv.className = 'auth-status error';
        passwordInput.value = '';
        passwordInput.focus();
    }
}

function logout() {
    if (confirm('🔐 Confirm logout? System will lock.')) {
        isAuthenticated = false;
        localStorage.setItem('isAuthenticated', 'false');
        document.getElementById('auth-password').value = '';
        applyLockTheme();
        showAuthModal();
        updateAuthMessage();
        hideCustomizeModal();
    }
}

function changePassword() {
    const newPassword = document.getElementById('change-password').value.trim();
    if (!newPassword) {
        alert('⚠️ Enter a new passphrase');
        return;
    }
    if (newPassword.length < 4) {
        alert('⚠️ Passphrase must be at least 4 characters');
        return;
    }
    sessionStorage.setItem('systemPassword', newPassword);
    systemPassword = newPassword;
    document.getElementById('change-password').value = '';
    alert('✅ Passphrase updated successfully!');
    playSound('success');
}

// Dashboard initialization function
function initializeDashboard() {
    try {
        console.log('Initializing dashboard...');
        loadTiles();
        backgroundInterval = initMatrixRain();
        updateBackground();
        updateClock();
        applyToggles();
        initQuote();
        updateWeatherDisplay();
        fetchWeather();
        autoDetectNetworkSpeed();
        toggleDevMode(devModeEnabled);
        setInterval(updateClock, 1000);
        setInterval(fetchWeather, WEATHER_REFRESH_INTERVAL_MS);
        setInterval(autoDetectNetworkSpeed, 30000);
        
        setupEventListeners();
        console.log('Dashboard initialized successfully');
    } catch (e) {
        console.error('Dashboard initialization failed:', e);
        showErrorPopup(e.message);
    }
}

// Setup all event listeners  
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

// Grid Background
function drawGrid() {
    try {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    } catch (e) {
        console.error('Grid background failed:', e);
        showErrorPopup(e.message);
    }
}

// Cityscape Background
function drawCityscape() {
    try {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    } catch (e) {
        console.error('Cityscape background failed:', e);
        showErrorPopup(e.message);
    }
}

// Glitch Background
function drawGlitch() {
    try {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < 10; i++) {
            ctx.fillStyle = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
            ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 50, 50);
        }
    } catch (e) {
        console.error('Glitch background failed:', e);
        showErrorPopup(e.message);
    }
}

// Neon Grid Background
function drawNeonGrid() {
    try {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 30) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    } catch (e) {
        console.error('Neon grid background failed:', e);
        showErrorPopup(e.message);
    }
}

// Starry Night Background
function drawStarryNight() {
    try {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < 100; i++) {
            ctx.fillStyle = currentColor;
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    } catch (e) {
        console.error('Starry night background failed:', e);
        showErrorPopup(e.message);
    }
}

// Pixel Rain Background
function drawPixelRain() {
    try {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = currentColor;
            ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 5, 5);
        }
    } catch (e) {
        console.error('Pixel rain background failed:', e);
        showErrorPopup(e.message);
    }
}

// Digital Waves Background
function drawDigitalWaves() {
    try {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < canvas.height; i += 20) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.bezierCurveTo(canvas.width / 3, i + Math.random() * 20, 2 * canvas.width / 3, i + Math.random() * 20, canvas.width, i);
            ctx.strokeStyle = currentColor;
            ctx.stroke();
        }
    } catch (e) {
        console.error('Digital waves background failed:', e);
        showErrorPopup(e.message);
    }
}

// Cosmic Flow Background
function drawCosmicFlow() {
    try {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
        gradient.addColorStop(0, currentColor);
        gradient.addColorStop(1, '#000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } catch (e) {
        console.error('Cosmic flow background failed:', e);
        showErrorPopup(e.message);
    }
}

function updateBackground() {
    try {
        clearInterval(backgroundInterval);
        const canvas = document.getElementById('canvas');
        if (!canvas) throw new Error('Canvas element not found');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (background === 'customWallpaper') {
            if (!customWallpaperData) {
                background = 'matrix';
                localStorage.setItem('selectedBackground', background);
                canvas.style.display = 'block';
                clearBodyWallpaper();
                backgroundInterval = initMatrixRain();
                showErrorPopup('No custom wallpaper found. Upload an image first.');
                return;
            }

            canvas.style.display = 'none';
            applyBodyWallpaper(customWallpaperData);
            return;
        }

        canvas.style.display = 'block';
        clearBodyWallpaper();

        if (background === 'matrix') {
            backgroundInterval = initMatrixRain();
        } else if (background === 'grid') {
            drawGrid();
        } else if (background === 'cityscape') {
            drawCityscape();
        } else if (background === 'glitch') {
            drawGlitch();
        } else if (background === 'neonGrid') {
            drawNeonGrid();
        } else if (background === 'starryNight') {
            drawStarryNight();
        } else if (background === 'pixelRain') {
            drawPixelRain();
        } else if (background === 'digitalWaves') {
            drawDigitalWaves();
        } else if (background === 'cosmicFlow') {
            drawCosmicFlow();
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

// In-page Search Window
let searchWindowUrl = '';
let searchWindowReady = false;
let searchWindowDrag = {
    active: false,
    startX: 0,
    startY: 0,
    initialLeft: 0,
    initialTop: 0
};
let searchWindowRestoreRect = null;
let latestSearchRequestId = 0;
let searxInstanceIndex = 0;

function getGoogleSearchUrl(query) {
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

const SEARXNG_INSTANCES = [
    'https://search.inetol.net',
    'https://searx.be',
    'https://search.sapti.me'
];

function getSearxIframeSearchUrl(query, instanceIndex = 0) {
    const safeIndex = Math.max(0, Math.min(SEARXNG_INSTANCES.length - 1, instanceIndex));
    const baseUrl = SEARXNG_INSTANCES[safeIndex];
    return `${baseUrl}/search?q=${encodeURIComponent(query)}&language=en-US&safesearch=0&categories=general`;
}

function loadIframeWithTimeout(frame, url, timeoutMs = 4500) {
    return new Promise((resolve) => {
        let finished = false;
        const done = (ok) => {
            if (finished) return;
            finished = true;
            frame.onload = null;
            frame.onerror = null;
            clearTimeout(timer);
            resolve(ok);
        };
        const timer = setTimeout(() => done(false), timeoutMs);
        frame.onload = () => done(true);
        frame.onerror = () => done(false);
        frame.src = url;
    });
}

function escapeHtml(value = '') {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function normalizeResultUrl(url = '') {
    return url
        .replace(/^https?:\/\//, '')
        .replace(/\/+$/, '')
        .toLowerCase();
}

function buildFallbackResults(query) {
    return [
        {
            title: `DuckDuckGo results for "${query}"`,
            url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
            snippet: 'Open full DuckDuckGo results.',
            source: 'DuckDuckGo'
        },
        {
            title: `Bing results for "${query}"`,
            url: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
            snippet: 'Open full Bing results.',
            source: 'Bing'
        }
    ];
}

function normalizeDdgTopics(topics = []) {
    const normalized = [];
    topics.forEach((item) => {
        if (item?.Topics) {
            normalized.push(...normalizeDdgTopics(item.Topics));
            return;
        }
        if (item?.FirstURL || item?.Text) {
            normalized.push(item);
        }
    });
    return normalized;
}

async function fetchDuckDuckGoResults(query) {
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&skip_disambig=1&t=blackarch-home`;
    const ddgResponse = await fetch(ddgUrl);
    if (!ddgResponse.ok) {
        throw new Error(`DuckDuckGo API failed (${ddgResponse.status})`);
    }

    const ddgData = await ddgResponse.json();
    const items = [];

    if (ddgData.AbstractURL || ddgData.AbstractText) {
        items.push({
            title: ddgData.Heading || query,
            url: ddgData.AbstractURL || getGoogleSearchUrl(query),
            snippet: ddgData.AbstractText || 'Open this result for more details.',
            source: 'DuckDuckGo'
        });
    }

    const related = normalizeDdgTopics(ddgData.RelatedTopics || []);
    related.slice(0, 8).forEach((item) => {
        items.push({
            title: item.Text ? item.Text.split(' - ')[0] : 'Related result',
            url: item.FirstURL || getGoogleSearchUrl(query),
            snippet: item.Text || 'Open this result for more details.',
            source: 'DuckDuckGo'
        });
    });

    return items;
}

async function fetchWikipediaResults(query) {
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&namespace=0&format=json&origin=*`;
    const wikiResponse = await fetch(wikiUrl);
    if (!wikiResponse.ok) {
        throw new Error(`Wikipedia API failed (${wikiResponse.status})`);
    }

    const data = await wikiResponse.json();
    const titles = data[1] || [];
    const descriptions = data[2] || [];
    const links = data[3] || [];

    const items = [];
    for (let i = 0; i < links.length; i++) {
        items.push({
            title: titles[i] || 'Wikipedia result',
            url: links[i],
            snippet: descriptions[i] || 'Open this Wikipedia entry.',
            source: 'Wikipedia'
        });
    }
    return items;
}

async function fetchInPageSearchResults(query) {
    const [ddgResult, wikiResult] = await Promise.allSettled([
        fetchDuckDuckGoResults(query),
        fetchWikipediaResults(query)
    ]);

    const combined = [];
    if (ddgResult.status === 'fulfilled') {
        combined.push(...ddgResult.value);
    }
    if (wikiResult.status === 'fulfilled') {
        combined.push(...wikiResult.value);
    }

    if (combined.length === 0) {
        return buildFallbackResults(query);
    }

    const unique = [];
    const seen = new Set();
    combined.forEach((result) => {
        if (!result.url) return;
        const key = normalizeResultUrl(result.url);
        if (seen.has(key)) return;
        seen.add(key);
        unique.push(result);
    });

    const limited = unique.slice(0, 12);
    return limited.length > 0 ? limited : buildFallbackResults(query);
}

function renderSearchResults(query, results) {
    const frame = document.getElementById('search-window-frame');
    if (!frame) return;

    const safeQuery = escapeHtml(query);
    if (!results || results.length === 0) {
        frame.srcdoc = `
            <html><head><base target="_self"></head><body style="background:#071015;color:#bdf9ed;font-family:VT323,monospace;padding:16px;">
                <div style="border:1px dashed #00ffcc66;border-radius:8px;padding:14px;">
                    No results found for <b>${safeQuery}</b>.<br><br>
                    <a href="${getGoogleSearchUrl(query)}" style="color:#8bf6df;">Open Google Search</a>
                </div>
            </body></html>
        `;
        return;
    }

    const resultHtml = results.map((result) => {
        const safeTitle = escapeHtml(result.title || 'Result');
        const safeUrl = escapeHtml(result.url || '#');
        const safeSnippet = escapeHtml(result.snippet || '');
        const safeSource = escapeHtml(result.source || 'Web');
        const isGoogleUrl = /(^https?:\/\/)?([a-z0-9-]+\.)*google\./i.test(result.url || '');
        const titleMarkup = isGoogleUrl
            ? `<span style="color:#8bf6df;font-family:Arial,sans-serif;font-size:14px;">${safeTitle} (blocked in iframe)</span>`
            : `<a href="${safeUrl}" style="color:#8bf6df;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;">${safeTitle}</a>`;
        return `
            <article style="border:1px solid #00ffcc55;border-radius:8px;padding:10px;margin-bottom:10px;background:rgba(0,0,0,.45);">
                ${titleMarkup}
                <div style="display:inline-block;border:1px solid #00ffcc77;border-radius:999px;padding:2px 8px;font-size:12px;color:#93ffe7;margin:6px 0 4px;">${safeSource}</div>
                <div style="color:#66d8c0;font-size:12px;margin:4px 0 6px;word-break:break-all;">${safeUrl}</div>
                <p style="color:#b8fff0;margin:0;line-height:1.35;font-size:14px;">${safeSnippet}</p>
            </article>
        `;
    }).join('');

    frame.srcdoc = `
        <html>
        <head>
            <meta charset="utf-8">
            <base target="_self">
        </head>
        <body style="margin:0;padding:10px 12px 14px;background:#071015;color:#bdf9ed;font-family:VT323,monospace;">
            <p style="margin:0 0 10px;color:#90f0da;">Results for: <b>${safeQuery}</b></p>
            ${resultHtml}
        </body>
        </html>
    `;
}

async function performInPageSearch(query) {
    const frame = document.getElementById('search-window-frame');
    if (!frame) return;

    const requestId = ++latestSearchRequestId;
    frame.srcdoc = `
        <html><head><base target="_self"></head><body style="background:#071015;color:#bdf9ed;font-family:VT323,monospace;padding:16px;">
            <div style="border:1px dashed #00ffcc66;border-radius:8px;padding:14px;">Loading SearXNG results in iframe...</div>
        </body></html>
    `;

    for (let i = 0; i < SEARXNG_INSTANCES.length; i++) {
        if (requestId !== latestSearchRequestId) return;
        const indexToTry = (searxInstanceIndex + i) % SEARXNG_INSTANCES.length;
        const ok = await loadIframeWithTimeout(frame, getSearxIframeSearchUrl(query, indexToTry));
        if (requestId !== latestSearchRequestId) return;
        if (ok) {
            searxInstanceIndex = indexToTry;
            return;
        }
    }

    // If all iframe instances fail, keep UI working by rendering results inside iframe srcdoc.
    try {
        const results = await fetchInPageSearchResults(query);
        if (requestId !== latestSearchRequestId) return;
        renderSearchResults(query, results);
    } catch (error) {
        if (requestId !== latestSearchRequestId) return;
        console.error('All SearXNG instances failed:', error);
        renderSearchResults(query, buildFallbackResults(query));
    }
}

function initializeSearchWindow() {
    if (searchWindowReady) return;

    const win = document.getElementById('search-window');
    const header = document.getElementById('search-window-header');
    const closeBtn = document.getElementById('search-window-close');
    const minimizeBtn = document.getElementById('search-window-minimize');
    const maximizeBtn = document.getElementById('search-window-maximize');
    const openTabBtn = document.getElementById('search-window-open-tab');
    const frame = document.getElementById('search-window-frame');
    const input = document.getElementById('search-window-input');
    const goBtn = document.getElementById('search-window-go');

    if (!win || !header || !closeBtn || !minimizeBtn || !maximizeBtn || !openTabBtn || !frame || !input || !goBtn) {
        throw new Error('Search window elements not found');
    }

    const stopHeaderButtonPropagation = (event) => event.stopPropagation();
    [closeBtn, minimizeBtn, maximizeBtn, openTabBtn].forEach(btn => {
        btn.addEventListener('mousedown', stopHeaderButtonPropagation);
    });

    closeBtn.addEventListener('click', () => {
        win.style.display = 'none';
        win.setAttribute('aria-hidden', 'true');
        win.classList.remove('minimized');
        frame.srcdoc = '';
    });

    minimizeBtn.addEventListener('click', () => {
        win.classList.toggle('minimized');
    });

    maximizeBtn.addEventListener('click', () => {
        if (win.classList.contains('maximized')) {
            win.classList.remove('maximized');
            if (searchWindowRestoreRect) {
                win.style.left = `${searchWindowRestoreRect.left}px`;
                win.style.top = `${searchWindowRestoreRect.top}px`;
                win.style.width = `${searchWindowRestoreRect.width}px`;
                win.style.height = `${searchWindowRestoreRect.height}px`;
            } else {
                win.style.left = '';
                win.style.top = '';
                win.style.width = '';
                win.style.height = '';
            }
            return;
        }

        const rect = win.getBoundingClientRect();
        searchWindowRestoreRect = {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
        };
        win.classList.remove('minimized');
        win.classList.add('maximized');
    });

    openTabBtn.addEventListener('click', () => {
        const query = input.value.trim();
        if (!query) return;
        searxInstanceIndex = (searxInstanceIndex + 1) % SEARXNG_INSTANCES.length;
        performInPageSearch(query);
    });

    const submitSearch = () => {
        const query = input.value.trim();
        if (!query) return;
        openSearchWindow(query);
    };

    goBtn.addEventListener('click', submitSearch);
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            submitSearch();
        }
    });

    header.addEventListener('mousedown', (event) => {
        if (win.classList.contains('maximized')) return;
        searchWindowDrag.active = true;
        searchWindowDrag.startX = event.clientX;
        searchWindowDrag.startY = event.clientY;
        const rect = win.getBoundingClientRect();
        searchWindowDrag.initialLeft = rect.left;
        searchWindowDrag.initialTop = rect.top;
    });

    document.addEventListener('mousemove', (event) => {
        if (!searchWindowDrag.active || win.classList.contains('maximized')) return;
        const deltaX = event.clientX - searchWindowDrag.startX;
        const deltaY = event.clientY - searchWindowDrag.startY;
        const maxLeft = window.innerWidth - win.offsetWidth;
        const maxTop = window.innerHeight - win.offsetHeight;
        const nextLeft = Math.max(0, Math.min(maxLeft, searchWindowDrag.initialLeft + deltaX));
        const nextTop = Math.max(0, Math.min(maxTop, searchWindowDrag.initialTop + deltaY));
        win.style.left = `${nextLeft}px`;
        win.style.top = `${nextTop}px`;
    });

    document.addEventListener('mouseup', () => {
        searchWindowDrag.active = false;
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && win.style.display !== 'none') {
            win.style.display = 'none';
            win.setAttribute('aria-hidden', 'true');
            win.classList.remove('minimized');
            frame.srcdoc = '';
        }
    });

    searchWindowReady = true;
}

function openSearchWindow(query) {
    try {
        searchWindowUrl = getGoogleSearchUrl(query);
        window.open(searchWindowUrl, '_blank');
    } catch (e) {
        console.error('Open Google search failed:', e);
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
            openSearchWindow(query);
        }
    } catch (e) {
        console.error('Search failed:', e);
        showErrorPopup(e.message);
    }
}

// Weather
const WEATHER_LOCATION = {
    name: 'New Delhi',
    latitude: 28.6139,
    longitude: 77.2090
};
const WEATHER_REQUEST_TIMEOUT_MS = 8000;
const WEATHER_REFRESH_INTERVAL_MS = 600000;
const WEATHER_STORAGE_KEY = 'lastKnownWeather';
const WEATHER_UNAVAILABLE_TEXT = `Weather unavailable (${WEATHER_LOCATION.name})`;
let currentWeather = localStorage.getItem(WEATHER_STORAGE_KEY) || 'Loading weather...';

function formatWeatherTemperature(value) {
    if (!Number.isFinite(value)) {
        throw new Error('Invalid weather temperature received');
    }
    return `${Math.round(value)}°C`;
}

function getWeatherDescription(code) {
    const weatherCodeMap = {
        0: 'Clear',
        1: 'Mostly Clear',
        2: 'Partly Cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Rime Fog',
        51: 'Light Drizzle',
        53: 'Drizzle',
        55: 'Dense Drizzle',
        56: 'Freezing Drizzle',
        57: 'Dense Freezing Drizzle',
        61: 'Light Rain',
        63: 'Rain',
        65: 'Heavy Rain',
        66: 'Freezing Rain',
        67: 'Heavy Freezing Rain',
        71: 'Light Snow',
        73: 'Snow',
        75: 'Heavy Snow',
        77: 'Snow Grains',
        80: 'Rain Showers',
        81: 'Heavy Showers',
        82: 'Violent Showers',
        85: 'Snow Showers',
        86: 'Heavy Snow Showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm, Hail',
        99: 'Severe Thunderstorm, Hail'
    };

    return weatherCodeMap[code] || 'Weather';
}

async function fetchWeatherText(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), WEATHER_REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(url, {
            cache: 'no-store',
            signal: controller.signal
        });
        if (!response.ok) {
            throw new Error(`Weather request failed (${response.status})`);
        }
        return response.text();
    } finally {
        clearTimeout(timeoutId);
    }
}

async function fetchWeatherJson(url) {
    const rawText = await fetchWeatherText(url);

    try {
        return JSON.parse(rawText);
    } catch (error) {
        throw new Error('Weather service returned invalid data');
    }
}

async function fetchWeatherFromOpenMeteo() {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${WEATHER_LOCATION.latitude}&longitude=${WEATHER_LOCATION.longitude}&current=temperature_2m,weather_code&temperature_unit=celsius`;
    const data = await fetchWeatherJson(weatherUrl);
    const current = data && data.current;

    if (!current || !Number.isFinite(current.temperature_2m) || typeof current.weather_code !== 'number') {
        throw new Error('Open-Meteo weather data is incomplete');
    }

    const weatherLabel = getWeatherDescription(current.weather_code);
    return `${weatherLabel}, ${formatWeatherTemperature(current.temperature_2m)} (${WEATHER_LOCATION.name})`;
}

async function fetchWeatherFromWttr() {
    const weatherUrl = `https://wttr.in/${encodeURIComponent(WEATHER_LOCATION.name)}?format=%25C+%25t`;
    const text = (await fetchWeatherText(weatherUrl)).trim();

    if (!text) {
        throw new Error('wttr.in returned an empty weather response');
    }

    return `${text} (${WEATHER_LOCATION.name})`;
}

async function fetchWeather() {
    const weatherSources = [fetchWeatherFromOpenMeteo, fetchWeatherFromWttr];

    for (const getWeather of weatherSources) {
        try {
            currentWeather = await getWeather();
            localStorage.setItem(WEATHER_STORAGE_KEY, currentWeather);
            updateWeatherDisplay();
            return;
        } catch (error) {
            console.warn('Weather source failed:', error);
        }
    }

    currentWeather = localStorage.getItem(WEATHER_STORAGE_KEY) || WEATHER_UNAVAILABLE_TEXT;
    updateWeatherDisplay();
}

function updateWeatherDisplay() {
    const weatherElement = document.getElementById('weather');
    if (!weatherElement) {
        console.warn('Weather element not found');
        return;
    }

    weatherElement.textContent = currentWeather;
}

// Quotes
const quotes = [
    "Code is poetry in motion.",
    "Hack the planet!",
    "The future is written in binary.",
    "Stay curious, stay dangerous."
];

// Sound Manager
let soundEnabled = localStorage.getItem('soundEnabled') !== 'false';

function playSound(type = 'click') {
    if (!soundEnabled) return;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const now = audioContext.currentTime;
        
        let oscillator, gain;
        
        if (type === 'click') {
            oscillator = audioContext.createOscillator();
            gain = audioContext.createGain();
            oscillator.connect(gain);
            gain.connect(audioContext.destination);
            oscillator.frequency.value = 600;
            oscillator.type = 'sine';
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            oscillator.start(now);
            oscillator.stop(now + 0.1);
        } else if (type === 'keystroke') {
            oscillator = audioContext.createOscillator();
            gain = audioContext.createGain();
            oscillator.connect(gain);
            gain.connect(audioContext.destination);
            oscillator.frequency.value = 800 + Math.random() * 200;
            oscillator.type = 'sine';
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            oscillator.start(now);
            oscillator.stop(now + 0.05);
        } else if (type === 'search') {
            oscillator = audioContext.createOscillator();
            gain = audioContext.createGain();
            oscillator.connect(gain);
            gain.connect(audioContext.destination);
            oscillator.frequency.setValueAtTime(500, now);
            oscillator.frequency.linearRampToValueAtTime(900, now + 0.15);
            oscillator.type = 'sine';
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            oscillator.start(now);
            oscillator.stop(now + 0.15);
        } else if (type === 'success') {
            oscillator = audioContext.createOscillator();
            gain = audioContext.createGain();
            oscillator.connect(gain);
            gain.connect(audioContext.destination);
            oscillator.frequency.setValueAtTime(400, now);
            oscillator.frequency.linearRampToValueAtTime(800, now + 0.2);
            oscillator.type = 'sine';
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            oscillator.start(now);
            oscillator.stop(now + 0.2);
        } else if (type === 'error') {
            oscillator = audioContext.createOscillator();
            gain = audioContext.createGain();
            oscillator.connect(gain);
            gain.connect(audioContext.destination);
            oscillator.frequency.setValueAtTime(800, now);
            oscillator.frequency.linearRampToValueAtTime(200, now + 0.3);
            oscillator.type = 'sine';
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            oscillator.start(now);
            oscillator.stop(now + 0.3);
        }
    } catch (e) {
        console.error('Sound playback error:', e);
    }
}

// Internet Speed Test
let isSpeedTesting = false;
let currentNetworkSpeed = { download: 0, ping: 0 };

async function testInternetSpeed() {
    if (isSpeedTesting) return;
    isSpeedTesting = true;
    
    const resultElement = document.getElementById('speed-result');
    const button = document.getElementById('speed-test-btn');
    
    try {
        resultElement.textContent = '⏳ Testing...';
        if (button) button.disabled = true;
        playSound('click');
        
        // Measure ping with a simple request
        const pingStart = performance.now();
        try {
            await fetch('data:,', { cache: 'no-store' });
        } catch (e) {}
        const pingEnd = performance.now();
        const ping = Math.round(pingEnd - pingStart);
        
        // Measure download speed
        const testSize = 1024 * 500; // 500KB test
        const iterations = 2;
        let totalTime = 0;
        
        const testBlob = new Blob([new ArrayBuffer(testSize)]);
        const testUrl = URL.createObjectURL(testBlob);
        
        for (let i = 0; i < iterations; i++) {
            const startTime = performance.now();
            try {
                const response = await fetch(testUrl, { cache: 'no-store' });
                await response.blob();
                const endTime = performance.now();
                totalTime += (endTime - startTime);
            } catch (e) {
                console.error('Speed test iteration failed:', e);
            }
        }
        
        URL.revokeObjectURL(testUrl);
        
        const avgTime = totalTime / iterations;
        const speedMbps = (testSize * 8) / (avgTime * 1000);
        
        currentNetworkSpeed = { download: speedMbps, ping: ping };
        
        resultElement.innerHTML = `
            <div>⬇️ ${speedMbps.toFixed(2)} Mbps</div>
            <div>📡 ${ping}ms</div>
        `;
        
        playSound('success');
    } catch (e) {
        console.error('Speed test failed:', e);
        resultElement.textContent = 'Test Failed ❌';
        playSound('error');
    } finally {
        if (button) button.disabled = false;
        isSpeedTesting = false;
    }
}

// Auto-fetch network speed on page load
async function autoDetectNetworkSpeed() {
    try {
        const resultElement = document.getElementById('speed-result');
        if (!resultElement) return;
        
        resultElement.textContent = '🔍 Detecting...';
        
        // Quick ping check
        const pingStart = performance.now();
        try {
            await fetch('data:,', { cache: 'no-store' });
        } catch (e) {}
        const pingEnd = performance.now();
        const ping = Math.round(pingEnd - pingStart);
        
        // Quick download speed estimation
        const testSize = 1024 * 100; // 100KB
        const startTime = performance.now();
        
        try {
            const testBlob = new Blob([new ArrayBuffer(testSize)]);
            const testUrl = URL.createObjectURL(testBlob);
            const response = await fetch(testUrl, { cache: 'no-store' });
            await response.blob();
            URL.revokeObjectURL(testUrl);
        } catch (e) {
            console.error('Auto speed detection failed:', e);
        }
        
        const endTime = performance.now();
        const avgTime = endTime - startTime;
        const speedMbps = (testSize * 8) / (avgTime * 1000);
        
        currentNetworkSpeed = { download: speedMbps, ping: ping };
        
        resultElement.innerHTML = `
            <div>⬇️ ${speedMbps.toFixed(2)} Mbps</div>
            <div>📡 ${ping}ms</div>
        `;
    } catch (e) {
        console.error('Auto network speed detection failed:', e);
        document.getElementById('speed-result').textContent = 'Auto-detect ❌';
    }
}
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
            tileElement.addEventListener('click', () => playSound('click'));
            tilesContainer.appendChild(tileElement);
        });

        const addTile = document.createElement('div');
        addTile.className = 'tile add-tile glitch';
        addTile.innerHTML = `
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${encodeURIComponent(currentColor.slice(1))}'%3E%3Cpath d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'/%3E%3C/svg%3E" alt="+">
            <span>Add</span>
        `;
        addTile.addEventListener('click', showAddInput);
        addTile.addEventListener('click', () => playSound('click'));
        tilesContainer.appendChild(addTile);
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
        // Populate theme and background selects
        const themeSelect = document.getElementById('theme');
        const backgroundSelect = document.getElementById('background');
        if (themeSelect && backgroundSelect) {
            themeSelect.innerHTML = Object.keys(themes).map(theme => `<option value="${theme}">${theme}</option>`).join('');
            backgroundSelect.innerHTML = Object.keys(backgrounds).map(bg => `<option value="${bg}">${bg}</option>`).join('');
            themeSelect.value = Object.keys(themes).find(t => themes[t] === currentColor) || 'neonGreen';
            backgroundSelect.value = background;
        }

        renderWallpaperGallery();
        setWallpaperControlsVisible(background === 'customWallpaper');
        setActiveCustomizeSection('appearance');
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
        const soundEnabledLocal = localStorage.getItem('soundEnabled') !== 'false';
        const showMicButtonLocal = localStorage.getItem('showMicButton') === 'true';
        const searchBarToggle = document.getElementById('search-bar-toggle');
        const webSearchToggle = document.getElementById('web-search-toggle');
        const webSearchSettingsToggle = document.getElementById('web-search-settings-toggle');
        const showMicToggle = document.getElementById('show-mic-toggle');
        const soundToggle = document.getElementById('sound-toggle');
        const searchBar = document.getElementById('search-bar');
        const terminalWidget = document.getElementById('terminal-widget');
        const micToggleBtn = document.getElementById('mic-toggle-btn');
        if (!searchBarToggle || !webSearchToggle || !soundToggle || !searchBar || !terminalWidget) {
            throw new Error('Toggle elements not found');
        }
        searchBarToggle.checked = showSearchBar;
        webSearchToggle.checked = enableWebSearch;
        if (webSearchSettingsToggle) {
            webSearchSettingsToggle.checked = enableWebSearch;
        }
        if (showMicToggle) {
            showMicToggle.checked = showMicButtonLocal;
        }
        soundToggle.checked = soundEnabledLocal;
        soundEnabled = soundEnabledLocal;
        showMicButton = showMicButtonLocal;
        searchBar.style.display = showSearchBar ? 'block' : 'none';
        terminalWidget.style.display = 'block';
        if (micToggleBtn) {
            micToggleBtn.style.display = showMicButton ? 'inline-flex' : 'none';
            if (!showMicButton) {
                stopVoiceRecognition();
                setVoicePopupVisible(false);
            }
        }
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
    search: 'Searches directly on Google in a new tab. Usage: search <query> (or any input when Web Search is enabled)',
    open: 'Opens a bookmark. Usage: open <bookmark-name>',
    addbookmark: 'Adds a new bookmark. Usage: addbookmark <url> [name]',
    clearbookmarks: 'Clears all bookmarks and restores defaults.',
    weather: 'Shows current weather for New Delhi.',
    quote: 'Displays a random quote.',
    theme: 'Changes the dashboard theme. Usage: theme <neonGreen|purpleHaze|bloodRed|electricBlue|goldenGlow|cyberPink|midnightBlack|lavaOrange|multiColor>',
    background: 'Changes the background style. Usage: background <matrix|grid|cityscape|glitch|neonGrid|starryNight|pixelRain|digitalWaves|cosmicFlow>',
    clearhistory: 'Clears terminal command history.',
    speed: 'Tests your internet speed manually or shows auto-detected speed. Usage: speed',
    addcommand: 'Adds a custom command. Usage: addcommand <name> <action>',
    hack: 'Initiates a fun hacking simulation.'
};

function handleTerminalKeydown(event) {
    try {
        const input = document.getElementById('terminal-input-post-login');
        if (!input) throw new Error('Terminal input not found');
        if (event.key === 'Enter') {
            playSound('search');
            runPostLoginCommand();
        } else if (event.key === 'Tab') {
            event.preventDefault();
            playSound('keystroke');
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
        } else {
            playSound('keystroke');
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
                openSearchWindow(query);
                response = '[OK] Search opened in Google tab';
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
                openSearchWindow(query);
                response = '[OK] Search opened in Google tab';
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
            fetchWeather();
            response = `[OK] Weather updated: ${currentWeather}`;
        } else if (command === 'quote') {
            response = '[SYSTEM] Generating quote ...';
            postOutput.textContent += `\n${response}`;
            postOutput.scrollTop = postOutput.scrollHeight;
            const newQuote = quotes[Math.floor(Math.random() * quotes.length)];
            document.getElementById('quote').textContent = newQuote;
            response = `[OK] Quote: ${newQuote}`;
        } else if (command.startsWith('theme ')) {
            const theme = command.slice(6).trim().toLowerCase();
            if (Object.keys(themes).includes(theme)) {
                response = `[SYSTEM] Changing theme to ${theme} ...`;
                postOutput.textContent += `\n${response}`;
                postOutput.scrollTop = postOutput.scrollHeight;
                document.getElementById('theme').value = theme;
                document.getElementById('theme').dispatchEvent(new Event('change'));
                response = '[OK] Theme changed';
            } else {
                response = '[ERROR] Invalid theme. Options: ' + Object.keys(themes).join(', ');
                showErrorPopup(response);
            }
        } else if (command.startsWith('background ')) {
            const bg = command.slice(10).trim().toLowerCase();
            if (Object.keys(backgrounds).includes(bg)) {
                response = `[SYSTEM] Changing background to ${bg} ...`;
                postOutput.textContent += `\n${response}`;
                postOutput.scrollTop = postOutput.scrollHeight;
                document.getElementById('background').value = bg;
                document.getElementById('background').dispatchEvent(new Event('change'));
                response = '[OK] Background changed';
            } else {
                response = '[ERROR] Invalid background. Options: ' + Object.keys(backgrounds).join(', ');
                showErrorPopup(response);
            }
        } else if (command === 'clearhistory') {
            response = '[SYSTEM] Clearing history ...';
            postOutput.textContent += `\n${response}`;
            postOutput.scrollTop = postOutput.scrollHeight;
            terminalHistory = [];
            postOutput.textContent = '[SYSTEM] Terminal history cleared';
            response = '';
        } else if (command === 'speed') {
            response = '[SYSTEM] Running speed test... Check the widget below for results.';
            postOutput.textContent += `\n${response}`;
            postOutput.scrollTop = postOutput.scrollHeight;
            testInternetSpeed(); // Call async function without await
            response = '[OK] Speed test initiated';
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
        } else if (command === 'devmode') {
            toggleDevMode();
            response = `[OK] Dev Mode ${devModeEnabled ? 'enabled' : 'disabled'}`;
        } else if (webSearchEnabled) {
            response = `[SYSTEM] Searching for: ${command} ...`;
            postOutput.textContent += `\n${response}`;
            postOutput.scrollTop = postOutput.scrollHeight;
            openSearchWindow(command);
            response = '[OK] Search opened in Google tab';
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
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const popupWidth = Math.min(380, screenWidth - 20);
    const popupHeight = 120;
    const padding = 20;
    const minXBound = padding;
    const maxXBound = screenWidth - popupWidth - padding;
    const minYBound = padding;
    const maxYBound = screenHeight - popupHeight - padding;
    const sidePadding = 12;
    const leftXStart = minXBound;
    const leftXEnd = Math.max(leftXStart, Math.min(maxXBound, screenWidth * 0.24));
    const rightXStart = Math.min(maxXBound, Math.max(minXBound, screenWidth * 0.76 - popupWidth));
    const rightXEnd = maxXBound;

    // Alternate mode: one popup left, next popup right.
    errorPopupSpawnRight = !errorPopupSpawnRight;
    localStorage.setItem('errorPopupSpawnRight', errorPopupSpawnRight ? 'true' : 'false');

    let x;
    if (errorPopupSpawnRight && rightXStart < rightXEnd) {
        x = Math.random() * (rightXEnd - rightXStart) + rightXStart;
    } else if (!errorPopupSpawnRight && leftXStart < leftXEnd) {
        x = Math.random() * (leftXEnd - leftXStart) + leftXStart;
    } else {
        x = errorPopupSpawnRight ? maxXBound - sidePadding : minXBound + sidePadding;
    }

    let y = Math.random() * (maxYBound - minYBound) + minYBound;

    const popup = document.createElement('div');
    popup.className = 'error-popup';
    popup.style.position = 'fixed';
    popup.style.transform = 'none';
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    popup.innerHTML = `
        <div class="drag-handle">
            <span>${message}</span>
            <button class="close-btn" onclick="this.parentElement.parentElement.remove()">✖</button>
        </div>
    `;
    document.body.appendChild(popup);

    // Clamp after render using real size so long messages never overflow viewport.
    const initialWidth = popup.offsetWidth || popupWidth;
    const initialHeight = popup.offsetHeight || popupHeight;
    x = Math.max(padding, Math.min(screenWidth - initialWidth - padding, x));
    y = Math.max(padding, Math.min(screenHeight - initialHeight - padding, y));
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;

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
            const liveScreenWidth = window.innerWidth;
            const liveScreenHeight = window.innerHeight;
            const livePopupWidth = popup.offsetWidth || popupWidth;
            const livePopupHeight = popup.offsetHeight || popupHeight;
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            currentX = Math.max(padding, Math.min(liveScreenWidth - livePopupWidth - padding, currentX));
            currentY = Math.max(padding, Math.min(liveScreenHeight - livePopupHeight - padding, currentY));

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
        initializeSearchWindow();
        
        // Initialize authentication system first
        initializeAuthSystem();
        updateAuthMessage();
        
        // Attach auth button handler immediately (before checking authentication)
        const authLoginBtn = document.getElementById('auth-login-btn');
        const authPasswordInput = document.getElementById('auth-password');
        if (authLoginBtn) {
            authLoginBtn.addEventListener('click', () => {
                playSound('click');
                handleAuthSubmit();
            });
        }
        if (authPasswordInput) {
            authPasswordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    playSound('click');
                    handleAuthSubmit();
                }
            });
        }
        
        // Load saved background and theme from localStorage
        const savedBackground = localStorage.getItem('selectedBackground') || 'matrix';
        background = savedBackground;
        const savedTheme = localStorage.getItem('selectedTheme') || 'neonGreen';
        currentColor = themes[savedTheme] || '#00ffcc';
        
        // Only proceed with UI setup if authenticated
        if (isAuthenticated) {
            initializeDashboard();
        }
    } catch (e) {
        console.error('DOMContentLoaded failed:', e);
        showErrorPopup(e.message);
    }
});

// Setup all event listeners
function setupEventListeners() {
    try {
        const addTileBtn = document.getElementById('add-tile-btn');
        const customizeBtn = document.getElementById('customize-btn');
        const customizeCancelBtn = document.getElementById('customize-cancel-btn');
        const backgroundSelect = document.getElementById('background');
        const themeSelect = document.getElementById('theme');
        const searchBarToggle = document.getElementById('search-bar-toggle');
        const webSearchToggle = document.getElementById('web-search-toggle');
        const soundToggle = document.getElementById('sound-toggle');
        const rootUsernameInput = document.getElementById('root-username');
        const searchInput = document.getElementById('search');
        const terminalInput = document.getElementById('terminal-input-post-login');
        const speedTestBtn = document.getElementById('speed-test-btn');
        const authPasswordInput = document.getElementById('auth-password');
        const authLoginBtn = document.getElementById('auth-login-btn');
        const changePasswordBtn = document.getElementById('change-password-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const customWallpaperInput = document.getElementById('custom-wallpaper-input');
        const uploadWallpaperBtn = document.getElementById('upload-wallpaper-btn');
        const removeWallpaperBtn = document.getElementById('remove-wallpaper-btn');
        const customBackgroundToggle = document.getElementById('custom-background-toggle');
        const webSearchSettingsToggle = document.getElementById('web-search-settings-toggle');
        const showMicToggle = document.getElementById('show-mic-toggle');
        const customizeMenuItems = document.querySelectorAll('.customize-menu-item');
        const micToggleBtn = document.getElementById('mic-toggle-btn');
        const voicePopup = document.getElementById('voice-popup');
        const voicePopupClose = document.getElementById('voice-popup-close');
        const voiceStartBtn = document.getElementById('voice-start-btn');
        const voiceStopBtn = document.getElementById('voice-stop-btn');

        if (!addTileBtn || !customizeBtn || !customizeCancelBtn || !backgroundSelect || !themeSelect ||
            !searchBarToggle || !webSearchToggle || !rootUsernameInput || !searchInput || !terminalInput ||
            !customWallpaperInput || !uploadWallpaperBtn || !removeWallpaperBtn || !customBackgroundToggle ||
            !micToggleBtn || !voicePopup || !voicePopupClose || !voiceStartBtn || !voiceStopBtn) {
            throw new Error('One or more DOM elements not found');
        }

        addTileBtn.addEventListener('click', addNewTile);
        addTileBtn.addEventListener('click', () => playSound('click'));
        customizeBtn.addEventListener('click', showCustomizeModal);
        customizeBtn.addEventListener('click', () => playSound('click'));
        customizeCancelBtn.addEventListener('click', hideCustomizeModal);
        customizeCancelBtn.addEventListener('click', () => playSound('click'));
        backgroundSelect.addEventListener('change', (e) => {
            background = e.target.value;
            localStorage.setItem('selectedBackground', background);
            if (background === 'customWallpaper') {
                setWallpaperControlsVisible(true);
            }
            updateBackground();
        });
        customBackgroundToggle.addEventListener('click', () => {
            toggleWallpaperControls();
            renderWallpaperGallery();
            playSound('click');
        });
        uploadWallpaperBtn.addEventListener('click', () => {
            customWallpaperInput.click();
        });
        customWallpaperInput.addEventListener('change', (e) => {
            try {
                const selectedFiles = Array.from(e.target.files || []);
                if (selectedFiles.length === 0) return;

                selectedFiles.forEach((file) => addWallpaperToGallery(file));
                customWallpaperInput.value = '';
            } catch (e) {
                console.error('Wallpaper upload failed:', e);
                showErrorPopup(e.message);
            }
        });
        removeWallpaperBtn.addEventListener('click', () => {
            try {
                removeSelectedWallpaper();
            } catch (e) {
                console.error('Wallpaper remove failed:', e);
                showErrorPopup(e.message);
            }
        });
        themeSelect.addEventListener('change', (e) => {
            try {
                const selectedTheme = e.target.value;
                localStorage.setItem('selectedTheme', selectedTheme);
                currentColor = themes[selectedTheme] || currentColor;
                if (selectedTheme === 'multiColor') {
                    let multiColorInterval = setInterval(() => {
                        currentColor = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
                        applyTheme();
                    }, 2000);
                    setTimeout(() => clearInterval(multiColorInterval), 10000); // 10 seconds multi-color effect
                } else {
                    applyTheme();
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
        if (webSearchSettingsToggle) {
            webSearchSettingsToggle.addEventListener('change', (e) => {
                try {
                    localStorage.setItem('enableWebSearch', e.target.checked);
                    applyToggles();
                } catch (error) {
                    console.error('Web search settings toggle failed:', error);
                    showErrorPopup(error.message);
                }
            });
        }
        if (showMicToggle) {
            showMicToggle.addEventListener('change', (e) => {
                try {
                    localStorage.setItem('showMicButton', e.target.checked ? 'true' : 'false');
                    applyToggles();
                } catch (error) {
                    console.error('Show mic toggle failed:', error);
                    showErrorPopup(error.message);
                }
            });
        }

        micToggleBtn.addEventListener('click', () => {
            setVoicePopupVisible(true);
            startVoiceRecognition();
            playSound('click');
        });

        voicePopupClose.addEventListener('click', () => {
            stopVoiceRecognition();
            setVoicePopupVisible(false);
            playSound('click');
        });

        voiceStartBtn.addEventListener('click', () => {
            startVoiceRecognition();
            playSound('click');
        });

        voiceStopBtn.addEventListener('click', () => {
            stopVoiceRecognition();
            playSound('click');
        });

        customizeMenuItems.forEach((button) => {
            button.addEventListener('click', () => {
                const sectionName = button.getAttribute('data-settings-section');
                if (!sectionName) return;
                setActiveCustomizeSection(sectionName);
                playSound('click');
            });
        });
        soundToggle.addEventListener('change', (e) => {
            try {
                soundEnabled = e.target.checked;
                localStorage.setItem('soundEnabled', soundEnabled);
                playSound('success');
            } catch (e) {
                console.error('Sound toggle failed:', e);
                showErrorPopup(e.message);
            }
        });
        if (speedTestBtn) {
            speedTestBtn.addEventListener('click', () => {
                try {
                    playSound('click');
                    testInternetSpeed();
                } catch (e) {
                    console.error('Speed test click failed:', e);
                    showErrorPopup(e.message);
                }
            });
        }
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
                    playSound('search');
                    search();
                } else {
                    playSound('keystroke');
                }
            } catch (e) {
                console.error('Search keydown failed:', e);
                showErrorPopup(e.message);
            }
        });
        terminalInput.addEventListener('keydown', handleTerminalKeydown);
        
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => {
                playSound('click');
                changePassword();
            });
        }
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                playSound('error');
                logout();
            });
        }
        
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
                if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
                    e.preventDefault();
                    toggleDevMode();
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
    } catch (e) {
        console.error('Setup events failed:', e);
        showErrorPopup(e.message);
    }
}

function applyTheme() {
    try {
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
    } catch (e) {
        console.error('Apply theme failed:', e);
        showErrorPopup(e.message);
    }
}
