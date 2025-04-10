const {model} = require("mongoose");
const WayPointsScehma = require("../Schemas/WayPointsScehma.js");

const WayPointsModel = new model("waypoint" , WayPointsScehma);
module.exports = WayPointsModel;

