const { Timestamp } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const producttypeSchema = new Schema ({
    accounttype:String,
    title:String,
   description:String,
   urlimage:String     
   
});

const producttype = mongoose.model('producttype', producttypeSchema);
module.exports = producttype;