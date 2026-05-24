const compareContainer =
document.getElementById(
"compareContainer"
);

function removeCompare(productId){

    let compare =
    JSON.parse(
    localStorage.getItem("compare")
    ) || [];

    compare =
    compare.filter(
    id => id !== productId
    );

    localStorage.setItem(
    "compare",
    JSON.stringify(compare)
    );

    location.reload();
}

const compareIds =
JSON.parse(
localStorage.getItem("compare")
) || [];

const compareProducts =
products.filter(product =>
compareIds.includes(product.id)
);

if(compareProducts.length===0){

compareContainer.innerHTML=`
<div class="empty-cart">

<h2>Немає товарів</h2>

<p>
Додайте товари для порівняння
</p>

</div>
`;

}else{

compareContainer.innerHTML=`

<table class="compare-table">

<tr>

<th>Назва</th>

${compareProducts.map(product => `
<td>

${product.title}

<br><br>

<button
class="remove-compare-btn"
onclick="removeCompare(${product.id})"
>

✕ Видалити

</button>

</td>
`).join("")}

</tr>

<tr>

<th>Ціна</th>

${compareProducts.map(product =>
`<td>${product.price} ₴</td>`
).join("")}

</tr>

<tr>

<th>Категорія</th>

${compareProducts.map(product =>
`<td>${product.category}</td>`
).join("")}

</tr>

<tr>

<th>Опис</th>

${compareProducts.map(product =>
`<td>${product.description}</td>`
).join("")}

</tr>

</table>
`;
}