const amqp = require('amqplib');

const connectWithRetry = async (host) => {
    let connection;
    while (true) {
        try {
            connection = await amqp.connect(`amqp://${host}`);
            console.log('[*] Successfully connected to RabbitMQ!');
            return connection;
        } catch (err) {
            console.error('[!] Failed to connect to RabbitMQ, retrying in 5 seconds...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};

async function startConsumer() {
    const exchangeName = 'post_ads'; 
    const rabbitHost = process.env.RABBITMQ_HOST || 'localhost';

    try {
        const connection = await connectWithRetry(rabbitHost);
        const channel = await connection.createChannel();

        await channel.assertExchange(exchangeName, 'fanout', { durable: false });
        const q = await channel.assertQueue('', { exclusive: true });

        console.log(`[*] Agency #${process.env.HOSTNAME || 'local'} is waiting for messages. Bound to queue: ${q.queue}`);
        await channel.bindQueue(q.queue, exchangeName, '');

        channel.consume(q.queue, (msg) => {
            if (msg.content) {
                const postData = JSON.parse(msg.content.toString());
                console.log("------------------------------------------");
                console.log(`[x] RECEIVED NEW ADVERTISEMENT (Agency #${process.env.HOSTNAME || 'local'}):`);
                console.log(`    Username: @${postData.username}`);
                console.log(`    Description: ${postData.description}`);
                console.log(`    Published At: ${new Date(postData.createdAt).toLocaleString('en-US')}`);
                console.log("------------------------------------------\n");
            }
        }, { noAck: true }); 

    } catch (error) {
        console.error("Fatal error, consumer is shutting down:", error);
        process.exit(1);
    }
}

startConsumer();