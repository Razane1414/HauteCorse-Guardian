//  Variables globales
const titreHomeId = "titreHome"; // ID du titre 
const navbarLinksClass = "navbar-links"; // classe de la barre de nav

//  Fonction pour l'animation GSAP du texte
function reveleTexte(titreHome) {
    gsap.to(titreHome, {
        duration: 1, 
        ease: "power4.out", 
        clipPath: "inset(0 0 0 0)",  
        webkitClipPath: "inset(0 0 0 0)", 
    });
}

// fonction pour animer la barre de navigation
function animeNavbarLinks() {
    // tous les éléments <li> sauf separateur
    const navbarLinks = document.querySelectorAll(`.${navbarLinksClass} li:not(.divider)`);

    gsap.fromTo(navbarLinks, {
        y: -20, 
        opacity: 0 
    }, {
        duration: 0.8, 
        y: 0, 
        opacity: 1, 
        ease: "power4.out", 
        delay: 0.3 
    });
}

// fnction d'initialisation
function init() {
    const titreHome = document.getElementById(titreHomeId); 

    reveleTexte(titreHome);  
    animeNavbarLinks(); 
}

window.addEventListener("load", init);
