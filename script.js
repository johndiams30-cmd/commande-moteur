// ==================== AUTHENTIFICATION ====================
// 🔐 Mot de passe : Admin1234
const PASSWORD_HASH = "d86f4d95037be50b8801738482fa0363c572d52ee4ffe588c40d939ae9f31170";

// ==================== CONFIGURATION ====================
const CONFIG = {
    channelId: '3295988',
    writeApiKey: '10JCZMPJ1E41POZS',
    readApiKey: 'QJVJO9L6RIRUKS1U',
    refreshInterval: 15000,
    maxHistoryItems: 20
};

// ==================== ÉTAT GLOBAL ====================
let currentLedState = 0;
let commandHistory = [];
let chart = null;
let refreshInterval = null;

// ==================== AUTHENTIFICATION ====================
async function hashPassword(password) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function login() {
    const passwordInput = document.getElementById('passwordInput');
    const errorDiv = document.getElementById('loginError');
    const password = passwordInput.value;

    if (!password) {
        errorDiv.textContent = 'Veuillez entrer un mot de passe';
        return;
    }

    const hash = await hashPassword(password);

    if (hash === PASSWORD_HASH) {
        sessionStorage.setItem('iot_auth', 'true');
        sessionStorage.setItem('iot_auth_time', Date.now().toString());
        showDashboard();
        errorDiv.textContent = '';
        passwordInput.value = '';
    } else {
        errorDiv.textContent = 'Mot de passe incorrect';
        passwordInput.value = '';
        passwordInput.focus();
    }
}

function logout() {
    sessionStorage.removeItem('iot_auth');
    sessionStorage.removeItem('iot_auth_time');
    location.reload();
}

function checkSession() {
    const auth = sessionStorage.getItem('iot_auth');
    const authTime = sessionStorage.getItem('iot_auth_time');

    if (auth === 'true' && authTime) {
        const timeDiff = Date.now() - parseInt(authTime);
        if (timeDiff < 24 * 60 * 60 * 1000) {
            showDashboard();
            return true;
        }
    }
    showLogin();
    return false;
}

function showDashboard() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    initApp();
}

function showLogin() {
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
}

// ==================== THÈME ====================
function toggleTheme() {
    const body = document.body;
    const themeBtn = document.getElementById('themeToggle');
    const themeIcon = themeBtn.querySelector('.theme-icon');
    const themeText = themeBtn.querySelector('.theme-text');

    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Mode sombre';
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Mode clair';
        localStorage.setItem('theme', 'dark');
    }

    if (chart) {
        const isDark = body.classList.contains('dark-theme');
        chart.options.scales.y.grid.color = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        chart.options.scales.y.ticks.color = isDark ? '#e0e0e0' : '#333';
        chart.options.scales.x.grid.color = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        chart.options.scales.x.ticks.color = isDark ? '#e0e0e0' : '#333';
        chart.update();
    }
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;
    const themeBtn = document.getElementById('themeToggle');

    if (themeBtn) {
        const themeIcon = themeBtn.querySelector('.theme-icon');
        const themeText = themeBtn.querySelector('.theme-text');

        if (savedTheme === 'light') {
            body.classList.add('light-theme');
            body.classList.remove('dark-theme');
            themeIcon.textContent = '🌙';
            themeText.textContent = 'Mode sombre';
        } else {
            body.classList.add('dark-theme');
            body.classList.remove('light-theme');
            themeIcon.textContent = '☀️';
            themeText.textContent = 'Mode clair';
        }
    }
}

// ==================== CHART.JS ====================
function initializeChart() {
    const ctx = document.getElementById('commandChart').getContext('2d');
    const isDarkTheme = document.body.classList.contains('dark-theme');

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'État du Moteur',
                data: [],
                borderColor: '#ffaa00',
                backgroundColor: isDarkTheme ? 'rgba(255, 170, 0, 0.2)' : 'rgba(255, 170, 0, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    grid: { color: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                    ticks: {
                        stepSize: 1,
                        color: isDarkTheme ? '#e0e0e0' : '#333',
                        callback: (value) => value === 1 ? 'MARCHE' : 'ARRÊT'
                    }
                },
                x: {
                    grid: { color: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                    ticks: { color: isDarkTheme ? '#e0e0e0' : '#333' }
                }
            }
        }
    });
}

// ==================== COMMUNICATION THINGSPEAK ====================
async function sendCommand(value) {
    setButtonsDisabled(true);
    document.getElementById('lastCommand').textContent = value === 1 ? 'MARCHE' : 'ARRÊT';
    document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString('fr-FR');

    try {
        const url = `https://api.thingspeak.com/update?api_key=${CONFIG.writeApiKey}&field1=${value}`;
        const response = await fetch(url);
        const result = await response.text();

        if (response.ok && result !== '0') {
            addToHistory(value);
            updateLEDState(value);
            setTimeout(() => readLEDState(), 3000);
            showNotification('Commande envoyée avec succès !', 'success');
        } else {
            throw new Error('Échec de l\'envoi');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur de communication avec ThingSpeak', 'error');
        document.getElementById('connectionStatus').textContent = 'ERREUR';
    } finally {
        setTimeout(() => {
            setButtonsDisabled(false);
            document.getElementById('connectionStatus').textContent = 'OK';
        }, 5000);
    }
}

async function readLEDState() {
    try {
        const url = `https://api.thingspeak.com/channels/${CONFIG.channelId}/fields/1/last.json?api_key=${CONFIG.readApiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.field1 !== undefined) {
            const value = parseInt(data.field1);
            updateLEDState(value);
            addToHistory(value, true);
            document.getElementById('connectionStatus').textContent = 'OK';
        }
    } catch (error) {
        console.error('Erreur de lecture:', error);
        document.getElementById('connectionStatus').textContent = 'ERREUR';
    }
}

// ==================== MISE À JOUR UI ====================
function updateLEDState(value) {
    const led = document.getElementById('led');
    const ledStatus = document.getElementById('ledStatus');

    if (value === 1) {
        led.className = 'led led-on';
        ledStatus.textContent = 'MARCHE';
        currentLedState = 1;
    } else {
        led.className = 'led led-off';
        ledStatus.textContent = 'ARRÊT';
        currentLedState = 0;
    }

    updateChart();
}

function updateChart() {
    if (!chart) return;
    chart.data.labels.push(new Date().toLocaleTimeString('fr-FR'));
    chart.data.datasets[0].data.push(currentLedState);
    if (chart.data.labels.length > 20) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }
    chart.update();
}

// ==================== HISTORIQUE ====================
function addToHistory(value, fromRead = false) {
    commandHistory.unshift({ value, time: new Date() });
    if (commandHistory.length > CONFIG.maxHistoryItems) commandHistory.pop();
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    if (commandHistory.length === 0) {
        historyList.innerHTML = '<div style="text-align: center; padding: 20px;">Aucune commande</div>';
        return;
    }

    commandHistory.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        const commandSpan = document.createElement('span');
        commandSpan.className = `history-command ${item.value === 1 ? 'on' : 'off'}`;
        commandSpan.textContent = item.value === 1 ? 'MARCHE' : 'ARRÊT';
        const timeSpan = document.createElement('span');
        timeSpan.className = 'history-time';
        timeSpan.textContent = item.time.toLocaleTimeString('fr-FR');
        div.appendChild(commandSpan);
        div.appendChild(timeSpan);
        historyList.appendChild(div);
    });
}

// ==================== UTILITAIRES ====================
function setButtonsDisabled(disabled) {
    const btnOn = document.getElementById('btnOn');
    const btnOff = document.getElementById('btnOff');
    if (btnOn) btnOn.disabled = disabled;
    if (btnOff) btnOff.disabled = disabled;
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; padding: 12px 24px;
        background: ${type === 'success' ? '#00b09b' : '#ff6b6b'}; color: white;
        border-radius: 10px; z-index: 1000; animation: slideIn 0.3s ease;
        font-family: 'Segoe UI', sans-serif; font-weight: bold;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==================== INITIALISATION ====================
function startAutoRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(async () => {
        await readLEDState();
    }, CONFIG.refreshInterval);
}

async function loadInitialState() {
    await readLEDState();
    updateHistoryDisplay();
}

function setupEventListeners() {
    // Boutons de commande
    document.getElementById('btnOn').addEventListener('click', () => sendCommand(1));
    document.getElementById('btnOff').addEventListener('click', () => sendCommand(0));

    // Bouton de connexion
    document.getElementById('loginBtn').addEventListener('click', login);

    // Bouton de déconnexion
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Bouton thème
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Animation des boutons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mousedown', () => btn.style.transform = 'scale(0.95)');
        btn.addEventListener('mouseup', () => btn.style.transform = '');
        btn.addEventListener('mouseleave', () => btn.style.transform = '');
    });

    // Entrée pour valider le mot de passe
    document.getElementById('passwordInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') login();
    });
}

function initApp() {
    loadSavedTheme();
    initializeChart();
    loadInitialState();
    startAutoRefresh();
    setupEventListeners();
}

// ==================== DÉMARRAGE ====================
document.addEventListener('DOMContentLoaded', () => {
    if (!checkSession()) {
        showLogin();
    }
});