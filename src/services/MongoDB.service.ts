import mongoose from "mongoose"
import MongoDBConfig from "../configs/MongoDB.config"

export const connectDb = async () => {
    try 
    {
        await mongoose.connect(MongoDBConfig.uri);
    } 
    catch(e) 
    {
        console.error(e)
    }
}