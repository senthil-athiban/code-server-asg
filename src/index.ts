import express from "express";
import { authRouter } from "./routes/auth.route";
import { userRouter } from "./routes/user.route";
import connectDb from "./db/connect";
import errorHanlder from "./middlewares/error";

const app = express();

app.use(express.json());
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);

app.use(errorHanlder);

app.listen(8080, async () => {
    console.log("server started on PORT 3000");
    await connectDb();
});
