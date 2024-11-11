const dotenv = require('dotenv').config();
const nodemailer = require('nodemailer');

class EmailService {
	constructor() {
		this.transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: process.env.SMTP_PORT,
			secure: true,
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASSWORD
			}
		});
	}

	async sendActivationEmail(email, token) {
		const activationLink = `http://localhost:3000/api/user/activate/${token}`;

		const mailOptions = {
			from: process.env.SMTP_USER,
			to: email,
			subject: 'Account activation for OnlyBuns',
			text: '',
			html: `
				<div>
					<h1>Account activation</h1>
					<p>To activate your account, please follow this link: <a href="${activationLink}">Activate account</a></p>
				</div>
			`
		};

		await this.transporter.sendMail(mailOptions);
	}
}

module.exports = new EmailService();