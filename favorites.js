const API_URL = "https://mobilix-backend-production.up.railway.app";

const favoritesGrid = document.getElementById("favoritesGrid");

let products = [];

function getFavorites() {
    return JSON.parse(localStorage.getItem("favorites")) || [];
}

function saveFavorites(favorites) {
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

function removeFavorite(productId) {
    const favorites = getFavorites().filter(id => id !== productId);
    saveFavorites(favorites);
    renderFavorites();
}

async function loadProducts() {
    const response = await fetch(`${API_URL}/api/products`);
    products = await response.json();

    renderFavorites();
}

function renderFavorites() {
    const favorites = getFavorites();

    const favoriteProducts = products.filter(product =>
        favorites.includes(product._id)
    );

    if (favoriteProducts.length === 0) {
        favoritesGrid.innerHTML = `
            <div class="empty-cart">
                <h2>Вибране порожнє</h2>
                <p>Додайте товари в обране з каталогу.</p>
                <a href="catalog.html">Перейти до каталогу</a>
            </div>
        `;
        return;
    }

    favoritesGrid.innerHTML = "";

    favoriteProducts.forEach(product => {
        favoritesGrid.innerHTML += `
            <div class="product-card">

                <button 
                    class="favorite-btn active"
                    onclick="removeFavorite('${product._id}')"
                    type="button"
                >
                    <i class="fa-solid fa-heart"></i>
                </button>

                <a href="product.html?id=${product._id}" class="favorite-product-link">
                    <img src="${product.image}" alt="${product.title}">

                    <span class="product-category-label">${product.category}</span>

                    <h3>${product.title}</h3>

                    <p>${product.description}</p>

                    <strong>${product.price} ₴</strong>

                    <div class="product-card-btn">
                        Переглянути товар
                    </div>
                </a>

            </div>
        `;
    });
}

loadProducts();