const dotenv = require('dotenv');
dotenv.config();

const amqp = require('amqplib');
const fs = require('fs').promises;

async function readFile() {
	const data = await fs.readFile('locations.json');
	const locations = JSON.parse(data);
	const randomIndex = Math.floor(Math.random() * locations.length);
	return locations[randomIndex];
}

async function produceMessage() {
	try {
		const connection = await amqp.connect(`amqp://${process.env.RABBITMQ_HOST}`);
		const channel = await connection.createChannel();
		const queue = process.env.RABBITMQ_QUEUE;
		const msg = JSON.stringify(await readFile());

		await channel.assertQueue(queue, {
			durable: false
		});

		channel.sendToQueue(queue, Buffer.from(msg));
		console.log(" [x] Sent %s", msg);

		setTimeout(() => {
			connection.close();
		}, 500);

	} catch (error) {
		console.error(error);
	}
}

setInterval(produceMessage, 5000);