const API_URL = "https://mobilix-backend-production.up.railway.app";

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

    renderCart();
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

                const itemTotal = product.price * item.quantity;
                total += itemTotal;

                const variantText = item.variant || "Стандартний";

                return `
                    <div class="cart-item">
                        <img src="${getCartItemImage(product, item)}" alt="${product.title}">

                        <div class="cart-item-info">
                            <h3>${product.title}</h3>
                            <p>${product.category}</p>

                            <p class="cart-variant">
                                Тип: ${variantText}
                            </p>

                            <strong>${product.price} ₴</strong>
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

function getCartItemImage(product, item) {
    if (!item.variant || item.variant === "Стандартний") {
        return product.image;
    }

    const variant = product.variants?.find(v => v.name === item.variant);

    return variant?.image || product.image;
}

function changeQuantity(productId, variantName, amount) {
    const cart = getCart();

    const item = cart.find(i =>
        i.id === productId && (i.variant || "Стандартний") === variantName
    );

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        saveCart(cart.filter(i =>
            !(i.id === productId && (i.variant || "Стандартний") === variantName)
        ));
    } else {
        saveCart(cart);
    }

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