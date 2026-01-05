// GESTION DES TABLES - CRUD complet avec support multilingue
// Variable pour stocker l'ID de la table en cours de modification
let tableEnCours = null;

// Charger les tables depuis LocalStorage (clé unifiée : "tables")
let tables = JSON.parse(localStorage.getItem("tables") || "[]");

// Références aux éléments du DOM
const tableForm = document.getElementById("tableForm");
const tableTable = document.getElementById("tableTable");
const btnCancel = document.getElementById("btnCancel");
const btnSubmit = tableForm ? tableForm.querySelector('button[type="submit"]') : null;

// Initialiser la langue au chargement
document.addEventListener('DOMContentLoaded', function() {
    // Attendre que i18n soit chargé
    setTimeout(function() {
        if (!tableForm || !tableTable) return;
        
        // Initialiser la langue
        if (typeof applyLanguage === 'function' && typeof getCurrentLanguage === 'function') {
            applyLanguage(getCurrentLanguage());
        }
        
        // Initialiser le sélecteur de langue
        const langSelect = document.getElementById('langSelect');
        if (langSelect && typeof getCurrentLanguage === 'function') {
            langSelect.value = getCurrentLanguage();
            langSelect.addEventListener('change', function(e) {
                if (typeof setLanguage === 'function') {
                    setLanguage(e.target.value);
                }
            });
        }
        
        // Afficher les tables existantes
        afficherTables();
    }, 100);
});

// Fonction helper pour obtenir une traduction
function getTranslation(key) {
    if (typeof t === 'function') {
        return t(key);
    }
    return key;
}

// Gestion du formulaire - Ajout ou Modification
if (tableForm) {
    tableForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const numeroTable = parseInt(document.getElementById("numeroTable").value);
        const capacite = parseInt(document.getElementById("capacite").value);
        const statutTable = document.getElementById("statutTable").value;

        // Validation
        if (!numeroTable || !capacite || !statutTable) {
            alert(getTranslation('name') + ' et ' + getTranslation('tableStatus') + ' sont requis');
            return;
        }

        if (numeroTable < 1) {
            alert(getTranslation('tableNumber') + ' doit être supérieur à 0');
            return;
        }

        if (capacite < 1 || capacite > 20) {
            alert(getTranslation('capacity') + ' doit être entre 1 et 20');
            return;
        }

        // Vérifier si le numéro de table existe déjà (sauf si on modifie)
        const existingTable = tables.find(t => t.numeroTable === numeroTable && (!tableEnCours || t.id !== tableEnCours));
        if (existingTable) {
            alert(getTranslation('tableNumber') + ' existe déjà');
            return;
        }

        if (tableEnCours) {
            // MODIFICATION d'une table existante
            const index = tables.findIndex(tab => tab.id === tableEnCours);

            if (index !== -1) {
                tables[index] = {
                    id: tableEnCours,
                    numeroTable: numeroTable,
                    capacite: capacite,
                    statut: statutTable
                };

                sauvegarder();
                afficherTables();
                resetForm();
                
                alert(getTranslation('tableUpdated'));
            }
        } else {
            // AJOUT d'une nouvelle table
            const newTable = {
                id: Date.now(),
                numeroTable: numeroTable,
                capacite: capacite,
                statut: statutTable
            };

            tables.push(newTable);
            sauvegarder();
            afficherTables();
            resetForm();
            
            alert(getTranslation('tableAdded'));
        }
    });
}

// Fonction pour afficher toutes les tables dans le tableau
function afficherTables() {
    if (!tableTable) return;
    
    tableTable.innerHTML = "";

    if (tables.length === 0) {
        const noTables = document.getElementById("noTables");
        if (noTables) {
            noTables.style.display = "block";
        }
        return;
    }

    const noTables = document.getElementById("noTables");
    if (noTables) {
        noTables.style.display = "none";
    }

    // Trier les tables par numéro
    const sortedTables = [...tables].sort((a, b) => a.numeroTable - b.numeroTable);

    sortedTables.forEach(table => {
        const row = document.createElement("tr");
        
        // Obtenir les traductions pour le statut et les classes CSS
        let statutText = table.statut;
        let statutClass = '';
        
        if (table.statut === 'Libre') {
            statutText = getTranslation('available');
            statutClass = 'status-available';
        } else if (table.statut === 'Occupée') {
            statutText = getTranslation('occupied');
            statutClass = 'status-occupied';
        } else if (table.statut === 'Réservée') {
            statutText = getTranslation('reserved');
            statutClass = 'status-reserved';
        }
        
        row.innerHTML = `
            <td>${escapeHtml(table.numeroTable)}</td>
            <td>${escapeHtml(table.capacite)} ${getTranslation('capacity')}</td>
            <td>
                <span class="status-badge ${statutClass}">${escapeHtml(statutText)}</span>
            </td>
            <td>
                <button 
                    class="btn btn-warning btn-sm me-1" 
                    onclick="modifierTable(${table.id})"
                    title="${getTranslation('edit')}"
                >
                    <i class="bi bi-pencil"></i> <span data-i18n="edit">Modifier</span>
                </button>
                <button 
                    class="btn btn-danger btn-sm" 
                    onclick="supprimerTable(${table.id})"
                    title="${getTranslation('delete')}"
                >
                    <i class="bi bi-trash"></i> <span data-i18n="delete">Supprimer</span>
                </button>
            </td>
        `;
        
        tableTable.appendChild(row);
    });
    
    // Réappliquer les traductions après l'ajout dynamique
    setTimeout(function() {
        if (typeof applyLanguage === 'function' && typeof getCurrentLanguage === 'function') {
            applyLanguage(getCurrentLanguage());
        }
    }, 100);
}

// Fonction pour modifier une table
function modifierTable(id) {
    const table = tables.find(tab => tab.id === id);

    if (!table) {
        alert("Table introuvable");
        return;
    }

    // Remplir le formulaire avec les données de la table
    document.getElementById("tableId").value = table.id;
    document.getElementById("numeroTable").value = table.numeroTable;
    document.getElementById("capacite").value = table.capacite;
    document.getElementById("statutTable").value = table.statut;

    // Activer le mode modification
    tableEnCours = id;
    if (btnCancel) btnCancel.style.display = "inline-block";
    if (btnSubmit) {
        btnSubmit.innerHTML = `<i class="bi bi-save"></i> <span data-i18n="save">Enregistrer</span>`;
    }
    
    // Scroll vers le formulaire
    tableForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Focus sur le premier champ
    document.getElementById("numeroTable").focus();
    
    // Réappliquer les traductions
    setTimeout(function() {
        if (typeof applyLanguage === 'function' && typeof getCurrentLanguage === 'function') {
            applyLanguage(getCurrentLanguage());
        }
    }, 100);
}

// Fonction pour supprimer une table
function supprimerTable(id) {
    if (confirm(getTranslation('confirmDeleteTable'))) {
        tables = tables.filter(tab => tab.id !== id);
        sauvegarder();
        afficherTables();
        
        alert(getTranslation('tableDeleted'));
    }
}

// Fonction pour annuler la modification en cours
function cancelEdit() {
    resetForm();
}

// Fonction pour réinitialiser le formulaire
function resetForm() {
    if (!tableForm) return;
    
    tableForm.reset();
    document.getElementById("tableId").value = '';
    tableEnCours = null;
    if (btnCancel) btnCancel.style.display = "none";
    if (btnSubmit) {
        btnSubmit.innerHTML = `<i class="bi bi-plus-circle"></i> <span data-i18n="addTable">Ajouter la table</span>`;
    }
    
    // Réappliquer les traductions
    setTimeout(function() {
        if (typeof applyLanguage === 'function' && typeof getCurrentLanguage === 'function') {
            applyLanguage(getCurrentLanguage());
        }
    }, 100);
}

// Fonction pour sauvegarder dans LocalStorage
function sauvegarder() {
    localStorage.setItem("tables", JSON.stringify(tables));
}

// Fonction utilitaire pour échapper le HTML (sécurité XSS)
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Exporter les fonctions pour qu'elles soient accessibles globalement
window.modifierTable = modifierTable;
window.supprimerTable = supprimerTable;
window.cancelEdit = cancelEdit;
