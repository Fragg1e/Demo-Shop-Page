let basket = JSON.parse(localStorage.getItem("basket")) || []; //gets basket from local storage or makes a new one if there is none 

function SaveBasket() {
  localStorage.setItem("basket", JSON.stringify(basket));
}

function AddToBasket(productID){
  basket.push(productID);
  alert("Added item to basket!"); 

  SendBasketToServer();
  SaveBasket();
}

async function RemoveFromBasket(productID){
  const index = basket.indexOf(productID);
  basket.splice(index, 1);
  alert("Removed item from basket!");

  SaveBasket();
  await SendBasketToServer();
  location.reload(); //refreshes page so basket updates for user
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
  const cards = Array.from(grid.querySelectorAll(".product-card")); //gets all product cards in the product grid div

  const compare = { //stores all the different sorting types 
    "rating-desc": (a, b) => Number(b.dataset.rating) - Number(a.dataset.rating),
    "price-asc":   (a, b) => Number(a.dataset.price) - Number(b.dataset.price),
    "price-desc":  (a, b) => Number(b.dataset.price) - Number(a.dataset.price),
    "title-asc":   (a, b) => a.dataset.title.localeCompare(b.dataset.title),
  }[value]; //this will be a value like "rating-desc" that determins what kind of sort will happen

  cards.sort(compare).forEach(card => grid.appendChild(card)); //sorts the cards based on the compare and adds each card back into the grid now sorted
}


if(sortSelect){ //if sort select exists (if user is on the right page) listen for the change in sorting type
  sortSelect.addEventListener("change", (e) => SortCards(e.target.value));
  SortCards(sortSelect.value); 
}

document.addEventListener("DOMContentLoaded", () => {
  if(basket.length > 0){
    SendBasketToServer(); //if there are items in the basket when the page loads send them to the server 
  }
  console.log("Loaded basket from storage:", basket);
});

