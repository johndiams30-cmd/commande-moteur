function allumer() {

    fetch("http://192.168.30.212/on", {
        mode: "no-cors"
    });

    ampoule.classList.remove("off");
    ampoule.classList.add("on");

    etat.innerText = "Allumée";
    etat.style.color = "lime";

}

function eteindre() {

    fetch("http://192.168.30.212/off", {
        mode: "no-cors"
    });

    ampoule.classList.remove("on");
    ampoule.classList.add("off");

    etat.innerText = "Éteinte";
    etat.style.color = "white";

}