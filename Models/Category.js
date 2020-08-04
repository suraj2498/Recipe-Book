const mongoose = require('mongoose');

const CategorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('categorie', CategorySchema);