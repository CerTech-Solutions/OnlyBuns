const MessageBrokerInterface = require('../utils/messageBrokerInterface');
const amp = require('amqplib');

let vetsLocation = [];

const initMessageInterface = async () => {
	const useRabbitMQ = process.env.USE_RABBITMQ === 'true';

	if (useRabbitMQ) {
		console.log('[*] Using RabbitMQ message interface');
		await consumeVetsMessageRabbitMQ();
	} else {
		console.log('[*] Using REST Broker message interface');
		await consumeVetsMessageREST();
	}
};

async function consumeVetsMessageRabbitMQ() {
	try {
		const connection = await amp.connect(`amqp://${process.env.RABBITMQ_HOST}`);
		const channel = await connection.createChannel();
		const queue = process.env.QUEUE_NAME;

		await channel.assertQueue(queue, { durable: false });

		channel.consume(queue, (message) => {
			vetsLocation.push(JSON.parse(message.content.toString()));
		}, { noAck: true });
	}
	catch (error) {
		console.error(error);
	}
}

async function consumeVetsMessageREST() {
	const messageInterface = new MessageBrokerInterface();

  try {
    const queueName = process.env.QUEUE_NAME;
    await messageInterface.createQueue(queueName);

    messageInterface.consumeFromQueue(queueName, (message) => {
      vetsLocation.push(message);
    }, { pollInterval: 1000 });

    console.log(`[*] Started consuming from queue: ${queueName}`);
  } catch (error) {
    console.error('Error setting up REST Broker message consumer:', error);
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
		console.log(`[x] Sent ad message to exchange '${exchangeName}': ${message}`);

		setTimeout(() => {
			connection.close();
		}, 500);

	} catch (error) {
		console.error("Error publishing ad message:", error);
	}
}

initMessageInterface().catch(console.error);

module.exports = { vetsLocation, publishAdMessage };