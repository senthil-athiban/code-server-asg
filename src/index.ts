import express, { type Request, type Response } from "express";

const app = express();

// generate userId from client, and store it in memory
type Machine = {
  ipAddress: string;
  isConnected: boolean;
  userId?: string;
  isDisConnected: boolean; // check if the machine has been used or not
}

app.use(express.json());
app.use('/api/v1/auth', );
app.use('/api/v1/editor', );

const CODE_EDITORS = [];
// 1. create new machine and store the userId + machine + IP, increase the desied cap and return the Ip of the machine.
app.post("/register", async (req: Request, res: Response) => {
  const { email, password } = req.body
  
  // if user exists
  const user = { email: "user@gmail.com", machine: {
    ipAddress: "",
    isConnected: false,
    userId: "123"
  }}

  if(user) {
    res.status(401).send({ message: "User already registered" })
    return;
  }

  // get him a machine and store it in db;
  const newUser = { email, password };
  const savedUser = await newUser.save();

  const machine = await aws.createMachine();
  const { id, ipAddress } = machine;
  // create machine record and save it along with user ref
});

// 2. Re-connect to the machine based on userId ( at a time, user can access only one machine at a time using his userId ).
app.get("/editor/:editorId/connect");

// 3. destroy machine, if user wish to leave or if the machine was idle for more than 5 minutes.
app.post("/editor/:editorId/logout");

app.listen(3000, () => console.log("server started on PORT 3000"));
