// We'll need the model for a recipe
const express= require('express');
const router = express.Router();
const Recipe = require('../Models/Recipe');
const Category = require('../Models/Category');
const multer = require('multer');
const { findById, findByIdAndUpdate } = require('../Models/Recipe');

// Multer stuff for storing images upon recipe creation
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './uploads/'),
    filename: (req, file, cb) => {
        cb(null, `${Math.floor(Math.random()*100000)}-${file.originalname }`);
    }
});
const fileFilter = (req, file, cb) => ((file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') ? cb(null, true) : cb(null, false));
const upload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 10
    },
    fileFilter
});

// Add A recipe
router.post('/', upload.single('recipeImage') ,async (req, res) => {
    console.log(req.file);
    //req.body will hold the stuff
    try {
        const { name, time, ingredients, instructions, category } = req.body;
        const { path } = req.file;

        // Check for existing recipe name
        let recipe = await Recipe.findOne({ name });
        if(recipe){
            res.status(400).json({ msg: 'There is already a recipe with this name' });
        }
        // Save the data to the DB
        const newRecipe = new Recipe({
            name,
            time,
            ingredients,
            instructions,
            category,
            recipeImage: path
        });

        await newRecipe.save();
        
        const dbCategory = await Category.findOne({name: category});
        if(dbCategory){
            await Category.findOneAndUpdate({name: category}, {$set: { count: dbCategory.count + 1 }});
        } 
        else {
            const newCategory = new Category({
                name: category,
                count: 1
            });
            await newCategory.save();
        }

        res.status(200).json(newRecipe);
    } catch (err) {
        console.error(`Error is:  ${err}`);
        res.status(500).json({error: 'Server Error'});
    }
});

// get all recipes
router.get('/', async (req, res) => {
    try {
        const recipes = await Recipe.find({}).sort({name: 1});
        res.status(200).json(recipes);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server Error'});
    }
});

// edit a recipe
router.post('/:id', async (req, res) => {
    const { name, time, ingredients, instructions, category } = req.body;
    const updatedRecipe = {};
    if(name) updatedRecipe.name = name;
    if(time) updatedRecipe.time = time;
    if(ingredients) updatedRecipe.ingredients = ingredients;
    if(instructions) updatedRecipe.instructions = instructions;
    if(category) updatedRecipe.category = category;
    
    try {
        const recipe = await Recipe.findById(req.params.id);
        if(!recipe)
            res.status(404).json({error: 'Recipe Not Found'});
        else{
            const sameCategory = category === recipe.category;

            if(!sameCategory) {
                // Decrement the old category by 1
                const oldCategory = await Category.findOne({name: recipe.category});
                await Category.findOneAndUpdate({name: oldCategory.name}, {$set: { count: oldCategory.count - 1 }});
                // Increment the submitted category
                let newCategory = await Category.findOne({ name: category });
                if(newCategory){
                    await Category.findOneAndUpdate({ name: newCategory.name }, { $set: { count: newCategory.count + 1 }});
                } else {
                    //  Create a new category for the inputted category
                    newCategory = new Category ({
                        name: category,
                        count: 1
                    });
                    newCategory.save();
                }
            }
            // Save the updated recipe
            const finalRecipe = await Recipe.findByIdAndUpdate(req.params.id, { $set: updatedRecipe }, { new: true });
            res.status(200).json({ finalRecipe });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Get info on a single recipe
router.get('/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        res.status(200).json(recipe);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Get all categories available
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find({});
        res.status(200).json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json('error: Server Error');
    }
});

module.exports = router;