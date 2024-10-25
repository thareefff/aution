const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const app = express();
const path = require('path');

app.use(express.json()); // Middleware to parse JSON data

// Session setup (session-based authentication)
app.use(session({
    secret: 'sG8yNHFoQmq5JhL8df7v2/JLFlEsYuZh2htW6tk9xdw',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/auction-platform')
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));


// User schema and model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Product schema and model
const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    highestBid: { type: Number, default: 0 }
});
const Product = mongoose.model('Product', productSchema);

// Authentication Middleware (session-based)
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'You must be logged in to access this resource' });
    }
}

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Handle form submissions
app.use(express.urlencoded({ extended: true }));

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Store user ID in session
        req.session.userId = user._id;
        res.redirect('/'); // Redirect to the home page after login
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Register route
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        // Store user ID in session
        req.session.userId = newUser._id;
        res.redirect('/');
    } catch (err) {
        if (err.code === 11000) { // Handle unique constraint error (duplicate email/username)
            res.status(400).json({ error: 'Email or username already exists' });
        } else {
            res.status(500).json({ error: 'Error registering user' });
        }
    }
});

// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error logging out' });
        }
        res.redirect('/login.html'); // Redirect to login page after logout
    });
});

// Add product route (Protected)
// Add product route (Protected)
app.post('/add-product', isAuthenticated, async (req, res) => {
    const { title, description, price } = req.body;

    try {
        // Create a new product with the provided data
        const newProduct = new Product({
            title,
            description,
            price,
            highestBid: 0 // Initially, the highest bid is 0
        });

        // Save the product to the MongoDB database
        await newProduct.save();

        // Respond with success
        res.status(201).json({ message: 'Product added successfully' });
    } catch (err) {
        // Handle any errors
        console.error('Error adding product:', err);
        res.status(500).json({ error: 'Error adding product' });
    }
});

// Bidding route (Protected)
app.post('/bid/:productId', isAuthenticated, async (req, res) => {
    const { bidAmount } = req.body;
    const { productId } = req.params;

    try {
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        if (bidAmount > product.highestBid) {
            product.highestBid = bidAmount;
            await product.save();
            res.status(200).json({ message: 'Bid placed successfully' });
        } else {
            res.status(400).json({ error: 'Bid must be higher than the current highest bid' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error placing bid' });
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

// Check session status
app.get('/check-session', (req, res) => {
    if (req.session.userId) {
        res.json(true); // User is logged in
    } else {
        res.json(false); // User is not logged in
    }
});
