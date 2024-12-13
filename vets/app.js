const dotenv = require('dotenv');
dotenv.config();

const amqp = require('amqplib');
const fs = require('fs');

let locations = [];

function getLocation() {
	const randomIndex = Math.floor(Math.random() * locations.length);
	const newLocation = locations[randomIndex];
	locations.splice(randomIndex, 1);
	return newLocation;
}

async function produceMessage() {
	try {
		const connection = await amqp.connect(`amqp://${process.env.RABBITMQ_HOST}`);
		const channel = await connection.createChannel();
		const queue = process.env.RABBITMQ_QUEUE;
		const msg = JSON.stringify(getLocation());

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

locations = JSON.parse(fs.readFileSync('locations.json'));
console.log('[*] Sending messages in \'%s\' queue every %d sec:', process.env.RABBITMQ_QUEUE, process.env.MESSAGE_INTERVAL / 1000);
setInterval(produceMessage, process.env.MESSAGE_INTERVAL);