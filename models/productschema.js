const { Timestamp } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dataSchema = new Schema ({
   title:String,
   description:String,
   urlimage:String     
    
});

const productdata = mongoose.model('productdata', dataSchema);
module.exports = productdata;