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
  joinedon: { type: Date, default: Date.now },
});

export default mongoose.model("user", userschema);
