// === CONFIGURATION ===
const CONFIG = {
    channelId: '3295988',
    writeApiKey: '10JCZMPJ1E41POZS',  // Votre Write API Key
    readApiKey: 'QJVJO9L6RIRUKS1U',   // Votre Read API Key
    refreshInterval: 15000, // 15 secondes (minimum ThingSpeak)
    maxHistoryItems: 20
};

// === ÉTAT DE L'APPLICATION ===
let currentLedState = 0;
let commandHistory = [];
let lastUpdateTime = null;
let chart = null;

// === INITIALISATION ===
document.addEventListener('DOMContentLoaded', () => {
    initializeChart();
    loadInitialState();
    startAutoRefresh();
    setupEventListeners();
});

// === CHART.JS INITIALIZATION ===
function initializeChart() {
    const ctx = document.getElementById('commandChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'État de la LED',
                data: [],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
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
                    ticks: {
                        stepSize: 1,
                        callback: function (value) {
                            return value === 1 ? 'ALLUMÉ' : 'ÉTEINT';
                        }
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
    // Animation des boutons
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
    // Désactiver les boutons pendant l'envoi
    setButtonsDisabled(true);

    // Mise à jour UI
    document.getElementById('lastCommand').textContent =
        value === 1 ? 'ALLUMER' : 'ÉTEINDRE';
    document.getElementById('lastUpdate').textContent =
        new Date().toLocaleTimeString('fr-FR');

    // Afficher un indicateur de chargement
    showLoading(true);

    try {
        // Construction de l'URL
        const url = `https://api.thingspeak.com/update?api_key=${CONFIG.writeApiKey}&field1=${value}`;

        // Envoi de la commande
        const response = await fetch(url);
        const result = await response.text();

        if (response.ok && result !== '0') {
            console.log('Commande envoyée avec succès:', value);

            // Ajouter à l'historique
            addToHistory(value);

            // Mise à jour immédiate de la LED (optimiste)
            updateLEDState(value);

            // Relecture de l'état après quelques secondes pour confirmation
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
        // Réactiver les boutons après le délai ThingSpeak
        setTimeout(() => {
            setButtonsDisabled(false);
            document.getElementById('connectionStatus').textContent = 'OK';
        }, 15000); // 15 secondes
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

            // Ajouter à l'historique
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

    // Mettre à jour le graphique
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

    // Limiter la taille de l'historique
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

    // Ajouter le nouveau point
    const now = new Date();
    chart.data.labels.push(now.toLocaleTimeString('fr-FR'));
    chart.data.datasets[0].data.push(currentLedState);

    // Garder seulement les 20 derniers points
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
    // Créer une notification temporaire
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