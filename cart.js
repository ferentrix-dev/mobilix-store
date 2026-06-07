const API_URL = "https://site--mobilix-backend--98z6fhqjkxml.code.run";

const cartContainer = document.getElementById("cartContainer");

let products = [];

function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

async function loadProducts() {
    const response = await fetch(`${API_URL}/api/products`);
    products = await response.json();

    cleanCart();
    renderCart();
}

function getAvailableStock(product, item) {
    const variantName = item.variant || "Стандартний";

    if (variantName !== "Стандартний") {
        const variant = product.variants?.find(v => v.name === variantName);
        return Number(variant?.stock || 0);
    }

    return Number(product.stock || 0);
}

function cleanCart() {
    let cart = getCart();

    cart = cart
        .map(item => {
            const product = products.find(p => p._id === item.id);

            if (!product) return null;

            const availableStock = getAvailableStock(product, item);

            if (availableStock <= 0) return null;

            if (item.quantity > availableStock) {
                item.quantity = availableStock;
            }

            return item;
        })
        .filter(Boolean);

    saveCart(cart);
}

function getCartItemImage(product, item) {
    const variantName = item.variant || "Стандартний";

    if (variantName === "Стандартний") {
        return product.image;
    }

    const variant = product.variants?.find(v => v.name === variantName);

    return variant?.image || product.image;
}

function renderCart() {
    const cart = getCart();

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <h2>Кошик порожній</h2>
                <p>Додайте товари з каталогу.</p>
                <a href="catalog.html">Перейти до каталогу</a>
            </div>
        `;
        return;
    }

    let total = 0;

    cartContainer.innerHTML = `
        <div class="cart-list">
            ${cart.map(item => {
                const product = products.find(p => p._id === item.id);

                if (!product) return "";

                const variantText = item.variant || "Стандартний";
                const availableStock = getAvailableStock(product, item);
                const itemTotal = product.price * item.quantity;

                total += itemTotal;

                return `
                    <div class="cart-item">
                        <img src="${getCartItemImage(product, item)}" alt="${product.title}">

                        <div class="cart-item-info">
                            <h3>${product.title}</h3>
                            <p>${product.category}</p>

                            <p class="cart-variant">
                                Тип: ${variantText}
                            </p>

                            <p class="cart-stock">
                                В наявності: ${availableStock} шт.
                            </p>
                        </div>

                        <div class="cart-quantity">
                            <button onclick="changeQuantity('${product._id}', '${variantText}', -1)">−</button>
                            <span>${item.quantity}</span>
                            <button onclick="changeQuantity('${product._id}', '${variantText}', 1)">+</button>
                        </div>

                        <div class="cart-item-total">
                            ${itemTotal} ₴
                        </div>

                        <button class="remove-btn" onclick="removeFromCart('${product._id}', '${variantText}')">
                            Видалити
                        </button>
                    </div>
                `;
            }).join("")}
        </div>

        <div class="cart-summary">
            <h2>Разом: ${total} ₴</h2>

            <a href="checkout.html" class="checkout-btn">
                Оформити замовлення
            </a>
        </div>
    `;
}

function changeQuantity(productId, variantName, amount) {
    const cart = getCart();

    const item = cart.find(i =>
        i.id === productId && (i.variant || "Стандартний") === variantName
    );

    if (!item) return;

    const product = products.find(p => p._id === productId);

    if (!product) {
        removeFromCart(productId, variantName);
        return;
    }

    const availableStock = getAvailableStock(product, item);

    if (amount > 0 && item.quantity >= availableStock) {
        showToast(`В наявності лише ${availableStock} шт.`, "error");
        return;
    }

    item.quantity += amount;

    if (item.quantity <= 0) {
        removeFromCart(productId, variantName);
        return;
    }

    saveCart(cart);
    renderCart();
}

function removeFromCart(productId, variantName) {
    const cart = getCart().filter(i =>
        !(i.id === productId && (i.variant || "Стандартний") === variantName)
    );

    saveCart(cart);
    renderCart();
}

loadProducts();