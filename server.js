const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
require("dotenv").config();

const User = require("./models/User");
const Membership = require("./models/Membership");

const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public")); // serves index.html (COMMON HOME)

app.use(
  session({
    secret: "gym_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

/* ---------- DATABASE ---------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

/* ---------- SIGNUP (ADMIN / CUSTOMER) ---------- */
app.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    await User.create({ name, email, password, role });

    // After signup → go back to SAME common home
    res.redirect("/index.html");
  } catch (err) {
    res.send("Signup failed");
  }
});

/* ---------- LOGIN (ADMIN / CUSTOMER) ---------- */
app.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  const user = await User.findOne({ email, password, role });

  if (!user) {
return res.status(401).json({ error: "Invalid credentials" });
  }

  req.session.user = user;

  // Redirect based on role (NOT home page)
  if (role === "customer") {
    res.redirect("/customer-home.html");
  } else {
    res.redirect("/admin-home.html");
  }
});



/* ---------- ADMIN: DELETE MEMBER ---------- */
app.delete("/admin/members/:id", async (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(401).send("Unauthorized");
  }

  try {
    await Membership.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting member");
  }
});



/* ---------- CUSTOMER: SUBMIT MEMBERSHIP FORM ---------- */
// app.post("/membership", async (req, res) => {
//   if (!req.session.user || req.session.user.role !== "customer") {
//     return res.redirect("/index.html");
//   }

//   await Membership.create({
//     userId: req.session.user._id,
//     ...req.body
//   });
  
//   res.status(200).end();

// });




app.post("/membership", async (req, res) => {
  console.log("FORM DATA:", req.body); // 🔍 DEBUG (very important)

  if (!req.session.user) {
    return res.status(401).send("Not logged in");
  }

  try {
    await Membership.create({
      userId: req.session.user._id,

      // Personal Info
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      dob: req.body.dob,
      gender: req.body.gender,

      // Address
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
      city: req.body.city,
      state: req.body.state,
      postalCode: req.body.postalCode,
      country: req.body.country,

      // Body Metrics
      heightCm: req.body.heightCm,
      weightKg: req.body.weightKg,
      bmi: req.body.bmi,
      goalWeightKg: req.body.goalWeightKg,

      // Emergency Contact
      emergencyFirstName: req.body.emergencyFirstName,
      emergencyLastName: req.body.emergencyLastName,
      emergencyRelation: req.body.emergencyRelation,
      emergencyPhone: req.body.emergencyPhone,

      // Medical
      hasMedicalConditions: req.body.hasMedicalConditions,
      medicalDetails: req.body.medicalDetails,

      // Membership
      membershipType: req.body.membershipType,
      preferredStartDate: req.body.preferredStartDate
    });

res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving data");
  }
});




/* ---------- ADMIN: GET ALL REGISTERED MEMBERS ---------- */
app.get("/admin/members", async (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.redirect("/index.html");
  }

  const members = await Membership.find();
  res.json(members); // admin dashboard fetches this
});

/* ---------- LOGOUT ---------- */
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/index.html"); // ALWAYS back to common home
});

/* ---------- SERVER ---------- */
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:3000/index.html`);
});
