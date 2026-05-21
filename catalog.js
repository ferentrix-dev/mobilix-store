const productsGrid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

function renderProducts(items) {
    productsGrid.innerHTML = "";

    items.forEach(product => {
        productsGrid.innerHTML += `
            <a href="product.html?id=${product.id}" class="product-card">
                <img src="${product.image}" alt="${product.title}">

                <span class="product-category-label">${product.category}</span>

                <h3>${product.title}</h3>

                <p>${product.description}</p>

                <strong>${product.price} ₴</strong>

                <div class="product-card-btn">
                    Переглянути товар
                </div>
            </a>
        `;
    });
}

function filterProducts() {
    const searchValue = searchInput.value.toLowerCase().trim();
    const categoryValue = categoryFilter.value;

    const filteredProducts = products.filter(product => {
        const titleMatch = product.title.toLowerCase().includes(searchValue);
        const categoryMatch = categoryValue === "all" || product.category === categoryValue;

        return titleMatch && categoryMatch;
    });

    renderProducts(filteredProducts);
}

searchInput.addEventListener("input", filterProducts);
categoryFilter.addEventListener("change", filterProducts);

renderProducts(products);