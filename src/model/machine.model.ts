import { model, Schema } from "mongoose";

const machineSchema = new Schema({
    instanceId: {
        required: true,
        type: String,
        trim: true,
        index: true
    },
    ipAddress: {
        required: true,
        type: String,
        trim: true,
        index: true
    },
    state: {
        type: String,
        enum: ["CONNECTED", "DISCONNECTED", "RECONNECTABLE"],
        default: "DISCONNECTED"
    },
    user: {
        required: true,
        ref: 'User',
        type: Schema.Types.ObjectId
    },
    lastActiveAt: {
        type: Date,
        default: Date.now
    },
    status: {
        required: true,
        enum: ["ACTIVE", "INACTIVE"]
    }
}, {
    timestamps: true 
});

// Optionally, add a TTL index if you want to automatically remove documents after a certain period
machineSchema.index({ lastActiveAt: 1 }, { expireAfterSeconds: 300 });

export const Machine = model('Machine', machineSchema);
