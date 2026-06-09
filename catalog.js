const API_URL = "https://site--mobilix-backend--98z6fhqjkxml.code.run";

const productsGrid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

let products = [];

function getStorageArray(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

function saveStorageArray(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function isFavorite(productId) {
    return getStorageArray("favorites").includes(productId);
}

function toggleFavorite(productId, event) {
    event.preventDefault();
    event.stopPropagation();

    let favorites = getStorageArray("favorites");
    favorites = favorites.includes(productId)
        ? favorites.filter(id => id !== productId)
        : [...favorites, productId];

    saveStorageArray("favorites", favorites);
    filterProducts();
}

function addToCompare(productId, event) {
    event.preventDefault();
    event.stopPropagation();

    let compare = getStorageArray("compare");

    if (compare.includes(productId)) {
        showToast("Товар вже є в порівнянні", "info");
        return;
    }

    compare.push(productId);
    saveStorageArray("compare", compare);
    showToast("Товар додано до порівняння");
}

function getAvailableVariants(product) {
    return (product.variants || []).filter(variant => Number(variant.stock || 0) > 0);
}

function renderProducts(items) {
    if (!items.length) {
        productsGrid.innerHTML = `
            <div class="empty-cart">
                <h2>Нічого не знайдено</h2>
                <p>Спробуйте змінити пошук або категорію.</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = items.map(product => {
        const variants = getAvailableVariants(product);
        const favoriteActive = isFavorite(product._id);

        return `
            <a href="product.html?id=${product._id}" class="product-card">
                <button class="favorite-btn ${favoriteActive ? "active" : ""}" onclick="toggleFavorite('${product._id}', event)" type="button" aria-label="Додати в обране">
                    <i class="${favoriteActive ? "fa-solid" : "fa-regular"} fa-heart"></i>
                </button>

                <img src="${product.image}" alt="${product.title}">
                <span class="product-category-label">${product.category}</span>
                <h3>${product.title}</h3>
                <p>${product.description}</p>

                ${variants.length ? `
                    <div class="product-variants-preview">
                        ${variants.map(variant => `<span>${variant.name} · ${variant.stock} шт.</span>`).join("")}
                    </div>
                ` : ""}

                <strong>${product.price} ₴</strong>
                <div class="product-card-btn">Переглянути товар</div>
                <button class="compare-btn" onclick="addToCompare('${product._id}', event)" type="button">⚖ Додати до порівняння</button>
            </a>
        `;
    }).join("");
}

function filterProducts() {
    const searchValue = searchInput.value.toLowerCase().trim();
    const categoryValue = categoryFilter.value.toLowerCase().trim();

    const filteredProducts = products.filter(product => {
        const titleMatch = product.title.toLowerCase().includes(searchValue);
        const descriptionMatch = product.description.toLowerCase().includes(searchValue);
        const categoryMatch = categoryValue === "all" || product.category.toLowerCase() === categoryValue;
        return (titleMatch || descriptionMatch) && categoryMatch;
    });

    renderProducts(filteredProducts);
}

function applyUrlFilters() {
    const params = new URLSearchParams(window.location.search);
    const search = params.get("search") || "";
    const category = params.get("category") || "all";

    searchInput.value = search;
    categoryFilter.value = category;
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/api/products`);
        products = await response.json();
        applyUrlFilters();
        filterProducts();
    } catch (error) {
        productsGrid.innerHTML = `
            <div class="empty-cart">
                <h2>Помилка завантаження</h2>
                <p>Спробуйте оновити сторінку.</p>
            </div>
        `;
    }
}

searchInput.addEventListener("input", filterProducts);
categoryFilter.addEventListener("change", filterProducts);
loadProducts();
