import {
  CopyObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { s3Client } from "../services/aws.service";
import { awsConfig } from "../config/config";

const copyBaseCode = async (source: string, destination: string) => {
  const getObjectCommand = new ListObjectsV2Command({
    Bucket: awsConfig.s3Bucket,
    Prefix: source,
  });

  let contents;

  try {
    const res = await s3Client.send(getObjectCommand);
    contents = res.Contents;

  } catch (error) {
    console.log('failed to fetch s3Contents:', error);
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
  } catch (error) {
    console.log("failed to copy:", error);
  }
};


// todo: get file contents from s3 and write it to local file system
const getFilesFromS3 = async (projectId: string) => {
  const sourceKey = `user-code/${projectId}`;
  const cmd = new ListObjectsV2Command({
    Bucket: awsConfig.s3Bucket,
    Prefix: sourceKey,
  });

  const res = await s3Client.send(cmd);

  const contents = res.Contents;
  contents?.map( async (content) => {
    const sourceKey = content.Key;
    const getCommand = new GetObjectCommand({
      Bucket: awsConfig.s3Bucket,
      Key: sourceKey
    });
    
  })
}
export { copyBaseCode, getFilesFromS3 };


