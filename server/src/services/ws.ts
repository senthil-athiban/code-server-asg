import { Server as HttpServer } from "http";
import { Socket, Server as WebSocketServer, type DefaultEventsMap } from "socket.io";
import { getFilesFromS3, updateFileToS3 } from "../utils/helpers";
import { fetchDir, fetchFileContent, updateFileContent } from "../utils/file";
import os from 'os';
import path from 'path';
import * as pty from 'node-pty';

interface TerminalSession {
    ptyProcess: pty.IPty;
    projectId: string;
}

const terminals: Map<string, TerminalSession> = new Map();

const initWebScoket = (server: HttpServer) => {
    const io = new WebSocketServer(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on("connection", (socket) => {
        const projectId = socket.handshake.query.projectId as string;
        console.log(`Socket io connection has been established for projectId: ${projectId}`);
        

        socket.on('project', async (projectId) => {
            await getFilesFromS3(projectId);
        });

       
        fileHandlers(projectId, socket);
        
        // terminalHandlers(projectId, socket);
        

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
            const session = terminals.get(socket.id);
            if(session){
                session.ptyProcess.kill();
                terminals.delete(socket.id);
                console.log(`Terminal has been disconnected for project ${projectId}`);
            }
        })
    });
    return io;
}

const fileHandlers = (projectId: string, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    socket.on("fetchFile", async (filePath: string) => {
        try {
            const content = await fetchFileContent(projectId, filePath);
            socket.emit('fileContent', { path: filePath, content, success: true });
        } catch (error) {
            socket.emit('fileContent', { path: filePath, success: false, error: 'Failed to fetch file' });
            console.error('Failed to fetch file:', error);
        }
    })

    socket.on("fetchDir", async (dirName: string) => {
        try {
            const files = await fetchDir(projectId, dirName);
            socket.emit('dirContent', { path: dirName, files, success: true });
        } catch (error) {
            socket.emit('dirContent', { path: dirName, success: false, error: 'Failed to fetch directory' });
            console.error('Failed to fetch directory:', error);
        }
    });

    socket.on('updateFile', async ({filePath, content}: { filePath: string, content: string }) => {
        await updateFileContent(projectId, filePath, content);
        await updateFileToS3(projectId, filePath, content);
    })
}

const terminalHandlers = (projectId: string, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    socket.on('terminal:start', () => {
        try {
            const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
            const projectDir = path.join(process.cwd(), "projects", projectId);

            const ptyProcess = pty.spawn(shell, [], {
                name: 'xterm-color',
                cols: 80,
                rows: 24,
                cwd: projectDir,
                env: process.env
            });

            if(!terminals.get(socket.id)) {
                terminals.set(socket.id, { projectId, ptyProcess });
            }

            ptyProcess.onData((data) => socket.emit('terminal:output', data));

            socket.emit('terminal:started', { success: true });
        } catch (error) {
            console.error('failed to start terminal', error);
            socket.emit('terminal:started', { success: false });
        }
    });

    socket.on('terminal:input', (command) => {
        const pty = terminals.get(socket.id);
        if(pty) {
            pty.ptyProcess.write(command)
        }
    });

    socket.on('terminal:resize', (data) => {
        const session = terminals.get(socket.id);
        if (session && data.cols && data.rows) {
            session.ptyProcess.resize(data.cols, data.rows);
        }
    });
}


export {
    initWebScoket
}