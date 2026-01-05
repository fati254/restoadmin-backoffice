let employeEnCours = null;
let employes = JSON.parse(localStorage.getItem("employes")) || [];

const employeForm = document.getElementById("employeForm");
const employeTable = document.getElementById("employeTable");
const btnCancelEmploye = document.getElementById("btnCancelEmploye");
const btnSubmitEmploye = employeForm ? employeForm.querySelector('button[type="submit"]') : null;

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
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
    afficherEmployes();
  }, 100);
});

if (employeForm) {
  employeForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const nom = document.getElementById("nom").value.trim();
    const role = document.getElementById("role").value;
    const telephone = document.getElementById("telephone").value.trim();

    if (!nom || !role || !telephone) {
      alert("Veuillez remplir tous les champs requis");
      return;
    }

    if (employeEnCours) {
      const index = employes.findIndex(emp => emp.id === employeEnCours);
      if (index !== -1) {
        employes[index] = { id: employeEnCours, nom, role, telephone };
        sauvegarderEmployes();
        afficherEmployes();
        resetEmployeForm();
        alert(t('employeeUpdated'));
      }
    } else {
      const newEmploye = { id: Date.now(), nom, role, telephone };
      employes.push(newEmploye);
      sauvegarderEmployes();
      afficherEmployes();
      resetEmployeForm();
      alert(t('employeeAdded'));
    }
  });
}

function afficherEmployes() {
  employeTable.innerHTML = "";
  const sorted = [...employes].sort((a, b) => b.id - a.id);
  sorted.forEach(emp => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(emp.nom)}</td>
      <td>${escapeHtml(emp.role)}</td>
      <td>${escapeHtml(emp.telephone)}</td>
      <td>
        <button class="btn btn-warning btn-sm me-1" onclick="modifierEmploye(${emp.id})" title="${t('edit')}">
          <i class="bi bi-pencil"></i> <span data-i18n="edit">Modifier</span>
        </button>
        <button class="btn btn-danger btn-sm" onclick="supprimerEmploye(${emp.id})" title="${t('delete')}">
          <i class="bi bi-trash"></i> <span data-i18n="delete">Supprimer</span>
        </button>
      </td>
    `;
    employeTable.appendChild(row);
  });
  if (typeof applyLanguage === 'function') {
    applyLanguage(getCurrentLanguage());
  }
}

function modifierEmploye(id) {
  const emp = employes.find(e => e.id === id);
  if (!emp) {
    alert("Employé introuvable");
    return;
  }
  document.getElementById("employeId").value = emp.id;
  document.getElementById("nom").value = emp.nom;
  document.getElementById("role").value = emp.role;
  document.getElementById("telephone").value = emp.telephone;
  employeEnCours = id;
  btnCancelEmploye.style.display = "inline-block";
  if (btnSubmitEmploye) {
    btnSubmitEmploye.innerHTML = `<i class="bi bi-save"></i> <span data-i18n="save">Enregistrer</span>`;
  }
  employeForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.getElementById("nom").focus();
  if (typeof applyLanguage === 'function') {
    applyLanguage(getCurrentLanguage());
  }
}

function supprimerEmploye(id) {
  if (confirm(t('confirmDeleteEmployee'))) {
    employes = employes.filter(e => e.id !== id);
    sauvegarderEmployes();
    afficherEmployes();
    alert(t('employeeDeleted'));
  }
}

function cancelEditEmploye() {
  resetEmployeForm();
}

function resetEmployeForm() {
  employeForm.reset();
  document.getElementById("employeId").value = '';
  employeEnCours = null;
  btnCancelEmploye.style.display = "none";
  if (btnSubmitEmploye) {
    btnSubmitEmploye.innerHTML = `<i class="bi bi-plus-circle"></i> <span data-i18n="addEmployee">Ajouter l'employé</span>`;
  }
  if (typeof applyLanguage === 'function') {
    applyLanguage(getCurrentLanguage());
  }
}

function sauvegarderEmployes() {
  localStorage.setItem("employes", JSON.stringify(employes));
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

window.modifierEmploye = modifierEmploye;
window.supprimerEmploye = supprimerEmploye;
window.cancelEditEmploye = cancelEditEmploye;
