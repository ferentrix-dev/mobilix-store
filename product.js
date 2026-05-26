const productContainer = document.getElementById("productContainer");

const params = new URLSearchParams(window.location.search);
const productId = Number(params.get("id"));

const product = products.find(item => item.id === productId);

let selectedVariant = product?.variants?.[0] || null;

if (!product) {
    productContainer.innerHTML = `
        <div class="product-not-found">
            <h1>Товар не знайдено</h1>
            <a href="catalog.html">Повернутись до каталогу</a>
        </div>
    `;
} else {
    renderProduct();
}

function renderProduct() {
    document.title = `${product.title} — Mobilix`;

    productContainer.innerHTML = `
        <div class="product-detail">

            <div class="product-detail-image">
                <img 
                    id="productImage"
                    src="${selectedVariant ? selectedVariant.image : product.image}" 
                    alt="${product.title}"
                >
            </div>

            <div class="product-detail-info">
                <span>${product.category}</span>

                <h1>${product.title}</h1>

                <p>${product.description}</p>

                <strong>${product.price} ₴</strong>

                ${
                    product.variants
                    ? `
                    <div class="variant-box">
                        <h4>Оберіть варіант:</h4>

                        <div class="variant-list">
                            ${product.variants.map((variant, index) => `
                                <button 
                                    class="variant-btn ${index === 0 ? "active" : ""}"
                                    onclick="selectVariant(${index})"
                                    ${!variant.inStock ? "disabled" : ""}
                                >
                                    ${variant.name}
                                </button>
                            `).join("")}
                        </div>
                    </div>
                    `
                    : ""
                }

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

function selectVariant(index) {
    selectedVariant = product.variants[index];

    document.getElementById("productImage").src = selectedVariant.image;

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