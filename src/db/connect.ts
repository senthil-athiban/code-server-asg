import mongoose from "mongoose";
import { MONGODB_URI } from "../config/config"

const connectDb = async () => {

    try {
        if(!MONGODB_URI) {
            throw new Error('mongo db uri was not provided');
        }
        await mongoose.connect(MONGODB_URI);
        console.log('DB connected')
    } catch (error) {
        console.log('failed to connect:', error);
    }
}

export default connectDb;