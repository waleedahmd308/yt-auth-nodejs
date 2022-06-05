const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name:{
    type:String,
    required :true
  },
  email: {
    type: String,
    required: true,
  },
  company:{
    type:String,
    required :true
  },
  phone_number:{
    type:String,
    required :true
  },
  address:{
    type:String,
    required :true
  },
  city:{
    type:String,
    required :true
  },
  img:
  {
    type: String,
    default: 'placeholder.jpg',
  },
  password: {
    type: String,
    required: true,
  },

});

const User = mongoose.model("User", userSchema);
module.exports = User;
