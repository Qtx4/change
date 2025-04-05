const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ✅ Get All Users
router.get("/", async (req, res) => {
    const users = await User.find();
    res.json(users);
});

// ✅ Add User
router.post("/", async (req, res) => {
    const { name, email, phone, address } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(409).json({ error: "⚠️ User already exists!" });
    }

    const newUser = new User({ name, email, phone, address });
    await newUser.save();

    res.json({ message: "✅ User Added!", user: newUser });
});

// ✅ Update User
router.put("/:id", async (req, res) => {
    const { name, email, phone, address } = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { name, email, phone, address }, { new: true });
    res.json(updatedUser);
});

// ✅ Delete User
router.delete("/:id", async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "✅ User Deleted!" });
});

module.exports = router;
