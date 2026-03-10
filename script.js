function ouvrirControle() {

    document.getElementById("menu").style.display = "none";
    document.getElementById("controle").style.display = "block";

}

function retourMenu() {

    document.getElementById("menu").style.display = "block";
    document.getElementById("controle").style.display = "none";

}

function allumer() {

    fetch("http://192.168.30.212/on", { mode: "no-cors" });

    document.getElementById("ampoule").classList.remove("off");
    document.getElementById("ampoule").classList.add("on");

    document.getElementById("etat").innerText = "Allumée";

}

function eteindre() {

    fetch("http://192.168.30.212/off", { mode: "no-cors" });

    document.getElementById("ampoule").classList.remove("on");
    document.getElementById("ampoule").classList.add("off");

    document.getElementById("etat").innerText = "Éteinte";

}