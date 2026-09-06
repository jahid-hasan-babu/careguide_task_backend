import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import config from "../../config";
import ApiError from "../errors/ApiError";


// ----------------- Multer storage config -----------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${crypto
      .randomBytes(6)
      .toString("hex")}`;
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});
const upload = multer({ storage });

// Single / multi upload configs
const uploadProfileImage = upload.single("profileImage");
const chatImage = upload.single("chatImage");
const uploadSignatureImage = upload.single("signature");
const uploadGiftImage = upload.single("image");
const uploadMultipleImage = upload.fields([
  { name: "productImage", maxCount: 10 },
  { name: "variantImages", maxCount: 100 },
]);
const uploadProductImages = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "productImage", maxCount: 10 },
  { name: "variantImages", maxCount: 100 },
]);
const uploadFile = upload.single("file");


export const s3Client = new S3Client({
  region: config.S3.space_bucket_region, // e.g. "sfo3"
  endpoint: config.S3.space_endpoint,    // e.g. "https://sfo3.digitaloceanspaces.com"
  credentials: {
    accessKeyId: config.S3.space_accesskey || "",
    secretAccessKey: config.S3.space_secret_key || "",
  },
  forcePathStyle: false, // DigitalOcean Spaces uses virtual-hosted-style URLs
});


const uploadToDigitalOcean = async (
  file: Express.Multer.File
): Promise<{ Location: string; Bucket: string; Key: string }> => {
  if (!file) throw new Error("File is required for uploading.");

  const Bucket = config.S3.space_bucket || "";
  const Key = `uploads/${Date.now()}_${file.originalname}`;

  try {
    const fileBuffer = fs.readFileSync(file.path);

    await s3Client.send(
      new PutObjectCommand({
        Bucket,
        Key,
        Body: fileBuffer,
        ContentType: file.mimetype,
        ACL: "public-read",
      })
    );

    await fs.promises.unlink(file.path);

    return {
      Location: `${config.S3.space_origin_endpoint}/${Key}`,
      Bucket,
      Key,
    };
  } catch (error) {
    console.error("Error uploading to DigitalOcean Spaces:", error);
    // Clean up local file if it exists
    try { await fs.promises.unlink(file.path); } catch {}
    throw error;
  }
};




export const fileUploader = {
  upload,
  uploadToDigitalOcean,
  uploadProfileImage,
  uploadMultipleImage,
  uploadProductImages,
  uploadSignatureImage,
  uploadFile,
  chatImage,
  uploadGiftImage
};
