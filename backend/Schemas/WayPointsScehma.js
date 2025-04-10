const mongoose = require("mongoose");

const WayPointsScehma = new mongoose.Schema({
    name : String ,
    lat :Number ,
    long : Number ,
    // a:Number ,
    // EndLong:Number,
    alt : Number
})

//   StartLat ,StartLong , EndLat , EndLong
module.exports = WayPointsScehma;