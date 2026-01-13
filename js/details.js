const id = localStorage.getItem("selectedCommande");
const commandes = JSON.parse(localStorage.getItem("commandes")) || [];
const cmd = commandes.find(c => c.id == id);

document.getElementById("details").innerHTML = `
  <p>Table : ${cmd.table}</p>
  <p>Total : ${cmd.total} DH</p>
  <p>Status : ${cmd.status}</p>
`;

function exportPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  pdf.text("Details Commande", 10, 10);
  pdf.text(`Table : ${cmd.table}`, 10, 20);
  pdf.text(`Total : ${cmd.total} DH`, 10, 30);
  pdf.text(`Status : ${cmd.status}`, 10, 40);

  pdf.save("commande.pdf");
}
