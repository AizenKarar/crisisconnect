
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "karar.nabil.montasir@g.bracu.ac.bd",
        pass: "pmyu alsl irym mvjn"
    }
});

export async function sendEmergencyEmail(to, subject, text) {
    try {
        await transporter.sendMail({
            from: "pocox3prorivo@gmail.com",
            to: to,
            subject: subject,
            text: text
        });
        return true;
    } catch (error) {
        console.error("ACTUAL EMAIL ERROR:", error);
        throw error;
    }
}