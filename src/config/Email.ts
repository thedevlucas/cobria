// Dependencies
const nodemailer=require('nodemailer');
// Env variables
import { email, email_password, email_port, email_host } from "./Constants";

// Transporter
// Port 587 uses STARTTLS (secure: false). Port 465 uses SSL (secure: true).
export const transportMail = nodemailer.createTransport({
    host: email_host,
    port: email_port,
    secure: email_port === 465,
    auth: {
        user: email,
        pass: email_password
    },
    tls: {
        rejectUnauthorized: false,
    }
})    
