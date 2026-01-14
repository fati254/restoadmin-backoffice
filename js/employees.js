let employeeEnCours = null; // ID de l'employé en cours de modification

// Charger les employés depuis LocalStorage
let employees = JSON.parse(localStorage.getItem("employees") || "[]");

// Références aux éléments du DOM
const employeeForm = document.getElementById("employeForm");
const employeeTable = document.getElementById("employeTable");
const btnCancel = document.getElementById("btnCancel");
const btnSubmit = employeeForm.querySelector('button[type="submit"]');

// Fonction helper pour i18n sécurisé
function tr(key) {
  return (typeof t === 'function') ? t(key) : key;
}

// Afficher tous les employés
function afficherEmployees() {
  employeeTable.innerHTML = "";

  const noEmployees = document.getElementById("noEmployees");
  if (!noEmployees) return;

  if (employees.length === 0) {
    noEmployees.style.display = "block";
    return;
  } else {
    noEmployees.style.display = "none";
  }

  employees.forEach(emp => {
    let roleText = emp.role;
    if (emp.role === 'Serveur') roleText = tr('server');
    else if (emp.role === 'Caissier') roleText = tr('cashier');
    else if (emp.role === 'Manager') roleText = tr('manager');

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(emp.nom)}</td>
      <td>${escapeHtml(roleText)}</td>
      <td>${escapeHtml(emp.telephone || '-')}</td>
      <td>
        <button class="btn btn-warning btn-sm me-1" onclick="modifierEmployee(${emp.id})" title="${tr('edit')}">
          <i class="bi bi-pencil"></i> <span data-i18n="edit">Modifier</span>
        </button>
        <button class="btn btn-danger btn-sm" onclick="supprimerEmployee(${emp.id})" title="${tr('delete')}">
          <i class="bi bi-trash"></i> <span data-i18n="delete">Supprimer</span>
        </button>
      </td>
    `;
    employeeTable.appendChild(row);
  });

  if (typeof applyLanguage === 'function') {
    applyLanguage(getCurrentLanguage());
  }
}

// Ajouter ou modifier un employé
employeeForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const nom = document.getElementById("nom").value.trim();
  const role = document.getElementById("role").value;
  const telephone = document.getElementById("telephone").value.trim();

  if (!nom || !role) {
    alert(tr('name') + ' et ' + tr('role') + ' sont requis');
    return;
  }

  if (employeeEnCours) {
    const index = employees.findIndex(emp => emp.id === employeeEnCours);
    if (index !== -1) {
      employees[index] = { id: employeeEnCours, nom, role, telephone };
      sauvegarder();
      afficherEmployees();
      resetForm();
      alert(tr('employeeUpdated'));
    }
  } else {
    const newEmployee = { id: Date.now(), nom, role, telephone };
    employees.push(newEmployee);
    sauvegarder();
    afficherEmployees();
    resetForm();
    alert(tr('employeeAdded'));
  }
});

// Modifier un employé
function modifierEmployee(id) {
  const emp = employees.find(e => e.id === id);
  if (!emp) { alert(tr('employeeNotFound')); return; }

  document.getElementById("employeId").value = emp.id;
  document.getElementById("nom").value = emp.nom;
  document.getElementById("role").value = emp.role;
  document.getElementById("telephone").value = emp.telephone || '';

  employeeEnCours = id;
  btnCancel.style.display = "inline-block";
  btnSubmit.innerHTML = `<i class="bi bi-save"></i> <span data-i18n="save">Enregistrer</span>`;
  employeeForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.getElementById("nom").focus();
  if (typeof applyLanguage === 'function') applyLanguage(getCurrentLanguage());
}

// Supprimer un employé
function supprimerEmployee(id) {
  if (confirm(tr('confirmDeleteEmployee'))) {
    employees = employees.filter(emp => emp.id !== id);
    sauvegarder();
    afficherEmployees();
    alert(tr('employeeDeleted'));
  }
}

// Annuler la modification
function cancelEdit() {
  resetForm();
}

// Réinitialiser le formulaire
function resetForm() {
  employeeForm.reset();
  document.getElementById("employeId").value = '';
  employeeEnCours = null;
  btnCancel.style.display = "none";
  btnSubmit.innerHTML = `<i class="bi bi-plus-circle"></i> <span data-i18n="addEmployee">Ajouter l'employé</span>`;
  if (typeof applyLanguage === 'function') applyLanguage(getCurrentLanguage());
}

// Sauvegarder dans LocalStorage
function sauvegarder() {
  localStorage.setItem("employees", JSON.stringify(employees));
}

// Échapper le HTML pour sécurité XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Exporter les fonctions globales
window.modifierEmployee = modifierEmployee;
window.supprimerEmployee = supprimerEmployee;
window.cancelEdit = cancelEdit;

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    afficherEmployees();

    // Sélecteur langue
    const langSelect = document.getElementById('langSelect');
    if (langSelect && typeof getCurrentLanguage === 'function') {
      langSelect.value = getCurrentLanguage();
      langSelect.addEventListener('change', e => {
        if (typeof setLanguage === 'function') setLanguage(e.target.value);
      });
    }
  }, 100);
});
