const express = require('express');

const app = express();

const port = process.env.PORT || 3000;

const bodyParser = require('body-parser');

 

// TO DO:

// 1. Login page logic

// 2. Add cart outline

// 3. Add login error message: fix login.ejs form

// 4. Add product Selection

 

app.set('view engine', 'ejs');

app.set('views', __dirname + '/views');

 

// Users (should be stored in a database)

const users = [{ username: 'srinath', password: '3' }];

 

// Products

const products = [

  { id: 1, name: 'Product 1', price: 10 },

  { id: 2, name: 'Product 2', price: 20 },

  { id: 3, name: 'Product 3', price: 30 },

];

 

var cart = [];
let cartItem;   
 

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

 

// Login Page

app.get('/', (req, res) => {

  res.render('login');

});

 

// Product Selection Page

app.get('/products', (req, res) => {

  res.render('products', { products , cart});

});

 

// Handle User Login

app.post('/login', (req, res) => {

  const { username, password } = req.body;

 

  // Match user (should be checked against a database)

  const user = users.find((user) => user.username === username && user.password === password);

 

  if (user) {

    // Success: Redirect to product selection page

    res.redirect('/products');

  } else {

    // Fail: Display login error message

    res.render('login', { errorMessage: 'Invalid username or password' });

  }

});

 

// Add to Cart Route

app.post('/add-to-cart', (req, res) => {

  const productId = req.body.productId;

  const quantity = parseInt(req.body.quantity, 10);
  let cartItem;

  // Find the product in your data based on the productId

const product = products.find((p) => p.id === productId);

 

  if (product) {

    // Calculate the total price for the cart item

    const total = product.price * quantity;

 

    // Create a cart item object and add it to the cart array

    const cartItem = {

    productId: product.id,

    name: product.name,

    quantity: quantity,

    price: product.price,

    total: total,

    };


    res.render('products', { products, cartItem });
    cart.push(cartItem);

  }

 

  // Redirect the user back to the product selection page

  res.redirect('/products');

});

 

// Cart Page

app.get('/cart', (req, res) => {

  res.render('cart', { cart: cart });

});

 

app.listen(port, () => {

  console.log(`Server is running on port ${port}`);

});