const {  request } = require("http");
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const { verify } = require("crypto");
const app = express();
const PORT = 8500

app.use(bodyParser.json());

// Mock Database
let users = [];
let products = [{
    id: 1,
    name: "Shalwarkameez",
    category: "Clothing",
    price: "Rs:2,999",
    rating: 4.7
  },
  {
    id: 2,
    name: "Shalwarkameez",
    category: "Clothing",
    price: "Rs:4,999",
    rating: 4.8
  },
  {
    id: 3,
    name: "ShalwarKameez",
    category: "Clothing",
    price: "Rs:3,999",
    rating: 4.5
  },
  {
    id: 4,
    name: "Laptop: acer i5 10th Generation",
    category: "Electronics",
    price: "Rs:24,999",
    rating: 4.6
  },
  {
    id: 5,
    name: "Laptop: Dell i7 8th Generation",
    category: "Electronics",
    price: "Rs:30,499",
    rating: 4.8
  },
  {
    id: 6,
    name: "Apple: MacBook",
    category: "Electronics",
    price: "Rs:2,50,499",
    rating: 4.7
  },
  {
    id: 7,
    name: "Samsung: Galaxy Z Fold",
    category: "Electronics",
    price: "Rs:15,499",
    rating: 4.7
  },
  {
    id: 8,
    name: "Iphone 14 proMax",
    category: "Electronics",
    price: "Rs:1,25,599",
    rating: 4.6
  },
  {
    id: 9,
    name: "Poco-X6-Pro-1",
    category: "Electronics",
    price: "Rs:20,599",
    rating: 4.8
  },
  {
    id: 10,
    name: "TShirt: React",
    category: "Clothing",
    price: "Rs:1,499",
    rating: 4.7
  },
  {
    id: 11,
    name: "Jeans",
    category: "Clothing",
    price: "Rs: 1,199",
    rating: 4.6
  },
  {
    id: 12,
    name: "SmartWatch",
    category: "Electronics",
    price: "Rs.77,999",
    rating: 4.7
  }
];

let cart = {};

//secrete Key for JWT
const SECRET_KEY = "your-secret-key";


const verifyToken = (request, response, next) => {
  const token = request.headers["authorization"]; // Correct extraction
  if (!token) return response.status(403).send("Token is required");

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return response.status(403).send("invalid token");
    request.userId = decoded.userId;
    next();
  });
};


//SignUp Route

app.post("/signup", async (request, response) => {
  const {
    username,
    password
  } = request.body;

  const userExists = users.find(user => user.username === username);
  if (userExists) return response.status(400).send("user allready exits");

  const writePassword = await bcrypt.hash(password, 8);

  const newUser = {
    id: 1,
    username: "Rehan",
    password: "Pass12345"
  };
  response.status(201).send("User register Successfully");
});

//Login Route

app.post("/login", async (request, response) => {
  const { username, password } = request.body;

  const user = users.find(user => user.username === username);
  if (!user) return response.status(400).send("Invalid username or Password");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return response.status(400).send("Invalid username or Password");

  const token = jwt.sign({ userId: user.id }, SECRET_KEY); // Generate JWT token
  response.json({ token });
});


//Product APIs
//1 Get 

app.get("/products", (request, response) => {
  response.json(products);
});

//2 Get Product by ID
app.get("/products/:id", (request, response) => {
  const product = products.find(p => p.id == request.params.id);
  if (!product) return response.status(404).send("Product not found");
  response.json(product);
});

// 3 Add a new product requires login 
app.post("/products", verifyToken, (request, response) => {
  const {
    name,
    category,
    price,
    rating
  } = request.body;

  const newProduct = {
    id: products.length + 1,
    name,
    category,
    price,
    rating
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

//4 Update Product by id (Requires login)

app.put("/products/:id", verifyToken, (request, response) => {
  const {
    name,
    category,
    price,
    rating
  } = request.body;
  const productIndex = products.findIndex(p => p.id == request.params.id);

  if (productIndex === -1) return response.status(404).send("Product not found");

  const updatedProdct = {
    id: request.params.id,
    name,
    category,
    price,
    rating
  };
  products[productIndex] = updatedProdct;
  response.json(updatedProdct);
});

// 5 Delete Token by Idv(Requires login)

app.delete("/products/:id", verifyToken, (request, response) => {
  const productIndex = products.findIndex(p => p.id == request.params.id);
  if (productIndex === -1) return response.status(404).send("Product not found");

  products.splice(productIndex, 1); // Use splice to remove an item from the array
  response.send("Product deleted successfully");
});

//Cart APIs

// 6. App Products in Cart (Requires Login)

app.post("/cart", verifyToken, (request, response) => {
  const {
    productId
  } = request.body;

  const product = products.find(p >= p.id === productId);
  if (!product) return response.status(404).send("Product not found");


  if (!carts[req.userId]) {
    carts[req.userId] = [];
  }

  carts[req.userId].push(product);
  res.status(200).send("Product added to cart");
});

// 7. Remove product from cart (requires login)
app.delete("/cart/:productId", verifyToken, (req, res) => {
  const {
    productId
  } = req.params;

  if (!carts[req.userId]) return res.status(400).send("Cart is empty");

  carts[req.userId] = carts[req.userId].filter(p => p.id != productId);
  res.status(200).send("Product removed from cart");
});

// 8. Get cart for user (requires login)
app.get("/cart", verifyToken, (req, res) => {
  res.json(carts[req.userId] || []);
});

// 9. Search products by name
app.get("/products/search/:name", (req, res) => {
  const result = products.filter(p => p.name.toLowerCase().includes(req.params.name.toLowerCase()));
  res.json(result);
});

// 10. Filter products by price range
app.get("/products/price/:min/:max", (req, res) => {
  const minPrice = parseFloat(req.params.min);
  const maxPrice = parseFloat(req.params.max);

  const result = products.filter(p => p.price >= minPrice && p.price <= maxPrice);
  res.json(result);
});




app.listen(PORT, () => console.log(`Server is Running on https://Localhost:${PORT}`))