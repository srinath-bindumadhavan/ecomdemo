const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const csv = require('csv-parser');
const fs = require('fs');
const session = require('express-session');
app.set('view engine', 'ejs');

app.set('views', __dirname + '/views');
// Set up session middleware
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Function to check login credentials against the CSV file
function checkLogin(username, password, callback) {
  fs.createReadStream('user_credentials.csv')
    .pipe(csv())
    .on('data', (row) => {
      if (row.username === username && row.password === password) {
        // Match found, user is authenticated
        callback(true);
      }
    })
    .on('end', () => {
      // No match found, user is not authenticated
      callback(false);
    });
}

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.isAuthenticated) {
    return next();
  }
  res.redirect('/login');
}


const products = [

  { id: 1, name: 'Product 1', price: 10 },

  { id: 2, name: 'Product 2', price: 20 },

  { id: 3, name: 'Product 3', price: 30 },

];

var cart = [];
let cartItem;   


// Routes
app.get('/', (req, res) => {
  res.render('login');
});

app.get('/register-form', (req, res) => {
  res.render('register' , { errorMessage: req.session.errorMessage });
});

app.get('/products', isAuthenticated, (req, res) => {
  res.render('products', { products, cart: req.session.cart });
});

app.get('/cart', isAuthenticated, (req, res) => {
  res.render('cart', { cart: req.session.cart });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  checkLogin(username, password, (isAuthenticated) => {
    if (isAuthenticated) {
      req.session.isAuthenticated = true;
      req.session.cart = [];
      res.redirect('/products');
    } else {
      res.render('login', { errorMessage: 'Invalid username or password' });
    }
  })
});

app.get('/logout', (req, res) => {
  // Destroy the user's session to log them out
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    // Redirect the user to the login page
    res.redirect('/');
  });
});

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

  function isUsernameTaken(username, callback) {
    let isTaken = false
    const readStream =fs.createReadStream('user_credentials.csv')
    readStream
      .pipe(csv())
      .on('data', (row) => {
        if (row.username === username) {
          // Username is already taken
          isTaken = true;
          console.log("Matched!!")
        }
      })
      .on('end', () => {
        callback(isTaken);
      });
  }
  
  // Route for handling the registration form submission
  app.post('/register', (req, res) => {
    const { username, password } = req.body;
    console.log('Starting!')
    // Check if the username is already taken
    isUsernameTaken(username, (usernameTaken) => {
      if (usernameTaken) {
        // Username is already taken, display an error message
        res.render('register', { errorMessage: 'Username already exists' });
        console.log('Username taken! printed error message and should stop here')

        return;
      } 
      // Username is available, add the new user to the CSV file
      const newUser = { username, password };
      console.log('uh-oh')
      // Append the new user to the CSV file
      const csvData = `${newUser.username},${newUser.password}\n`;
      fs.appendFile('user_credentials.csv', csvData, (err) => {
        if (err) {
          console.error('Error writing to CSV file:', err);
          res.render('register', { errorMessage: 'Registration failed' });
        } else {
          // Registration successful, redirect to the login page
          res.redirect('/');
        }
        });
      
    });
  });


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
