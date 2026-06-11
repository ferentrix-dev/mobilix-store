const API_URL = "https://site--mobilix-backend--98z6fhqjkxml.code.run";
const productContainer = document.getElementById("productContainer");

const productId = new URLSearchParams(window.location.search).get("id");

let product = null;
let selectedVariant = null;
let currentImageIndex = 0;

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

function getProductImages() {
    const images = product.images?.length ? product.images : [product.image];
    return images.filter(Boolean).slice(0, 5);
}

function getAvailableVariants() {
    return (product.variants || []).filter(variant => Number(variant.stock || 0) > 0);
}

function getCurrentPrice() {
    return Number(selectedVariant?.price || product.price || 0);
}

function getCurrentStock() {
    return Number(selectedVariant?.stock ?? product.stock ?? 0);
}

function updateSeo() {
    const images = getProductImages();
    const title = `${product.title} — купити в Україні | Mobilix`;
    const description = `${product.title}. ${product.description || ""}. Ціна ${getCurrentPrice()} ₴. Доставка Новою Поштою по Україні.`;

    document.title = title;
    updateMetaDescription(description);
    setMetaProperty("og:title", title);
    setMetaProperty("og:description", description);
    setMetaProperty("og:type", "product");
    setMetaProperty("og:image", images[0] || "");
    setMetaProperty("og:url", window.location.href);
}

function animateImageChange(image, src) {
    if (!image || !src) return;

    image.classList.remove("image-switch");
    void image.offsetWidth;
    image.src = src;
    image.classList.add("image-switch");
}

function changeProductImage(direction) {
    const images = getProductImages();

    if (images.length < 2) return;

    currentImageIndex += direction;

    if (currentImageIndex < 0) currentImageIndex = images.length - 1;
    if (currentImageIndex >= images.length) currentImageIndex = 0;

    animateImageChange(document.getElementById("productImage"), images[currentImageIndex]);
}

function selectVariant(index) {
    selectedVariant = getAvailableVariants()[index];

    if (!selectedVariant) return;

    document.getElementById("productPrice").textContent = `${getCurrentPrice()} ₴`;
    document.getElementById("productStock").textContent = `В наявності: ${getCurrentStock()} шт.`;

    if (selectedVariant.image) {
        animateImageChange(document.getElementById("productImage"), selectedVariant.image);
    }

    document.querySelectorAll(".variant-btn").forEach((button, buttonIndex) => {
        button.classList.toggle("active", buttonIndex === index);
    });
}

function addToCart(productId) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const variantName = selectedVariant?.name || "Стандартний";
    const stock = getCurrentStock();
    const price = getCurrentPrice();

    if (stock <= 0) {
        showToast("Товару немає в наявності", "error");
        return;
    }

    const existingItem = cart.find(item => {
        return item.id === productId && (item.variant || "Стандартний") === variantName;
    });

    if (existingItem) {
        if (existingItem.quantity >= stock) {
            showToast(`В наявності лише ${stock} шт.`, "error");
            return;
        }

        existingItem.quantity += 1;
        existingItem.price = price;
    } else {
        cart.push({
            id: productId,
            variant: variantName,
            quantity: 1,
            price
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.location.href = "cart.html";
}

function toggleFavorite(productId) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

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
    const images = getProductImages();
    const variants = getAvailableVariants();

    productContainer.innerHTML = `
        <div class="product-detail">
            <div class="product-detail-image product-gallery">
                ${images.length > 1 ? `
                    <button class="gallery-arrow left" onclick="changeProductImage(-1)" type="button">‹</button>
                    <button class="gallery-arrow right" onclick="changeProductImage(1)" type="button">›</button>
                ` : ""}

                <img id="productImage" src="${selectedVariant?.image || images[0]}" alt="${product.title}">
            </div>

            <div class="product-detail-info">
                <span>${product.category}</span>
                <h1>${product.title}</h1>
                <p>${product.description || ""}</p>

                <strong id="productPrice">${getCurrentPrice()} ₴</strong>
                <p class="product-stock" id="productStock">В наявності: ${getCurrentStock()} шт.</p>

                ${variants.length ? `
                    <div class="variant-box">
                        <h4>Оберіть тип:</h4>

                        <div class="variant-list">
                            ${variants.map((variant, index) => `
                                <button class="variant-btn ${index === 0 ? "active" : ""}" onclick="selectVariant(${index})" type="button">
                                    ${variant.name} · ${Number(variant.price || product.price)} ₴ · ${variant.stock} шт.
                                </button>
                            `).join("")}
                        </div>
                    </div>
                ` : ""}

                <button onclick="addToCart('${product._id}')" type="button">Додати у кошик</button>

                <button onclick="toggleFavorite('${product._id}')" class="product-favorite-btn" type="button">
                    <i class="fa-regular fa-heart"></i>
                    Додати в обране
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

            productContainer.innerHTML = `
                <div class="product-not-found">
                    <h1>Товар не знайдено</h1>
                    <a href="catalog.html">Повернутись до каталогу</a>
                </div>
            `;

            return;
        }

        selectedVariant = getAvailableVariants()[0] || null;

        updateSeo();
        renderProduct();
    } catch {
        productContainer.innerHTML = `
            <div class="product-not-found">
                <h1>Помилка завантаження</h1>
                <a href="catalog.html">Повернутись до каталогу</a>
            </div>
        `;
    }
}

loadProduct();