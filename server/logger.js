const log4js = require('log4js');

log4js.configure({
    appenders: {
        out: { type: 'stdout', layout: { type: 'json', separator: '' } }
    },
    categories: {
        default: { appenders: ['out'], level: 'info' }
    }
});

const logger = log4js.getLogger();
logger.level = 'info';

module.exports = { logger };