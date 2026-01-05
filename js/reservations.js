// GESTION DES RÉSERVATIONS - CRUD complet avec support multilingue
// Variable pour stocker l'ID de la réservation en cours de modification
let reservationEnCours = null;

// Charger les réservations depuis LocalStorage
let reservations = JSON.parse(localStorage.getItem("reservations")) || [];

const reservationForm = document.getElementById("reservationForm");
const reservationTable = document.getElementById("reservationTable");
const btnCancel = document.getElementById("btnCancel");
const btnSubmit = reservationForm.querySelector('button[type="submit"]');

// Initialiser la langue au chargement
document.addEventListener('DOMContentLoaded', function() {
  // Attendre un peu pour que i18n.js soit chargé
  setTimeout(function() {
    if (typeof applyLanguage === 'function' && typeof getCurrentLanguage === 'function') {
      applyLanguage(getCurrentLanguage());
    }
    
    // Initialiser le sélecteur de langue s'il existe
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
    const dateInput = document.getElementById("date");
    if (dateInput) {
      dateInput.setAttribute("min", today);
    }
    
    // Afficher les réservations existantes
    afficherReservations();
  }, 100);
});

// Gestion du formulaire - Ajout ou Modification
reservationForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const nomClient = document.getElementById("nomClient").value.trim();
  const date = document.getElementById("date").value;
  const heure = document.getElementById("heure").value;
  const nbPersonnes = parseInt(document.getElementById("nbPersonnes").value);
  const statut = document.getElementById("statut").value;

  // Validation
  if (!nomClient || !date || !heure || !nbPersonnes || !statut) {
    alert("Veuillez remplir tous les champs requis");
    return;
  }

  if (nbPersonnes < 1 || nbPersonnes > 50) {
    alert(t('numberOfPeople') + ' doit être entre 1 et 50');
    return;
  }

  if (reservationEnCours) {
    // MODIFICATION d'une réservation existante
    const index = reservations.findIndex(res => res.id === reservationEnCours);

    if (index !== -1) {
      reservations[index] = {
        id: reservationEnCours,
        nomClient: nomClient,
        date: date,
        heure: heure,
        nbPersonnes: nbPersonnes,
        statut: statut
      };

      sauvegarder();
      afficherReservations();
      resetForm();
      
      // Message de succès multilingue
      alert(t('reservationUpdated'));
    }
  } else {
    // AJOUT d'une nouvelle réservation
    const newReservation = {
      id: Date.now(), // Utiliser un timestamp comme ID unique
      nomClient: nomClient,
      date: date,
      heure: heure,
      nbPersonnes: nbPersonnes,
      statut: statut
    };

    reservations.push(newReservation);
    sauvegarder();
    afficherReservations();
    resetForm();
    
    // Message de succès multilingue
    alert(t('reservationAdded'));
  }
});

// Fonction pour afficher toutes les réservations dans le tableau
function afficherReservations() {
  reservationTable.innerHTML = "";

  if (reservations.length === 0) {
    document.getElementById("noReservations").style.display = "block";
    return;
  }

  document.getElementById("noReservations").style.display = "none";

  // Trier les réservations par date et heure (plus récentes en premier)
  const sortedReservations = [...reservations].sort((a, b) => {
    const dateA = new Date(a.date + ' ' + a.heure);
    const dateB = new Date(b.date + ' ' + b.heure);
    return dateB - dateA;
  });

  sortedReservations.forEach(res => {
    const row = document.createElement("tr");
    
    // Formater la date (ex: 2024-01-15 -> 15/01/2024)
    const dateFormatted = formaterDate(res.date);
    
    // Obtenir les traductions pour le statut et les classes CSS
    let statutText = res.statut;
    let statutClass = '';
    
    if (res.statut === 'Confirmée') {
      statutText = t('confirmed');
      statutClass = 'status-confirmed';
    } else if (res.statut === 'En attente') {
      statutText = t('pending');
      statutClass = 'status-pending';
    } else if (res.statut === 'Annulée') {
      statutText = t('cancelled');
      statutClass = 'status-cancelled';
    }
    
    row.innerHTML = `
      <td>${escapeHtml(res.nomClient)}</td>
      <td>${dateFormatted}</td>
      <td>${res.heure}</td>
      <td>${res.nbPersonnes}</td>
      <td>
        <span class="status-badge ${statutClass}">${escapeHtml(statutText)}</span>
      </td>
      <td>
        <button 
          class="btn btn-warning btn-sm me-1" 
          onclick="modifierReservation(${res.id})"
          title="${t('edit')}"
        >
          <i class="bi bi-pencil"></i> <span data-i18n="edit">Modifier</span>
        </button>
        <button 
          class="btn btn-danger btn-sm" 
          onclick="supprimerReservation(${res.id})"
          title="${t('delete')}"
        >
          <i class="bi bi-trash"></i> <span data-i18n="delete">Supprimer</span>
        </button>
      </td>
    `;
    
    reservationTable.appendChild(row);
  });
  
  // Réappliquer les traductions après l'ajout dynamique
  if (typeof applyLanguage === 'function') {
    applyLanguage(getCurrentLanguage());
  }
}

// Fonction pour formater la date selon la locale
function formaterDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const lang = getCurrentLanguage();
  
  if (lang === 'ar') {
    // Format arabe : JJ/MM/AAAA
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } else if (lang === 'en') {
    // Format anglais : MM/DD/YYYY
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  } else {
    // Format français : JJ/MM/AAAA
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}

// Fonction pour modifier une réservation
function modifierReservation(id) {
  const reservation = reservations.find(res => res.id === id);

  if (!reservation) {
    alert("Réservation introuvable");
    return;
  }

  // Remplir le formulaire avec les données de la réservation
  document.getElementById("reservationId").value = reservation.id;
  document.getElementById("nomClient").value = reservation.nomClient;
  document.getElementById("date").value = reservation.date;
  document.getElementById("heure").value = reservation.heure;
  document.getElementById("nbPersonnes").value = reservation.nbPersonnes;
  document.getElementById("statut").value = reservation.statut;

  // Activer le mode modification
  reservationEnCours = id;
  btnCancel.style.display = "inline-block";
  btnSubmit.innerHTML = `<i class="bi bi-save"></i> <span data-i18n="save">Enregistrer</span>`;
  
  // Scroll vers le formulaire
  reservationForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  // Focus sur le premier champ
  document.getElementById("nomClient").focus();
  
  // Réappliquer les traductions
  if (typeof applyLanguage === 'function') {
    applyLanguage(getCurrentLanguage());
  }
}

// Fonction pour supprimer une réservation
function supprimerReservation(id) {
  if (confirm(t('confirmDeleteReservation'))) {
    reservations = reservations.filter(res => res.id !== id);
    sauvegarder();
    afficherReservations();
    
    // Message de succès multilingue
    alert(t('reservationDeleted'));
  }
}

// Fonction pour annuler la modification en cours
function cancelEdit() {
  resetForm();
}

// Fonction pour réinitialiser le formulaire
function resetForm() {
  reservationForm.reset();
  document.getElementById("reservationId").value = '';
  reservationEnCours = null;
  btnCancel.style.display = "none";
  btnSubmit.innerHTML = `<i class="bi bi-plus-circle"></i> <span data-i18n="addReservation">Ajouter la réservation</span>`;
  
  // Remettre la date minimale
  const today = new Date().toISOString().split('T')[0];
  document.getElementById("date").setAttribute("min", today);
  
  // Réappliquer les traductions
  if (typeof applyLanguage === 'function') {
    applyLanguage(getCurrentLanguage());
  }
}

// Fonction pour sauvegarder dans LocalStorage
function sauvegarder() {
  localStorage.setItem("reservations", JSON.stringify(reservations));
}

// Fonction utilitaire pour échapper le HTML (sécurité XSS)
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Exporter les fonctions pour qu'elles soient accessibles globalement
window.modifierReservation = modifierReservation;
window.supprimerReservation = supprimerReservation;
window.cancelEdit = cancelEdit;
