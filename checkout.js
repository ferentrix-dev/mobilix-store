const API_URL = "https://mobilix-backend-production.up.railway.app";

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

cityInput.addEventListener("input", async () => {
    const search = cityInput.value.trim();

    if (search.length < 2) {
        citiesList.innerHTML = "";
        citiesList.style.display = "none";
        return;
    }

    const response = await fetch(`${API_URL}/api/cities?search=${encodeURIComponent(search)}`);
    const cities = await response.json();

    citiesList.innerHTML = "";

    cities.forEach(city => {
        const item = document.createElement("div");
        item.className = "suggestion-item";
        item.textContent = `${city.Description} (${city.AreaDescription})`;

        item.onclick = () => {
            selectedCity = city;
            cityInput.value = city.Description;
            citiesList.style.display = "none";
            loadWarehouses(city.Ref);
        };

        citiesList.appendChild(item);
    });

    citiesList.style.display = cities.length ? "block" : "none";
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

function redirectToLiqPay(data, signature) {
    const form = document.createElement("form");

    form.method = "POST";
    form.action = "https://www.liqpay.ua/api/3/checkout";
    form.acceptCharset = "utf-8";

    form.innerHTML = `
        <input type="hidden" name="data" value="${data}">
        <input type="hidden" name="signature" value="${signature}">
    `;

    document.body.appendChild(form);
    form.submit();
}

checkoutForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
        showToast("Кошик порожній", "error");
        return;
    }

    const items = cart.map(item => {
        const product = products.find(p => p._id === item.id);

        if (!product) return "";

        const variant = item.variant || "Стандартний";

        return `${product.title} (${variant}) x${item.quantity}`;
    }).join("\n");

    const total = cart.reduce((sum, item) => {
        const product = products.find(p => p._id === item.id);

        if (!product) return sum;

        return sum + product.price * item.quantity;
    }, 0);

    const paymentMethod = document.getElementById("paymentMethod").value;

    const order = {
        surname: document.getElementById("customerSurname").value.trim(),
        name: document.getElementById("customerName").value.trim(),
        middleName: document.getElementById("customerMiddleName").value.trim(),
        phone: document.getElementById("customerPhone").value.trim(),
        city: cityInput.value.trim(),
        warehouse: warehouseSelect.value,
        comment: document.getElementById("customerComment").value.trim(),
        paymentMethod,
        items,
        total,
        cart
    };

    if (paymentMethod === "online") {
        const orderId = "mobilix-" + Date.now();

        const paymentResponse = await fetch(`${API_URL}/api/create-payment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                amount: total,
                orderId,
                order
            })
        });

        const paymentData = await paymentResponse.json();

        if (!paymentData.success) {
            showToast("Помилка створення оплати", "error");
            return;
        }

        redirectToLiqPay(paymentData.data, paymentData.signature);
        return;
    }

    const response = await fetch(`${API_URL}/api/order`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(order)
    });

    if (response.ok) {
        localStorage.removeItem("cart");
        showToast("Замовлення успішно оформлено");

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);
    } else {
        showToast("Помилка оформлення замовлення", "error");
    }
});

loadProducts();