// server.js
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files (your frontend)
app.use(express.static('public'));

// Redirect root URL to pre-sign-in.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Path to json-user.json
const USER_FILE = './public/json-user.json';

// Helper function to read users from json-user.json
function readUsers() {
  try {
    const data = fs.readFileSync(USER_FILE);
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading users file:', err);
    return [];
  }
}

// Helper function to write users to json-user.json
function writeUsers(users) {
  try {
    fs.writeFileSync(USER_FILE, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error writing users file:', err);
  }
}

// Endpoint to register a new user
app.post('/signup', (req, res) => {
  const { email, password } = req.body;

  // Load existing users
  let users = readUsers();

  // Check if the email is already registered
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'Email is already registered!' });
  }

  // Create a new user object
  const newUser = {
    id: Date.now().toString(),
    email,
    password,
    username: '',
    address: '',
    phone: ''
  };

  // Append the new user
  users.push(newUser);

  // Save updated users back to the file
  writeUsers(users);

  res.status(201).json({ message: 'Sign Up successful!', userId: newUser.id });
});

// Endpoint to authenticate a user
app.post('/signin', (req, res) => {
  const { email, password } = req.body;

  // Load existing users
  const users = readUsers();

  // Find the user by email
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    res.status(200).json({ message: 'Sign In successful!', userId: user.id });
  } else {
    res.status(401).json({ message: 'Invalid email or password!' });
  }
});

// Endpoint to fetch user data by ID
app.get('/user/:id', (req, res) => {
  const userId = req.params.id;

  // Load existing users
  const users = readUsers();

  // Find the user by ID
  const user = users.find(u => u.id === userId);
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ message: 'User not found!' });
  }
});

// Endpoint to update user profile
app.post('/update-profile', (req, res) => {
  const { userId, username, address, phone } = req.body;

  // Load existing users
  let users = readUsers();

  // Find the user by ID
  const user = users.find(u => u.id === userId);
  if (user) {
    user.username = username || user.username;
    user.address = address || user.address;
    user.phone = phone || user.phone;

    // Save updated users back to the file
    writeUsers(users);

    res.status(200).json({ message: 'Profile updated successfully!' });
  } else {
    res.status(404).json({ message: 'User not found!' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});