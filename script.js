const etatLampe = document.getElementById("etat-lampe");
const ipESP32 = "http://ADRESSE_IP_ESP32"; // Remplacez par l'IP de votre ESP32

// Allumer la lampe
document.getElementById("btn-on").addEventListener("click", () => {
    fetch(`${ipESP32}/on`)
        .then(() => etatLampe.textContent = "ON")
        .catch(() => alert("Erreur : impossible de contacter l'ESP32"));
});

// Éteindre la lampe
document.getElementById("btn-off").addEventListener("click", () => {
    fetch(`${ipESP32}/off`)
        .then(() => etatLampe.textContent = "OFF")
        .catch(() => alert("Erreur : impossible de contacter l'ESP32"));
});