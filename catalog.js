const API_URL = "https://mobilix-backend-production.up.railway.app";

let products = [];

const productsGrid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

function getFavorites() {
    return JSON.parse(localStorage.getItem("favorites")) || [];
}

function saveFavorites(favorites) {
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

function isFavorite(productId) {
    return getFavorites().includes(productId);
}

function toggleFavorite(productId, event) {
    event.preventDefault();
    event.stopPropagation();

    let favorites = getFavorites();

    if (favorites.includes(productId)) {
        favorites = favorites.filter(id => id !== productId);
    } else {
        favorites.push(productId);
    }

    saveFavorites(favorites);
    filterProducts();
}

function renderProducts(items) {
    productsGrid.innerHTML = "";

    if (items.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-cart">
                <h2>Нічого не знайдено</h2>
                <p>Спробуйте змінити пошук або категорію.</p>
            </div>
        `;
        return;
    }

    items.forEach(product => {
        const productId = product._id;
        const favoriteActive = isFavorite(productId);

        productsGrid.innerHTML += `
            <a href="product.html?id=${productId}" class="product-card">

                <button
                    class="favorite-btn ${favoriteActive ? "active" : ""}"
                    onclick="toggleFavorite('${productId}', event)"
                    type="button"
                >
                    <i class="${favoriteActive ? "fa-solid" : "fa-regular"} fa-heart"></i>
                </button>

                <img src="${product.image}" alt="${product.title}">

                <span class="product-category-label">
                    ${product.category}
                </span>

                <h3>${product.title}</h3>

                <p>${product.description}</p>

${
    product.variants && product.variants.filter(v => v.stock > 0).length > 0
    ? `
        <div class="product-variants-preview">
            ${product.variants
                .filter(variant => variant.stock > 0)
                .map(variant => `
                    <span>${variant.name} · ${variant.stock} шт.</span>
                `).join("")}
        </div>
    `
    : ""
}

<strong>${product.price} ₴</strong>

                <div class="product-card-btn">
                    Переглянути товар
                </div>

                <button
                    class="compare-btn"
                    onclick="addToCompare('${productId}', event)"
                    type="button"
                >
                    ⚖ Додати до порівняння
                </button>

            </a>
        `;
    });
}

function filterProducts() {
    const searchValue = searchInput.value.toLowerCase().trim();
    const categoryValue = categoryFilter.value.toLowerCase().trim();

    const filteredProducts = products.filter(product => {
        const titleMatch = product.title.toLowerCase().includes(searchValue);

        const categoryMatch =
            categoryValue === "all" ||
            product.category.toLowerCase().trim() === categoryValue;

        return titleMatch && categoryMatch;
    });

    renderProducts(filteredProducts);
}

function addToCompare(productId, event) {
    event.preventDefault();
    event.stopPropagation();

    let compare = JSON.parse(localStorage.getItem("compare")) || [];

    if (compare.includes(productId)) {
        return;
    }

    if (compare.length >= 4) {
        showToast("Максимум 4 товари для порівняння", "error");
        return;
    }

    compare.push(productId);
    localStorage.setItem("compare", JSON.stringify(compare));

    showToast("Товар додано до порівняння");
}

async function initCatalog() {
    const response = await fetch(`${API_URL}/api/products`);
    products = await response.json();

    const urlParams = new URLSearchParams(window.location.search);

    const urlSearch = urlParams.get("search") || "";
    const urlCategory = urlParams.get("category") || "all";

    searchInput.value = urlSearch;
    categoryFilter.value = urlCategory;

    filterProducts();
}

searchInput.addEventListener("input", filterProducts);
categoryFilter.addEventListener("change", filterProducts);

initCatalog();