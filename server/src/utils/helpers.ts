import {
  CopyObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  type _Object,
} from "@aws-sdk/client-s3";
import { s3Client } from "../services/aws.service";
import { awsConfig } from "../config/config";
import ApiError from "../config/error";
import path from "path";
import fs from "fs";
import { promisify } from "util";

const isS3Dir = (content: _Object) => content.Size === 0 && content.Key?.endsWith('/')

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

const copyBaseCode = async (source: string, destination: string) => {
  const getObjectCommand = new ListObjectsV2Command({
    Bucket: awsConfig.s3Bucket,
    Prefix: source,
  });

  let contents;

  try {
    const res = await s3Client.send(getObjectCommand);
    contents = res.Contents;

  } catch (error: any) {
    throw new ApiError(500, "Failed to copy files", error);
  }

  if (!contents || contents.length === 0) return;


  try {
    const copyPromises = contents.map(async (content) => {
      const sourceKey = content.Key;
      const destinationKey = sourceKey?.replace(source, destination);

      const command = new CopyObjectCommand({
        Bucket: awsConfig.s3Bucket,
        CopySource: `${awsConfig.s3Bucket}/${sourceKey}`,
        Key: destinationKey,
      });

      const sendRes = await s3Client.send(command);
      return sendRes;
    });

    await Promise.all(copyPromises);
  } catch (error: any) {
    throw new ApiError(500, "Failed to copy files", error);
  }
};

const getFilesFromS3 = async (projectId: string) => {
  const sourceKey = `user-code/${projectId}`;
  const cmd = new ListObjectsV2Command({
    Bucket: awsConfig.s3Bucket,
    Prefix: sourceKey,
  });

  const res = await s3Client.send(cmd);

  const contents = res.Contents;

  const projectDir = path.join(process.cwd(), "projects", projectId);

  await Promise.all(contents!.map(async (content) => {
    const sourceKey = content.Key;
    const getCommand = new GetObjectCommand({
      Bucket: awsConfig.s3Bucket,
      Key: sourceKey
    });

    const relativePath = sourceKey?.replace(`user-code/${projectId}`, '');

    // check if it is dir
    if (isS3Dir(content)) {

      const dirName = path.join(projectDir, relativePath!);

      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
      }
      return;
    }

    const fileRes = await s3Client.send(getCommand);
    const filePath = path.join(projectDir, relativePath!);
    const fileContent = await fileRes.Body?.transformToString();
    
    writeFileWithDirs(filePath, fileContent!);

  }));

  
}

const createFolder = async (dirName: string) => {
  if (!fs.existsSync(dirName)) {
    try {
      await mkdir(dirName, { recursive: true });
      console.log(`Created directory: ${dirName}`);
    } catch (err) {
      console.error(`Error creating directory ${dirName}:`, err);
      throw err;
    }
  }
};

const writeFileWithDirs = async (filePath: string, fileContent: string) => {
  try {
    const dirName = path.dirname(filePath);
    
    await createFolder(dirName);
    await writeFile(filePath, fileContent);
    return true;
  } catch (err) {
    console.error(`Error writing file ${filePath}:`, err);
    throw err;
  }
};

export { copyBaseCode, getFilesFromS3 };
