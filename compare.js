const compareContainer =
document.getElementById(
"compareContainer"
);

const compareIds =
JSON.parse(
localStorage.getItem("compare")
) || [];

const compareProducts =
products.filter(product=>
compareIds.includes(product.id)
);

if(compareProducts.length===0){

compareContainer.innerHTML=`
<div class="empty-cart">
<h2>Немає товарів</h2>
</div>
`;

}else{

compareContainer.innerHTML=`

<table class="compare-table">

<tr>
<th>Назва</th>

${compareProducts.map(product=>
`<td>${product.title}</td>`
).join("")}

</tr>

<tr>

<th>Ціна</th>

${compareProducts.map(product=>
`<td>${product.price} ₴</td>`
).join("")}

</tr>

<tr>

<th>Категорія</th>

${compareProducts.map(product=>
`<td>${product.category}</td>`
).join("")}

</tr>

<tr>

<th>Опис</th>

${compareProducts.map(product=>
`<td>${product.description}</td>`
).join("")}

</tr>

</table>

`;

}