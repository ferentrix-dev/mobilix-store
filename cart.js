const cartContainer = document.getElementById("cartContainer");

function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
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
                const product = products.find(p => p.id === item.id);
                if (!product) return "";

                const itemTotal = product.price * item.quantity;
                total += itemTotal;

                return `
                    <div class="cart-item">
                        <img src="${product.image}" alt="${product.title}">

                        <div class="cart-item-info">
                            <h3>${product.title}</h3>
                            <p>Варіант: ${item.variant || "Стандартний"}</p>
                            <p>${product.category}</p>
                            <strong>${product.price} ₴</strong>
                        </div>

                        <div class="cart-quantity">
                            <button onclick="changeQuantity(${product.id}, -1)">−</button>
                            <span>${item.quantity}</span>
                            <button onclick="changeQuantity(${product.id}, 1)">+</button>
                        </div>

                        <div class="cart-item-total">
                            ${itemTotal} ₴
                        </div>

                        <button class="remove-btn" onclick="removeFromCart(${product.id})">
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

function changeQuantity(productId, amount) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        const updatedCart = cart.filter(i => i.id !== productId);
        saveCart(updatedCart);
    } else {
        saveCart(cart);
    }

    renderCart();
}

function removeFromCart(productId) {
    const cart = getCart().filter(i => i.id !== productId);
    saveCart(cart);
    renderCart();
}

renderCart();