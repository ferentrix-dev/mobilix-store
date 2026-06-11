const API_URL = "https://site--mobilix-backend--98z6fhqjkxml.code.run";

const cityInput = document.getElementById("cityInput");
const citiesList = document.getElementById("citiesList");
const warehouseSelect = document.getElementById("warehouseSelect");
const checkoutForm = document.getElementById("checkoutForm");

let products = [];
let selectedCity = null;

async function loadProducts() {
    const response = await fetch(`${API_URL}/api/products`);
    products = await response.json();
}

function getProductStock(product, item) {
    const variantName = item.variant || "Стандартний";

    if (variantName !== "Стандартний") {
        const variant = product.variants?.find(v => v.name === variantName);
        return Number(variant?.stock || 0);
    }

    return Number(product.stock || 0);
}

function validateCart(cart) {
    for (const item of cart) {
        const product = products.find(p => p._id === item.id);

        if (!product) {
            showToast("У кошику є товар, якого вже немає в наявності", "error");
            return false;
        }

        const stock = getProductStock(product, item);

        if (stock <= 0 || item.quantity > stock) {
            showToast(`Недостатньо товару: ${product.title}`, "error");
            return false;
        }
    }

    return true;
}

cityInput.addEventListener("input", async () => {
    const search = cityInput.value.trim();

    if (search.length < 2) {
        citiesList.innerHTML = "";
        citiesList.style.display = "none";
        return;
    }

    const response = await fetch(`${API_URL}/api/cities?search=${encodeURIComponent(search)}`);
    const cities = await response.json();

    citiesList.innerHTML = cities.map(city => `
        <div class="suggestion-item" data-ref="${city.Ref}" data-city="${city.Description}">
            ${city.Description} (${city.AreaDescription})
        </div>
    `).join("");

    citiesList.style.display = cities.length ? "block" : "none";

    document.querySelectorAll(".suggestion-item").forEach(item => {
        item.onclick = () => {
            selectedCity = item.dataset.ref;
            cityInput.value = item.dataset.city;
            citiesList.style.display = "none";
            loadWarehouses(selectedCity);
        };
    });
});

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

checkoutForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (!cart.length) {
        showToast("Кошик порожній", "error");
        return;
    }

    if (!validateCart(cart)) return;

    const phone = document.getElementById("customerPhone").value.trim();

    if (!/^(\+380|380|0)\d{9}$/.test(phone)) {
        showToast("Введіть коректний номер телефону", "error");
        return;
    }

    const items = cart.map(item => {
        const product = products.find(p => p._id === item.id);
        const variant = item.variant || "Стандартний";
        return `${product.title} (${variant}) x${item.quantity}`;
    }).join("\n");

    const total = cart.reduce((sum, item) => {
        const product = products.find(p => p._id === item.id);
        return sum + product.price * item.quantity;
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
        cart
    };

    const response = await fetch(`${API_URL}/api/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
    });

    if (response.ok) {
        const data = await response.json().catch(() => ({}));

        if (data.orderNumber) {
            localStorage.setItem("lastOrderNumber", String(data.orderNumber));
        }

        localStorage.removeItem("cart");
        window.location.href = "success.html";
    } else {
        const data = await response.json().catch(() => ({}));
        showToast(data.message || "Помилка оформлення замовлення", "error");
    }
});

loadProducts();