// GESTION DES COMMANDES - CRUD complet avec support multilingue
// Variable pour stocker l'ID de la commande en cours de modification
let orderEnCours = null;

// Charger les commandes depuis LocalStorage (clé unifiée : "orders")
let orders = JSON.parse(localStorage.getItem("orders") || "[]");

// Références aux éléments du DOM
const orderForm = document.getElementById("orderForm");
const orderTable = document.getElementById("orderTable");
const btnCancel = document.getElementById("btnCancel");
const btnSubmit = orderForm ? orderForm.querySelector('button[type="submit"]') : null;

// Initialiser la langue au chargement
document.addEventListener('DOMContentLoaded', function() {
    // Attendre que i18n soit chargé
    setTimeout(function() {
        if (!orderForm || !orderTable) return;
        
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
        
        // Définir la date minimale à aujourd'hui
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById("dateCommande");
        if (dateInput) {
            dateInput.setAttribute("min", today);
        }
        
        // Afficher les commandes existantes
        afficherOrders();
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
if (orderForm) {
    orderForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const numeroTable = parseInt(document.getElementById("numeroTable").value);
        const dateCommande = document.getElementById("dateCommande").value;
        const heureCommande = document.getElementById("heureCommande").value;
        const statutCommande = document.getElementById("statutCommande").value;
        const montantTotal = parseFloat(document.getElementById("montantTotal").value);
        const items = document.getElementById("items").value.trim();

        // Validation
        if (!numeroTable || !dateCommande || !heureCommande || !statutCommande || !montantTotal) {
            alert(getTranslation('name') + ' et ' + getTranslation('orderStatus') + ' sont requis');
            return;
        }

        if (montantTotal < 0) {
            alert(getTranslation('totalAmount') + ' doit être positif');
            return;
        }

        if (orderEnCours) {
            // MODIFICATION d'une commande existante
            const index = orders.findIndex(ord => ord.id === orderEnCours);

            if (index !== -1) {
                orders[index] = {
                    id: orderEnCours,
                    numeroTable: numeroTable,
                    dateCommande: dateCommande,
                    heureCommande: heureCommande,
                    statutCommande: statutCommande,
                    montantTotal: montantTotal,
                    items: items
                };

                sauvegarder();
                afficherOrders();
                resetForm();
                
                alert(getTranslation('orderUpdated'));
            }
        } else {
            // AJOUT d'une nouvelle commande
            const newOrder = {
                id: Date.now(),
                numeroTable: numeroTable,
                dateCommande: dateCommande,
                heureCommande: heureCommande,
                statutCommande: statutCommande,
                montantTotal: montantTotal,
                items: items
            };

            orders.push(newOrder);
            sauvegarder();
            afficherOrders();
            resetForm();
            
            alert(getTranslation('orderAdded'));
        }
    });
}

// Fonction pour afficher toutes les commandes dans le tableau
function afficherOrders() {
    if (!orderTable) return;
    
    orderTable.innerHTML = "";

    if (orders.length === 0) {
        const noOrders = document.getElementById("noOrders");
        if (noOrders) {
            noOrders.style.display = "block";
        }
        return;
    }

    const noOrders = document.getElementById("noOrders");
    if (noOrders) {
        noOrders.style.display = "none";
    }

    // Trier les commandes par date et heure (plus récentes en premier)
    const sortedOrders = [...orders].sort((a, b) => {
        const dateA = new Date(a.dateCommande + ' ' + a.heureCommande);
        const dateB = new Date(b.dateCommande + ' ' + b.heureCommande);
        return dateB - dateA;
    });

    sortedOrders.forEach(order => {
        const row = document.createElement("tr");
        
        // Formater la date
        const dateFormatted = formaterDate(order.dateCommande);
        
        // Obtenir les traductions pour le statut et les classes CSS
        let statutText = order.statutCommande;
        let statutClass = '';
        
        if (order.statutCommande === 'En cours') {
            statutText = getTranslation('inProgress');
            statutClass = 'status-inProgress';
        } else if (order.statutCommande === 'Terminée') {
            statutText = getTranslation('completed');
            statutClass = 'status-completed';
        } else if (order.statutCommande === 'Annulée') {
            statutText = getTranslation('cancelled');
            statutClass = 'status-cancelled';
        }
        
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${escapeHtml(order.numeroTable)}</td>
            <td>${dateFormatted}</td>
            <td>${order.heureCommande || '-'}</td>
            <td>${order.montantTotal.toFixed(2)} DH</td>
            <td>
                <span class="status-badge ${statutClass}">${escapeHtml(statutText)}</span>
            </td>
            <td>
                <button 
                    class="btn btn-warning btn-sm me-1" 
                    onclick="modifierOrder(${order.id})"
                    title="${getTranslation('edit')}"
                >
                    <i class="bi bi-pencil"></i> <span data-i18n="edit">Modifier</span>
                </button>
                <button 
                    class="btn btn-danger btn-sm" 
                    onclick="supprimerOrder(${order.id})"
                    title="${getTranslation('delete')}"
                >
                    <i class="bi bi-trash"></i> <span data-i18n="delete">Supprimer</span>
                </button>
            </td>
        `;
        
        orderTable.appendChild(row);
    });
    
    // Réappliquer les traductions après l'ajout dynamique
    setTimeout(function() {
        if (typeof applyLanguage === 'function' && typeof getCurrentLanguage === 'function') {
            applyLanguage(getCurrentLanguage());
        }
    }, 100);
}

// Fonction pour formater la date selon la locale
function formaterDate(dateStr) {
    if (!dateStr) return 'N/A';
    
    const date = new Date(dateStr + 'T00:00:00');
    const lang = (typeof getCurrentLanguage === 'function') ? getCurrentLanguage() : 'fr';
    
    if (lang === 'ar') {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } else if (lang === 'en') {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    } else {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
}

// Fonction pour modifier une commande
function modifierOrder(id) {
    const order = orders.find(ord => ord.id === id);

    if (!order) {
        alert("Commande introuvable");
        return;
    }

    // Remplir le formulaire avec les données de la commande
    document.getElementById("orderId").value = order.id;
    document.getElementById("numeroTable").value = order.numeroTable;
    document.getElementById("dateCommande").value = order.dateCommande;
    document.getElementById("heureCommande").value = order.heureCommande;
    document.getElementById("statutCommande").value = order.statutCommande;
    document.getElementById("montantTotal").value = order.montantTotal;
    document.getElementById("items").value = order.items || '';

    // Activer le mode modification
    orderEnCours = id;
    if (btnCancel) btnCancel.style.display = "inline-block";
    if (btnSubmit) {
        btnSubmit.innerHTML = `<i class="bi bi-save"></i> <span data-i18n="save">Enregistrer</span>`;
    }
    
    // Scroll vers le formulaire
    orderForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Focus sur le premier champ
    document.getElementById("numeroTable").focus();
    
    // Réappliquer les traductions
    setTimeout(function() {
        if (typeof applyLanguage === 'function' && typeof getCurrentLanguage === 'function') {
            applyLanguage(getCurrentLanguage());
        }
    }, 100);
}

// Fonction pour supprimer une commande
function supprimerOrder(id) {
    if (confirm(getTranslation('confirmDeleteOrder'))) {
        orders = orders.filter(ord => ord.id !== id);
        sauvegarder();
        afficherOrders();
        
        alert(getTranslation('orderDeleted'));
    }
}

// Fonction pour annuler la modification en cours
function cancelEdit() {
    resetForm();
}

// Fonction pour réinitialiser le formulaire
function resetForm() {
    if (!orderForm) return;
    
    orderForm.reset();
    document.getElementById("orderId").value = '';
    orderEnCours = null;
    if (btnCancel) btnCancel.style.display = "none";
    if (btnSubmit) {
        btnSubmit.innerHTML = `<i class="bi bi-plus-circle"></i> <span data-i18n="addOrder">Ajouter la commande</span>`;
    }
    
    // Remettre la date minimale
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById("dateCommande");
    if (dateInput) {
        dateInput.setAttribute("min", today);
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
    localStorage.setItem("orders", JSON.stringify(orders));
}

// Fonction utilitaire pour échapper le HTML (sécurité XSS)
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Exporter les fonctions pour qu'elles soient accessibles globalement
window.modifierOrder = modifierOrder;
window.supprimerOrder = supprimerOrder;
window.cancelEdit = cancelEdit;
