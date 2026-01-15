

const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  dob: Date,
  gender: String,

  addressLine1: String,
  addressLine2: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,

  heightCm: Number,
  weightKg: Number,
  bmi: Number,
  goalWeightKg: Number,

  emergencyFirstName: String,
  emergencyLastName: String,
  emergencyRelation: String,
  emergencyPhone: String,

  hasMedicalConditions: String,
  medicalDetails: String,

  membershipType: String,
  preferredStartDate: Date,

  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model("Membership", membershipSchema);
