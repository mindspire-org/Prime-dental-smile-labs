import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const allowedExtensions = ["stl", "ply", "obj", "dcm", "dicom", "zip", "rar", "jpg", "jpeg", "png", "pdf"];

function client() {
  return new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: process.env.S3_ACCESS_KEY_ID
      ? { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY }
      : undefined,
  });
}

export function validateFileName(name) {
  const ext = name.split(".").pop()?.toLowerCase();
  return Boolean(ext && allowedExtensions.includes(ext));
}

export async function createUploadUrl({ caseNumber, fileName, contentType }) {
  if (!validateFileName(fileName)) throw new Error("Unsupported file type");
  const bucket = process.env.S3_BUCKET;
  if (!bucket) throw new Error("S3_BUCKET is not configured");

  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `cases/${caseNumber}/${Date.now()}-${safeName}`;
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType || "application/octet-stream" });
  const uploadUrl = await getSignedUrl(client(), command, { expiresIn: 900 });

  return { key, uploadUrl };
}

export async function createDownloadUrl(key) {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) throw new Error("S3_BUCKET is not configured");

  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client(), command, { expiresIn: 900 });
}
