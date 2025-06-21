document.getElementById('pdfInput').addEventListener('change', async function () {
  const file = this.files[0];
  if (!file) return;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    fullText += textContent.items.map(item => item.str).join(" ") + "\n";
  }

  // Extract PO Number
  const poMatch = fullText.match(/Purchase Order (\d+)/i);
  const poNumber = poMatch ? poMatch[1] : "Unknown";

  // Extract product lines
  const lines = fullText.split("\n");
  const productLines = lines.filter(line =>
    /^\d{6,}/.test(line) && /\b(?:Piece|Kilo)\b/.test(line)
  );

  // Build the table
  let html = `<h3>PO Number: ${poNumber}</h3>`;
  html += "<table><thead><tr><th>Product ID</th><th>Item Name</th><th>Quantity</th><th>Vendor</th></tr></thead><tbody>";

  productLines.forEach(line => {
    const match = line.match(/^(\d{6,}) (.+?) (\d{1,5}) (?:Piece|Kilo)/);
    if (match) {
      const [_, id, name, qty] = match;

      // Infer vendor from product name
      let vendor = "Unknown";
      if (name.toLowerCase().includes("kilimohai")) vendor = "Kilimohai";
      else if (name.toLowerCase().includes("sylvia")) vendor = "Sylvia Basket";

      html += `<tr><td>${id}</td><td>${name}</td><td>${qty}</td><td>${vendor}</td></tr>`;
    }
  });

  html += "</tbody></table>";
  document.getElementById("outputTable").innerHTML = html;
});
