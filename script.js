const ipESP = "http://192.168.30.212";

function ouvrirControle() {

    document.getElementById("menu").style.display = "none";
    document.getElementById("controle").style.display = "block";

}

function retourMenu() {

    document.getElementById("menu").style.display = "block";
    document.getElementById("controle").style.display = "none";

}


function allumer() {

    fetch(ipESP + "/on", { mode: "no-cors" });

    document.getElementById("ampoule").classList.remove("off");
    document.getElementById("ampoule").classList.add("on");

    document.getElementById("etat").innerText = "Allumée";

}


function eteindre() {

    fetch(ipESP + "/off", { mode: "no-cors" });

    document.getElementById("ampoule").classList.remove("on");
    document.getElementById("ampoule").classList.add("off");

    document.getElementById("etat").innerText = "Éteinte";

}



// heure et date

function horloge() {

    let maintenant = new Date()

    let heure = maintenant.toLocaleTimeString()

    let date = maintenant.toLocaleDateString()

    document.getElementById("heure").innerText = "🕒 " + heure

    document.getElementById("date").innerText = "📅 " + date

}

setInterval(horloge, 1000)



// test connexion ESP32

function testESP() {

    fetch(ipESP + "/etat", { mode: "no-cors" })
        .then(() => {

            document.getElementById("wifi").innerText = "🟢 ESP32 connecté"

        })
        .catch(() => {

            document.getElementById("wifi").innerText = "🔴 ESP32 déconnecté"

        })

}

setInterval(testESP, 5000)