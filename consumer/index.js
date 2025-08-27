const { Kafka } = require('kafkajs');
const log4js = require('log4js');

// Fixed JSON logs configuration
log4js.configure({
    appenders: {
        out: {
            type: 'stdout',
            layout: {
                type: 'pattern',
                pattern: '%m'
            }
        }
    },
    categories: {
        default: { appenders: ['out'], level: 'info' }
    }
});

const logger = log4js.getLogger();

const BROKER = process.env.KAFKA_BROKER || 'kafka:9092';
const TOPIC = process.env.KAFKA_TOPIC || 'cdc-events';

const kafka = new Kafka({ clientId: 'cdc-consumer', brokers: [BROKER] });
const consumer = kafka.consumer({ groupId: 'cdc-group' });

async function run() {
    console.log('Starting CDC Consumer...');

    await consumer.connect();
    await consumer.subscribe({ topic: TOPIC, fromBeginning: true });

    await consumer.run({
        eachMessage: async({ topic, partition, message }) => {
            // Manual JSON formatting to avoid log4js layout issues
            const logEntry = {
                timestamp: new Date().toISOString(),
                action: 'cdc_event',
                topic,
                partition,
                offset: message.offset,
                key: message.key ? message.key.toString() : null,
                value: message.value ? message.value.toString() : null
            };

            // Use console.log instead of logger to avoid layout issues
            console.log(JSON.stringify(logEntry));
        }
    });
}

run().catch((err) => {
    console.error(JSON.stringify({
        action: 'consumer_error',
        error: err.message,
        timestamp: new Date().toISOString()
    }));
    process.exit(1);
});