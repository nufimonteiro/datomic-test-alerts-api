var zlib = require('zlib');
var axios = require('axios');
const slackToken = process.env.Token_Workspace_Slack;
exports.handler = function(event) {
var obj = JSON.parse(JSON.stringify(event, null, 2));
var payload = Buffer.from(obj.awslogs.data, 'base64');

zlib.gunzip(payload, function(e, result) {
var msg = JSON.parse(result.toString('ascii'));
var getMessage = msg["logEvents"][0]["message"];
var getLogGroup = msg["logGroup"];
var getLogStream = msg["logStream"];
var getTimestamp = msg["logEvents"][0]["timestamp"];
var timestampNow = new Date(getTimestamp);
var newLogStream = getLogStream.replace(/\//g, "$252F");
var urlGetLogGroup = "<https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/"+getLogGroup+"|"+getLogGroup+">";
var urlLogStream = "<https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/system-automator/log-events/"+newLogStream+"|"+getLogStream+">";

async function run() {
            const url = 'https://slack.com/api/chat.postMessage';
            const res = await axios.post(url, {
            channel: process.env.Channel_Id_Slack,
            text: '*An alert in the tests*: \n *_Time of the occurence_*: '+timestampNow+'\n *_LogGroup_*: '+urlGetLogGroup+'\n *_Logname_*: '+urlLogStream+'\n *_Message from log_*: ```'+getMessage+'```'
        }, { headers: { authorization: `Bearer ${slackToken}` } });
    }
            run();
    });
};