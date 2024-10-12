import {
    EMAIL_FROM,
    EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT,
    EMAIL_SERVER_USER,
    EMAIL_SERVER_PASSWORD,
} from '$env/static/private'
import nodemailer from 'nodemailer'
import { obj2encodedFormString } from '$lib/utils'

const baseUrl = 'http://localhost:5173' // hardcoded

export const smtpOptions = {
    host: EMAIL_SERVER_HOST,
    port: Number(EMAIL_SERVER_PORT),
    secure: false, // true for port 465, false for other ports
    auth: {
        user: EMAIL_SERVER_USER,
        pass: EMAIL_SERVER_PASSWORD,
    },
}

const transporter = nodemailer.createTransport(smtpOptions)

export async function sendEmail(to: string, subject: string, text: string, html: string) {
    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: EMAIL_FROM, // sender address
        to, // list of receivers
        subject, // Subject line
        text, // plain text body
        html, // html body
    })

    if (info.messageId) {
        console.log(`Message ${info.messageId} sent`)
        return true
    } else {
        return false
    }
}

export async function sendVerificationEmail(to: string, userId: string, token: string) {
    const url = `${baseUrl}/verify?${obj2encodedFormString({ userId, token })}`

    const subject = 'Verify your email address'
    const text = `Verify your email address by clicking the link: ${url}`
    const html = `<a href="${url}">Verify your email address</a>`

    return await sendEmail(to, subject, text, html)
}

export async function sendResetPasswordEmail(to: string, userId: string, token: string) {
    const url = `${baseUrl}/resetPassword?${obj2encodedFormString({ userId, token })}`

    const subject = 'Password reset request'
    const text = `Reset your password by clicking the link: ${url}`
    const html = `<a href="${url}">Reset your password</a>`

    return await sendEmail(to, subject, text, html)
}
