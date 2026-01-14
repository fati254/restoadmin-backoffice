// GESTION DES TABLES - CRUD complet avec support multilingue
let tableEnCours = null;
let tables = JSON.parse(localStorage.getItem("tables") || "[]");

const tableForm = document.getElementById("tableForm");
const tableTable = document.getElementById("tableTable");
const btnCancel = document.getElementById("btnCancel");
const btnSubmit = tableForm ? tableForm.querySelector('button[type="submit"]') : null;

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        if (!tableForm || !tableTable) return;

        if (typeof applyLanguage === 'function' && typeof getCurrentLanguage === 'function') {
            applyLanguage(getCurrentLanguage());
        }

        const langSelect = document.getElementById('langSelect');
        if (langSelect && typeof getCurrentLanguage === 'function') {
            langSelect.value = getCurrentLanguage();
            langSelect.addEventListener('change', function(e) {
                if (typeof setLanguage === 'function') {
                    setLanguage(e.target.value);
                }
            });
        }

        afficherTables();
    }, 100);
});

function getTranslation(key) {
    if (typeof t === 'function') return t(key);
    return key;
}

if (tableForm) {
    tableForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const numeroTable = parseInt(document.getElementById("numeroTable").value);
        const capacite = parseInt(document.getElementById("capacite").value);
        const statutTable = document.getElementById("statutTable").value;

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

        const existingTable = tables.find(t => t.numeroTable === numeroTable && (!tableEnCours || t.id !== tableEnCours));
        if (existingTable) {
            alert(getTranslation('tableNumber') + ' existe déjà');
            return;
        }

        if (tableEnCours) {
            const index = tables.findIndex(tab => tab.id === tableEnCours);
            if (index !== -1) {
                tables[index] = { id: tableEnCours, numeroTable, capacite, statut: statutTable };
                sauvegarder();
                afficherTables();
                resetForm();
                alert(getTranslation('tableUpdated'));
            }
        } else {
            tables.push({ id: Date.now(), numeroTable, capacite, statut: statutTable });
            sauvegarder();
            afficherTables();
            resetForm();
            alert(getTranslation('tableAdded'));
        }
    });
}

function afficherTables() {
    if (!tableTable) return;

    tableTable.innerHTML = "";

    if (tables.length === 0) {
        const noTables = document.getElementById("noTables");
        if (noTables) noTables.style.display = "block";
        return;
    }

    const noTables = document.getElementById("noTables");
    if (noTables) noTables.style.display = "none";

    const sortedTables = [...tables].sort((a, b) => a.numeroTable - b.numeroTable);

    sortedTables.forEach(table => {
        const row = document.createElement("tr");
        let statutText = table.statut;
        let statutClass = '';

        if (table.statut === 'Libre') { statutText = getTranslation('available'); statutClass = 'status-available'; }
        else if (table.statut === 'Occupée') { statutText = getTranslation('occupied'); statutClass = 'status-occupied'; }
        else if (table.statut === 'Réservée') { statutText = getTranslation('reserved'); statutClass = 'status-reserved'; }

        row.innerHTML = `
            <td>${escapeHtml(table.numeroTable)}</td>
            <td>${escapeHtml(table.capacite)} ${getTranslation('capacity')}</td>
            <td><span class="status-badge ${statutClass}">${escapeHtml(statutText)}</span></td>
            <td>
                <button class="btn btn-warning btn-sm me-1" onclick="modifierTable(${table.id})" title="${getTranslation('edit')}">
                    <i class="bi bi-pencil"></i> <span data-i18n="edit">Modifier</span>
                </button>
                <button class="btn btn-danger btn-sm" onclick="supprimerTable(${table.id})" title="${getTranslation('delete')}">
                    <i class="bi bi-trash"></i> <span data-i18n="delete">Supprimer</span>
                </button>
            </td>
        `;
        tableTable.appendChild(row);
    });

    setTimeout(function() {
        if (typeof applyLanguage === 'function' && typeof getCurrentLanguage === 'function') {
            applyLanguage(getCurrentLanguage());
        }
    }, 100);
}

function modifierTable(id) {
    const table = tables.find(tab => tab.id === id);
    if (!table) { alert("Table introuvable"); return; }

    document.getElementById("tableId").value = table.id;
    document.getElementById("numeroTable").value = table.numeroTable;
    document.getElementById("capacite").value = table.capacite;
    document.getElementById("statutTable").value = table.statut;

    tableEnCours = id;
    if (btnCancel) btnCancel.style.display = "inline-block";
    if (btnSubmit) btnSubmit.innerHTML = `<i class="bi bi-save"></i> <span data-i18n="save">Enregistrer</span>`;

    tableForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById("numeroTable").focus();

    setTimeout(function() {
        if (typeof applyLanguage === 'function' && typeof getCurrentLanguage === 'function') {
            applyLanguage(getCurrentLanguage());
        }
    }, 100);
}

function supprimerTable(id) {
    if (confirm(getTranslation('confirmDeleteTable'))) {
        tables = tables.filter(tab => tab.id !== id);
        sauvegarder();
        afficherTables();
        alert(getTranslation('tableDeleted'));
    }
}

function cancelEdit() { resetForm(); }

function resetForm() {
    if (!tableForm) return;
    tableForm.reset();
    document.getElementById("tableId").value = '';
    tableEnCours = null;
    if (btnCancel) btnCancel.style.display = "none";
    if (btnSubmit) btnSubmit.innerHTML = `<i class="bi bi-plus-circle"></i> <span data-i18n="addTable">Ajouter la table</span>`;
    setTimeout(function() {
        if (typeof applyLanguage === 'function' && typeof getCurrentLanguage === 'function') {
            applyLanguage(getCurrentLanguage());
        }
    }, 100);
}

function sauvegarder() {
    localStorage.setItem("tables", JSON.stringify(tables));
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.modifierTable = modifierTable;
window.supprimerTable = supprimerTable;
window.cancelEdit = cancelEdit;
