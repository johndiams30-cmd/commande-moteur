const writeAPI = "W895NE005ZS6GHF6";

function allumer() {
    fetch("https://api.thingspeak.com/update?api_key=" + writeAPI + "&field1=1");
    document.getElementById("ampoule").className = "on";
    document.getElementById("etat").innerText = "Allumée";
}

function eteindre() {
    fetch("https://api.thingspeak.com/update?api_key=" + writeAPI + "&field1=0");
    document.getElementById("ampoule").className = "off";
    document.getElementById("etat").innerText = "Éteinte";
}

// Mettre à jour l'état depuis ThingSpeak toutes les 5 secondes
function majEtat() {
    fetch("https://api.thingspeak.com/channels/VOTRE_CHANNEL_ID/fields/1/last.txt")
        .then(response => response.text())
        .then(data => {
            data = data.trim();
            if (data == "1") {
                document.getElementById("ampoule").className = "on";
                document.getElementById("etat").innerText = "Allumée";
                document.getElementById("wifi").innerText = "🟢 ESP32 connecté";
            } else {
                document.getElementById("ampoule").className = "off";
                document.getElementById("etat").innerText = "Éteinte";
                document.getElementById("wifi").innerText = "🟢 ESP32 connecté";
            }
        })
        .catch(() => {
            document.getElementById("wifi").innerText = "🔴 ESP32 déconnecté";
        });
}

setInterval(majEtat, 5000);