// load express
const express = require("express");
// load handlebars
const exphbs = require("express-handlebars");

const session = require("express-session");

// instantiate express
const app = express();

// configure express to use handlebars as templating engine
app.engine(
  "hbs",
  exphbs.engine({
    extname: ".hbs",
    // use this layout by default - if you have different layout
    // for say home page - you can toggle this in your code
    defaultLayout: "default",
    // set location of layouts
    layoutsDir: "views/layouts",
    // set location of partials - header, footer, etc
    partialsDir: "views/partials",
  })
);
// set the view engine to handlesbards
app.set("view engine", "hbs");
// where to find all of the view
app.set("views", "views");
// where to find static files - css, images, js
app.use(express.static("public"));

app.use(express.json());

app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: true
}));


// home page or home route
app.get("/", async (req, res, next) => {
  try {
    const products = await GetProducts();

    state = { home: true };

    head = { title: "Home" };

    console.log("home");

    return res.render("index", { state, head, products });
  } catch (err) {
    console.error(err);
    return next(err);
  }

  // send this to terminal where node app is running
});

app.get("/products/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = await GetProduct(id);
    const head = { title: product.title };
    const state = { productPage: true };

    return res.render("productPage", { head, state, product });
  } catch (err) {
    return next(err);
  }
});

// contact route
app.get("/shop", (req, res) => {
  state = { shop: true };
  head = { title: "Shop" };
  res.render("shop", { state, head });
  console.log("shop");
});

// contact route
app.get("/about_us", (req, res) => {
  state = { about_us: true };
  head = { title: "About us" };
  res.render("about_us", { state, head });
  console.log("about_us");
});

// contact route
app.get("/contact", (req, res) => {
  state = { contact: true };
  head = { title: "Contact" };
  res.render("contact", { state, head });
  console.log("contact");
});

app.get("/checkout", (req, res) => {
  state = { checkout: true };
  head = { title: "Checkout" };
  res.render("checkout", { state, head });
  console.log("checkout");
});

// contact route
app.post("/basket", (req, res) => {
  
  const { basket} = req.body;
  req.session.basket = basket;
  res.json({ success: true }); 

});

app.get("/basket", async (req, res) => {

  const basket = req.session.basket || [];

  const basketTrack = {};
  let total = 0;

  for(const id of basket){
  if(basketTrack[id] == null){
    basketTrack[id] = 1;
    }
  else{
    basketTrack[id]++;
    }
  }
  basketItems = []
  
  for(const id in basketTrack){
    const product = await GetProduct(id);
    const quantity = basketTrack[id];
    product.price *= quantity;
    total += product.price;
    product.discountedPrice *= quantity;
    basketItems.push({
      product: product,
      quantity: quantity
    })
  }

  state = { basket: true };
  head = { title: "Basket" };
  res.render("basket", { state, head, basketItems, total});
  console.log("basket");
});


// contact route
app.get("/checkout", (req, res) => {
  state = { checkout: true };
  const loggedIn = false;
  head = { title: "Checkout" };
  res.render("checkout", { state, head, loggedIn});
  console.log("checkout");
});

// contact route
app.get("/register", (req, res) => {
  state = { register: true };
  head = { title: "Register" };
  res.render("register", { state, head});
  console.log("register");
});

// contact route
app.get("/login", (req, res) => {
  state = { login: true };
  head = { title: "Login" };
  res.render("login", { state, head });
  console.log("login");
});

async function GetProducts() {
  const requests = [];

  for (let i = 1; i < 10; i++) {
    requests.push(GetProduct(i));
  }

  const products = await Promise.all(requests);

  return products;
}


async function GetProduct(id) {
  try{
    const res = await fetch(`https://dummyjson.com/products/${id}`)
    const p = await res.json(); 
    const price = Number(p.price.toFixed(2));
    const discountedPrice = (p.price - (p.price * (p.discountPercentage / 100))).toFixed(2);

    return {
    id: p.id,
    title: p.title,
    description: p.description,
    category: p.category,
    price: price,
    discountPercentage: p.discountPercentage,
    discountedPrice: discountedPrice,
    rating: p.rating,
    stock: p.stock,
    tags: p.tags,
    brand: p.brand,
    weight: p.weight,
    dimensions:
        {
          width: p.dimensions.width,
          height: p.dimensions.height,
          depth: p.dimensions.depth,
        },
    warrantyInformation: p.warrantyInformation,
    shippingInformation: p.shippingInformation,
    availabilityStatus: p.availabilityStatus,
    reviews: p.reviews,
    images: p.images,
    thumbnail: p.thumbnail,
  }; 

  } catch (err){
    console.log(err);
  }
}


// Start the server
app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
