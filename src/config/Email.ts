// Dependencies
const nodemailer=require('nodemailer');
// Env variables
import { email, email_password, email_port, email_host } from "./Constants";

// Transporter
export const transportMail = nodemailer.createTransport({
    host: email_host,
    port: email_port,
    secure: true, // Use STARTTLS instead of SSL
    requireTLS: true,
    auth: {
        user: email,
        pass: email_password
    },
    tls: {
        rejectUnauthorized: false, // Allow self-signed certificates in development
    }
})    
