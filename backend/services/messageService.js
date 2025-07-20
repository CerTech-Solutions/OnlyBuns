const amp = require('amqplib');

let vetsLocation = [];

async function consumeMessage() {
	try {
		const connection = await amp.connect(`amqp://${process.env.RABBITMQ_HOST}`);
		const channel = await connection.createChannel();
		const queue = process.env.RABBITMQ_QUEUE;

		await channel.assertQueue(queue, { durable: false });

		channel.consume(queue, (message) => {
			vetsLocation.push(JSON.parse(message.content.toString()));
		}, { noAck: true });
	}
	catch (error) {
		console.error(error);
	}
}

async function publishAdMessage(postData) {
    const exchangeName = 'post_ads';
    try {
        const connection = await amp.connect(`amqp://${process.env.RABBITMQ_HOST}`);
        const channel = await connection.createChannel();

        await channel.assertExchange(exchangeName, 'fanout', { durable: false });
        const message = JSON.stringify(postData);
        channel.publish(exchangeName, '', Buffer.from(message));

        setTimeout(() => {
            connection.close();
        }, 500);

    } catch (error) {
        console.error("Error publishing ad message:", error);
    }
}

consumeMessage();

module.exports = { vetsLocation, publishAdMessage };