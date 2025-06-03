document.addEventListener("DOMContentLoaded", () => {
  const orderForm = document.getElementById("purchase_form");
  const orderButton = document.getElementById("order");

  const reviewForm = document.getElementById("review_form");
  const reviewButton = document.getElementById("send");
  const reviewsContainer = document.getElementById("revues_div");

  function placeAnOrder(event) {
    const name = document.getElementById("name").value;
    const address = document.getElementById("address").value;

    if (name && address) {
      // Показваме съобщение с името
      alert(`${name}, благодарим за поръчката!`);
    }

    // НЕ предотвратявам изпращането, ако искам да се запази в базата
    // Ако искам да остана на страницата – включвам:
    // event.preventDefault();
    // orderForm.reset();
  }

  function sendReview(event) {
    const reviewText = document.getElementById("comments").value;

    const newReview = document.createElement("div");
    newReview.textContent = reviewText;
    newReview.className = "rev";

    reviewsContainer.prepend(newReview);
  }

  if (orderButton && orderForm) {
    orderButton.addEventListener("click", placeAnOrder);
  }

  if (reviewButton && reviewForm && reviewsContainer) {
    reviewButton.addEventListener("click", sendReview);
  }
});

async function loadProducts() {
  try {
    const response = await fetch("http://localhost:3006/api/products");
    const products = await response.json();
    const container = document.getElementById("cakes_section");
    container.innerHTML = "";

    products.forEach((product) => {
      const div = document.createElement("div");
      div.classList.add("cake_divs");

      div.innerHTML = `
          <h3>${product.title}</h3>
          <img class="cakes" src="${product.image}" alt="Изображение на торта ${
        product.title
      }" />
          <p><strong>Цена:</strong> ${parseFloat(product.price).toFixed(
            2
          )} лв.</p>
          <p><strong>Кратко описание:</strong><br><br>${
            product.shortDescription
          }</p>
          <a href="/product/${product.slug}"><button>Виж</button></a>
        `;

      container.appendChild(div);
    });
  } catch (error) {
    console.error("Грешка при зареждане на продуктите:", error);
  }
}

loadProducts();

function logout() {
  fetch("http://localhost:3006/logout", {
    method: "POST",
    credentials: "same-origin", // важно за session cookies
  })
    .then(() => {
      window.location.href = "/"; // връща към началната страница
    })
    .catch((err) => {
      console.error("Грешка при изхода:", err);
    });
}
