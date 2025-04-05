require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ CORS - Allow multiple origins dynamically
const allowedOrigins = [
  "http://localhost:3000",
  "http://192.168.56.1:3000",
  "https://cerulean-peony-0f7fce.netlify.app"
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("⛔ Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// ✅ Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// ✅ Schema & Model
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
});
const User = mongoose.model("User", UserSchema);

// ✅ Routes
app.get("/", (req, res) => res.send("✅ Server is running!"));

app.get("/dashboard", async (req, res) => {
  const users = await User.find();
  res.render("dashboard", {
    Admin: "Admin Dashboard",
    users,
    user: null,
    errorMessage: null,
  });
});

app.post("/add-user", async (req, res) => {
  const { name, email, phone, address } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "⚠️ User already exists!" });
    }

    const newUser = new User({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim()
    });

    await newUser.save();

    res.status(200).json({ message: "✅ User added successfully!" });
  } catch (err) {
    console.error("❌ Error saving user:", err);
    res.status(500).json({ error: "❌ Server error!" });
  }
});

// ✅ Update Routes
app.get("/edit-user/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send("User not found!");

  const users = await User.find();
  res.render("dashboard", {
    Admin: "Edit User",
    users,
    user,
    errorMessage: null,
  });
});

app.post("/update-user/:id", async (req, res) => {
  const { name, email, phone, address } = req.body;
  await User.findByIdAndUpdate(req.params.id, {
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    address: address.trim()
  });

  res.redirect("/dashboard");
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

