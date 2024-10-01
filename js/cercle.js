/* -- declaration et affectation des variables globales -- */

let svgElementId = "#svgCecle"; // selecteur de l'element SVG
let fichierSVG = "SVG/cercle.svg"; // chemin vers le fichier SVG
let dataInfo2; // pour stocker les données de data.json
let svgAnimation; //  pour stocker l'animation GSAP

/* -- declaration des fonctions -- */

// fonction pour charger le fichier SVG
function chargerSVG() {
    // selectionner l'element SVG avec Snap.svg
    let svgCercle = Snap(svgElementId);

    // charger le fichier SVG et l'inserer dans l'element
    Snap.load(fichierSVG, function(loadedFragment) {
        svgCercle.append(loadedFragment); // injecte le fichier SVG
        selectionnerClasses(); // appeler la fonction pour selectionner les classes
        genererLegende(); // generer la legende
    });
}

// fonction pour charger les donnees JSON
function chargerData() {
    fetch('data/data.json') // chemin vers le fichier data.json
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors du chargement du fichier JSON');
            }
            return response.json(); // convertir la reponse en JSON
        })
        .then(data => {
            dataInfo2 = data; // affecter les donnees a la variable globale
            lierClassesAuxDonnees(); // lier les classes aux donnees
            animerRotation(); // animer la rotation du SVG
        })

}

// fonction pour lier les classes aux donnees
function lierClassesAuxDonnees() {
    let svgCercle = Snap(svgElementId); 

    // obtenir les dimensions du SVG pour positionner le texte
    let bboxSVG = svgCercle.getBBox();
    let centerX = bboxSVG.x + bboxSVG.width / 2; // centre en X
    let centerY = bboxSVG.y + bboxSVG.height / 2; // centre en Y

    dataInfo2.forEach((item) => {
        // selectionner les elements avec la classe specifique
        let elements = svgCercle.selectAll(`.${item.class}`);

        elements.forEach((element, index) => {
            // ajouter un evenement hover a chaque element
            element.hover(
                // fonction lors du survol
                function() {
                    // ajouter le texte au survol
                    ajouterTexteAuSurvol(element, item.nombre_borne, centerX, centerY + index * 20);
                    // animer la rotation au survol
                    svgAnimation.pause();
                },
                //lors de la fin du survol
                function() {
                    supprimerTexteAuSurvol(element);
                    svgAnimation.resume();
                }
            );
        });
    });
}

// fonction pour ajouter le texte au survol
function ajouterTexteAuSurvol(element, texte, x, y) {
    let svgCercle = Snap(svgElementId);

    // creer l'element de texte au survol
    let textElement = svgCercle.text(x, y, texte);
    textElement.attr({
        'font-size': 12,
        'fill': '#fff',  // couleur du texte
        'text-anchor': 'middle',
        'dominant-baseline': 'middle' // centrer verticalement
    });

    // stocker l'element de texte pour le supprimer plus tard
    element.data('textElement', textElement);
}

// fonction pour supprimer le texte au survol²
function supprimerTexteAuSurvol(element) {
    let textElement = element.data('textElement');
    if (textElement) {
        textElement.remove(); // retirer le texte du groupe
        element.removeData('textElement');
    }
}

// fonction pour appliquer le zoom sur les elements selectionnes
function appliquerZoom(elements) {
    elements.forEach(function(element) {
        element.hover(
            () => element.animate({ transform: 's1.05' }, 300, mina.easeinout), // zoom au survol
            () => element.animate({ transform: 's1' }, 300, mina.easeinout)     // reinitialisation apres le survol
        );
    });
}

// fonction pour selectionner les classes et appliquer des effets
function selectionnerClasses() {
    let svgCercle = Snap(svgElementId);
    let elements = svgCercle.selectAll('[class^="cls-"]'); // selecteur pour toutes les classes qui commencent par "cls-"

    // appliquer l'effet de zoom
    appliquerZoom(elements);
}

// fonction pour generer la legende
function genererLegende() {
    let legendElement = document.getElementById('legend');
    let classes = [
        { className: 'CA de Bastia', color: '#ffd219', population: 63750 },
        { className: 'CC de Marana-Golo', color: '#4cc3d6', population: 24230 },
        { className: 'CC Pasquale Paoli', color: '#fff', population: 6083 },
        { className: 'CC de la Costa Verde', color: '#e0c48a', population: 10726 },
        { className: 'CC de Calvi Balagne', color: '#f9a800', population: 12874 }, 
        { className: 'CC du Centre Corse', color: '#c4c4c4', population: 9953 }, 
        { className: "CC Nebbiu - Conca d'Oro", color: '#eab8d1', population: 7716 }, 
        { className: "CC de l'Ile-Rousse - Balagne", color: '#b5e0a6', population: 11078 }, 
        { className: 'CC de la Castagniccia-Casinca', color: '#ff6f61', population: 13276 }, 
        { className: "CC de l'Oriente", color: '#a8d8b9', population: 6625 }, 
        { className: 'CC du Cap Corse', color: '#5a9bd5', population: 6159 }, 
        { className: "CC de Fium'orbu Castellu", color: '#ff5e20', population: 10033 } 
    ];
    
    classes.forEach(item => {
        let legendItem = document.createElement('div');
        legendItem.className = 'legend-item';

        // utilisation de backticks pour interpoler correctement les variables
        legendItem.innerHTML = `
            <div class="color-box" style="background-color: ${item.color};"></div>
            ${item.className} (Population: ${item.population.toLocaleString()} personnes)
        `;

        legendElement.appendChild(legendItem);
    });
}

// fonction pour animer la rotation du SVG
function animerRotation() {
    svgAnimation = gsap.to(svgElementId, {
        rotation: 360, // rotation complete de 360 degres
        duration: 5,   // duree
        ease: "power1.inOut",
        repeat: -1,    // repeter l'animation indefiniment
        transformOrigin: "50% 50%" // point d'origine pour la rotation (centre du SVG)
    });
}

// fonction d'initialisation
function init() {
    chargerData(); // charger les donnees JSON
    chargerSVG();  // charger le SVG
}

// quand le DOM a ete entierement charge, on peut appeler la fonction d'initialisation
window.addEventListener("load", init);
