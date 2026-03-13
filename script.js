// === CONFIGURATION ===
const CONFIG = {
    channelId: '3295988',
    writeApiKey: '10JCZMPJ1E41POZS',
    readApiKey: 'QJVJO9L6RIRUKS1U',
    refreshInterval: 15000,
    maxHistoryItems: 20
};

// === ÉTAT DE L'APPLICATION ===
let currentLedState = 0;
let commandHistory = [];
let lastUpdateTime = null;
let chart = null;

// === GESTION DU THÈME ===
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

        if (chart) {
            chart.options.scales.y.grid.color = 'rgba(0,0,0,0.1)';
            chart.options.scales.y.ticks.color = '#333';
            chart.options.scales.x.grid.color = 'rgba(0,0,0,0.1)';
            chart.options.scales.x.ticks.color = '#333';
            chart.update();
        }

        localStorage.setItem('theme', 'light');
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Mode clair';

        if (chart) {
            chart.options.scales.y.grid.color = 'rgba(255,255,255,0.1)';
            chart.options.scales.y.ticks.color = '#e0e0e0';
            chart.options.scales.x.grid.color = 'rgba(255,255,255,0.1)';
            chart.options.scales.x.ticks.color = '#e0e0e0';
            chart.update();
        }

        localStorage.setItem('theme', 'dark');
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

// === INITIALISATION ===
document.addEventListener('DOMContentLoaded', () => {
    loadSavedTheme();
    initializeChart();
    loadInitialState();
    startAutoRefresh();
    setupEventListeners();

    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }
});

// === CHART.JS INITIALIZATION ===
function initializeChart() {
    const ctx = document.getElementById('commandChart').getContext('2d');
    const isDarkTheme = document.body.classList.contains('dark-theme');

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'État de la LED',
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
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    grid: {
                        color: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        stepSize: 1,
                        color: isDarkTheme ? '#e0e0e0' : '#333',
                        callback: function (value) {
                            return value === 1 ? 'ALLUMÉ' : 'ÉTEINT';
                        }
                    }
                },
                x: {
                    grid: {
                        color: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        color: isDarkTheme ? '#e0e0e0' : '#333'
                    }
                }
            }
        }
    });
}

// === CHARGEMENT DE L'ÉTAT INITIAL ===
async function loadInitialState() {
    await readLEDState();
    updateHistoryDisplay();
}

// === RAFRAÎCHISSEMENT AUTOMATIQUE ===
function startAutoRefresh() {
    setInterval(async () => {
        await readLEDState();
        document.getElementById('refreshTime').textContent =
            new Date().toLocaleTimeString('fr-FR');
    }, CONFIG.refreshInterval);
}

// === ÉCOUTEURS D'ÉVÉNEMENTS ===
function setupEventListeners() {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mousedown', () => {
            btn.style.transform = 'scale(0.95)';
        });
        btn.addEventListener('mouseup', () => {
            btn.style.transform = '';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
}

// === ENVOI D'UNE COMMANDE ===
async function sendCommand(value) {
    setButtonsDisabled(true);

    document.getElementById('lastCommand').textContent =
        value === 1 ? 'ALLUMER' : 'ÉTEINDRE';
    document.getElementById('lastUpdate').textContent =
        new Date().toLocaleTimeString('fr-FR');

    showLoading(true);

    try {
        const url = `https://api.thingspeak.com/update?api_key=${CONFIG.writeApiKey}&field1=${value}`;
        const response = await fetch(url);
        const result = await response.text();

        if (response.ok && result !== '0') {
            console.log('Commande envoyée avec succès:', value);
            addToHistory(value);
            updateLEDState(value);

            setTimeout(async () => {
                await readLEDState();
            }, 5000);

            showNotification('Commande envoyée avec succès !', 'success');
        } else {
            throw new Error('Échec de l\'envoi');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur de communication avec ThingSpeak', 'error');
        document.getElementById('connectionStatus').textContent = 'ERREUR';
    } finally {
        showLoading(false);
        setTimeout(() => {
            setButtonsDisabled(false);
            document.getElementById('connectionStatus').textContent = 'OK';
        }, 15000);
    }
}

// === LECTURE DE L'ÉTAT DE LA LED ===
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

// === MISE À JOUR DE L'UI DE LA LED ===
function updateLEDState(value) {
    const led = document.getElementById('led');
    const ledStatus = document.getElementById('ledStatus');

    if (value === 1) {
        led.className = 'led led-on';
        ledStatus.textContent = 'ALLUMÉE';
        currentLedState = 1;
    } else {
        led.className = 'led led-off';
        ledStatus.textContent = 'ÉTEINTE';
        currentLedState = 0;
    }

    updateChart();
}

// === AJOUT À L'HISTORIQUE ===
function addToHistory(value, fromRead = false) {
    const timestamp = new Date();
    const historyItem = {
        value: value,
        time: timestamp,
        source: fromRead ? 'lecture' : 'commande'
    };

    commandHistory.unshift(historyItem);

    if (commandHistory.length > CONFIG.maxHistoryItems) {
        commandHistory.pop();
    }

    updateHistoryDisplay();
}

// === MISE À JOUR DE L'AFFICHAGE HISTORIQUE ===
function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    commandHistory.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';

        const commandSpan = document.createElement('span');
        commandSpan.className = `history-command ${item.value === 1 ? 'on' : 'off'}`;
        commandSpan.textContent = item.value === 1 ? 'ALLUMÉ' : 'ÉTEINT';

        const timeSpan = document.createElement('span');
        timeSpan.className = 'history-time';
        timeSpan.textContent = item.time.toLocaleTimeString('fr-FR');

        div.appendChild(commandSpan);
        div.appendChild(timeSpan);
        historyList.appendChild(div);
    });
}

// === MISE À JOUR DU GRAPHIQUE ===
function updateChart() {
    if (!chart) return;

    const now = new Date();
    chart.data.labels.push(now.toLocaleTimeString('fr-FR'));
    chart.data.datasets[0].data.push(currentLedState);

    if (chart.data.labels.length > 20) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }

    chart.update();
}

// === UTILITAIRES UI ===
function setButtonsDisabled(disabled) {
    document.getElementById('btnOn').disabled = disabled;
    document.getElementById('btnOff').disabled = disabled;
}

function showLoading(show) {
    const status = document.getElementById('connectionStatus');
    if (show) {
        status.innerHTML = '<span class="loading"></span>';
    } else {
        status.textContent = 'OK';
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#00b09b' : '#ff6b6b'};
        color: white;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Ajouter les animations CSS pour les notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// === EXPOSITION DES FONCTIONS GLOBALES ===
window.sendCommand = sendCommand;