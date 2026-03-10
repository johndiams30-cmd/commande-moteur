// === CONFIG ===
const ipESP32 = "http://ADRESSE_IP_ESP32"; // Remplacez par l'IP de votre ESP32
const lampImg = document.getElementById("lamp");
const connectionIndicator = document.getElementById("connection-indicator");
const controlPanel = document.getElementById("control-panel");
const toggleBtn = document.getElementById("toggle-panel");
const closePanelBtn = document.getElementById("close-panel");

// Afficher / cacher le panneau
toggleBtn.addEventListener("click", () => {
    controlPanel.classList.remove("hidden");
    toggleBtn.classList.add("hidden");
});

closePanelBtn.addEventListener("click", () => {
    controlPanel.classList.add("hidden");
    toggleBtn.classList.remove("hidden");
});

// Heure et date
function updateDateTime() {
    const now = new Date();
    document.getElementById("time").textContent = now.toLocaleTimeString();
    document.getElementById("date").textContent = now.toLocaleDateString();
}
setInterval(updateDateTime, 1000);
updateDateTime();

// Vérifier connexion ESP32 et état lampe
function checkESP32() {
    fetch(`${ipESP32}/etat`)
        .then(response => response.json())
        .then(data => {
            connectionIndicator.className = "connected";

            if (data.lampe === "on") {
                lampImg.src = "https://i.imgur.com/9F8h6sP.png"; // ampoule allumée
            } else {
                lampImg.src = "https://i.imgur.com/8ZC5Hsq.png"; // ampoule éteinte
            }
        })
        .catch(() => {
            connectionIndicator.className = "disconnected";
        });
}

// Vérifier toutes les 5 secondes
setInterval(checkESP32, 5000);
checkESP32();

// Boutons Allumer / Éteindre
document.getElementById("btn-on").addEventListener("click", () => {
    fetch(`${ipESP32}/on`)
        .then(() => checkESP32())
        .catch(() => alert("Erreur : impossible de contacter l'ESP32"));
});

document.getElementById("btn-off").addEventListener("click", () => {
    fetch(`${ipESP32}/off`)
        .then(() => checkESP32())
        .catch(() => alert("Erreur : impossible de contacter l'ESP32"));
});