// ─── ShadowDrive AI — MinIO/S3 Client Singleton ───
// Same pattern as prisma.ts — returns null if not configured.

import { S3Client, CreateBucketCommand } from '@aws-sdk/client-s3';

const globalForS3 = globalThis as unknown as { s3?: S3Client; publicS3?: S3Client; s3BucketReady?: boolean };

export const BUCKET = process.env.MINIO_BUCKET || 'shadowdrive-recordings';

export function getS3(): S3Client | null {
    const endpoint = process.env.MINIO_ENDPOINT;
    const accessKey = process.env.MINIO_ACCESS_KEY || process.env.MINIO_ROOT_USER;
    const secretKey = process.env.MINIO_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD;

    if (!endpoint || !accessKey || !secretKey) return null;

    if (!globalForS3.s3) {
        globalForS3.s3 = new S3Client({
            endpoint,
            region: 'us-east-1',
            forcePathStyle: true,
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
            },
        });
    }

    return globalForS3.s3;
}

/** Get S3 client pointing to public endpoint (for presigned download URLs). */
export function getPublicS3(): S3Client | null {
    const endpoint = process.env.MINIO_PUBLIC_ENDPOINT || process.env.MINIO_ENDPOINT;
    const accessKey = process.env.MINIO_ACCESS_KEY || process.env.MINIO_ROOT_USER;
    const secretKey = process.env.MINIO_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD;

    if (!endpoint || !accessKey || !secretKey) return null;

    if (!globalForS3.publicS3) {
        globalForS3.publicS3 = new S3Client({
            endpoint,
            region: 'us-east-1',
            forcePathStyle: true,
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
            },
        });
    }

    return globalForS3.publicS3;
}

/** Ensure the bucket exists (called once lazily). */
export async function ensureBucket(): Promise<void> {
    if (globalForS3.s3BucketReady) return;

    const s3 = getS3();
    if (!s3) return;

    try {
        await s3.send(new CreateBucketCommand({ Bucket: BUCKET }));
    } catch {
        // Bucket already exists — ignore
    }

    globalForS3.s3BucketReady = true;
}
