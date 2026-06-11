const API_URL = "https://site--mobilix-backend--98z6fhqjkxml.code.run";

const productsGrid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortFilter = document.getElementById("sortFilter");

let products = [];
let imageIndexes = {};

function getLocalArray(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

function setLocalArray(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getProductImages(product) {
    const images = product.images?.length ? product.images : [product.image];
    return images.filter(Boolean).slice(0, 5);
}

function getAvailableVariants(product) {
    return (product.variants || []).filter(variant => Number(variant.stock || 0) > 0);
}

function getLowestPrice(product) {
    const variants = getAvailableVariants(product);

    if (!variants.length) {
        return Number(product.price || 0);
    }

    return Math.min(...variants.map(variant => Number(variant.price || product.price || 0)));
}

function getDiscountPercent(product) {
    const price = getLowestPrice(product);
    const oldPrice = Number(product.oldPrice || 0);

    if (!oldPrice || oldPrice <= price) {
        return 0;
    }

    return Math.round(((oldPrice - price) / oldPrice) * 100);
}

function isFavorite(productId) {
    return getLocalArray("favorites").includes(productId);
}

function toggleFavorite(productId, event) {
    event.preventDefault();
    event.stopPropagation();

    let favorites = getLocalArray("favorites");

    favorites = favorites.includes(productId)
        ? favorites.filter(id => id !== productId)
        : [...favorites, productId];

    setLocalArray("favorites", favorites);
    renderProducts(getFilteredProducts());
}

function addToCompare(productId, event) {
    event.preventDefault();
    event.stopPropagation();

    const compare = getLocalArray("compare");

    if (compare.includes(productId)) {
        showToast("Товар вже є в порівнянні", "info");
        return;
    }

    compare.push(productId);
    setLocalArray("compare", compare);
    showToast("Товар додано до порівняння");
}

function changeCatalogImage(productId, direction, event) {
    event.preventDefault();
    event.stopPropagation();

    const product = products.find(item => item._id === productId);

    if (!product) return;

    const images = getProductImages(product);

    if (images.length < 2) return;

    const currentIndex = imageIndexes[productId] || 0;
    let nextIndex = currentIndex + direction;

    if (nextIndex < 0) nextIndex = images.length - 1;
    if (nextIndex >= images.length) nextIndex = 0;

    imageIndexes[productId] = nextIndex;

    const image = document.getElementById(`catalogImage-${productId}`);

    if (!image) return;

    image.classList.remove("image-switch");
    void image.offsetWidth;
    image.src = images[nextIndex];
    image.classList.add("image-switch");
}

function getFilteredProducts() {
    const searchValue = searchInput.value.toLowerCase().trim();
    const categoryValue = categoryFilter.value.toLowerCase().trim();
    const sortValue = sortFilter.value;

    let filtered = products.filter(product => {
        const title = product.title?.toLowerCase() || "";
        const description = product.description?.toLowerCase() || "";
        const category = product.category?.toLowerCase() || "";

        const matchesSearch = title.includes(searchValue) || description.includes(searchValue);
        const matchesCategory = categoryValue === "all" || category === categoryValue;

        return matchesSearch && matchesCategory;
    });

    if (sortValue === "cheap") {
        filtered.sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
    }

    if (sortValue === "expensive") {
        filtered.sort((a, b) => getLowestPrice(b) - getLowestPrice(a));
    }

    if (sortValue === "new") {
        filtered = filtered.filter(product => product.isNew);
    }

    if (sortValue === "hit") {
        filtered = filtered.filter(product => product.isHit);
    }

    if (sortValue === "discount") {
        filtered = filtered.filter(product => getDiscountPercent(product) > 0);
    }

    return filtered;
}

function renderBadges(product) {
    const discount = getDiscountPercent(product);

    return `
        <div class="product-badges">
            ${product.isHit ? `<span class="badge-hit">Хіт</span>` : ""}
            ${product.isNew ? `<span class="badge-new">Новинка</span>` : ""}
            ${discount ? `<span class="badge-discount">-${discount}%</span>` : ""}
        </div>
    `;
}

function renderPrice(product) {
    const price = getLowestPrice(product);
    const oldPrice = Number(product.oldPrice || 0);
    const hasDiscount = oldPrice > price;

    return `
        <div class="product-price-box">
            ${hasDiscount ? `<span class="old-price">${oldPrice} ₴</span>` : ""}
            <strong>${getAvailableVariants(product).length ? "від " : ""}${price} ₴</strong>
        </div>
    `;
}

function renderProducts(items) {
    if (!items.length) {
        productsGrid.innerHTML = `
            <div class="empty-cart">
                <h2>Нічого не знайдено</h2>
                <p>Спробуйте змінити пошук, категорію або сортування.</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = items.map(product => {
        const images = getProductImages(product);
        const variants = getAvailableVariants(product);
        const currentImageIndex = imageIndexes[product._id] || 0;
        const favorite = isFavorite(product._id);

        return `
            <a href="product.html?id=${product._id}" class="product-card">
                ${renderBadges(product)}

                <button class="favorite-btn ${favorite ? "active" : ""}" onclick="toggleFavorite('${product._id}', event)" type="button">
                    <i class="${favorite ? "fa-solid" : "fa-regular"} fa-heart"></i>
                </button>

                <div class="catalog-gallery">
                    ${images.length > 1 ? `
                        <button class="catalog-arrow left" onclick="changeCatalogImage('${product._id}', -1, event)" type="button">‹</button>
                        <button class="catalog-arrow right" onclick="changeCatalogImage('${product._id}', 1, event)" type="button">›</button>
                    ` : ""}

                    <img id="catalogImage-${product._id}" src="${images[currentImageIndex] || product.image}" alt="${product.title}">
                </div>

                <span class="product-category-label">${product.category}</span>
                <h3>${product.title}</h3>
                <p>${product.description || ""}</p>

                ${variants.length ? `
                    <div class="product-variants-preview">
                        ${variants.slice(0, 3).map(variant => `
                            <span>${variant.name} · ${Number(variant.price || product.price)} ₴</span>
                        `).join("")}

                        ${variants.length > 3 ? `<span class="more-variants">+${variants.length - 3} ще</span>` : ""}
                    </div>
                ` : ""}

                ${renderPrice(product)}

                <div class="product-card-btn">Переглянути товар</div>

                <button class="compare-btn" onclick="addToCompare('${product._id}', event)" type="button">
                    ⚖ Додати до порівняння
                </button>
            </a>
        `;
    }).join("");
}

function filterProducts() {
    renderProducts(getFilteredProducts());
}

function applyUrlFilters() {
    const params = new URLSearchParams(window.location.search);

    searchInput.value = params.get("search") || "";
    categoryFilter.value = params.get("category") || "all";
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/api/products`);
        products = await response.json();

        applyUrlFilters();
        filterProducts();
    } catch {
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
sortFilter.addEventListener("change", filterProducts);

loadProducts();