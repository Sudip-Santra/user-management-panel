const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const fs = require("fs");

//image upload
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});

var upload = multer({
    storage: storage,
}).single("image");


//Insert an user to database route
router.post("/add", upload, async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename,
            status: req.body.status,
        });

        await user.save(); 

        req.session.message = {
            type: "success",
            message: "User Added Successfully!",
        };
        res.redirect("/");
    } catch (err) {
        res.json({ message: err.message, type: "danger" });
    }
});


//get all users route
router.get("/", async (req, res) => {
    try {
        const users = await User.find();
        res.render("index", { title: "User Management Panel", users: users });
    } catch (err) {
        res.json({ message: err.message, type: "danger" });
    }
});

router.get("/", (req, res) => {
    res.render("index", { title: "User Management Panel" });
});

router.get("/add", (req, res) => {
    res.render("add_users", { title: "Add Users" });
});

//Edit an user route
router.get("/edit/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.render("edit_users", { title: "Edit User", user: user });
    } catch (err) {
        res.json({ message: err.message, type: "danger" });
    }
});

//Update an user route
router.post("/update/:id", upload, async (req, res) => {
    let id = req.params.id;
    let new_image = "";

    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync("./uploads/" + req.body.old_image);
        } catch (err) {
            console.log(err);
        }
    } else {
        new_image = req.body.old_image;
    }

    try {
        await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            status: req.body.status,
            image: new_image,
        });

        req.session.message = {
            type: "success",
            message: "User Updated Successfully!",
        };
        res.redirect("/");
    } catch (err) {
        res.json({ message: err.message, type: "danger" });
    }
});

//Delete an user route
router.get("/delete/:id", async (req, res) => {
    let id = req.params.id;

    try {
        const result = await User.findByIdAndDelete(id);
        
        if (result && result.image) {
            try {
                fs.unlinkSync("./uploads/" + result.image);
            } catch (err) {
                console.log("Error deleting image:", err);
            }
        }

        req.session.message = {
            type: "info",
            message: "User Deleted Successfully!",
        };
        res.redirect("/");
    } catch (err) {
        res.json({ message: err.message, type: "danger" });
    }
});


module.exports = router;