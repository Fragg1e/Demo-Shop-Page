const express = require("express");
const exphbs = require("express-handlebars");
const session = require("express-session"); 
const FileStore = require("session-file-store")(session); //load in depedancies 

var formatter = new Intl.NumberFormat("en-US"); //formats numbers to have commas

const app = express(); //initialise express

app.engine( //tells express where to find all my handlebars code
  "hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: "default",
    layoutsDir: "views/layouts",
    partialsDir: "views/partials",
  })
);
app.set("view engine", "hbs"); //tells express im using handlebars

app.set("views", "views");

app.use(express.static("public")); //where my css js files are

app.use(express.urlencoded({ extended: true })); //tells express to turn data from forms to readable json data. Extended allows for nested data which i need since im sending express an array of users 
app.use(express.json()); //allows express to read the json data that i get from the forms

let users = []; //stores all users 

app.use(session({
  store: new FileStore(), //stores sessions in files to persist server resets
  secret: "secret",
  resave: false,
  saveUninitialized: false
}));

app.use((req, res, next) => {
  res.locals.isLoggedIn = !!req.session.user; //allows my whole environment to see if someone is logged in
  res.locals.user = req.session.user || null; //and also who is logged in
  next();
});

app.get("/", async (req, res, next) => { //home page
  try {
    const state = { home: true };
    const head = { title: "Home" };
    const meta = {
      description: "Smarter Phones - Ireland's best online smartphone store. Buy quality smartphones at great prices with free delivery across Ireland. Latest models, customer reviews, and expert advice.",
      keywords: "smartphones, mobile phones, buy phones online Ireland, smartphone store, iPhone, Samsung, smartphone deals, phone shop Ireland, mobile phone retailer, best smartphone prices"
    }

    const buyAgain = await GetBuyAgain(); //gets products for home page
    const highestRated = await GetHighestRated();

    console.log("home");
    return res.render("index", { state, head, meta, buyAgain, highestRated }); //passes them into the page

  } catch (err) {
    console.error(err);
    return next(err);
  }

});

app.get("/products/:id", async (req, res, next) => { //individual product page
  try {
    const id = req.params.id; //gets the id from the call
    const product = await GetProduct(id); //gets product with that id

    const head = { title: product.title };
    const state = { productPage: true };


    return res.render("productPage", { head, state, product }); //passes into page
  } catch (err) {
    return next(err);
  }
});

app.get("/shop", async(req, res) => {
  
  const state = { shop: true };
  const head = { title: "Shop" };
  const meta = {
      description: "Browse our complete smartphone collection - Latest iPhone, Samsung, and Android models. Compare prices, read reviews, and find the perfect phone. Free delivery across Ireland.",
      keywords: "smartphone shop, buy smartphones online, phone catalogue, smartphone collection, mobile phone store, phone deals, smartphone prices, phone reviews, latest smartphones, phone comparison"
    }

  const products = await GetAllProducts(); 

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

  res.render("Account", { state, head, meta});
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


app.post("/basket", (req, res) => { //gets updated basket array from browser 
  const { basket} = req.body;

  req.session.basket = basket; //sets current session basket to it to sync the two

  res.json({ success: true }); //returns success or page just loops 
});

app.get("/basket", async (req, res) => {

  const state = { basket: true };
  const head = { title: "Basket" };
  const meta = {
      description: "Review your shopping basket at Smarter Phones. Check your selected smartphones, quantities, and total price. Ready to checkout? Complete your purchase securely.",
      keywords: "shopping basket, cart, shopping cart, basket review, checkout, smartphone cart, order review"
    }

  const basket = req.session.basket || []; //gets current session basket or null if there is none
  const basketTrack = {}; //this is to keep track of product amounts
  let basketItems = [] //this will store the actual product not just ids
  let total = 0;

  for(const id of basket){ //goes through every item in basket and adds to basketTrack dictionary to stop dupilcates in basket
  if(basketTrack[id] == null){//if products isnt already in basket
    basketTrack[id] = 1; //add it
    }
  else{
    basketTrack[id]++; //if it is just up amount by 1
    }
  }
  
  
  for(const id in basketTrack){
    const product = await GetProduct(id); //gets product based on its ID
    const quantity = basketTrack[id];

    product.price *= quantity;
    product.discountedPrice *= quantity; //adjust for quantity

    total += product.discountedPrice; //tallys total
    
    basketItems.push({
      product: product,
      quantity: quantity
    })
  }
   const basketDetails = { //stores basket information in the session for checkout 
    items: basketItems,
    total: Number(total).toFixed(2),
  };

  req.session.basketDetails = basketDetails;
  
  res.render("basket", { state, head, meta, basketItems, total});
  console.log("basket");
});

app.get("/checkout", requireAuth, (req, res) => { //can only go to checkout if logged in
  const state = { checkout: true };
  const head = { title: "Checkout" };
  const meta = {
      description: "Complete your smartphone purchase securely at Smarter Phones. Review your order, enter payment details, and get free delivery across Ireland. Secure checkout guaranteed.",
      keywords: "checkout, secure payment, buy smartphones, complete purchase, payment, order confirmation, secure checkout Ireland"
    }
  
  const basketDetails = req.session.basketDetails;

  res.render("checkout", {state, head, meta, basketDetails});
  console.log("checkout");
});

app.get("/ordered", (req, res) => {
  const state = { ordered: true };
  const head = { title: "Ordered" };
  const meta = {
      description: "Thank you for your order at Smarter Phones! Your order has been confirmed. Free delivery across Ireland.",
      keywords: "order confirmation, thank you, order received, purchase confirmed, order complete"
    }

  req.session.basket = []; //clears basket after order
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

app.post("/register", (req, res) => { //gets information from registration form
  const user = req.body;

  users.push(user); //adds it to users array
  req.session.user = user; //sets current user to newly registerd user

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

app.post("/login", (req, res) => { //only gets email from login form 
  const {email} = req.body;

  const currentUser = users.find(u => u.email === email ); //uses that email to find full user details
  req.session.user = currentUser; //sets them to be current user

  SaveSession(req, res)
});

app.get("/logout", (req, res) => {
  req.session.user = null;

  SaveSession(req, res)
});

app.post("/users", (req, res) => {
  users = req.body.users || [];  //gets list of users from browser and updates server side array
  res.json({ success: true });
});


function requireAuth(req, res, next) { //if no one is logged in forces user to login page
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

function SaveSession(req, res, location = "/"){ //saves the session to avoid sync issues
  req.session.save(() => {
      res.redirect(location);
    });
}

async function GetAllProducts() { //gets all smartphones from the dummy json api
  try{
    const res = await fetch("https://dummyjson.com/products/category/smartphones")
    const p = await res.json(); 
    const products = p.products;

    products.forEach(product => { //formats the prices and adds the discounted prioe field
      product.price = Number(product.price.toFixed(2));
      product.discountedPrice = Number((product.price - (product.price * (product.discountPercentage / 100))).toFixed(2));
    });
    
    return products;
    }
    catch(err){
      console.log(err);
    }
}

async function GetBuyAgain() {
  const requests = [];

  for (let i = 125; i < 128; i++) { //just random products now but could be implemented to have actual buy again products
    requests.push(GetProduct(i));
  }

  const products = await Promise.all(requests); //gets all products at once and returns them simultaniously 

  return products;
}

async function GetHighestRated() {

  const products = await GetAllProducts();

  const highestRated = products.filter(p => p.rating >= 4); //filters only 4 star and above items 
  highestRated.sort((a, b) => a.rating - b.rating); //sorts products into highest rated first

  return highestRated;
}

async function GetProduct(id) { //gets a product from the api based on its id
  try{
    const res = await fetch(`https://dummyjson.com/products/${id}`)
    const p = await res.json(); 

 
    const price = Number(p.price.toFixed(2)); //formats prices 
    const discountedPrice = Number((p.price - (p.price * (p.discountPercentage / 100))).toFixed(2));
    //adds discounted price field from discount percentage 

    return { //all of the fields from the api
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
