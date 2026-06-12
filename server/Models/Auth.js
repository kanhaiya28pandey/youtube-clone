import mongoose from "mongoose";

const userschema = mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String },
  channelname: { type: String },
  description: { type: String },
  image: { type: String },


  isPremium: {
    type: Boolean,
    default: false,
  },


  plan: {
    type: String,
    enum: ["free", "bronze", "silver", "gold"],
    default: "free",
  },

  joinedon: {
    type: Date,
    default: Date.now,
  },

  watchTimeLimit: {
    type: Number,
    default: 5,
  },
});

export default mongoose.model("user", userschema);