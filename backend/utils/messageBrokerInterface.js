const axios = require('axios');

class MessageBrokerInterface {
	constructor(brokerUrl = process.env.MESSAGE_BROKER_URL) {
		this.brokerUrl = brokerUrl;
		this.pollingIntervals = new Map();
	}

	async createQueue(queueName) {
		try {
			await axios.post(`${this.brokerUrl}/queues/${queueName}`);
		} catch (error) {
			console.warn(`Queue ${queueName} may already exist`);
		}
	}

	async createExchange(exchangeName, type = 'fanout') {
		try {
			await axios.post(`${this.brokerUrl}/exchanges/${exchangeName}`, { type });
		} catch (error) {
			console.warn(`Exchange ${exchangeName} may already exist`);
		}
	}

	async bindQueue(exchangeName, queueName) {
		try {
			await axios.post(`${this.brokerUrl}/exchanges/${exchangeName}/bindings/${queueName}`);
		} catch (error) {
			console.error(`Failed to bind queue ${queueName} to exchange ${exchangeName}:`, error.message);
		}
	}

	async publishToQueue(queueName, message) {
		try {
			await axios.post(`${this.brokerUrl}/queues/${queueName}/messages`, message);
		} catch (error) {
			console.error(`Failed to publish to queue ${queueName}:`, error.message);
			throw error;
		}
	}

	async publishToExchange(exchangeName, message) {
		try {
			await axios.post(`${this.brokerUrl}/exchanges/${exchangeName}/messages`, message);
		} catch (error) {
			console.error(`Failed to publish to exchange ${exchangeName}:`, error.message);
			throw error;
		}
	}

	async consumeFromQueue(queueName, callback, options = {}) {
		const { pollInterval = 1000, limit = 10 } = options;

		const poll = async () => {
			try {
				const response = await axios.get(`${this.brokerUrl}/queues/${queueName}/messages`, {
					params: { limit }
				});

				const { messages } = response.data;
				messages.forEach(message => {
					callback(message);
				});
			} catch (error) {
				console.error(`Error polling queue ${queueName}:`, error.message);
			}
		};

		// Start polling
		const intervalId = setInterval(poll, pollInterval);
		this.pollingIntervals.set(queueName, intervalId);

		return () => {
			clearInterval(intervalId);
			this.pollingIntervals.delete(queueName);
		};
	}

	stopConsumer(queueName) {
		if (this.pollingIntervals.has(queueName)) {
			clearInterval(this.pollingIntervals.get(queueName));
			this.pollingIntervals.delete(queueName);
		}
	}

	async health() {
		try {
			const response = await axios.get(`${this.brokerUrl}/health`);
			return response.data;
		} catch (error) {
			console.error('Message broker health check failed:', error.message);
			return { status: 'unhealthy' };
		}
	}
}

module.exports = MessageBrokerInterface;