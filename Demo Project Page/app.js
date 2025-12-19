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

    const state = { home: true };

    const head = { title: "Home" };

    const meta = {
      description: "Smarter Phones - Ireland's best online smartphone store. Buy quality smartphones at great prices with free delivery across Ireland. Latest models, customer reviews, and expert advice.",
      keywords: "smartphones, mobile phones, buy phones online Ireland, smartphone store, iPhone, Samsung, smartphone deals, phone shop Ireland, mobile phone retailer, best smartphone prices"
    }

    console.log("home");

    return res.render("index", { state, head, meta, buyAgain, highestRated });
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
  const state = { shop: true };
  const head = { title: "Shop" };
  const meta = {
      description: "Browse our complete smartphone collection - Latest iPhone, Samsung, and Android models. Compare prices, read reviews, and find the perfect phone. Free delivery across Ireland.",
      keywords: "smartphone shop, buy smartphones online, phone catalogue, smartphone collection, mobile phone store, phone deals, smartphone prices, phone reviews, latest smartphones, phone comparison"
    }

  res.render("shop", { state, head, meta, products});
  console.log("shop");
});


app.get("/about_us", (req, res) => {
  const state = { about_us: true };
  const head = { title: "About us" };
  const meta = {
      description: "Learn about Smarter Phones - Ireland's trusted smartphone retailer since the 2000s. Our mission is to bring you the best quality smartphones at the best prices.",
      keywords: "about Smarter Phones, smartphone retailer Ireland, phone store history, trusted phone retailer, smartphone company Ireland, phone shop about us, mobile phone retailer"
    }

  res.render("about_us", { state, head, meta});
  console.log("about_us");
});


app.get("/account", (req, res) => {
  const state = { account: true };
  const head = { title: "Account" };
  const meta = {
      description: "Manage your Smarter Phones account. View your details, delivery address, order history, and payment information. Update your account settings anytime.",
      keywords: "my account, account management, customer account, order history, account settings, profile"
    }

  const currentUser = req.session.user || null;
  const fullUser = users.find(u => u.email === currentUser.email && u.password === currentUser.password);

  res.render("Account", { state, head, meta, fullUser});
  console.log("account");
});



app.get("/contact", (req, res) => {
  const state = { contact: true };
  const head = { title: "Contact" };
  const meta = {
      description: "Contact Smarter Phones customer service. Reach us by phone, email, or submit a query. Open Monday-Friday 9:30-18:30, Saturday 9:30-16:00. We're here to help!",
      keywords: "contact Smarter Phones, customer service Ireland, phone shop contact, smartphone store contact, customer support, phone retailer Ireland contact, Smarter Phones phone number"
    }

  res.render("contact", { state, head, meta});
  console.log("contact");
});


app.post("/basket", (req, res) => {
  const { basket} = req.body;

  req.session.basket = basket;

  res.json({ success: true });
});

app.get("/basket", async (req, res) => {

  const state = { basket: true };
  const head = { title: "Basket" };
  const meta = {
      description: "Review your shopping basket at Smarter Phones. Check your selected smartphones, quantities, and total price. Ready to checkout? Complete your purchase securely.",
      keywords: "shopping basket, cart, shopping cart, basket review, checkout, smartphone cart, order review"
    }

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
  let basketItems = []
  
  for(const id in basketTrack){
    const product = await GetProduct(id);
    const quantity = basketTrack[id];

    product.price *= quantity;
    total += product.price;

    product.discountedPrice *= quantity;
    product.discountedPrice = Number(product.discountedPrice).toFixed(2);

    basketItems.push({
      product: product,
      quantity: quantity
    })
  }

   const basketDetails = {
    items: basketItems,
    total: Number(total.toFixed(2)),
    totalQuantity: basket.length // Total items in basket
  };

  req.session.basketDetails = basketDetails;

  res.render("basket", { state, head, meta, basketItems, total});
  console.log("basket");
});



app.get("/checkout", requireAuth, (req, res) => {
  const state = { checkout: true };
  const head = { title: "Checkout" };
  const meta = {
      description: "Complete your smartphone purchase securely at Smarter Phones. Review your order, enter payment details, and get free delivery across Ireland. Secure checkout guaranteed.",
      keywords: "checkout, secure payment, buy smartphones, complete purchase, payment, order confirmation, secure checkout Ireland"
    }
  
  const user = req.session.user;

  const basketDetails = req.session.basketDetails;

  res.render("checkout", {state, head, meta, user, basketDetails});
  console.log("checkout");
});

app.get("/ordered", (req, res) => {
  const state = { ordered: true };
  const head = { title: "Ordered" };
  const meta = {
      description: "Thank you for your order at Smarter Phones! Your order has been confirmed.Free delivery across Ireland.",
      keywords: "order confirmation, thank you, order received, purchase confirmed, order complete"
    }

  req.session.basket = [];
  req.session.basketDetails = null;

  res.render("ordered", {state, head, meta});
  console.log("ordered");
});


app.get("/register", (req, res) => {
  const state = { register: true };
  const head = { title: "Register" };
  const meta = {
      description: "Create your free Smarter Phones account. Save your delivery address, track orders, and enjoy faster checkout. Register now and start shopping for smartphones.",
      keywords: "register Smarter Phones, create account, sign up, new customer registration, smartphone store account, member registration"
    }

  res.render("register", { state, head, meta});
  console.log("register");
});

app.post("/register", (req, res) => {
  const user = req.body;

  users.push(user);      
  req.session.user = user;

  SaveSession(req, res);
});


app.get("/login", (req, res) => {
  const state = { login: true };
  const head = { title: "Login" };
  const meta = {
      description: "Login to your Smarter Phones account. Access your order history, saved addresses, and manage your account. New customer? Register for free today.",
      keywords: "Smarter Phones login, account login, customer account, smartphone store login, member login, sign in"
    }

  res.render("login", { state, head, meta});
  console.log("login");
});

app.post("/login", (req, res) => {
  const {email} = req.body;

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
