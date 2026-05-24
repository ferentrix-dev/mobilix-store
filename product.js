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

                <button onclick="addToCart(${product.id})">
                    Додати у кошик
                </button>

                <button 
                    onclick="toggleFavorite(${product.id})"
                    class="product-favorite-btn"
                >
                    <i class="fa-regular fa-heart"></i>
                    Додати в обране
                </button>
            </div>

        </div>
    `;
}

function addToCart(productId) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existingProduct = cart.find(item => item.id === productId);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({
            id: productId,
            quantity: 1
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    window.location.href = "cart.html";
}

function getFavorites() {
    return JSON.parse(localStorage.getItem("favorites")) || [];
}

function saveFavorites(favorites) {
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

function toggleFavorite(productId) {
    let favorites = getFavorites();

    if (favorites.includes(productId)) {
        favorites = favorites.filter(id => id !== productId);
        showToast("Товар видалено з обраного");
    } else {
        favorites.push(productId);
        showToast("Товар додано в обране");
    }

    saveFavorites(favorites);
}