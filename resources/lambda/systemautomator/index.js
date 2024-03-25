const AWS = require('aws-sdk');
var zlib = require('zlib');
var axios = require('axios');
const slackToken = process.env.Token_Workspace_Slack;
exports.handler = function(event) {
var obj = JSON.parse(JSON.stringify(event, null, 2));
var payload = Buffer.from(obj.awslogs.data, 'base64');

zlib.gunzip(payload, function(e, result) {
var msg = JSON.parse(result.toString('ascii'));
var setLogGroup = "monteiro-tests" //NAO ESQUECA DE BOTAR O LOGGROUP CERTO
var getMessage = msg["logEvents"][0]["message"];
var getLogGroup = msg["logGroup"];
var getLogStream = msg["logStream"];
var getTimestamp = msg["logEvents"][0]["timestamp"];
var timestampNow = new Date(getTimestamp);
var newLogStream = getLogStream.replace(/\//g, "$252F");
var logStreamEncoded = encodeURIComponent(getLogStream);
var getLogStreamScap = getLogStream.replace(/\//g, "\\/");
// var urlGetLogGroup = "<https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/"+getLogGroup+"|"+getLogGroup+">";
// var urlLogStream = "<https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/"+setLogGroup+"/log-events/"+newLogStream+"|"+getLogStream+">";
var logDatomicVersion;
var directUrlLogStream = "";
var foundVersion = false;
var logStreamScaped = "";
var logGroupScaped = "";

var timeStampStart = "";
var timeStampEnd = "";

async function run() {
    return new Promise((resolve, reject) => {
        var cloudwatchlogs = new AWS.CloudWatchLogs({region: 'us-east-1'});
        var params = {
            logGroupName: setLogGroup,
            logStreamNamePrefix: getLogStream,
            limit: 1
        };

        cloudwatchlogs.describeLogStreams(params, function(err, data) {
            if (err) {
                console.log(err, err.stack);
                reject(err);
            } else {
                var params = {
                    logGroupName: setLogGroup,
                    logStreamName: data.logStreams[0].logStreamName,
                    limit: 100
                };

                cloudwatchlogs.getLogEvents(params, function(err, data) {
                    if (err) {
                        console.log(err, err.stack);
                        reject(err);
                    } else {
                        let foundVersion = false;
                        var timestampOriginalCru = new Date().getTime();
                        var timestampOriginal = timestampOriginalCru - (15 * 1000);

                        const dataOriginal = new Date(timestampOriginal);
                        dataOriginal.setSeconds(dataOriginal.getSeconds() + 15);
                        const timestampNovo = dataOriginal.getTime();

                        // directUrlLogStream = "<https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/"+setLogGroup+"/log-events/"+logStreamEncoded+"$3Fstart$3D"+timestampOriginal+"$26end$3D"+timestampNovo+"|"+getLogStream.trim()+">";
                        timeStampStart = timestampOriginal;
                        timeStampEnd = timestampNovo;
                        // logStreamScaped = directUrlLogStream.replace(/["#]/g, (match) => {
                        //     return match === '"' ? '\\"' : '%23';
                        //   });
                        //   console.log("logstream depois do scaped -> " + logStreamScaped);
                        // // logStreamScaped = directUrlLogStream;
                        // logGroupScaped = urlGetLogGroup.replace(/["#]/g, (match) => {
                        //     return match === '"' ? '\\"' : '%23';
                        //   });
                        for(var i = 0; i < data.events.length; i++) {
                            if(data.events[i].message.indexOf("version") > -1) {
                                var mensagem = JSON.stringify(data.events[i]);
                                var objetoJson = JSON.parse(mensagem);
                                var valorMessage = objetoJson.message;
                                const valorMessageComAspasEscapadas = valorMessage.replace(/"/g, '\\"');

                                const messageScaped = getMessage.replace(/"/g, '\\"');
                                const urlSystemAutomator = `https://5419-2804-1b3-a000-37e5-f50d-e2de-672d-fd7f.ngrok-free.app/api/v1/alerts-system-automator?log="${valorMessageComAspasEscapadas}"&time=${timestampNow}&loggroup=${getLogGroup}&logname=${getLogStream}&timestampstart=${timeStampStart}&timestampend=${timeStampEnd}&message=${getMessage}&channel=${process.env.Channel_Id_Slack}&authorization=${slackToken}`;
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

                                foundVersion = true;
                                break;
                            }
                        }

                        resolve(foundVersion);
                    }
                });
            }
        });
    });
}
run().then(foundVersion => {
    if (!foundVersion) {
        const urlSystemAutomator = `https://5419-2804-1b3-a000-37e5-f50d-e2de-672d-fd7f.ngrok-free.app/api/v1/alerts-system-automator?log="{:nothing 123}"&time=${timestampNow}&loggroup=${getLogGroup}&logname=${getLogStream}&timestampstart=${timeStampStart}&timestampend=${timeStampEnd}&message=${getMessage}&channel=${process.env.Channel_Id_Slack}&authorization=${slackToken}`;
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
}).catch(err => {
    console.error('Erro:', err);
});
    });
};