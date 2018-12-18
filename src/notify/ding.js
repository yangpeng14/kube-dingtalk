const config = require('config');
const logger = require('../logger');

class DingTalkNotifier {
	constructor() {
		let opts = {};

		try {
			this.robot = require('dingtalk-robot')(config.dingtalk_token);
		} catch (err) {
			logger.error({ err }, 'Could not initialize Slack');
			this.robot = null;
		}
	}

	notify(item) {
		if (!this.robot) {
			return;
		}

    let channel = item.channel || 'no-channel'
    delete item.channel

    return this.robot.send({
      msgtype: 'markdown',
      markdown: {
          title: 'Kubernetes Notification:',
          text: '#### Kubernetes Notification:\n' +
                '> title: **' + item.title + '**\n\n' +
                '> text: `' + item.text + '`\n'
      }
    }, function(err, data) {
        if (err) {
          logger.error({ err }, 'Could not send notification to Slack');
            return;
        }
        logger.info('Slack message sent');
        logger.info(data);
    });
	}
}

module.exports = DingTalkNotifier;
