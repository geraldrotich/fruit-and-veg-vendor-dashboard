document.getElementById('pdfInput').addEventListener('change', async function () {
  const file = this.files[0];
  if (!file) return;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(" ");
    fullText += pageText + "\n";
  }

  const poMatch = fullText.match(/Purchase Order (\d+)/i);
  const poNumber = poMatch ? poMatch[1] : "Unknown";

  const productRegex = /(\d{6,}) ([^-\\n]+?)(?:-|\u2013)? [^\\n]+? (\d{1,5}) (?:Piece|Kilo)/g;
  let match;
  let rows = [];

  while ((match = productRegex.exec(fullText)) !== null) {
    const id = match[1].trim();
    const name = match[2].trim();
    const qty = match[3].trim();

    let vendor = "Unknown";
    if (/kilimohai/i.test(name)) vendor = "Kilimohai";
    else if (/sylvia/i.test(name)) vendor = "Sylvia Basket";

    rows.push({ id, name, qty, vendor });
  }

  let html = `<h3>PO Number: ${poNumber}</h3>`;
  html += "<table><thead><tr><th>Product ID</th><th>Item Name</th><th>Quantity</th><th>Vendor</th></tr></thead><tbody>";
  rows.forEach(row => {
    html += `<tr><td>${row.id}</td><td>${row.name}</td><td>${row.qty}</td><td>${row.vendor}</td></tr>`;
  });
  html += "</tbody></table>";
  document.getElementById("outputTable").innerHTML = html;

  // ✅ Show download button
  const downloadBtn = document.getElementById("downloadBtn");
  downloadBtn.style.display = "inline-block";

  // ✅ CSV export logic
  downloadBtn.onclick = function () {
    let csv = `PO Number,${poNumber}\n\nProduct ID,Item Name,Quantity,Vendor\n`;
    rows.forEach(row => {
      csv += `"${row.id}","${row.name}","${row.qty}","${row.vendor}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `PO_${poNumber}_Extract.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
});
