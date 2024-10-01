// VARIABLE GLOBAL
let svgElementIdBarre = "#svgBarre"; // SVG où insérer le graphique en barres
let fichierSVGBarre = "SVG/barre.svg"; // chemain du fichier SVG BARRE
let svgBarre; // pour stocker l'élément SVG une fois chargé

// Fonction pour charger le fichier SVG du graphique
function chargerSVGBarre() {
    svgBarre = Snap(svgElementIdBarre);
    
    Snap.load(fichierSVGBarre, function(loadedFragment) {
        svgBarre.append(loadedFragment);
        genererLegendeBarre(); 
    });
}

// Fonction d'animation des barres avec Snap.svg
function animerBarres() {
    if (!svgBarre) return;

    let barres = svgBarre.selectAll(".cls-6, .cls-1");

    barres.forEach(function(barre) {
        let initialHeight = barre.attr("height");
        let y = barre.attr("y");
        barre.attr({ height: 0, y: parseFloat(y) + parseFloat(initialHeight) });

        // Animation de l'élément
        barre.animate(
            { height: initialHeight, y: y },
            1000, // duree de l'animation
            mina.easeinout
        );
    });
}

// Fonction pour observer l'animation avec ScrollTrigger (GSAP)
function observerGraphiqueBarre() {
    gsap.registerPlugin(ScrollTrigger); 
    
    ScrollTrigger.create({
        trigger: svgElementIdBarre, 
        start: 'top 80%', 
        onEnter: () => animerBarres(), // appel de la fonction animerbarres(animation en SNAP.SVG)
        once: true
    });
}

// Fonction pour generer la legende
function genererLegendeBarre() {
    let legendElement = document.querySelector('.legendeBarre'); 
    let classes = [
        { className: 'Véhicules Rechargeables', color: '#ffd219' },
        { className: 'Points de Charge', color: '#ff5e20' }
    ];

    // generateur de la légende
    classes.forEach(item => {
        let legendItem = document.createElement('div');
        legendItem.className = 'legend-item';

        //  structure et syle de la légende
        legendItem.innerHTML = `
            <div class="color-box" style="background-color: ${item.color};"></div>
            ${item.className}
        `;

        legendElement.appendChild(legendItem);
    });
}

// Initialisation lorsque le DOM est chargé pour le graphique
function initGraphiqueBarre() {
    chargerSVGBarre(); 
    observerGraphiqueBarre(); 
}

window.addEventListener("load", initGraphiqueBarre);
