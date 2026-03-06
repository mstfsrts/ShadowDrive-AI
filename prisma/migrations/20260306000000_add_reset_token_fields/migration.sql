-- AddColumn: resetToken ve resetTokenExpiry alanları User tablosuna ekleniyor
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP(3);
