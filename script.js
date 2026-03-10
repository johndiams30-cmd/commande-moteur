const menu = document.getElementById("menuPrincipal");
const controle = document.getElementById("panneauControle");
const ampoule = document.getElementById("ampoule");
const etat = document.getElementById("etat");

// ouvrir panneau de commande
function ouvrirControle() {

    menu.style.display = "none";
    controle.style.display = "block";

}

// retour menu principal
function retourMenu() {

    controle.style.display = "none";
    menu.style.display = "block";

}

// allumer lampe
function allumer() {

    fetch("http://192.168.30.212/on", {
        mode: "no-cors"
    });

    ampoule.classList.remove("off");
    ampoule.classList.add("on");

    etat.innerText = "Allumée";
    etat.style.color = "lime";

}

// eteindre lampe
function eteindre() {

    fetch("http://192.168.30.212/off", {
        mode: "no-cors"
    });

    ampoule.classList.remove("on");
    ampoule.classList.add("off");

    etat.innerText = "Éteinte";
    etat.style.color = "white";

}