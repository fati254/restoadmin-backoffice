//une liste juste pour le afficher maintenant
let plats = [
{ nom: "Pizza" , Prix: 40, categorie: "Fast Food "},
{ nom: "Tajine" , Prix: 60, categorie: "Marocain "},
{ nom: "Salade" , Prix: 25, categorie: "Healthy "}
];

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

//exempleeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
let addBtn = document.getElementById("addBtn");

addBtn.addEventListener("click", function () {
    let nom = prompt("Nom du plat :");
    let prix = prompt("Prix du plat :");
    let categorie = prompt("Categorie du plat :");

    if (nom && prix && categorie) {
        plats.push({
            nom: nom,
            prix: Number(prix),
            categorie: categorie
        });

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
        plat.Prix = nouveauprix;
        plat.categorie = nouvellecategorie;
       afficherMenu();
    }
}