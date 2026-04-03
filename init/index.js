const mongoose = require("mongoose");
const initData= require("./data.js");
const Listing = require("../models/listing.js");

const Mongo_url = "mongodb://127.0.0.1:27017/Wonderlust";
main()
 .then(() => {
    console.log("Connected to MongoDB");
 })
 .catch((err) => {
    console.log(err);
 });

async function main(){
    await mongoose.connect(Mongo_url);
} 

const initDB = async () => {
     await Listing.deleteMany({});
     initData.data=initData.data.map((obj) => ({ ...obj, owner: "699ac962b5b99e4e12e8a548"}));
    await Listing.insertMany(initData.data);//initdata is an array of objects
     console.log("Data was Initialized ");
};

initDB();
