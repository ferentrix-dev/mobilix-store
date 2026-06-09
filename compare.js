const API_URL = "https://site--mobilix-backend--98z6fhqjkxml.code.run";
const compareContainer = document.getElementById("compareContainer");

let products = [];

function getCompare() {
    return JSON.parse(localStorage.getItem("compare")) || [];
}

function saveCompare(compare) {
    localStorage.setItem("compare", JSON.stringify(compare));
}

function cleanCompare() {
    saveCompare(getCompare().filter(id => products.some(product => product._id === id)));
}

function removeCompare(productId) {
    saveCompare(getCompare().filter(id => id !== productId));
    renderCompare();
}

function renderCompare() {
    const compareProducts = products.filter(product => getCompare().includes(product._id));

    if (!compareProducts.length) {
        compareContainer.innerHTML = `
            <div class="empty-cart">
                <h2>Немає товарів</h2>
                <p>Додайте товари для порівняння з каталогу.</p>
                <a href="catalog.html">Перейти до каталогу</a>
            </div>
        `;
        return;
    }

    compareContainer.innerHTML = `
        <table class="compare-table">
            <tr>
                <th>Назва</th>
                ${compareProducts.map(product => `
                    <td>
                        <strong>${product.title}</strong><br><br>
                        <button class="remove-compare-btn" onclick="removeCompare('${product._id}')">✕ Видалити</button>
                    </td>
                `).join("")}
            </tr>
            <tr><th>Ціна</th>${compareProducts.map(product => `<td>${product.price} ₴</td>`).join("")}</tr>
            <tr><th>Категорія</th>${compareProducts.map(product => `<td>${product.category}</td>`).join("")}</tr>
            <tr><th>Опис</th>${compareProducts.map(product => `<td>${product.description}</td>`).join("")}</tr>
        </table>
    `;
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/api/products`);
        products = await response.json();
        cleanCompare();
        renderCompare();
    } catch (error) {
        compareContainer.innerHTML = `<div class="empty-cart"><h2>Помилка завантаження</h2><p>Спробуйте оновити сторінку.</p></div>`;
    }
}

loadProducts();
