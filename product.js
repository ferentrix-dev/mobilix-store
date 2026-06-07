const API_URL = "https://site--mobilix-backend--98z6fhqjkxml.code.run";
const productContainer = document.getElementById("productContainer");

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

let product = null;
let selectedVariant = null;

async function loadProduct() {
    const response = await fetch(`${API_URL}/api/products`);
    const products = await response.json();

    product = products.find(item => item._id === productId);

    if (!product) {
        productContainer.innerHTML = `
            <div class="product-not-found">
                <h1>Товар не знайдено</h1>
                <a href="catalog.html">Повернутись до каталогу</a>
            </div>
        `;
        return;
    }

    const availableVariants = getAvailableVariants();

    selectedVariant = availableVariants.length > 0
        ? availableVariants[0]
        : null;

    renderProduct();
}

function getAvailableVariants() {
    if (!product || !product.variants) {
        return [];
    }

    return product.variants.filter(variant => variant.stock > 0);
}

function renderProduct() {
    const availableVariants = getAvailableVariants();

    const image = selectedVariant?.image || product.image;
    const stock = selectedVariant ? selectedVariant.stock : product.stock;

    productContainer.innerHTML = `
        <div class="product-detail">

            <div class="product-detail-image">
                <img id="productImage" src="${image}" alt="${product.title}">
            </div>

            <div class="product-detail-info">
                <span>${product.category}</span>

                <h1>${product.title}</h1>

                <p>${product.description}</p>

                <strong>${product.price} ₴</strong>

                <p class="product-stock" id="productStock">
                    В наявності: ${stock || 0} шт.
                </p>

                ${
                    availableVariants.length > 0
                    ? `
                        <div class="variant-box">
                            <h4>Оберіть тип:</h4>

                            <div class="variant-list">
                                ${availableVariants.map((variant, index) => `
                                    <button 
                                        class="variant-btn ${index === 0 ? "active" : ""}"
                                        onclick="selectVariant(${index})"
                                        type="button"
                                    >
                                        ${variant.name} · ${variant.stock} шт.
                                    </button>
                                `).join("")}
                            </div>
                        </div>
                    `
                    : ""
                }

                <button onclick="addToCart('${product._id}')">
                    Додати у кошик
                </button>

                <button 
                    onclick="toggleFavorite('${product._id}')"
                    class="product-favorite-btn"
                >
                    <i class="fa-regular fa-heart"></i>
                    Додати в обране
                </button>
            </div>

        </div>
    `;
}

function selectVariant(index) {
    const availableVariants = getAvailableVariants();

    selectedVariant = availableVariants[index];

    if (!selectedVariant) {
        return;
    }

    document.getElementById("productImage").src =
        selectedVariant.image || product.image;

    document.getElementById("productStock").textContent =
        `В наявності: ${selectedVariant.stock || 0} шт.`;

    document.querySelectorAll(".variant-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    document.querySelectorAll(".variant-btn")[index].classList.add("active");
}

function addToCart(productId) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const variantName = selectedVariant ? selectedVariant.name : "Стандартний";

    const existingProduct = cart.find(item =>
        item.id === productId && item.variant === variantName
    );

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({
            id: productId,
            variant: variantName,
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

loadProduct();