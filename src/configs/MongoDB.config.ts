require('dotenv').config();

const MongoDBConfig = {
    uri: process.env.MONGO_URI!
}

export default MongoDBConfig;