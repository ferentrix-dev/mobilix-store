const API_URL = "https://site--mobilix-backend--98z6fhqjkxml.code.run";
const cartContainer = document.getElementById("cartContainer");

let products = [];

function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function getProductImages(product) {
    const images = product.images?.length ? product.images : [product.image];
    return images.filter(Boolean);
}

function getVariant(product, item) {
    const variantName = item.variant || "Стандартний";

    if (variantName === "Стандартний") {
        return null;
    }

    return product.variants?.find(variant => variant.name === variantName) || null;
}

function getItemStock(product, item) {
    const variant = getVariant(product, item);
    return Number(variant ? variant.stock : product.stock || 0);
}

function getItemPrice(product, item) {
    const variant = getVariant(product, item);
    return Number(variant?.price || product.price || 0);
}

function getItemImage(product, item) {
    const variant = getVariant(product, item);

    if (variant?.image) {
        return variant.image;
    }

    return getProductImages(product)[0] || "";
}

function normalizeCart() {
    const cart = getCart();

    const normalizedCart = cart
        .map(item => {
            const product = products.find(product => product._id === item.id);

            if (!product) {
                return null;
            }

            const stock = getItemStock(product, item);

            if (stock <= 0) {
                return null;
            }

            return {
                ...item,
                price: getItemPrice(product, item),
                quantity: Math.min(Number(item.quantity || 1), stock)
            };
        })
        .filter(Boolean);

    saveCart(normalizedCart);
}

function changeQuantity(productId, variantName, amount) {
    const cart = getCart();
    const item = cart.find(item => {
        return item.id === productId && (item.variant || "Стандартний") === variantName;
    });

    const product = products.find(product => product._id === productId);

    if (!item || !product) return;

    const stock = getItemStock(product, item);

    if (amount > 0 && item.quantity >= stock) {
        showToast(`В наявності лише ${stock} шт.`, "error");
        return;
    }

    item.quantity += amount;
    item.price = getItemPrice(product, item);

    if (item.quantity <= 0) {
        removeFromCart(productId, variantName);
        return;
    }

    saveCart(cart);
    renderCart();
}

function removeFromCart(productId, variantName) {
    const cart = getCart().filter(item => {
        return !(item.id === productId && (item.variant || "Стандартний") === variantName);
    });

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
        const product = products.find(product => product._id === item.id);
        if (!product) return "";

        const variantName = item.variant || "Стандартний";
        const price = getItemPrice(product, item);
        const stock = getItemStock(product, item);
        const itemTotal = price * item.quantity;

        total += itemTotal;

        return `
            <div class="cart-item">
                <img src="${getItemImage(product, item)}" alt="${product.title}">

                <div class="cart-item-info">
                    <h3>${product.title}</h3>
                    <p>${product.category}</p>
                    <p class="cart-variant">Тип: ${variantName}</p>
                    <p class="cart-stock">В наявності: ${stock} шт.</p>
                    <p>Ціна: ${price} ₴</p>
                </div>

                <div class="cart-quantity">
                    <button onclick="changeQuantity('${product._id}', '${variantName}', -1)" type="button">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQuantity('${product._id}', '${variantName}', 1)" type="button">+</button>
                </div>

                <div class="cart-item-total">${itemTotal} ₴</div>

                <button class="remove-btn" onclick="removeFromCart('${product._id}', '${variantName}')" type="button">
                    Видалити
                </button>
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

        normalizeCart();
        renderCart();
    } catch {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <h2>Помилка завантаження кошика</h2>
                <p>Спробуйте оновити сторінку.</p>
            </div>
        `;
    }
}

loadProducts();