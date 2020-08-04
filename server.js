const express = require('express');
const connectDB = require('./config/db');
const app = express();

//  Connect to Mongo
connectDB();
// Body Parser Middleware
app.use(express.json({ extended: false }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/recipes', require('./routes/recipeRoutes'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server Started successfully on port ${PORT}`));