const productContainer = document.getElementById("productContainer");

const params = new URLSearchParams(window.location.search);
const productId = Number(params.get("id"));

const product = products.find(item => item.id === productId);

if (!product) {
    productContainer.innerHTML = `
        <div class="product-not-found">
            <h1>Товар не знайдено</h1>
            <p>Схоже, такого товару немає в каталозі.</p>
            <a href="catalog.html">Повернутись до каталогу</a>
        </div>
    `;
} else {
    document.title = `${product.title} — Mobilix`;

    productContainer.innerHTML = `
        <div class="product-detail">

            <div class="product-detail-image">
                <img src="${product.image}" alt="${product.title}">
            </div>

            <div class="product-detail-info">
                <span>${product.category}</span>

                <h1>${product.title}</h1>

                <p>${product.description}</p>

                <strong>${product.price} ₴</strong>

                <button>Додати у кошик</button>
            </div>

        </div>
    `;
}