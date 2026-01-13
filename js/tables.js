let tables = JSON.parse(localStorage.getItem("tables")) || [];

function addTable() {
  const numero = document.getElementById("numero").value;
  const places = document.getElementById("places").value;

  if (!numero || !places) return alert("Remplis tous les champs");

  tables.push({
    id: Date.now(),
    numero,
    places
  });

  localStorage.setItem("tables", JSON.stringify(tables));
  afficherTables();
}

function afficherTables() {
  const tbody = document.getElementById("tableList");
  tbody.innerHTML = "";

  tables.forEach(t => {
    tbody.innerHTML += `
      <tr>
        <td>${t.numero}</td>
        <td>${t.places}</td>
        <td>
          <button onclick="deleteTable(${t.id})">Supprimer</button>
        </td>
      </tr>
    `;
  });
}

function deleteTable(id) {
  tables = tables.filter(t => t.id !== id);
  localStorage.setItem("tables", JSON.stringify(tables));
  afficherTables();
}

afficherTables();
