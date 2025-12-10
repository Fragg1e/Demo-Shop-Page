let basket = JSON.parse(localStorage.getItem("basket")) || [];


async function DisplayBasket(){
  for(productId of basket){
    const product = await GetBasketProduct(productId);
    console.log(product);
  }
}


function AddToBasket(product){
  console.log(`added ${product} Add to basket`)
  
  basket.push(product);
  DisplayBasket();
}



async function GetBasketProduct(id){
  try {
    const response = await fetch(`https://dummyjson.com/products/${id}`);
    const product = await response.json();
    return product;
      
    }
   catch (err) {
    console.log(err);
  }
}

