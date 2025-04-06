import { model, Mongoose, Schema } from "mongoose";

const tokenSchema = new Schema({
    token: {
        type: String,
        required: true,
        index: true
    },type: {
        type: String,
        required: String
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

const Token = model('Token', tokenSchema);
export default Token;