import express from "express";

const app = express();

// generate userId from client, and store it in memory
type Machine = {
  ipAddress: string;
  isConnected: boolean;
  userId?: string;
}

const CODE_EDITORS = [];
// 1. create new machine
app.post("/register", (req, res) => {
  const 
});
// 2. connect to the machine
// 3. destroy machine

app.listen(3000, () => console.log("server started on PORT 3000");
