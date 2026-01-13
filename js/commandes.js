let commandes = JSON.parse(localStorage.getItem("commandes")) || [];

function addCommande() {
  const table = document.getElementById("table").value;
  const total = document.getElementById("total").value;
  const status = document.getElementById("status").value;

  if (!table || !total) return alert("Champs manquants");

  commandes.push({
    id: Date.now(),
    table,
    total,
    status
  });

  localStorage.setItem("commandes", JSON.stringify(commandes));
  afficherCommandes();
}

function afficherCommandes() {
  const tbody = document.getElementById("commandeList");
  tbody.innerHTML = "";

  commandes.forEach(c => {
    tbody.innerHTML += `
      <tr>
        <td>${c.table}</td>
        <td>${c.total} DH</td>
        <td>${c.status}</td>
        <td>
          <button onclick="voirDetails(${c.id})">Details</button>
          <button onclick="deleteCommande(${c.id})">Supprimer</button>
        </td>
      </tr>
    `;
  });
}

function deleteCommande(id) {
  commandes = commandes.filter(c => c.id !== id);
  localStorage.setItem("commandes", JSON.stringify(commandes));
  afficherCommandes();
}

function voirDetails(id) {
  localStorage.setItem("selectedCommande", id);
  window.location.href = "details.html";
}

afficherCommandes();
