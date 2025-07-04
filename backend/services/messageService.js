const amp = require('amqplib');

let vetsLocation = [];

async function consumeMessage() {
	try {
		const connection = await amp.connect(`amqp://${process.env.RABBITMQ_HOST}`);
		const channel = await connection.createChannel();
		const queue = process.env.RABBITMQ_QUEUE;

		await channel.assertQueue(queue, { durable: false });

		channel.consume(queue, (message) => {
			console.log(`[-] Received message from queue "${queue}": ${message.content.toString()}`);
			vetsLocation.push(JSON.parse(message.content.toString()));
		}, { noAck: true });
	}
	catch (error) {
		console.error(error);
	}
}

consumeMessage();

module.exports = { vetsLocation };