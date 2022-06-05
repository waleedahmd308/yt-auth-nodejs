const { Timestamp } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportsSchema = new Schema ({
   username:String,
   repusername:String,
   description:String     
    
});

const reportsdata = mongoose.model('reportsdata', reportsSchema);
module.exports = reportsdata;