const API_URL = "https://site--mobilix-backend--98z6fhqjkxml.code.run";
const cartContainer = document.getElementById("cartContainer");

let products = [];

function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function getAvailableStock(product, item) {
    const variantName = item.variant || "Стандартний";

    if (variantName !== "Стандартний") {
        const variant = product.variants?.find(v => v.name === variantName);
        return Number(variant?.stock || 0);
    }

    return Number(product.stock || 0);
}

function getCartItemImage(product, item) {
    const variantName = item.variant || "Стандартний";

    if (variantName === "Стандартний") return product.image;

    const variant = product.variants?.find(v => v.name === variantName);
    return variant?.image || product.image;
}

function cleanCart() {
    const cleanItems = getCart()
        .map(item => {
            const product = products.find(p => p._id === item.id);
            if (!product) return null;

            const stock = getAvailableStock(product, item);
            if (stock <= 0) return null;

            return {
                ...item,
                quantity: Math.min(Number(item.quantity || 1), stock)
            };
        })
        .filter(Boolean);

    saveCart(cleanItems);
}

function changeQuantity(productId, variantName, amount) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId && (i.variant || "Стандартний") === variantName);
    const product = products.find(p => p._id === productId);

    if (!item || !product) return;

    const stock = getAvailableStock(product, item);

    if (amount > 0 && item.quantity >= stock) {
        showToast(`В наявності лише ${stock} шт.`, "error");
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
    const cart = getCart().filter(i => !(i.id === productId && (i.variant || "Стандартний") === variantName));
    saveCart(cart);
    renderCart();
}

function renderCart() {
    const cart = getCart();

    if (!cart.length) {
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

    const itemsHtml = cart.map(item => {
        const product = products.find(p => p._id === item.id);
        if (!product) return "";

        const variantText = item.variant || "Стандартний";
        const stock = getAvailableStock(product, item);
        const itemTotal = product.price * item.quantity;
        total += itemTotal;

        return `
            <div class="cart-item">
                <img src="${getCartItemImage(product, item)}" alt="${product.title}">

                <div class="cart-item-info">
                    <h3>${product.title}</h3>
                    <p>${product.category}</p>
                    <p class="cart-variant">Тип: ${variantText}</p>
                    <p class="cart-stock">В наявності: ${stock} шт.</p>
                </div>

                <div class="cart-quantity">
                    <button onclick="changeQuantity('${product._id}', '${variantText}', -1)">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQuantity('${product._id}', '${variantText}', 1)">+</button>
                </div>

                <div class="cart-item-total">${itemTotal} ₴</div>
                <button class="remove-btn" onclick="removeFromCart('${product._id}', '${variantText}')">Видалити</button>
            </div>
        `;
    }).join("");

    cartContainer.innerHTML = `
        <div class="cart-list">${itemsHtml}</div>
        <div class="cart-summary">
            <h2>Разом: ${total} ₴</h2>
            <a href="checkout.html" class="checkout-btn">Оформити замовлення</a>
        </div>
    `;
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/api/products`);
        products = await response.json();
        cleanCart();
        renderCart();
    } catch (error) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <h2>Помилка завантаження кошика</h2>
                <p>Спробуйте оновити сторінку.</p>
            </div>
        `;
    }
}

loadProducts();
