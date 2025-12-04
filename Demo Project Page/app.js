// load express
const express = require("express");
// load handlebars
const exphbs = require("express-handlebars");

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

// home page or home route
app.get("/", async (req, res, next) => {
  try {
    const products = await getProducts();

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
    const response = await fetch(`https://dummyjson.com/products/${id}`);

    if (!response.ok)
      return res.status(404).render("404", { message: "Product not found" });

    const product = await response.json();
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

async function getProducts() {
  const promises = [];
  for (let i = 1; i < 10; i++) {
    promises.push(
      fetch(`https://dummyjson.com/products/${i}`)
        .then((res) => res.json())
        .then((p) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          category: p.category,
          price: Number(p.price).toFixed(2),
          rating: p.rating,
          discountPercentage: p.discountPercentage,
          thumbnail: p.thumbnail,
        }))
    );
  }
  return Promise.all(promises);
}

// Start the server
app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
