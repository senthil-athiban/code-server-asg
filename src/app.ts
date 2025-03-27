import express from "express";
import { authRouter } from "./routes/auth.route";
import { userRouter } from "./routes/user.route";
import connectDb from "./db/connect";
import errorHanlder from "./middlewares/error";
import { machineRouter } from "./routes/machine.router";
import morgan from 'morgan';
import cron from 'node-cron';
import { Machine } from "./model/machine.model";
import machineState, { machineStatus } from "./config/machine";
import { registerCronJobs } from "./jobs";

const app = express();
app.use(morgan('dev'));

app.use(express.json());
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/machine', machineRouter)

cron.schedule('* * * * *', async () => {
    
})
app.use(errorHanlder);

app.listen(8080, async () => {
    console.log("server started on PORT 3000");
    await connectDb();
    registerCronJobs();
});
