// MENU - Gestion des plats avec support multilingue
let plats = JSON.parse(localStorage.getItem("plats") || "[]");

// Fonction pour afficher le menu
function afficherMenu() {
    const menuBody = document.getElementById("menuBody");
    const noPlats = document.getElementById("noPlats");
    
    if (!menuBody) return;
    
    menuBody.innerHTML = "";
    
    if (plats.length === 0) {
        if (noPlats) noPlats.style.display = "block";
        return;
    }
    
    if (noPlats) noPlats.style.display = "none";
    
    plats.forEach((plat, index) => {
        const row = document.createElement("tr");
        const prix = plat.prix || plat.Prix || 0;
        row.innerHTML = `
            <td>${escapeHtml(plat.nom)}</td>
            <td>${prix} DH</td>
            <td>${escapeHtml(plat.categorie || '')}</td>
            <td>
                <button class="btn btn-warning btn-sm me-1" onclick="modifierPlat(${index})" title="${typeof t === 'function' ? t('edit') : 'Modifier'}">
                    <i class="bi bi-pencil"></i> <span data-i18n="edit">Modifier</span>
                </button>
                <button class="btn btn-danger btn-sm" onclick="supprimerPlat(${index})" title="${typeof t === 'function' ? t('delete') : 'Supprimer'}">
                    <i class="bi bi-trash"></i> <span data-i18n="delete">Supprimer</span>
                </button>
            </td>
        `;
        menuBody.appendChild(row);
    });

    // Réappliquer les traductions si disponibles
    setTimeout(function() {
        if (typeof applyLanguage === 'function' && typeof getCurrentLanguage === 'function') {
            applyLanguage(getCurrentLanguage());
        }
    }, 100);
}

// Fonction utilitaire pour échapper le HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Supprimer un plat
function supprimerPlat(index) {
    if (confirm("Voulez-vous vraiment supprimer ce plat ?")) {
        plats.splice(index, 1);
        localStorage.setItem("plats", JSON.stringify(plats));
        afficherMenu();
    }
}

// Modifier un plat
function modifierPlat(index) {
    const plat = plats[index];
    if (!plat) return;

    const prixActuel = plat.prix || plat.Prix || 0;
    
    const nouveaunom = prompt("Entrez le nouveau nom", plat.nom);
    const nouveauprix = prompt("Entrez le nouveau prix", prixActuel);
    const nouvellecategorie = prompt("Entrez la nouvelle categorie", plat.categorie);

    if (nouveaunom && nouveauprix && nouvellecategorie) {
        plat.nom = nouveaunom.trim();
        plat.prix = Number(nouveauprix);
        plat.categorie = nouvellecategorie.trim();
        localStorage.setItem("plats", JSON.stringify(plats));
        afficherMenu();
    }
}

// Exporter les fonctions pour global
window.modifierPlat = modifierPlat;
window.supprimerPlat = supprimerPlat;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        const menuBody = document.getElementById("menuBody");
        const addBtn = document.getElementById("addBtn");
        const langSelect = document.getElementById('langSelect');

        if (langSelect && typeof getCurrentLanguage === 'function') {
            langSelect.value = getCurrentLanguage();
            langSelect.addEventListener('change', function(e) {
                if (typeof setLanguage === 'function') setLanguage(e.target.value);
            });
        }

        if (menuBody) afficherMenu();

        if (addBtn) {
            addBtn.addEventListener("click", function () {
                const nom = prompt("Nom du plat :");
                const prix = prompt("Prix du plat :");
                const categorie = prompt("Categorie du plat :");

                if (nom && prix && categorie) {
                    plats.push({ id: Date.now(), nom: nom.trim(), prix: Number(prix), categorie: categorie.trim() });
                    localStorage.setItem("plats", JSON.stringify(plats));
                    afficherMenu();
                } else {
                    alert("Veuillez remplir tous les champs");
                }
            });
        }

        if (typeof applyLanguage === 'function' && typeof getCurrentLanguage === 'function') {
            applyLanguage(getCurrentLanguage());
        }
    }, 100);
});
