import express from "express";
import { authRouter } from "./routes/auth.route";
import { userRouter } from "./routes/user.route";
import connectDb from "./db/connect";
import errorHanlder from "./middlewares/error";
import { editorRouter } from "./routes/editor.router";
import morgan from 'morgan';

const app = express();
app.use(morgan('dev'));

app.use(express.json());
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/editor', editorRouter)

app.use(errorHanlder);

app.listen(8080, async () => {
    console.log("server started on PORT 3000");
    await connectDb();
});
