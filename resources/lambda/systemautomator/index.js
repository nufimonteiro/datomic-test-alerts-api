const AWS = require('aws-sdk');
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
var logDatomicVersion;

async function run() {
  var cloudwatchlogs = new AWS.CloudWatchLogs({region: 'us-east-1'});

  var params = {
    logGroupName: 'monteiro-tests',
    logStreamNamePrefix: 'tests',
    limit: 1
};

cloudwatchlogs.describeLogStreams(params, function(err, data) {
    if (err) {
        console.log(err, err.stack);
    } else {
        var params = {
            logGroupName: 'monteiro-tests',
            logStreamName: data.logStreams[0].logStreamName,
            limit: 100
        };

        cloudwatchlogs.getLogEvents(params, function(err, data) {
            if (err) {
                console.log(err, err.stack);
            } else {
                for(var i = 0; i < data.events.length; i++) {
                    if(data.events[i].message.indexOf("version") > -1) {
                            var mensagem = JSON.stringify(data.events[i]);
                            var objetoJson = JSON.parse(mensagem);
                            var valorMessage = objetoJson.message;
                            console.log("Apenas o log = " + valorMessage);
                            const valorMessageComAspasEscapadas = valorMessage.replace(/"/g, '\\"');
                            const logStreamScaped = urlLogStream.replace(/["#]/g, (match) => {
                                return match === '"' ? '\\"' : '%23';
                              });
                            const logGroupScaped = urlGetLogGroup.replace(/["#]/g, (match) => {
                                return match === '"' ? '\\"' : '%23';
                              });
                            const messageScaped = getMessage.replace(/"/g, '\\"');
                            const urlSystemAutomator = `https://ac7dhepzzc.execute-api.us-east-1.amazonaws.com/api/v1/alerts-system-automator?log="${valorMessageComAspasEscapadas}"&time=${timestampNow}&loggroup=${logGroupScaped}&logname=${logStreamScaped}&message=${getMessage}&channel=${process.env.Channel_Id_Slack}&authorization=${slackToken}`;

                            axios.post(urlSystemAutomator, null, {
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'DatomicTestAlerts!!'
                                }
                            })
                                .then(response => {
                                    console.log('API return -> ' + response.data);
                                })
                                .catch(error => {
                                    console.error('Error:', error.message);
                                });
                            }
                }
            }
        });
    }
});
}
        run();
    });
};