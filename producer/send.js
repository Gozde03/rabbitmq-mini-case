const amqp = require("amqplib");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
const QUEUE_NAME = process.env.QUEUE_NAME || "mini-case-queue";

async function sendMessage() {
  const message = process.argv.slice(2).join(" ") || "Hello from producer";

  try {
    console.log(`[Producer] Connecting to RabbitMQ at ${RABBITMQ_URL}...`);
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });

    channel.sendToQueue(QUEUE_NAME, Buffer.from(message), {
      persistent: true
    });

    console.log(`[Producer] Message sent to "${QUEUE_NAME}": ${message}`);

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("[Producer] Failed to send message:", error.message);
    process.exit(1);
  }
}

sendMessage();
