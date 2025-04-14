import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const rootProject = path.join(process.cwd(), 'projects');
console.log('rootProject:', rootProject)
const readdir = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);

const fetchDir = async (dirname: string, projectId: string) => {
    try {
        const directory = path.join(rootProject, projectId, dirname || '');
        
        if (!fs.existsSync(directory)) {
            throw new Error(`Directory does not exist: ${directory}`);
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
        return await writeFile(fullPath, contents);
        // await fs.promises.appendFile(fullPath, contents);
    } catch (error) {
        console.log('failed to update contents');
    }
}


export { fetchDir, fetchFileContent, updateFileContent };