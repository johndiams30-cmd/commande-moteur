const writeAPI = "W895NE005ZS6GHF6";
const channelID = "3294224";

// ouvrir panneau de contrôle
function ouvrirControle() {
    document.getElementById("menu").style.display = "none";
    document.getElementById("controle").style.display = "block";
}

// retour menu principal
function retourMenu() {
    document.getElementById("menu").style.display = "block";
    document.getElementById("controle").style.display = "none";
}

// allumer lampe
function allumer() {
    fetch("https://api.thingspeak.com/update?api_key=" + writeAPI + "&field1=1");
    document.getElementById("ampoule").className = "on";
    document.getElementById("etat").innerText = "Allumée";
}

// éteindre lampe
function eteindre() {
    fetch("https://api.thingspeak.com/update?api_key=" + writeAPI + "&field1=0");
    document.getElementById("ampoule").className = "off";
    document.getElementById("etat").innerText = "Éteinte";
}

// mise à jour de l'état depuis ThingSpeak toutes les 5 sec
function majEtat() {
    fetch("https://api.thingspeak.com/channels/" + channelID + "/fields/1/last.txt")
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

// afficher heure et date en direct
function horloge() {
    let maintenant = new Date();
    document.getElementById("heure").innerText = "🕒 " + maintenant.toLocaleTimeString();
    document.getElementById("date").innerText = "📅 " + maintenant.toLocaleDateString();
}

setInterval(horloge, 1000);