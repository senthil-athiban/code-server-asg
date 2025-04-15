import React, { useEffect, useState } from 'react'
import { io, Socket } from "socket.io-client";

const useSocket = (projectId: string) => {
    const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    const socket = io(`ws://localhost:3000?projectId=${projectId}`);
    socket.on("connect", () => {
      console.log("Connected to socket server");
    });
    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });
    setSocket(socket);
  },[projectId]);

  return socket;
}

export default useSocket