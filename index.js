//-------------------------------------------------------------------------------- meu abaixo

require('dotenv').config();
//--------------------------------------------------------------------------------

const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//--------------------------------------------------------------------------------meu abaixo

const Book = require("./models/users");
//--------------------------------------------------------------------------------

const app = express();
const activeSessions = {}; // Object to store active sessions

//--------------------------------------------------------------------------------meu abaixo
const PORT = process.env.PORT || 3000

mongoose.set('strictQuery', false);
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

//--------------------------------------------------------------------------------


/* Database connection
mongoose.connect('mongodb://localhost:27017/login-system', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));
*/

// User schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: { type: String, default: 'user' } // Default role is 'user'
});
const User = mongoose.model('User', userSchema);

// Hash the admin password
const adminPassword = '12345678'; // Replace this with the admin password
const hashedPassword = bcrypt.hashSync(adminPassword, 10); // Hashing the password with salt rounds 10

// Create the admin user object
const adminUser = new User({
    username: 'admin', // Set the admin username
    password: hashedPassword, // Set the hashed password
    role: 'admin' // Set role to 'admin' for the admin user
});

// Save the admin user to the database
adminUser.save()
    .then(() => console.log('Admin user created successfully'))
    .catch(err => console.error('Error creating admin user:', err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(flash());

// Authentication middleware
const requireLogin = (req, res, next) => {
    if (req.session.username) {
        next(); // Continue to the next middleware or route handler
    } else {
        res.redirect('/admin/login'); // Redirect to the admin login page if not authenticated
    }
};

// Routes
// Redirect root route to the user login page
app.get('/', (req, res) => {
    res.redirect('/login');
});

// User login page
app.get('/login', (req, res) => {
    res.render('user_login.ejs', { error: req.flash('error') });
});

// User login form submission
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/login');
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            req.flash('error', 'Invalid password');
            return res.redirect('/login');
        }

        req.session.username = username;
        req.flash('success', 'Logged in successfully');
        res.redirect('/user/dashboard');
    } catch (error) {
        console.error('Error logging in:', error);
        req.flash('error', 'An error occurred while logging in');
        res.redirect('/login');
    }
});

// User dashboard route
app.get('/user/dashboard', requireLogin, (req, res) => {
    res.render('user_dashboard.ejs', { username: req.session.username }); // Pass the username to the template
});


// Admin login page
app.get('/admin/login', (req, res) => {
    res.render('admin_login.ejs', { error: req.flash('error') });
});

// Admin login form submission
app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !bcrypt.compareSync(password, user.password)) {
        req.flash('error', 'Invalid username or password');
        res.redirect('/admin/login');
    } else {
        req.session.username = username;
        activeSessions[req.session.id] = username;
        res.redirect('/admin/dashboard');
    }
});

// Logout route
app.post('/logout', (req, res) => {
    delete activeSessions[req.session.id]; // Remove the session from activeSessions upon logout
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
        } else {
            res.sendStatus(200);
        }
    });
});

// Admin dashboard route
app.get('/admin/dashboard', requireLogin, (req, res) => {
    if (req.session.username) {
        const users = Object.values(activeSessions).map(username => ({ username }));
        res.render('admin_dashboard.ejs', { users });
    } else {
        req.flash('error', 'You do not have permission to access the admin dashboard');
        res.redirect('/admin/login');
    }
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


