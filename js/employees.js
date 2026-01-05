// GESTION DES EMPLOYÉS - CRUD complet avec support multilingue
// Variable pour stocker l'ID de l'employé en cours de modification
let employeeEnCours = null;

// Charger les employés depuis LocalStorage
let employees = JSON.parse(localStorage.getItem("employees")) || [];

// Références aux éléments du DOM
const employeeForm = document.getElementById("employeForm");
const employeeTable = document.getElementById("employeTable");
const btnCancel = document.getElementById("btnCancel");
const btnSubmit = employeeForm.querySelector('button[type="submit"]');

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
    
    // Afficher les employés existants
    afficherEmployees();
  }, 100);
});

// Gestion du formulaire - Ajout ou Modification
employeeForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const nom = document.getElementById("nom").value.trim();
  const role = document.getElementById("role").value;
  const telephone = document.getElementById("telephone").value.trim();

  // Validation
  if (!nom || !role) {
    alert(t('name') + ' et ' + t('role') + ' sont requis');
    return;
  }

  if (employeeEnCours) {
    // MODIFICATION d'un employé existant
    const index = employees.findIndex(emp => emp.id === employeeEnCours);

    if (index !== -1) {
      employees[index] = {
        id: employeeEnCours,
        nom: nom,
        role: role,
        telephone: telephone
      };

      sauvegarder();
      afficherEmployees();
      resetForm();
      
      // Message de succès multilingue
      alert(t('employeeUpdated'));
    }
  } else {
    // AJOUT d'un nouvel employé
    const newEmployee = {
      id: Date.now(), // Utiliser un timestamp comme ID unique
      nom: nom,
      role: role,
      telephone: telephone
    };

    employees.push(newEmployee);
    sauvegarder();
    afficherEmployees();
    resetForm();
    
    // Message de succès multilingue
    alert(t('employeeAdded'));
  }
});

// Fonction pour afficher tous les employés dans le tableau
function afficherEmployees() {
  employeeTable.innerHTML = "";

  if (employees.length === 0) {
    document.getElementById("noEmployees").style.display = "block";
    return;
  }

  document.getElementById("noEmployees").style.display = "none";

  employees.forEach(emp => {
    const row = document.createElement("tr");
    
    // Obtenir les traductions pour les rôles
    let roleText = emp.role;
    if (emp.role === 'Serveur') roleText = t('server');
    else if (emp.role === 'Caissier') roleText = t('cashier');
    else if (emp.role === 'Manager') roleText = t('manager');
    
    row.innerHTML = `
      <td>${escapeHtml(emp.nom)}</td>
      <td>${escapeHtml(roleText)}</td>
      <td>${escapeHtml(emp.telephone || '-')}</td>
      <td>
        <button 
          class="btn btn-warning btn-sm me-1" 
          onclick="modifierEmployee(${emp.id})"
          title="${t('edit')}"
        >
          <i class="bi bi-pencil"></i> <span data-i18n="edit">Modifier</span>
        </button>
        <button 
          class="btn btn-danger btn-sm" 
          onclick="supprimerEmployee(${emp.id})"
          title="${t('delete')}"
        >
          <i class="bi bi-trash"></i> <span data-i18n="delete">Supprimer</span>
        </button>
      </td>
    `;
    
    employeeTable.appendChild(row);
  });
  
  // Réappliquer les traductions après l'ajout dynamique
  if (typeof applyLanguage === 'function') {
    applyLanguage(getCurrentLanguage());
  }
}

// Fonction pour modifier un employé
function modifierEmployee(id) {
  const employee = employees.find(emp => emp.id === id);

  if (!employee) {
    alert("Employé introuvable");
    return;
  }

  // Remplir le formulaire avec les données de l'employé
  document.getElementById("employeId").value = employee.id;
  document.getElementById("nom").value = employee.nom;
  document.getElementById("role").value = employee.role;
  document.getElementById("telephone").value = employee.telephone || '';

  // Activer le mode modification
  employeeEnCours = id;
  btnCancel.style.display = "inline-block";
  btnSubmit.innerHTML = `<i class="bi bi-save"></i> <span data-i18n="save">Enregistrer</span>`;
  
  // Scroll vers le formulaire
  employeeForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  // Focus sur le premier champ
  document.getElementById("nom").focus();
  
  // Réappliquer les traductions
  if (typeof applyLanguage === 'function') {
    applyLanguage(getCurrentLanguage());
  }
}

// Fonction pour supprimer un employé
function supprimerEmployee(id) {
  if (confirm(t('confirmDeleteEmployee'))) {
    employees = employees.filter(emp => emp.id !== id);
    sauvegarder();
    afficherEmployees();
    
    // Message de succès multilingue
    alert(t('employeeDeleted'));
  }
}

// Fonction pour annuler la modification en cours
function cancelEdit() {
  resetForm();
}

// Fonction pour réinitialiser le formulaire
function resetForm() {
  employeeForm.reset();
  document.getElementById("employeId").value = '';
  employeeEnCours = null;
  btnCancel.style.display = "none";
  btnSubmit.innerHTML = `<i class="bi bi-plus-circle"></i> <span data-i18n="addEmployee">Ajouter l'employé</span>`;
  
  // Réappliquer les traductions
  if (typeof applyLanguage === 'function') {
    applyLanguage(getCurrentLanguage());
  }
}

// Fonction pour sauvegarder dans LocalStorage
function sauvegarder() {
  localStorage.setItem("employees", JSON.stringify(employees));
}

// Fonction utilitaire pour échapper le HTML (sécurité XSS)
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Exporter les fonctions pour qu'elles soient accessibles globalement
window.modifierEmployee = modifierEmployee;
window.supprimerEmployee = supprimerEmployee;
window.cancelEdit = cancelEdit;
