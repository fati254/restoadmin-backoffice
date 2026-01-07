//premierement recupere les plats qu'on a deja 
let plats ;
if (localStorage.plats) {
 plats = JSON.parse(localStorage.plats);
}
else {
//une liste juste pour le afficher maintenant
 plats = [
{ nom: "Pizza" , Prix: 40, categorie: "Fast Food " ,},
{ nom: "Tajine" , Prix: 60, categorie: "Marocain "},
{ nom: "Salade" , Prix: 25, categorie: "Healthy "}
];
localStorage.plats = JSON.stringify(plats);
}

//ou il est mieux de le remplace (pour sauvgarder )

/*
let plats;

if (localStorage.plats) {
    plats = JSON.parse(localStorage.plats);
} else {
    plats = [
        { nom: "Pizza", Prix: 40, categorie: "Fast Food" },
        { nom: "Tajine", Prix: 60, categorie: "Marocain" }
    ];
    localStorage.plats = JSON.stringify(plats);
}
*/

let menuBody = document.getElementById("menuBody");

function afficherMenu(){
    menuBody.innerHTML = "";
    plats.forEach((plat, index) => {
        let row =  document.createElement("tr");
        row.innerHTML = `
        <td>${plat.nom}</td>
        <td>${plat.Prix}</td>
        <td>${plat.categorie}</td>
          <td> 
            <button onclick="modifierPlat(${index})" > Modifier </button>
            <button onclick="supprimerPlat(${index})" > Supprimer </button>
          </td> `;
        menuBody.appendChild(row);
    } );
}
afficherMenu();

//ajouter plat exempleeeeeeeeeee
let addBtn = document.getElementById("addBtn");

addBtn.addEventListener("click", function () {
    let nom = prompt("Nom du plat :");
    let prix = prompt("Prix du plat :");
    let categorie = prompt("Categorie du plat :");

    if (nom && prix && categorie) {
        plats.push({
            nom: nom,
            Prix: Number(prix),
            categorie: categorie
        });
    //pour le sauvgarder
       localStorage.plats = JSON.stringify(plats);
        afficherMenu();
    } else {
        alert("Veuillez remplir tous les champs");
    }
});

console.log("le menu.js fonction");

// fct pour suppression 
function supprimerPlat(index) {
    let confirmation = confirm("Voulez-vous vraiment supprimer ce plat ?");
    if(confirmation) {
        plats.splice(index, 1);
        //pour sauvgarder
        localStorage.plats = JSON.stringify(plats);
        afficherMenu();
    }
}

//fct pour modification
function modifierPlat(index) {
    let plat = plats[index];

    let nouveaunom = prompt("Entrez  le nouveau nom", plat.nom);
    let nouveauprix = prompt("Entrez le nouveau prix", plat.Prix);
    let nouvellecategorie = prompt("Entrez le nouvelle categorie", plat.categorie);

    if(nouveaunom && nouveauprix && nouvellecategorie ){
        plat.nom = nouveaunom;
        plat.Prix = Number(nouveauprix);
        plat.categorie = nouvellecategorie;
        //sauvgarder
        localStorage.plats = JSON.stringify(plats);
       afficherMenu();
    }
}

//recheeeeeeeeeeeeercher
function afficherMenu(liste = plats) {
    menuBody.innerHTML = "";

    liste.forEach((plat, index) => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${plat.nom}</td>
            <td>${plat.Prix}</td>
            <td>${plat.categorie}</td>
            <td>
                <button onclick="modifierPlat(${index})">Modifier</button>
                <button onclick="supprimerPlat(${index})">Supprimer</button>
            </td>
        `;
        menuBody.appendChild(row);
    });
}
let searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", function () {
    let texte = searchInput.value.toLowerCase();

    let resultat = plats.filter(plat =>
        plat.nom.toLowerCase().includes(texte)
    );

    afficherMenu(resultat);
});

////filtre les plats 
let filterCategorie = document.getElementById("filterCategorie");
let prixMinInput = document.getElementById("prixMin");
let prixMaxInput = document.getElementById("prixMax");

function appliquerFiltres() {
    let categorie = filterCategorie.value;
    let min = prixMinInput.value ? Number(prixMinInput.value) : 0;
    let max = prixMaxInput.value ? Number(prixMaxInput.value) : Infinity;

    let resultat = plats.filter(plat => {
        let okCategorie = categorie === "" || plat.categorie.trim() === categorie;
        let okPrix = plat.Prix >= min && plat.Prix <= max;
        return okCategorie && okPrix;
    });

    afficherMenu(resultat);
}

filterCategorie.addEventListener("change", appliquerFiltres);
prixMinInput.addEventListener("input", appliquerFiltres);
prixMaxInput.addEventListener("input", appliquerFiltres);


///tri des plat 
let triSelect = document.getElementById("tri");

triSelect.addEventListener("change", function () {
    let copie = [...plats];

    if (this.value === "prix-asc") {
        copie.sort((a, b) => a.Prix - b.Prix);
    }
    if (this.value === "prix-desc") {
        copie.sort((a, b) => b.Prix - a.Prix);
    }
    if (this.value === "nom-asc") {
        copie.sort((a, b) => a.nom.localeCompare(b.nom));
    }

    afficherMenu(copie);
});
