import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, "..", "..");

const allowedExtensions = ["stl", "ply", "obj", "dcm", "dicom", "zip", "rar", "jpg", "jpeg", "png", "pdf"];
const UPLOADS_DIR = path.join(PROJECT_ROOT, "uploads");

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

export const isLocalStorage = () => !process.env.S3_BUCKET;

export function validateFileName(name) {
  const ext = name.split(".").pop()?.toLowerCase();
  return Boolean(ext && allowedExtensions.includes(ext));
}

export async function createUploadUrl({ caseNumber, fileName, contentType }) {
  if (!validateFileName(fileName)) throw new Error("Unsupported file type");
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `cases/${caseNumber}/${Date.now()}-${safeName}`;

  if (isLocalStorage()) {
    const uploadUrl = `/api/files/upload-local?key=${encodeURIComponent(key)}`;
    return { key, uploadUrl };
  }

  const command = new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, ContentType: contentType || "application/octet-stream" });
  const uploadUrl = await getSignedUrl(client(), command, { expiresIn: 900 });
  return { key, uploadUrl };
}

export async function createMessageUploadUrl({ fileName, contentType }) {
  if (!validateFileName(fileName)) throw new Error("Unsupported file type");
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `messages/${Date.now()}-${safeName}`;

  if (isLocalStorage()) {
    const uploadUrl = `/api/files/upload-local?key=${encodeURIComponent(key)}`;
    return { key, uploadUrl };
  }

  const command = new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, ContentType: contentType || "application/octet-stream" });
  const uploadUrl = await getSignedUrl(client(), command, { expiresIn: 900 });
  return { key, uploadUrl };
}

export async function createDownloadUrl(key) {
  if (isLocalStorage()) {
    return `/uploads/${key}`;
  }

  const command = new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key });
  return getSignedUrl(client(), command, { expiresIn: 900 });
}

export async function saveLocalFile(key, buffer) {
  const filePath = path.join(UPLOADS_DIR, key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);
}
