const API_URL = "https://site--mobilix-backend--98z6fhqjkxml.code.run";
const favoritesGrid = document.getElementById("favoritesGrid");

let products = [];

function getFavorites() {
    return JSON.parse(localStorage.getItem("favorites")) || [];
}

function saveFavorites(favorites) {
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

function cleanFavorites() {
    const activeFavorites = getFavorites().filter(id => products.some(product => product._id === id));
    saveFavorites(activeFavorites);
}

function removeFavorite(productId) {
    saveFavorites(getFavorites().filter(id => id !== productId));
    renderFavorites();
}

function renderFavorites() {
    const favoriteProducts = products.filter(product => getFavorites().includes(product._id));

    if (!favoriteProducts.length) {
        favoritesGrid.innerHTML = `
            <div class="empty-cart">
                <h2>Вибране порожнє</h2>
                <p>Додайте товари в обране з каталогу.</p>
                <a href="catalog.html">Перейти до каталогу</a>
            </div>
        `;
        return;
    }

    favoritesGrid.innerHTML = favoriteProducts.map(product => `
        <div class="product-card">
            <button class="favorite-btn active" onclick="removeFavorite('${product._id}')" type="button" aria-label="Видалити з обраного">
                <i class="fa-solid fa-heart"></i>
            </button>

            <a href="product.html?id=${product._id}" class="favorite-product-link">
                <img src="${product.image}" alt="${product.title}">
                <span class="product-category-label">${product.category}</span>
                <h3>${product.title}</h3>
                <p>${product.description}</p>
                <strong>${product.price} ₴</strong>
                <div class="product-card-btn">Переглянути товар</div>
            </a>
        </div>
    `).join("");
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/api/products`);
        products = await response.json();
        cleanFavorites();
        renderFavorites();
    } catch (error) {
        favoritesGrid.innerHTML = `<div class="empty-cart"><h2>Помилка завантаження</h2><p>Спробуйте оновити сторінку.</p></div>`;
    }
}

loadProducts();
