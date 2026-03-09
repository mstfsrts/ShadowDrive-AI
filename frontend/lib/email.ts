import { Resend } from "resend";

// Initialize with a dummy key for local development to prevent crashes
const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_for_dev_only");

export const sendPasswordResetEmail = async (email: string, resetUrl: string) => {
    try {
        const { data, error } = await resend.emails.send({
            // Artık kendi domaininizi bağladığınız için buradan gönderebiliriz.
            // Bu sayede e-postalar herkese gidebilir ve Spama düşme ihtimali azalır.
            from: "ShadowDrive AI <noreply@shadowdrive.mustafasaritas.nl>",
            to: email,
            subject: "Şifrenizi Sıfırlayın - ShadowDrive AI",
            html: `
                <div style="font-family: Arial, sans-serif; max-w-lg mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-100">
                    <h2 style="color: #333; text-align: center; margin-bottom: 24px;">Şifre Sıfırlama Talebi</h2>
                    
                    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                        Merhaba,<br><br>
                        ShadowDrive AI hesabınız için bir şifre sıfırlama talebi aldık. Şifrenizi yenilemek için aşağıdaki butona tıklayabilirsiniz:
                    </p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                           Şifremi Sıfırla
                        </a>
                    </div>

                    <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
                        Veya şu bağlantıyı tarayıcınıza kopyalayabilirsiniz:<br>
                        <a href="${resetUrl}" style="color: #10b981; word-break: break-all;">${resetUrl}</a>
                    </p>

                    <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />

                    <p style="color: #888; font-size: 12px; text-align: center;">
                        Bu talebi siz yapmadıysanız bu e-postayı güvenle silebilirsiniz.<br>
                        © 2026 ShadowDrive AI
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error("Resend API Error:", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Email send failed:", error);
        return { success: false, error };
    }
};
