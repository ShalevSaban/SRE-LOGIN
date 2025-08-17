const { Kafka } = require('kafkajs');
const log4js = require('log4js');

// JSON logs to stdout
log4js.configure({
    appenders: { out: { type: 'stdout', layout: { type: 'json', separator: '' } } },
    categories: { default: { appenders: ['out'], level: 'info' } }
});
const logger = log4js.getLogger();

const BROKER = process.env.KAFKA_BROKER || 'kafka:9092';
const TOPIC = process.env.KAFKA_TOPIC || 'cdc-events'; // make sure TiCDC sinks to this

const kafka = new Kafka({ clientId: 'cdc-consumer', brokers: [BROKER] });
const consumer = kafka.consumer({ groupId: 'cdc-group' });

async function run() {
    await consumer.connect();
    await consumer.subscribe({ topic: TOPIC, fromBeginning: true });

    await consumer.run({
        eachMessage: async({ topic, partition, message }) => {
            logger.info(JSON.stringify({
                timestamp: new Date().toISOString(),
                action: 'cdc_event',
                topic,
                partition,
                offset: message.offset,
                key: message.key ? message.key.toString() : null,
                value: message.value ? message.value.toString() : null
            }));
        }
    });
}

run().catch((err) => {
    logger.error(JSON.stringify({ action: 'consumer_error', error: err.message }));
    process.exit(1);
});