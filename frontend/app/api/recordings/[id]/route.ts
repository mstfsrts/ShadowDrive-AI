// GET /api/recordings/[id] — Get presigned URL for a recording
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getPrisma } from '@/lib/prisma';
import { getPublicS3, BUCKET } from '@/lib/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string } },
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrisma();
    const publicS3 = getPublicS3();
    if (!prisma || !publicS3) {
        return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    }

    try {
        const attempt = await prisma.pronunciationAttempt.findUnique({
            where: { id: params.id },
            select: { userId: true, recordingUrl: true },
        });

        if (!attempt || attempt.userId !== session.user.id) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        if (!attempt.recordingUrl) {
            return NextResponse.json({ error: 'No recording' }, { status: 404 });
        }

        const url = await getSignedUrl(
            publicS3,
            new GetObjectCommand({ Bucket: BUCKET, Key: attempt.recordingUrl }),
            { expiresIn: 3600 },
        );

        return NextResponse.json({ url });
    } catch (error) {
        console.error('[GET /api/recordings/[id]]', error);
        return NextResponse.json({ error: 'Failed to get recording' }, { status: 500 });
    }
}
