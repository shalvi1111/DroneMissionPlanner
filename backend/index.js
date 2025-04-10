require("dotenv").config();
const haversine = require('haversine-distance')

const express = require("express");
const app = express();

const mongoose = require('mongoose');

const uri = process.env.MONGO_URL;
const WayPointsModel = require("./models/WayPointsModel.js");
const cors = require("cors");
app.use(express.json());
app.use(cors());





// function DisBtw2Pts(StartLat ,  StartLong  , EndLat , EndLong) {
//     const R = 6371;
//     const rad = deg => deg * Math.PI / 180;
//     const disLat = rad(EndLat - StartLat);
//     const disLong = rad(EndLong - StartLong);
//     const a = Math.sin(disLat / 2) ** 2 + Math.cos(rad(StartLat)) * Math.cos(rad(EndLat)) * Math.sin(disLong / 2) ** 2;
//     return R*2*Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   }

  // Post a mission by giving name , lat , long , alt to body in json format 
  app.post("/mission" , async(req,res)=>{
     try{
    const { name , lat ,long  , alt  } = req.body ;
    // const latDecimal = parseFloat(lat);
    if(alt <10 || alt >120){
       return res.json({success:false ,message:"Mission rejected because of altitude."})
    } 

     // Findinb existing waypoints
     const existingWaypoints = await WayPointsModel.find();

     //  degrees ==> radians
     const toRad = (value) => (value * Math.PI) / 180;
 
     // Haversine formula to calculate distance
     const calculateDistance = (lat1, lon1, lat2, lon2) => {
       const R = 6371000; // Radius of Earth in meters
       const dLat = toRad(lat2 - lat1);
       const dLon = toRad(lon2 - lon1);
 
       const a =
         Math.sin(dLat / 2) ** 2 +
         Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
 
       const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
       return R * c; // cinverting Distance in meters
     };
 
     // Check distance with existing waypoints
     for (let point of existingWaypoints) {
       const distance = calculateDistance(
         parseFloat(lat),
         parseFloat(long),
         parseFloat(point.lat),
         parseFloat(point.long)
       );
 
       if (distance < 10) {
         return res.json({
           success: false,
           message: "Waypoint are too close (dis is less than 10 m)",
         });
       }
     }
    
    const newMission = new WayPointsModel({name ,lat ,long ,alt});
    // console.log(newMission ,"print");
    const print = await newMission.save();
    // console.log(print);
    res.json({success : true , message:print})
   } 
   catch(err){
    // console.log(err);
    res.json({success:false,message:err});
   }
     
  }) 
  // get all the sxistinng missions
  app.get("/mission", async(req,res)=>{
      try{
    const mission = await WayPointsModel.find({});
    res.json({success:true , message:mission})
      }
      catch(err){
        res.json({success:false , message:err})
      }
  }) ;
     
  // update a mission if the mission satisfy the condtion of alt and dis
  app.put("/mission/:id" , async(req,res)=>{
      try{
        const {id} = req.params ;
        const {name , lat , long , alt} = req.body ;
        const mission = await WayPointsModel.findById(id);
        if(!mission){
          return res.json({success:false , message:"Message doesn't exist"})
        }
        if(alt <10 || alt >120){
          return res.json({success:false ,message:"Mission rejected because of altitude."})
       } 
   
        // Findinb existing waypoints
        const existingWaypoints = await WayPointsModel.find();
   
        //  degrees ==> radians
        const toRad = (value) => (value * Math.PI) / 180;
    
        // Haversine formula to calculate distance
        const calculateDistance = (lat1, lon1, lat2, lon2) => {
          const R = 6371000; // Radius of Earth in meters
          const dLat = toRad(lat2 - lat1);
          const dLon = toRad(lon2 - lon1);
    
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c; // Distance in meters
        };
    
        // Check distance with existing waypoints
        for (let point of existingWaypoints) {
          const distance = calculateDistance(
            parseFloat(lat),
            parseFloat(long),
            parseFloat(point.lat),
            parseFloat(point.long)
          );
    
          if (distance < 10) {
            return res.json({
              success: false,
              message: "Waypoint are too close (dis is less than 10 m)",
            });
          }
        }

        // valid mission than update 
        mission.name = name ;
        mission.lat = lat ;
        mission.long = long ;
        mission.alt = alt ;
          const uspdatedMission = await mission.save();

         res.json({success:true , message:uspdatedMission })
      }
      catch(err){
        res.json({success:false , message:err})
      }
  }) ;

  // delete a mission by using id
  app.delete("/mission/:id" , async(req,res)=>{
    try{
    const {id} = req.params ;
    const mission = await WayPointsModel.findByIdAndDelete(id);
    // console.log(mission);
    res.json({success:true , message:mission});
  }
  catch(err){
    res.json({success:false ,message:err});
  }
  })

  

 app.get("/simulate", async (req, res) => {
  try {
    const waypoints = await WayPointsModel.find({});

    if (waypoints.length < 2) {
      return res.json({success: false, message: "Atleast two waypoints are required to simulate a mission." });
    }

    let totalDistanceKm = 0;

    for (let i = 0; i < waypoints.length - 1; i++) {
      const start = {
        latitude: parseFloat(waypoints[i].lat),
        longitude: parseFloat(waypoints[i].long),
      };
      const end = {
        latitude: parseFloat(waypoints[i + 1].lat),
        longitude: parseFloat(waypoints[i + 1].long),
      };

      const distanceMeters = haversine(start, end);
      totalDistanceKm += distanceMeters / 1000;
    }

    // Drone constants
    const DRONE_SPEED_KMPH = 40; 
    const BATTERY_CONSUMPTION_PER_KM = 5; // % of battery per km

    const estimatedTimeMinutes = (totalDistanceKm / DRONE_SPEED_KMPH) * 60;
    const estimatedBatteryUsage = totalDistanceKm * BATTERY_CONSUMPTION_PER_KM;

    res.json({
      success: true,
      totalWaypoints: waypoints.length,
      totalDistanceKm: totalDistanceKm.toFixed(2),
      estimatedTimeMinutes: estimatedTimeMinutes.toFixed(1),
      estimatedBatteryUsage: estimatedBatteryUsage.toFixed(1),
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

  

app.listen(8000 , ()=>{
    console.log('Server is listening to PORT 8000');
    mongoose.connect(uri);
    console.log("Database Connected");
})

