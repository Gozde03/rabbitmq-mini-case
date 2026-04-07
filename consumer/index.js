const amqp = require("amqplib");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
const QUEUE_NAME = process.env.QUEUE_NAME || "mini-case-queue";
const RETRY_DELAY_MS = Number(process.env.RETRY_DELAY_MS || 5000);

let connection = null;
let channel = null;
let isShuttingDown = false;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`[Consumer] Received ${signal}. Shutting down gracefully...`);

  try {
    if (channel) {
      await channel.close();
      console.log("[Consumer] Channel closed.");
    }
  } catch (error) {
    console.error("[Consumer] Error while closing channel:", error.message);
  }

  try {
    if (connection) {
      await connection.close();
      console.log("[Consumer] Connection closed.");
    }
  } catch (error) {
    console.error("[Consumer] Error while closing connection:", error.message);
  }

  process.exit(0);
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

async function connectWithRetry() {
  while (!isShuttingDown) {
    try {
      console.log(`[Consumer] Connecting to RabbitMQ at ${RABBITMQ_URL}...`);
      connection = await amqp.connect(RABBITMQ_URL);

      connection.on("error", (err) => {
        if (!isShuttingDown) {
          console.error("[Consumer] Connection error:", err.message);
        }
      });

      connection.on("close", () => {
        if (!isShuttingDown) {
          console.error("[Consumer] Connection closed.");
          process.exit(1);
        }
      });

      channel = await connection.createChannel();

      await channel.assertQueue(QUEUE_NAME, {
        durable: true
      });

      console.log(`[Consumer] Waiting for messages in queue: ${QUEUE_NAME}`);

      await channel.consume(
        QUEUE_NAME,
        (msg) => {
          if (!msg) {
            console.warn("[Consumer] Received null message.");
            return;
          }

          const content = msg.content.toString();
          console.log(`[Consumer] Received message: ${content}`);
          channel.ack(msg);
        },
        {
          noAck: false
        }
      );

      return;
    } catch (error) {
      if (isShuttingDown) return;

      console.error(`[Consumer] Failed to start: ${error.message}`);
      console.log(`[Consumer] Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await wait(RETRY_DELAY_MS);
    }
  }
}

connectWithRetry();