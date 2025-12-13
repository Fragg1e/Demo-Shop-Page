let basket = JSON.parse(localStorage.getItem("basket")) || [];

function saveBasket() {
  localStorage.setItem("basket", JSON.stringify(basket));
}

function AddToBasket(productID, title){
  basket.push(productID);
  console.log(productID);
  sendBasketToServer();
  saveBasket();
}

async function sendBasketToServer() {
  const response = await fetch("/basket", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ basket })
  });

  const result = await response.json();
  console.log("Server response:", result);
}

document.addEventListener("DOMContentLoaded", () => {
  sendBasketToServer();
  console.log("Loaded basket from storage:", basket);

});


