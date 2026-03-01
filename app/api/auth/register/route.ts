// ─── ShadowDrive AI — Email Registration Endpoint ───
// POST /api/auth/register  →  { email, password, name }

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getPrisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    const prisma = getPrisma();
    if (!prisma) {
        return NextResponse.json(
            { error: 'Kayıt şu anda kullanılamıyor.' },
            { status: 503 }
        );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
        return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
    }

    const { email, password, name } = body as {
        email?: string;
        password?: string;
        name?: string;
    };

    if (!email || !password) {
        return NextResponse.json(
            { error: 'E-posta ve şifre zorunludur.' },
            { status: 400 }
        );
    }

    if (password.length < 8) {
        return NextResponse.json(
            { error: 'Şifre en az 8 karakter olmalıdır.' },
            { status: 400 }
        );
    }

    // Check if email is already registered
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return NextResponse.json(
            { error: 'Bu e-posta zaten kayıtlı.' },
            { status: 409 }
        );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
        data: { email, name: name || null, passwordHash },
        select: { id: true, email: true, name: true },
    });

    return NextResponse.json({ user }, { status: 201 });
}
