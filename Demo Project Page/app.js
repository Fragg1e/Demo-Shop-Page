// load express
const express = require("express");
// load handlebars
const exphbs = require("express-handlebars");

const session = require("express-session");

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

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let users = [];
let basketDetails = {};

const FileStore = require("session-file-store")(session);

app.use(session({
  store: new FileStore(),
  secret: "secret",
  resave: false,
  saveUninitialized: false
}));

app.use((req, res, next) => {
  res.locals.isLoggedIn = !!req.session.user;
  res.locals.user = req.session.user || null;
  next();
});



// home page or home route
app.get("/", async (req, res, next) => {
  try {
    const buyAgain = await GetBuyAgain();

    const highestRated = await GetHighestRated();

    state = { home: true };

    head = { title: "Home" };

    console.log("home");

    return res.render("index", { state, head, buyAgain, highestRated });
  } catch (err) {
    console.error(err);
    return next(err);
  }

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
app.get("/shop", async(req, res) => {

  const products = await GetAllProducts();
  state = { shop: true };
  head = { title: "Shop" };

  res.render("shop", { state, head, products});
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
app.get("/account", (req, res) => {
  const state = { account: true };
  const head = { title: "Account" };
  const currentUser = req.session.user || null;
  const fullUser = users.find(u => u.email === currentUser.email && u.password === currentUser.password);
  console.log(users);
  res.render("Account", { state, head, fullUser});
  console.log("account");
});


// contact route
app.get("/contact", (req, res) => {
  state = { contact: true };
  head = { title: "Contact" };
  res.render("contact", { state, head });
  console.log("contact");
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

    product.price = product.price * quantity;
    total += product.price;

    product.discountedPrice *= quantity;
    product.discountedPrice = Number(product.discountedPrice).toFixed(2);

    basketDetails.total = total;
    basketDetails.quantity = quantity;
  
    basketItems.push({
      product: product,
      quantity: quantity
    })
  }

  const state = { basket: true };
  const head = { title: "Basket" };
  res.render("basket", { state, head, basketItems, total});
  console.log("basket");
});


// contact route
app.get("/checkout", requireAuth, (req, res) => {
  const state = { checkout: true };
  const head = { title: "Checkout" };
  const user = req.session.user;

  res.render("checkout", {state, head, user, basketDetails});
  console.log("checkout");
});

app.post("/paymentDetails", requireAuth, (req, res) => {
  const paymentDetails = req.body;

  const index = users.findIndex(
    u => u.email === req.session.user.email
  );

  users[index].paymentDetails = paymentDetails;
  req.session.user = users[index];

  console.log("Current user", req.session.user);
  SaveSession(req, res, "/checkout");
});


// contact route
app.get("/register", (req, res) => {
  state = { register: true };
  head = { title: "Register" };
  res.render("register", { state, head});
  console.log("register");
});

app.post("/register", (req, res) => {
  const user = req.body;

  users.push(user);      
  req.session.user = user;

  SaveSession(req, res);
});

// contact route
app.get("/login", (req, res) => {
  const state = { login: true };
  const head = { title: "Login" };
  res.render("login", { state, head });
  console.log("login");
});

app.post("/login", (req, res) => {
  const {email} = req.body;
  console.log(users);

  const found = users.find(u => u.email === email );

  req.session.user = found;
  SaveSession(req, res)
});

app.get("/logout", (req, res) => {
  req.session.user = null;

  SaveSession(req, res)
});

app.post("/users", (req, res) => {
  users = req.body.users || [];  

  res.json({ success: true }); 

});


function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

function SaveSession(req, res, location = "/"){
  req.session.save(() => {
      res.redirect(location);
    });
}

async function GetBuyAgain() {
  const requests = [];

  for (let i = 125; i < 128; i++) {
    requests.push(GetProduct(i));
  }

  const products = await Promise.all(requests);

  return products;
}

async function GetHighestRated() {
  const requests = [];

  for (let i = 121; i < 137; i++) {
    requests.push(GetProduct(i));
  }

  const products = await Promise.all(requests);

  const highestRated = products.filter(p => p.rating >= 4);
  highestRated.sort((a, b) => a.rating - b.rating);


  return highestRated;
}

async function GetAllProducts() {
  try{
    const res = await fetch("https://dummyjson.com/products/category/smartphones")
    const p = await res.json(); 
    const products = p.products;
    products.forEach(product => {
      product.price = Number(product.price.toFixed(2));
      product.discountedPrice = Number((product.price - (product.price * (product.discountPercentage / 100))).toFixed(2));
    });
    
    return products;
    }
    catch(err){
      console.log(err);
    }
  
}




async function GetProduct(id) {
  try{
    const res = await fetch(`https://dummyjson.com/products/${id}`)
    const p = await res.json(); 

 
    const price = Number(p.price.toFixed(2));
    const discountedPrice = Number((p.price - (p.price * (p.discountPercentage / 100))).toFixed(2));

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
