let basket = JSON.parse(localStorage.getItem("basket")) || [];

function SaveBasket() {
  localStorage.setItem("basket", JSON.stringify(basket));
}

function AddToBasket(productID, title){
  basket.push(productID);
  alert("Added", title, "to basket!");
  SendBasketToServer();
  SaveBasket();
}

async function RemoveFromBasket(productID){
  const index = basket.indexOf(productID);
  basket.splice(index, 1);
  SaveBasket();
  await SendBasketToServer();
  location.reload();
}

async function SendBasketToServer() {
  
  const res = await fetch("/basket", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ basket })
  });
  console.log(res)

}

const sortSelect = document.getElementById("sort-select");
const grid = document.getElementById("product-grid");

function SortCards(value) {
  const cards = Array.from(grid.querySelectorAll(".product-card"));

  const compare = {
    "rating-desc": (a, b) => Number(b.dataset.rating) - Number(a.dataset.rating),
    "price-asc":   (a, b) => Number(a.dataset.price) - Number(b.dataset.price),
    "price-desc":  (a, b) => Number(b.dataset.price) - Number(a.dataset.price),
    "title-asc":   (a, b) => a.dataset.title.localeCompare(b.dataset.title),
  }[value];

  cards.sort(compare).forEach(card => grid.appendChild(card));
}


if(sortSelect){
  sortSelect.addEventListener("change", (e) => SortCards(e.target.value));
  SortCards(sortSelect.value);
}

document.addEventListener("DOMContentLoaded", () => {
  if(basket.length > 0){
    SendBasketToServer();
  }
  console.log("Loaded basket from storage:", basket);
});

