import { Server as HttpServer } from "http";
import { Server as WebSocketServer } from "socket.io";
import { getFilesFromS3 } from "../utils/helpers";

const initWebScoket = (server: HttpServer) => {
    console.log('init websocket')
    const io = new WebSocketServer(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on("connection", (socket) => {
        console.log('Socket io connection established');

        socket.on('project', async (projectId) => {
            
            await getFilesFromS3(projectId);
        })
    });
    return io;
}


export {
    initWebScoket
}