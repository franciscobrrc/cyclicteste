const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Database connection
mongoose.connect('mongodb://localhost:27017/login-system', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});
const User = mongoose.model('User', userSchema);

// Hash the admin password
const adminPassword = '12345678'; // Replace this with the admin password
const hashedPassword = bcrypt.hashSync(adminPassword, 10); // Hashing the password with salt rounds 10

// Create the admin user object
const adminUser = new User({
    username: 'admin', // Set the admin username
    password: hashedPassword // Set the hashed password
});

// Save the admin user to the database
adminUser.save()
    .then(() => {
        console.log('Admin user created successfully');
        mongoose.connection.close(); // Close the database connection after saving the user
    })
    .catch(err => {
        console.error('Error creating admin user:', err);
        mongoose.connection.close(); // Close the database connection on error
    });
