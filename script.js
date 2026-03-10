const menu = document.getElementById("menuPrincipal")
const controle = document.getElementById("panneauControle")
const ampoule = document.getElementById("ampoule")
const etat = document.getElementById("etat")

// ouvrir panneau
function ouvrirControle() {
    menu.classList.add("hidden")
    controle.classList.remove("hidden")
}

// retour menu
function retourMenu() {
    controle.classList.add("hidden")
    menu.classList.remove("hidden")
}

// allumer
function allumer() {

    fetch("http://IP_ESP32/on")

    ampoule.classList.remove("off")
    ampoule.classList.add("on")

    etat.innerText = "Allumée"
    etat.style.color = "lime"
}

// eteindre
function eteindre() {

    fetch("http://IP_ESP32/off")

    ampoule.classList.remove("on")
    ampoule.classList.add("off")

    etat.innerText = "Éteinte"
    etat.style.color = "white"
}