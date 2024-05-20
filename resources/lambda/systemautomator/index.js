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
                                const urlSystemAutomator = `https://ac7dhepzzc.execute-api.us-east-1.amazonaws.com/api/v1/alerts-system-automator?log="${valorMessageComAspasEscapadas}"&time=${timestampNow}&loggroup=${getLogGroup}&logname=${getLogStream}&timestampstart=${timeStampStart}&timestampend=${timeStampEnd}&message=${getMessage}&channel=${process.env.Channel_Id_Slack}&authorization=${slackToken}`;
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
        const urlSystemAutomator = `https://ac7dhepzzc.execute-api.us-east-1.amazonaws.com/api/v1/alerts-system-automator?log="{:nothing 123}"&time=${timestampNow}&loggroup=${getLogGroup}&logname=${getLogStream}&timestampstart=${timeStampStart}&timestampend=${timeStampEnd}&message=${getMessage}&channel=${process.env.Channel_Id_Slack}&authorization=${slackToken}`;
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

//contaning filter logs version 1
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
var timeStampStart;
var timeStampEnd;

var timestampOriginalCru = new Date().getTime();
//var timestampOriginal = timestampOriginalCru - (7 * 1000);
var timestampOriginal = new Date(getTimestamp).getTime() - 2000;


const timestampNovo = new Date(getTimestamp).getTime() + 2000;
timeStampStart = timestampOriginal;
timeStampEnd = timestampNovo;
var urlGetLogGroup = "<https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/"+getLogGroup+"|"+getLogGroup+">";
var urlLogStream = "<https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/system-automator/log-events/"+newLogStream+"$3Fstart$3D"+timeStampStart+"$26end$3D"+timeStampEnd+"|"+getLogStream+">";


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

//version with filter many types secs
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
var timeStampStart2Secs;
var timeStampEnd2Secs;
var timeStampStart5Secs;
var timeStampEnd5Secs;
var timeStampStart30Secs;
var timeStampEnd30Secs;
var timeStampStart60Secs;
var timeStampEnd60Secs;


var timestampOriginal2Secs = new Date(getTimestamp).getTime() - 2000;
var timestampOriginal5Secs = new Date(getTimestamp).getTime() - 5000;
var timestampOriginal30Secs = new Date(getTimestamp).getTime() - 30000;
var timestampOriginal60Secs = new Date(getTimestamp).getTime() - 60000;

const timestampNovo2Secs = new Date(getTimestamp).getTime() + 2000;
const timestampNovo5Secs = new Date(getTimestamp).getTime() + 5000;
const timestampNovo30Secs = new Date(getTimestamp).getTime() + 30000;
const timestampNovo60Secs = new Date(getTimestamp).getTime() + 60000;

timeStampStart2Secs = timestampOriginal2Secs;
timeStampEnd2Secs = timestampNovo2Secs;

timeStampStart5Secs = timestampOriginal5Secs;
timeStampEnd5Secs = timestampNovo5Secs;

timeStampStart30Secs = timestampOriginal30Secs;
timeStampEnd30Secs = timestampNovo30Secs;

timeStampStart60Secs = timestampOriginal60Secs;
timeStampEnd60Secs = timestampNovo60Secs;



var urlGetLogGroup = "<https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/"+getLogGroup+"|"+getLogGroup+">";
var urlLogStream2Secs = "<https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/monteiro-tests/log-events/"+newLogStream+"$3Fstart$3D"+timeStampStart2Secs+"$26end$3D"+timeStampEnd2Secs+"|"+getLogStream+">";
var urlLogStream5Secs = "<https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/monteiro-tests/log-events/"+newLogStream+"$3Fstart$3D"+timeStampStart5Secs+"$26end$3D"+timeStampEnd5Secs+"|"+getLogStream+">";
var urlLogStream30Secs = "<https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/monteiro-tests/log-events/"+newLogStream+"$3Fstart$3D"+timeStampStart30Secs+"$26end$3D"+timeStampEnd30Secs+"|"+getLogStream+">";
var urlLogStream60Secs = "<https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/monteiro-tests/log-events/"+newLogStream+"$3Fstart$3D"+timeStampStart60Secs+"$26end$3D"+timeStampEnd60Secs+"|"+getLogStream+">";


async function run() {
            const url = 'https://slack.com/api/chat.postMessage';
            const res = await axios.post(url, {
            channel: process.env.Channel_Id_Slack,
            text: '*An alert in the tests*: \n *_Time of the occurence_*: '+timestampNow+'\n *_LogGroup_*: '+urlGetLogGroup+'\n *_Logname (2 secs filtered)_*: '+urlLogStream2Secs+'\n *_Logname (5 secs filtered)_*: '+urlLogStream5Secs+'\n *_Logname (30 secs filtered)_*: '+urlLogStream30Secs+'\n *_Logname (1 min filtered)_*: '+urlLogStream60Secs+'\n *_Message from log_*: ```'+getMessage+'```'
        }, { headers: { authorization: `Bearer ${slackToken}` } });
    }
            run();
    });
};