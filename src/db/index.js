import mongoose from "mongoose";

import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
       const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`Connected to the database !! DB HOST: ${connectionInstance.connection.host} `);
    } catch (error) {
        console.log('MONGODB coonection error:', error);
        process.exit(1)
    }
}

export default connectDB