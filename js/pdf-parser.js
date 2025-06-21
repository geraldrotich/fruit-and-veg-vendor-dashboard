document.getElementById('pdfInput').addEventListener('change', async function () {
  const file = this.files[0];
  if (!file) return;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const strings = textContent.items.map(item => item.str);
    fullText += strings.join("\n") + "\n";
  }

  // Extract PO Number
  const poMatch = fullText.match(/Purchase Order (\d+)/i);
  const poNumber = poMatch ? poMatch[1] : "Unknown";

  // Find all lines that start with a 6-digit Product ID
  const lines = fullText.split("\n");
  const productLines = lines.filter(line => /^\d{6}\s/.test(line));

  const extractedRows = [];

  productLines.forEach(line => {
    const match = line.match(/^(\d{6})\s+(.+?)\s+(\d{1,5})\s+(?:Piece|Kilo)/);
    if (match) {
      const productId = match[1].trim();
      const itemName = match[2].trim();
      const quantity = match[3].trim();

      let vendor = "Unknown";
      if (/kilimohai/i.test(itemName)) vendor = "Kilimohai";
      else if (/sylvia/i.test(itemName)) vendor = "Sylvia Basket";

      extractedRows.push({ productId, itemName, quantity, vendor });
    }
  });

  // Build HTML Table
  let html = `<h3>PO Number: ${poNumber}</h3>`;
  html += `<table><thead><tr><th>Product ID</th><th>Item Name</th><th>Quantity</th><th>Vendor</th></tr></thead><tbody>`;
  extractedRows.forEach(row => {
    html += `<tr><td>${row.productId}</td><td>${row.itemName}</td><td>${row.quantity}</td><td>${row.vendor}</td></tr>`;
  });
  html += `</tbody></table>`;
  document.getElementById("outputTable").innerHTML = html;

  // Enable CSV Download
  const downloadBtn = document.getElementById("downloadBtn");
  if (extractedRows.length > 0) {
    downloadBtn.style.display = "inline-block";
    downloadBtn.onclick = function () {
      let csv = `PO Number,${poNumber}\n\nProduct ID,Item Name,Quantity,Vendor\n`;
      extractedRows.forEach(row => {
        csv += `"${row.productId}","${row.itemName}","${row.quantity}","${row.vendor}"\n`;
      });
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PO_${poNumber}_Extract.csv`;
      a.click();
      URL.revokeObjectURL(url);
    };
  } else {
    downloadBtn.style.display = "none";
    alert("No valid product lines found in the PDF.");
  }
});
