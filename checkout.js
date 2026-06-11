const API_URL = "https://site--mobilix-backend--98z6fhqjkxml.code.run";

const cityInput = document.getElementById("cityInput");
const citiesList = document.getElementById("citiesList");
const warehouseSelect = document.getElementById("warehouseSelect");
const checkoutForm = document.getElementById("checkoutForm");

let products = [];
let selectedCityRef = null;

async function loadProducts() {
    const response = await fetch(`${API_URL}/api/products`);
    products = await response.json();
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

function validateCart(cart) {
    if (!cart.length) {
        showToast("Кошик порожній", "error");
        return false;
    }

    for (const item of cart) {
        const product = products.find(product => product._id === item.id);

        if (!product) {
            showToast("У кошику є товар, якого вже немає в наявності", "error");
            return false;
        }

        const stock = getItemStock(product, item);

        if (stock <= 0 || item.quantity > stock) {
            showToast(`Недостатньо товару: ${product.title}`, "error");
            return false;
        }
    }

    return true;
}

function normalizePhone(phone) {
    return phone.trim().replace(/\s+/g, "");
}

function isValidPhone(phone) {
    return /^(\+380|380|0)\d{9}$/.test(phone);
}

async function loadCities(search) {
    const response = await fetch(`${API_URL}/api/cities?search=${encodeURIComponent(search)}`);
    return response.json();
}

async function loadWarehouses(cityRef) {
    warehouseSelect.innerHTML = `<option value="">Завантаження відділень...</option>`;

    const response = await fetch(`${API_URL}/api/warehouses?cityRef=${cityRef}`);
    const warehouses = await response.json();

    warehouseSelect.innerHTML = `<option value="">Оберіть відділення</option>`;

    warehouses.forEach(warehouse => {
        const option = document.createElement("option");
        option.value = warehouse.Description;
        option.textContent = warehouse.Description;
        warehouseSelect.appendChild(option);
    });
}

cityInput.addEventListener("input", async () => {
    const search = cityInput.value.trim();

    if (search.length < 2) {
        citiesList.innerHTML = "";
        citiesList.style.display = "none";
        return;
    }

    const cities = await loadCities(search);

    citiesList.innerHTML = cities.map(city => `
        <div class="suggestion-item" data-ref="${city.Ref}" data-city="${city.Description}">
            ${city.Description} (${city.AreaDescription})
        </div>
    `).join("");

    citiesList.style.display = cities.length ? "block" : "none";

    document.querySelectorAll(".suggestion-item").forEach(item => {
        item.addEventListener("click", () => {
            selectedCityRef = item.dataset.ref;
            cityInput.value = item.dataset.city;
            citiesList.style.display = "none";
            loadWarehouses(selectedCityRef);
        });
    });
});

checkoutForm.addEventListener("submit", async event => {
    event.preventDefault();

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (!validateCart(cart)) return;

    const phone = normalizePhone(document.getElementById("customerPhone").value);

    if (!isValidPhone(phone)) {
        showToast("Введіть коректний номер телефону", "error");
        return;
    }

    const normalizedCart = cart.map(item => {
        const product = products.find(product => product._id === item.id);

        return {
            ...item,
            price: getItemPrice(product, item)
        };
    });

    const items = normalizedCart.map(item => {
        const product = products.find(product => product._id === item.id);
        const variantName = item.variant || "Стандартний";
        const price = getItemPrice(product, item);
        const lineTotal = price * item.quantity;

        return `${product.title} (${variantName}) x${item.quantity} — ${lineTotal} ₴`;
    }).join("\n");

    const total = normalizedCart.reduce((sum, item) => {
        const product = products.find(product => product._id === item.id);
        return sum + getItemPrice(product, item) * item.quantity;
    }, 0);

    const order = {
        surname: document.getElementById("customerSurname").value.trim(),
        name: document.getElementById("customerName").value.trim(),
        middleName: document.getElementById("customerMiddleName").value.trim(),
        phone,
        paymentMethod: document.getElementById("paymentMethod").value,
        city: cityInput.value.trim(),
        warehouse: warehouseSelect.value,
        comment: document.getElementById("customerComment").value.trim(),
        items,
        total,
        cart: normalizedCart
    };

    try {
        const response = await fetch(`${API_URL}/api/order`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(order)
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.success) {
            showToast(data.message || "Помилка оформлення замовлення", "error");
            return;
        }

        localStorage.setItem("lastOrderNumber", String(data.orderNumber || ""));
        localStorage.removeItem("cart");
        window.location.href = "success.html";
    } catch {
        showToast("Помилка з'єднання з сервером", "error");
    }
});

loadProducts();