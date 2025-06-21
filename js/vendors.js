const data = {
  "Tomatoes": ["Vendor A", "Vendor B", "Vendor C"],
  "Onions": ["Vendor B", "Vendor D"],
  "Cucumbers": ["Vendor A", "Vendor C"]
};

const productContainer = document.getElementById('products');
const vendorContainer = document.getElementById('vendors');

Object.keys(data).forEach(product => {
  const div = document.createElement('div');
  div.className = 'product';
  div.innerText = product;
  div.onclick = () => showVendors(product);
  productContainer.appendChild(div);
});

const ctx = document.getElementById('vendorChart').getContext('2d');
let vendorChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: [],
    datasets: [{
      label: '',
      data: [],
      backgroundColor: '#42a5f5'
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  }
});

function showVendors(product) {
  const vendors = data[product];
  vendorContainer.innerHTML = `<h3>Vendors for ${product}</h3><ul>` +
    vendors.map(v => `<li>${v}</li>`).join('') + '</ul>';

  vendorChart.data.labels = vendors;
  vendorChart.data.datasets[0].data = vendors.map(() => 1);
  vendorChart.data.datasets[0].label = `Vendors for ${product}`;
  vendorChart.update();
}

