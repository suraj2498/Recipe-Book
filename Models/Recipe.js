const mongoose = require('mongoose');

const RecipeSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    recipeImage: {
        type: String,
        required: false
    },
    time: {
        type: Number,
        required: false
    },
    category: {
        type: String,
        required: true
    },
    ingredients: {
        type: Array,
        required: true
    },
    instructions: {
        type: Array,
        required: true
    }
});

module.exports = mongoose.model('recipe', RecipeSchema);