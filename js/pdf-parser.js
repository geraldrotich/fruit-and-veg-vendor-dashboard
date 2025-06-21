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

  // Simple line-based extract (customize as needed)
  const lines = fullText.split("\n");
  const relevant = lines.filter(line =>
    /\d{6,}/.test(line) && /\b(?:Piece|Kilo)\b/.test(line)
  );

  let html = "<table><thead><tr><th>Product ID</th><th>Item Name</th><th>Qty</th></tr></thead><tbody>";
  relevant.forEach(line => {
    const match = line.match(/^(\d{6,}) (.+?) (\d{1,5}) (?:Piece|Kilo)/);
    if (match) {
      const [_, id, name, qty] = match;
      html += `<tr><td>${id}</td><td>${name}</td><td>${qty}</td></tr>`;
    }
  });
  html += "</tbody></table>";

  document.getElementById("outputTable").innerHTML = html;
});

