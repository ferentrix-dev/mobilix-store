const API_URL = "https://site--mobilix-backend--98z6fhqjkxml.code.run";
const productContainer = document.getElementById("productContainer");

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

let product = null;
let selectedVariant = null;

function setMetaProperty(property, content) {
    let meta = document.querySelector(`meta[property="${property}"]`);
    if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
}

function updateMetaDescription(content) {
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
}

function updateProductSeo() {
    const title = `${product.title} — купити в Україні | Mobilix`;
    const description = `${product.title}. ${product.description}. Ціна ${product.price} ₴. Доставка Новою Поштою по Україні.`;

    document.title = title;
    updateMetaDescription(description);
    setMetaProperty("og:title", title);
    setMetaProperty("og:description", description);
    setMetaProperty("og:type", "product");
    setMetaProperty("og:image", product.image);
    setMetaProperty("og:url", window.location.href);
}

function getAvailableVariants() {
    return (product?.variants || []).filter(variant => Number(variant.stock || 0) > 0);
}

function selectVariant(index) {
    selectedVariant = getAvailableVariants()[index];
    if (!selectedVariant) return;

    document.getElementById("productImage").src = selectedVariant.image || product.image;
    document.getElementById("productStock").textContent = `В наявності: ${selectedVariant.stock || 0} шт.`;

    document.querySelectorAll(".variant-btn").forEach(button => button.classList.remove("active"));
    document.querySelectorAll(".variant-btn")[index].classList.add("active");
}

function getCurrentStock() {
    return Number(selectedVariant ? selectedVariant.stock : product.stock || 0);
}

function addToCart(productId) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const variantName = selectedVariant ? selectedVariant.name : "Стандартний";
    const stock = getCurrentStock();

    if (stock <= 0) {
        showToast("Товару немає в наявності", "error");
        return;
    }

    const existingItem = cart.find(item => item.id === productId && item.variant === variantName);

    if (existingItem) {
        if (existingItem.quantity >= stock) {
            showToast(`В наявності лише ${stock} шт.`, "error");
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, variant: variantName, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.location.href = "cart.html";
}

function getFavorites() {
    return JSON.parse(localStorage.getItem("favorites")) || [];
}

function toggleFavorite(productId) {
    let favorites = getFavorites();
    if (favorites.includes(productId)) {
        favorites = favorites.filter(id => id !== productId);
        showToast("Товар видалено з обраного", "info");
    } else {
        favorites.push(productId);
        showToast("Товар додано в обране");
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

function renderProduct() {
    const variants = getAvailableVariants();
    const image = selectedVariant?.image || product.image;
    const stock = getCurrentStock();

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
                <p class="product-stock" id="productStock">В наявності: ${stock} шт.</p>

                ${variants.length ? `
                    <div class="variant-box">
                        <h4>Оберіть тип:</h4>
                        <div class="variant-list">
                            ${variants.map((variant, index) => `
                                <button class="variant-btn ${index === 0 ? "active" : ""}" onclick="selectVariant(${index})" type="button">
                                    ${variant.name} · ${variant.stock} шт.
                                </button>
                            `).join("")}
                        </div>
                    </div>
                ` : ""}

                <button onclick="addToCart('${product._id}')">Додати у кошик</button>
                <button onclick="toggleFavorite('${product._id}')" class="product-favorite-btn">
                    <i class="fa-regular fa-heart"></i> Додати в обране
                </button>
            </div>
        </div>
    `;
}

async function loadProduct() {
    try {
        const response = await fetch(`${API_URL}/api/products`);
        const products = await response.json();
        product = products.find(item => item._id === productId);

        if (!product) {
            document.title = "Товар не знайдено | Mobilix";
            updateMetaDescription("Товар не знайдено. Поверніться до каталогу Mobilix.");
            productContainer.innerHTML = `<div class="product-not-found"><h1>Товар не знайдено</h1><a href="catalog.html">Повернутись до каталогу</a></div>`;
            return;
        }

        updateProductSeo();
        selectedVariant = getAvailableVariants()[0] || null;
        renderProduct();
    } catch (error) {
        productContainer.innerHTML = `<div class="product-not-found"><h1>Помилка завантаження</h1><a href="catalog.html">Повернутись до каталогу</a></div>`;
    }
}

loadProduct();
