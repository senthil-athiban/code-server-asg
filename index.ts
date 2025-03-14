import express from "express";

const app = express();

// generate userId from client, and store it in memory
type Machine = {
  ipAddress: string;
  isConnected: boolean;
  userId?: string;
}

const CODE_EDITORS = [];
// 1. create new machine and store the userId + machine Id + IP, increase the desied cap and return the Ip of the machine.
app.post("/register", (req, res) => {
  const 
});

// 2. Re-connect to the machine based on userId ( at a time, user can access only one machine at a time using his userId ).
app.get("/editor/:editorId");
// 3. destroy machine, if user wish to leave or if the machine was idle for more than 5 minutes.
app.post("/kill/editor/:editorId");

app.listen(3000, () => console.log("server started on PORT 3000");
