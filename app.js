const express = require("express")
const bodyParser = require("body-parser")
const multer = require('multer');
const path = require("path");
const mongoose = require("mongoose")


const app = express()
app.set('view engine', 'ejs')





// connect to database
mongoose.connect("mongodb://localhost:27017/travelDB")
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'));


// Schema of the database
const postsSchema = {
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    budget: {
        type: Number,
        required: true
    }
}

const usersSchema = {
    name: {
        type: String,
        required: true
    },
    email: String,
    message: String
}

const Post = mongoose.model("Post", postsSchema);
const User = mongoose.model("User", usersSchema);

const post1 = new Post({
    title: "Bali Trip",
    description: "Embark on a mesmerizing journey to the enchanting island of Bali, where tropical beauty, rich culture, and unparalleled hospitality come together to create an unforgettable vacation experience. Located in the heart of Indonesia, Bali is renowned for its pristine beaches, lush landscapes, vibrant traditions, and spiritual heritage. As you arrive in Bali, you'll be greeted by warm, balmy air and a sense of tranquility that permeates the island. The first thing that captures your attention is the stunning natural beauty. Bali boasts picturesque rice terraces, cascading waterfalls, and dense jungles teeming with exotic flora and fauna. From the iconic Mount Agung towering in the distance to the pristine beaches adorned with swaying palm trees, every corner of the island is a visual feast.",
    imageUrl: "bali.jpeg",
    budget: 5000
})
post1.save()
const defaultPosts = [post1];



let img = ""
const storageEngine = multer.diskStorage({
    destination: "./public/images",
    filename: (req, file, cb) => {
        img = `${Date.now()}--${file.originalname}`;
        cb(null, `${Date.now()}--${file.originalname}`);
    },
});

const upload = multer({
    storage: storageEngine,
    limits: { fileSize: 1000000 },
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    },
});

const checkFileType = function (file, cb) {
    //Allowed file extensions
    const fileTypes = /jpeg|jpg|png|gif|svg/;

    //check extension names
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

    const mimeType = fileTypes.test(file.mimetype);

    if (mimeType && extName) {
        return cb(null, true);
    } else {
        cb("Error: You can Only Upload Images!!");
    }
};






app.get("/", function (req, res) {
    Post.find().then((posts) => {
        if (posts.length === 0) {
            Post.insertMany(defaultPosts);
            res.redirect("/")
        } else {
            res.render("home", { posts: posts })
        }
    })
})

app.get("/post", function (req, res) {
    res.render("post")
})

app.post("/post", upload.single('imageUpload'), async function (req, res) {
    try {
        let title = req.body.title;
        let desc = req.body.desc;
        let image = "" + img;
        let budget = req.body.budget;
        const post = new Post({
            title: title,
            description: desc,
            imageUrl: image,
            budget: budget
        });
        await post.save();
        res.redirect("/");
    } catch (error) {
        if (error.name === "ValidationError") {
            let errors = {};

            Object.keys(error.errors).forEach((key) => {
                errors[key] = error.errors[key].message;
            });

            return res.status(400).send(errors);
        }
        res.status(500).send("Something went wrong");
    }
})

app.get("/contact", function (req, res) {
    res.render("contact")
})

app.post("/contact", async function (req, res) {
    try {

        let name = req.body.name;
        let email = req.body.email;
        let message = req.body.message;

        const user = new User({
            name: name,
            email: email,
            message: message
        })

        await user.save();
        res.render("success")
    } catch (error) {
        if (error.name === "ValidationError") {
            let errors = {};

            Object.keys(error.errors).forEach((key) => {
                errors[key] = error.errors[key].message;
            });

            return res.status(400).send(errors);
        }
        res.status(500).send("Something went wrong");
    }
})

app.listen(3000, function () {
    console.log("Server started on port 3000!");
})