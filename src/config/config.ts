import { config } from "dotenv";
config();

export const PORT = process.env.PORT!;

export const MONGODB_URI = process.env.MONGODB_URL!;

export const JWT_SECRET = process.env.JWT_SECRET!;

export const emailConfig = {
  from: process.env.EMAIL_FROM!,
};

export const domains = {
  backend: process.env.BACKEND_DOMAIN!,
  client: process.env.CLIENT_DOMAIN!,
};

export const awsConfig = {
  s3Bucket: process.env.S3_BUCKET!,
  accessKey: process.env.ACCESS_KEY!,
  secretKey: process.env.SECRET_KEY!,
  region: process.env.REGION!,
};
