// src/lib/mailer.js
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "pocox3prorivo@gmail.com",
        pass: "bytl gtxz kwnn jpti"
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
        console.error("Email sending failed:", error);
        return false;
    }
}