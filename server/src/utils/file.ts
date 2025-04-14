import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { updateFileToS3 } from './helpers';

const rootProject = path.join(process.cwd(), 'projects');

const readdir = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);

const fetchDir = async (projectId: string, dirname: string) => {
    try {
        const directory = path.join(rootProject, projectId, dirname || '');
        console.log('directory:', directory);
        
        if (!fs.existsSync(directory)) {
            console.error(`Directory does not exist: ${directory}`);
            return;
        }
        
        const files = await readdir(directory, { withFileTypes: true });
    
        return files.map((file) => ({
            type: file.isDirectory() ? "directory" : "file",
            name: file.name,
            path: path.join(dirname || '', file.name),
            isDirectory: file.isDirectory()
        }));
    } catch (error) {
        console.error(`Error reading directory ${dirname} for project ${projectId}:`, error);
        throw error;
    }
}

// example: projectId: '1', filePath: nice/app.js
const fetchFileContent = (projectId: string, filePath: string) => {
    try {
        const absolutePath = path.join(rootProject, projectId, filePath);
        
        const stats = fs.statSync(absolutePath);
        
        if(!stats.isFile()) {
            console.log('Not a file:', absolutePath);
            return;
        }

        const contents = fs.promises.readFile(absolutePath, 'utf8');
        return contents;
    } catch (error) {
        console.log('failed to fetch file contents');
    }
}

const updateFileContent = async (projectId: string, filePath: string, contents: string) => {
    try {
        const fullPath = path.join(rootProject, projectId, filePath);
        const updatedFileContent = await writeFile(fullPath, contents);
        return updatedFileContent;
        // await fs.promises.appendFile(fullPath, contents);
    } catch (error) {
        console.log('failed to update contents');
    }
}


export { fetchDir, fetchFileContent, updateFileContent };