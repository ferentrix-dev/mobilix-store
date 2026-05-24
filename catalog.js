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

    if(items.length === 0){
        productsGrid.innerHTML = `
            <div class="empty-cart">
                <h2>Нічого не знайдено</h2>
                <p>Спробуйте змінити пошук або категорію.</p>
            </div>
        `;

        return;
    }

    items.forEach(product => {

        const favoriteActive = isFavorite(product.id);

        productsGrid.innerHTML += `
        <a href="product.html?id=${product.id}" class="product-card">

            <button
                class="favorite-btn ${favoriteActive ? "active" : ""}"
                onclick="toggleFavorite(${product.id}, event)"
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

            <strong>${product.price} ₴</strong>

            <div class="product-card-btn">
                Переглянути товар
            </div>

            <button
    class="compare-btn"
    onclick="addToCompare(${product.id}, event)"
>
    ⚖ Додати до порівняння
</button>

        </a>
        `;
    });
}

function filterProducts() {

    const searchValue = searchInput.value.toLowerCase().trim();

    const categoryValue =
        categoryFilter.value.toLowerCase().trim();

    const filteredProducts = products.filter(product => {

        const titleMatch =
            product.title.toLowerCase()
            .includes(searchValue);

        const categoryMatch =
            categoryValue === "all" ||
            product.category.toLowerCase().trim() === categoryValue;

        return titleMatch && categoryMatch;

    });

    renderProducts(filteredProducts);
}

searchInput.addEventListener(
    "input",
    filterProducts
);

categoryFilter.addEventListener(
    "change",
    filterProducts
);


/* URL SEARCH */

const urlParams = new URLSearchParams(window.location.search);

const urlSearch =
    urlParams.get("search") || "";

const urlCategory =
    urlParams.get("category") || "all";


searchInput.value = urlSearch;

categoryFilter.value = urlCategory;

filterProducts();  

function addToCompare(productId,event){

    event.preventDefault();
    event.stopPropagation();

    let compare =
        JSON.parse(localStorage.getItem("compare")) || [];

    if(compare.includes(productId)){
        return;
    }

    if(compare.length >= 4){
        showToast("Максимум 4 товари для порівняння", "error");("Максимум 4 товари");
        return;
    }

    compare.push(productId);

    localStorage.setItem(
        "compare",
        JSON.stringify(compare)
    );

showToast("Товар додано до порівняння");    }