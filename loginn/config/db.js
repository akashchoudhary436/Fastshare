const mongoose = require('mongoose');

const connectDB = async () =>{
    try{
        const conn = await mongoose.connect("mongodb://127.0.0.1:27017/fastshare");
         console.log(`mongo db connected:${conn.connection.host}`)
    }catch(error){
       console.log(`Error:${error.message}`);
       process.exit();
    }
};

module.exports = connectDB;