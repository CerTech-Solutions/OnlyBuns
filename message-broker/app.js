const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const messageQueues = new Map();
const exchanges = new Map();

// Queue management
app.post('/queues/:queueName', (req, res) => {
  const { queueName } = req.params;
  if (!messageQueues.has(queueName)) {
    messageQueues.set(queueName, []);
  }
  res.status(201).json({ message: `Queue ${queueName} created` });
});

// Exchange management (for fanout pattern)
app.post('/exchanges/:exchangeName', (req, res) => {
  const { exchangeName } = req.params;
  const { type = 'fanout' } = req.body;

  if (!exchanges.has(exchangeName)) {
    exchanges.set(exchangeName, { type, bindings: [] });
  }
  res.status(201).json({ message: `Exchange ${exchangeName} created` });
});

// Bind queue to exchange
app.post('/exchanges/:exchangeName/bindings/:queueName', (req, res) => {
  const { exchangeName, queueName } = req.params;

  if (!exchanges.has(exchangeName)) {
    return res.status(404).json({ error: 'Exchange not found' });
  }

  if (!messageQueues.has(queueName)) {
    messageQueues.set(queueName, []);
  }

  const exchange = exchanges.get(exchangeName);
  if (!exchange.bindings.includes(queueName)) {
    exchange.bindings.push(queueName);
  }

  res.json({ message: `Queue ${queueName} bound to exchange ${exchangeName}` });
});

// Publish to queue
app.post('/queues/:queueName/messages', (req, res) => {
  const { queueName } = req.params;
  const message = req.body;

  if (!messageQueues.has(queueName)) {
    messageQueues.set(queueName, []);
  }

  messageQueues.get(queueName).push({
    ...message,
    timestamp: new Date(),
    id: Date.now()
  });

  res.status(201).json({ message: 'Message published' });
});

// Publish to exchange
app.post('/exchanges/:exchangeName/messages', (req, res) => {
  const { exchangeName } = req.params;
  const message = req.body;

  if (!exchanges.has(exchangeName)) {
    return res.status(404).json({ error: 'Exchange not found' });
  }

  const exchange = exchanges.get(exchangeName);
  const messageWithMeta = {
    ...message,
    timestamp: new Date(),
    id: Date.now()
  };

  // Fanout to all bound queues
  exchange.bindings.forEach(queueName => {
    if (!messageQueues.has(queueName)) {
      messageQueues.set(queueName, []);
    }
    messageQueues.get(queueName).push(messageWithMeta);
  });

  res.status(201).json({ message: 'Message published to exchange' });
});

// Consume messages (polling)
app.get('/queues/:queueName/messages', (req, res) => {
  const { queueName } = req.params;
  const { limit = 10, ack = true } = req.query;

  if (!messageQueues.has(queueName)) {
    return res.json({ messages: [] });
  }

  const queue = messageQueues.get(queueName);
  const messages = queue.splice(0, parseInt(limit));

  res.json({ messages });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    queues: Array.from(messageQueues.keys()),
    exchanges: Array.from(exchanges.keys())
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Message Broker running on port ${PORT}`);
});