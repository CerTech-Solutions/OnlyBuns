const dotenv = require('dotenv');
dotenv.config();

const amqp = require('amqplib');
const axios = require('axios');
const fs = require('fs');

let locations = JSON.parse(fs.readFileSync('locations.json'));

function getLocation() {
	const randomIndex = Math.floor(Math.random() * locations.length);
	const newLocation = locations[randomIndex];
	locations.splice(randomIndex, 1);
	return newLocation;
}

async function produceMessageRabbitMQ() {
	try {
		const connection = await amqp.connect(`amqp://${process.env.RABBITMQ_HOST}`);
		const channel = await connection.createChannel();
		const queue = process.env.QUEUE_NAME;
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

async function produceMessageRest() {
  try {
    const brokerUrl = process.env.MESSAGE_BROKER_URL;
    const queueName = process.env.QUEUE_NAME;
    const location = getLocation();

    // Ensure queue exists
    await axios.post(`${brokerUrl}/queues/${queueName}`).catch(() => {});

    // Send message
    await axios.post(`${brokerUrl}/queues/${queueName}/messages`, location);
    console.log(" [x] Sent:", JSON.stringify(location));

  } catch (error) {
    console.error('Error sending message via REST:', error);
  }
}

async function produceMessage() {
  const useRabbitMQ = process.env.USE_RABBITMQ === 'true';

  if (useRabbitMQ) {
    await produceMessageRabbitMQ();
  } else {
    await produceMessageRest();
  }
}

const messageType = process.env.USE_RABBITMQ === 'true' ? 'RabbitMQ' : 'REST Broker';

console.log('[*] Sending messages via %s in \'%s\' queue every %d sec:',
  messageType, process.env.QUEUE_NAME, process.env.MESSAGE_INTERVAL / 1000);

setInterval(produceMessage, process.env.MESSAGE_INTERVAL);