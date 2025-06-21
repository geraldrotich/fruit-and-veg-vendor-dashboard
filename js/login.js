function loginUser() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === "admin" && password === "1234") {
    window.location.href = "dashboard-products.html";
  } else {
    alert("Invalid login");
  }
  return false;
}

