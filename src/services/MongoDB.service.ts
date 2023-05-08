import mongoose from "mongoose"
import MongoDBConfig from "../configs/MongoDB.config"

export const connectDb = async () => {
    await mongoose.connect(MongoDBConfig.uri);
}