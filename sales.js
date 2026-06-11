const API_URL = "https://site--mobilix-backend--98z6fhqjkxml.code.run";

const salesGrid = document.getElementById("salesGrid");

let products = [];

function getProductImages(product) {
    const images = product.images && product.images.length
        ? product.images
        : [product.image];

    return images.filter(Boolean).slice(0, 5);
}

function getAvailableVariants(product) {
    return (product.variants || []).filter(variant => Number(variant.stock || 0) > 0);
}

function getLowestPrice(product) {
    const variants = getAvailableVariants(product);

    if (!variants.length) {
        return Number(product.price || 0);
    }

    return Math.min(...variants.map(variant => Number(variant.price || product.price || 0)));
}

function getDiscountPercent(product) {
    const price = getLowestPrice(product);
    const oldPrice = Number(product.oldPrice || 0);

    if (!oldPrice || oldPrice <= price) {
        return 0;
    }

    return Math.round(((oldPrice - price) / oldPrice) * 100);
}

function renderSalesProducts(items) {
    if (!items.length) {
        salesGrid.innerHTML = `
            <div class="empty-cart">
                <h2>Акційних товарів поки немає</h2>
                <p>Загляньте пізніше або перегляньте весь каталог.</p>
                <a href="catalog.html">Перейти до каталогу</a>
            </div>
        `;
        return;
    }

    salesGrid.innerHTML = items.map(product => {
        const images = getProductImages(product);
        const price = getLowestPrice(product);
        const oldPrice = Number(product.oldPrice || 0);
        const discount = getDiscountPercent(product);

        return `
            <a href="product.html?id=${product._id}" class="product-card">
                <div class="product-badges">
                    <span class="badge-discount">-${discount}%</span>
                </div>

                <div class="catalog-gallery">
                    <img src="${images[0] || product.image}" alt="${product.title}">
                </div>

                <span class="product-category-label">${product.category}</span>
                <h3>${product.title}</h3>
                <p>${product.description || ""}</p>

                <div class="product-price-box">
                    <span class="old-price">${oldPrice} ₴</span>
                    <strong>${price} ₴</strong>
                </div>

                <div class="product-card-btn">Переглянути товар</div>
            </a>
        `;
    }).join("");
}

async function loadSalesProducts() {
    try {
        const response = await fetch(`${API_URL}/api/products`);
        products = await response.json();

        const salesProducts = products.filter(product => getDiscountPercent(product) > 0);

        renderSalesProducts(salesProducts);
    } catch {
        salesGrid.innerHTML = `
            <div class="empty-cart">
                <h2>Помилка завантаження</h2>
                <p>Спробуйте оновити сторінку.</p>
            </div>
        `;
    }
}

loadSalesProducts();