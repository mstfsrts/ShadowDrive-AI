// POST /api/recordings/upload — Upload a pronunciation recording to MinIO
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getS3, ensureBucket, BUCKET } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const s3 = getS3();
    if (!s3) {
        return NextResponse.json({ error: 'Storage not configured' }, { status: 503 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const lessonId = formData.get('lessonId') as string | null;
        const lineIndex = formData.get('lineIndex') as string | null;

        if (!file || !lessonId || lineIndex === null) {
            return NextResponse.json({ error: 'Missing file, lessonId, or lineIndex' }, { status: 400 });
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 413 });
        }

        await ensureBucket();

        const ext = file.name.split('.').pop() || 'webm';
        const timestamp = Date.now();
        const key = `recordings/${session.user.id}/${lessonId}/line${lineIndex}_${timestamp}.${ext}`;

        const buffer = Buffer.from(await file.arrayBuffer());

        await s3.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: buffer,
            ContentType: file.type || 'audio/webm',
        }));

        return NextResponse.json({ url: key });
    } catch (error) {
        console.error('[POST /api/recordings/upload]', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
