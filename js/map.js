/* -- 
déclaration et affectation des variables contenant les données ou les options 
--*/

// Définition du fond de carte OpenStreetMap
let fondCarte = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
});

// Variables pour la carte, les marqueurs et le GeoJSON filtré
let filteredGeoJSON, info;
let markerArray = [];  // Pour stocker les marqueurs des EPCI
let dataInfo; // Pour stocker les datas de data.json

// Liste des EPCI à filtrer pour la Haute-Corse
let listeEPCI = [
  'CA de Bastia',
  'CC de Calvi Balagne',
  'CC de Fium\'orbu Castellu',
  'CC de la Castagniccia-Casinca',
  'CC de la Costa Verde',
  'CC de l\'Ile-Rousse - Balagne',
  'CC de l\'Oriente',
  'CC de Marana-Golo',
  'CC du Cap Corse',
  'CC du Centre Corse',
  'CC Nebbiu - Conca d\'Oro',
  'CC Pasquale Paoli'
];

/* -- 
déclaration des variables globales 
--*/
let gpx; // Variable pour le GPX
let lastClickedFeature = null; // Variable pour garder la trace de la dernière fonctionnalité cliquée

// 1. chargement des données

// Charger les données à partir de data.json (donnée issue du tableau excel)
function chargerDonnees() {
    return fetch('data/data.json')
        .then(response => response.json())
        .then(data => {
            dataInfo = data; // Stocke les données pour une utilisation ultérieure
        })
}

// fonction pour charger et ajouter le geojson à la carte
function chargerEtAjouterGeoJSON() {
    return fetch('data/map.geojson')
        .then(response => response.json())
        .then(data => {
            filteredGeoJSON = filtrerGeoJSON(data);

            // ajouter le geojson filtré à la carte
            L.geoJSON(filteredGeoJSON, {
                style: function(feature) {
                    let epciName = feature.properties.nom_epci;
                    let epciData = dataInfo.find(epci => epci.libepci === epciName);
                    let ratio = epciData ? epciData.Ratio_point_de_charge_Densite : 0; // obtenir le ratio

                    return { color: getColorRatioPointChargeDensite(ratio), weight: 2, fillOpacity: 0.5 };
                },
                onEachFeature: function(feature, layer) {
                    onEachFeature(feature, layer); // ajouter les événements sur chaque entité
                    markerArray.push(layer);  // ajouter le layer au tableau pour centrer sur tous
                }
            }).addTo(map);

            // afficher les infos pour l'epci total (haute corse total) après ajout de geojson
            afficherInfoEPCI("Total Haute-Corse");
        })
}


// filtrer le geojson en fonction des epci de haute-corse
function filtrerGeoJSON(data) {
    // filtrer les entités en fonction des epci
    let entitesFiltrees = data.features.filter(entite => {
        let nomEPCI = entite.properties.nom_epci; 
        return listeEPCI.includes(nomEPCI);
    });

    // retourner un nouvel objet geojson avec les entités filtrées
    return {
        type: "FeatureCollection",
        features: entitesFiltrees
    };
}


// créer contrôle d'information
function createInfoControl() {
    info = L.control(); // initialiser info ici

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // création de la div info
        this.update(); // appel initial pour afficher un message par défaut
        return this._div;
    };

    info.update = function (props) {
        // si props est défini, trouver les données correspondantes dans dataInfo
        if (props) {
            let epciData = dataInfo.find(epci => epci.libepci === props.nom_epci);

            if (epciData) {
                this._div.innerHTML = 
                '<b>' + epciData.libepci + '</b><br />' +
                'Points de charge: ' + (epciData.nbre_pdc !== undefined ? epciData.nbre_pdc : 'N/A') +
                '<br />Densité: ' + (epciData.Densite !== undefined ? epciData.Densite : 'N/A') + ' habitants/km<sup>2</sup><br />';
            } else {
                this._div.innerHTML = '<h4>Densité et Points de Charge</h4>' + 
                'Aucune donnée trouvée pour cet epci.';
            }
        } else {
            this._div.innerHTML = 'Survolez une epci';
        }
    };

    return info; // retourner le contrôle pour pouvoir l'ajouter à la carte
}

// créer la légende
function createLegend() {
    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'info legend'),
            grades = [0.05, 0.1, 0.3, 0.5, 1.0], // intervalles de densité 
            labels = [];

        // titre de la légende
        div.innerHTML += '<strong style="color: #052962;">Ratio points de charge/densité</strong><br>'; // changer la couleur du titre ici

        // boucle à travers les intervalles et générer une étiquette avec un carré coloré
        for (let i = 0; i < grades.length; i++) {
            let color = getColorRatioPointChargeDensite(grades[i] + 0.001);
            let nextGrade = grades[i + 1] !== undefined ? grades[i + 1] : '+';

            // ajouter l'élément html pour chaque intervalle
            div.innerHTML +=
                '<i style="background:' + color + '"></i> ' + // supprimer la largeur et la hauteur du style inline
                grades[i].toFixed(2) + (nextGrade !== '+' ? ' &ndash; ' + nextGrade.toFixed(2) : '+') + '<br>';
        }

        return div;
    };

    return legend; // ne pas ajouter à la carte ici
}

// fonction pour recentrer la carte sur tous les epci
function centrerTous() {
    let group = L.featureGroup(markerArray); // créer un groupe avec les marqueurs
    map.fitBounds(group.getBounds()); // ajuster la vue de la carte pour inclure tous les marqueurs
}

// obtenir la couleur en fonction du ratio
function getColorRatioPointChargeDensite(ratio) {
    return ratio > 1.5 ? '#FF6F61' : // corail
           ratio > 1.0 ? '#FFB65C' : // abricot
           ratio > 0.5 ? '#FFE66D' : // jaune clair
           ratio > 0.3 ? '#A8E5A0' : // vert pastel
           ratio > 0.1 ? '#4FC3F7' : // bleu clair
           ratio > 0.05 ? '#81D4FA' : // cyan pastel
           '#B39DDB'; // violet pastel (absence de points de charge)
}

// highlight et afficher les infos au clic
function highlightFeature(e) {
    let layer = e.target;

    layer.setStyle({
        weight: 2,
        dashArray: '',
    });

    layer.bringToFront();
}

// fonction de réinitialisation
function resetHighlight(e) {
    e.target.setStyle({
        weight: 1
    });

    // si aucune fonctionnalité n'est cliquée, réinitialisez les informations
    if (!lastClickedFeature) {
        info.update(); // met à jour le contrôle d'information sans paramètres pour indiquer de survoler une epci
    } else {
        // réafficher les informations de l'élément cliqué
        info.update(lastClickedFeature.properties);
    }
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds()); // zoomer sur l'entité sélectionnée
}

// 5. fonctions d'affichage

// afficher les informations sur l'epci
function afficherInfoEPCI(epciName) {
    let epciData = dataInfo.find(epci => epci.libepci === epciName);

    if (epciData) {
        document.getElementById("epciSelectionne").innerText = epciData.libepci;
        document.getElementById("nbVéhiculesRechargeables").innerText = epciData.Total_des_Vehicules_Rechargeables;
        document.getElementById("nbBornes").innerText = epciData.nombre_borne;
        document.getElementById("nombreHabitants").innerText = epciData.Population;

        // ajouter l'événement au bouton "voir tous les epci"
        document.getElementById("btnVoirTous").addEventListener("click", function() {
            afficherInfoEPCI("Total Haute-Corse");  // afficher les infos de l'epci "Total Haute-Corse"
            info.update();  // mettre à jour les informations dans le panneau info
            centrerTous();  // recentrer la carte sur tous les epci
        });
    }
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: function(e) {
            highlightFeature(e); // mettre en surbrillance
            info.update(feature.properties); // passer les propriétés de la fonctionnalité
        },
        mouseout: resetHighlight, // réinitialisation à la sortie
        click: function(e) {
            zoomToFeature(e); // zoomer sur l'epci sélectionné
            const epciName = layer.feature.properties.nom_epci; 
            afficherInfoEPCI(epciName); // afficher les infos de l'epci
            lastClickedFeature = feature; // mémoriser la dernière fonctionnalité cliquée
        }
    });
}

// initialiser la carte
function init() {
    // créer la carte 
    map = L.map("map").setView([42.5, 9.15], 9); 
    fondCarte.addTo(map); // ajouter le fond de carte
    
    // charger les données
    chargerDonnees().then(() => {
        // charger et ajouter le geojson à la carte
        chargerEtAjouterGeoJSON();
    }).then(() => {
        // ajouter la légende à la carte ici
        createLegend().addTo(map);
        createInfoControl().addTo(map);
    });
}

window.addEventListener("load", init);
