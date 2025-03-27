import { model, Schema } from "mongoose";
import machineState, { machineStatus } from "../config/machine";

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
    // To represent the connection status b/w client and server
    state: {
        type: String,
        enum: [machineState.CONNNECTED, machineState.DISCONNECTED, machineState.READY_TO_CONNECT, machineState.RECONNECABLE],
        default: "DISCONNECTED"
    },
    user: {
        ref: 'User',
        type: Schema.Types.ObjectId
    },
    lastActiveAt: {
        type: Date,
        default: Date.now
    },
    // To represent the lifecycle of machine
    status: {
        type: String,
        enum: [machineStatus.ACTIVE, machineStatus.IN_ACTIVE],
        required: true
    }
}, {
    timestamps: true 
});

machineSchema.index({ lastActiveAt: 1 });

export const Machine = model('Machine', machineSchema);
