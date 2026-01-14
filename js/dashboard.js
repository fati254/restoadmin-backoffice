// DASHBOARD - Statistiques depuis LocalStorage avec support multilingue

// Fonction helper pour obtenir une traduction (protection si i18n n'est pas chargé)
function getTranslation(key) {
  if (typeof t === 'function') {
    return t(key);
  }
  return key; // Retourner la clé si la fonction n'existe pas encore
}

// Fonction pour charger toutes les statistiques
function loadStatistics() {
  // Charger les données depuis LocalStorage (clés unifiées)
  const employees = JSON.parse(localStorage.getItem("employees") || "[]");
  const reservations = JSON.parse(localStorage.getItem("reservations") || "[]");
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const tables = JSON.parse(localStorage.getItem("tables") || "[]");
  const plats = JSON.parse(localStorage.getItem("plats") || "[]"); // Ajouter plats

  // Afficher les totaux (inclure plats si nécessaire, ou ajouter une carte séparée)
  displayTotalStatistics(employees, reservations, orders, tables);

  // Afficher les statistiques détaillées
  displayEmployeesByRole(employees);
  displayReservationsByStatus(reservations);
  displayTablesByStatus(tables);
  // displayOrdersByStatus(orders); // Disponible si un conteneur ordersByStatus est ajouté au dashboard
  displayRecentReservations(reservations);
}

// Fonction pour afficher les statistiques totales
function displayTotalStatistics(employees, reservations, orders, tables) {
  document.getElementById("totalEmployees").textContent = employees.length;
  document.getElementById("totalReservations").textContent = reservations.length;
  document.getElementById("totalOrders").textContent = orders.length;
  document.getElementById("totalTables").textContent = tables.length;
}

// Fonction pour afficher les employés par rôle
function displayEmployeesByRole(employees) {
  const container = document.getElementById("employeesByRole");
  
  if (employees.length === 0) {
    container.innerHTML = `<p class="text-muted text-center" data-i18n="noData">${getTranslation('noData')}</p>`;
    if (typeof applyLanguage === 'function') {
      applyLanguage(getCurrentLanguage());
    }
    return;
  }

  // Compter les employés par rôle
  const rolesCount = {};
  employees.forEach(emp => {
    const role = emp.role || 'Non défini';
    rolesCount[role] = (rolesCount[role] || 0) + 1;
  });

  // Créer le HTML
  let html = '';
  for (const [role, count] of Object.entries(rolesCount)) {
    // Traduire le rôle
    let roleText = role;
    if (role === 'Serveur') roleText = getTranslation('server');
    else if (role === 'Caissier') roleText = getTranslation('cashier');
    else if (role === 'Manager') roleText = getTranslation('manager');

    const percentage = ((count / employees.length) * 100).toFixed(1);
    html += `
      <div class="mb-3">
        <div class="d-flex justify-content-between mb-1">
          <span>${escapeHtml(roleText)}</span>
          <span><strong>${count}</strong> (${percentage}%)</span>
        </div>
        <div class="progress" style="height: 20px;">
          <div class="progress-bar" role="progressbar" style="width: ${percentage}%" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
            ${percentage}%
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

// Fonction pour afficher les réservations par statut
function displayReservationsByStatus(reservations) {
  const container = document.getElementById("reservationsByStatus");
  
  if (reservations.length === 0) {
    container.innerHTML = `<p class="text-muted text-center" data-i18n="noData">${getTranslation('noData')}</p>`;
    if (typeof applyLanguage === 'function') {
      applyLanguage(getCurrentLanguage());
    }
    return;
  }

  // Compter les réservations par statut
  const statusCount = {
    'Confirmée': 0,
    'En attente': 0,
    'Annulée': 0
  };

  reservations.forEach(res => {
    const status = res.statut || 'En attente';
    if (statusCount.hasOwnProperty(status)) {
      statusCount[status]++;
    } else {
      statusCount['En attente']++;
    }
  });

  // Créer le HTML
  let html = '';
  const statusConfig = {
    'Confirmée': { class: 'bg-success', text: getTranslation('confirmed') },
    'En attente': { class: 'bg-warning', text: getTranslation('pending') },
    'Annulée': { class: 'bg-danger', text: getTranslation('cancelled') }
  };

  for (const [status, count] of Object.entries(statusCount)) {
    if (count === 0) continue;
    
    const percentage = ((count / reservations.length) * 100).toFixed(1);
    const config = statusConfig[status] || { class: 'bg-secondary', text: status };
    
    html += `
      <div class="mb-3">
        <div class="d-flex justify-content-between mb-1">
          <span>${escapeHtml(config.text)}</span>
          <span><strong>${count}</strong> (${percentage}%)</span>
        </div>
        <div class="progress" style="height: 20px;">
          <div class="progress-bar ${config.class}" role="progressbar" style="width: ${percentage}%" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
            ${percentage}%
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = html || `<p class="text-muted text-center" data-i18n="noData">${getTranslation('noData')}</p>`;
}

// Fonction pour afficher les tables par statut
function displayTablesByStatus(tables) {
  const container = document.getElementById("tablesByStatus");
  
  if (!container) return;
  
  if (tables.length === 0) {
    container.innerHTML = `<p class="text-muted text-center" data-i18n="noData">${getTranslation('noData')}</p>`;
    if (typeof applyLanguage === 'function') {
      applyLanguage(getCurrentLanguage());
    }
    return;
  }

  // Compter les tables par statut
  const statusCount = {
    'Libre': 0,
    'Occupée': 0,
    'Réservée': 0
  };

  tables.forEach(table => {
    const status = table.statut || 'Libre';
    if (statusCount.hasOwnProperty(status)) {
      statusCount[status]++;
    } else {
      statusCount['Libre']++;
    }
  });

  // Créer le HTML avec traductions
  let html = '';
  const statusConfig = {
    'Libre': { class: 'bg-success', key: 'available' },
    'Occupée': { class: 'bg-danger', key: 'occupied' },
    'Réservée': { class: 'bg-warning', key: 'reserved' }
  };

  for (const [status, count] of Object.entries(statusCount)) {
    if (count === 0) continue;
    
    const percentage = ((count / tables.length) * 100).toFixed(1);
    const config = statusConfig[status] || { class: 'bg-secondary', key: status };
    const statusText = getTranslation(config.key);
    
    html += `
      <div class="mb-3">
        <div class="d-flex justify-content-between mb-1">
          <span>${escapeHtml(statusText)}</span>
          <span><strong>${count}</strong> (${percentage}%)</span>
        </div>
        <div class="progress" style="height: 20px;">
          <div class="progress-bar ${config.class}" role="progressbar" style="width: ${percentage}%" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
            ${percentage}%
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = html || `<p class="text-muted text-center" data-i18n="noData">${getTranslation('noData')}</p>`;
}

// Fonction pour afficher les commandes par statut
function displayOrdersByStatus(orders) {
  // Chercher un conteneur pour les commandes par statut (si ajouté au dashboard)
  const container = document.getElementById("ordersByStatus");
  
  if (!container) return; // Si le conteneur n'existe pas, on ne fait rien
  
  if (orders.length === 0) {
    container.innerHTML = `<p class="text-muted text-center" data-i18n="noData">${getTranslation('noData')}</p>`;
    if (typeof applyLanguage === 'function') {
      applyLanguage(getCurrentLanguage());
    }
    return;
  }

  // Compter les commandes par statut
  const statusCount = {
    'En cours': 0,
    'Terminée': 0,
    'Annulée': 0
  };

  orders.forEach(order => {
    const status = order.statutCommande || 'En cours';
    if (statusCount.hasOwnProperty(status)) {
      statusCount[status]++;
    } else {
      statusCount['En cours']++;
    }
  });

  // Créer le HTML
  let html = '';
  const statusConfig = {
    'En cours': { class: 'bg-info', key: 'inProgress' },
    'Terminée': { class: 'bg-success', key: 'completed' },
    'Annulée': { class: 'bg-danger', key: 'cancelled' }
  };

  for (const [status, count] of Object.entries(statusCount)) {
    if (count === 0) continue;
    
    const percentage = ((count / orders.length) * 100).toFixed(1);
    const config = statusConfig[status] || { class: 'bg-secondary', key: status };
    const statusText = getTranslation(config.key);
    
    html += `
      <div class="mb-3">
        <div class="d-flex justify-content-between mb-1">
          <span>${escapeHtml(statusText)}</span>
          <span><strong>${count}</strong> (${percentage}%)</span>
        </div>
        <div class="progress" style="height: 20px;">
          <div class="progress-bar ${config.class}" role="progressbar" style="width: ${percentage}%" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
            ${percentage}%
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = html || `<p class="text-muted text-center" data-i18n="noData">${getTranslation('noData')}</p>`;
}

// Fonction pour afficher les réservations récentes
function displayRecentReservations(reservations) {
  const container = document.getElementById("recentReservations");
  
  if (reservations.length === 0) {
    container.innerHTML = `<p class="text-muted text-center" data-i18n="noData">${getTranslation('noData')}</p>`;
    if (typeof applyLanguage === 'function') {
      applyLanguage(getCurrentLanguage());
    }
    return;
  }

  // Trier les réservations par date (plus récentes en premier) et prendre les 5 premières
  const sortedReservations = [...reservations]
    .sort((a, b) => {
      const dateA = new Date(a.date + ' ' + (a.heure || '00:00'));
      const dateB = new Date(b.date + ' ' + (b.heure || '00:00'));
      return dateB - dateA;
    })
    .slice(0, 5);

  // Créer le HTML
  let html = '<div class="list-group list-group-flush">';
  
  sortedReservations.forEach(res => {
    // Formater la date
    const dateFormatted = formaterDate(res.date);
    
    // Obtenir le texte du statut traduit
    let statutText = res.statut;
    let statutClass = '';
    if (res.statut === 'Confirmée') {
      statutText = getTranslation('confirmed');
      statutClass = 'badge bg-success';
    } else if (res.statut === 'En attente') {
      statutText = getTranslation('pending');
      statutClass = 'badge bg-warning';
    } else if (res.statut === 'Annulée') {
      statutText = getTranslation('cancelled');
      statutClass = 'badge bg-danger';
    } else {
      statutClass = 'badge bg-secondary';
    }
    
    html += `
      <div class="list-group-item">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h6 class="mb-1">${escapeHtml(res.nomClient || 'Client')}</h6>
            <small class="text-muted">
              <i class="bi bi-calendar"></i> ${dateFormatted} 
              <i class="bi bi-clock ms-2"></i> ${res.heure || 'N/A'}
              <i class="bi bi-people ms-2"></i> ${res.nbPersonnes || 0} ${getTranslation('numberOfPeople')}
            </small>
          </div>
          <span class="${statutClass}">${escapeHtml(statutText)}</span>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

// Fonction pour formater la date selon la locale
function formaterDate(dateStr) {
  if (!dateStr) return 'N/A';
  
  const date = new Date(dateStr + 'T00:00:00');
  const lang = (typeof getCurrentLanguage === 'function') ? getCurrentLanguage() : 'fr';
  
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

// Fonction utilitaire pour échapper le HTML (sécurité XSS)
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialiser le dashboard au chargement
document.addEventListener('DOMContentLoaded', function() {
  // Attendre que i18n soit chargé
  setTimeout(function() {
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
          // Recharger les statistiques après changement de langue
          loadStatistics();
        }
      });
    }
    
    // Charger les statistiques initiales
    loadStatistics();
    
    // Auto-refresh toutes les 30 secondes
    setInterval(loadStatistics, 30000);
  }, 100);
});

// Exporter la fonction pour qu'elle soit accessible globalement
window.loadStatistics = loadStatistics;
