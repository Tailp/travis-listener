const async = require("async");
const fs = require("fs");

const scanner = require("./scanner");
const DEST = ("folder/")

// ActiveMQ
var Stomp = require('stomp-client');
var host = process.env.ACTIVEMQ_HOSTNAME || 'localhost';
var port = process.env.ACTIVEMQ_PORT || 61613;
var destination = process.env.ACTIVEMQ_QUEUENAME || '/queue/pipeline';
var username = process.env.ACTIVEMQ_USERNAME || 'admin';
var pass = process.env.ACTIVEMQ_PASSWORD || 'admin';
var client = new Stomp(host, port, username, pass);

// jmx
var sleep = require('sleep');
var jmx = require("jmx");
var sleepTime = process.env.SLEEP_TIME || 5; // seconds
var waitQueueSize = process.env.WAIT_QUEUE_SIZE || 100; // max number of enqueued message before sleeping
var jmxHost = process.env.ACTIVEMQ_JMXHOST || 'localhost';
var jmxPort = process.env.ACTIVEMQ_JMXPORT || 1099;
jmxClient = jmx.createClient({
  host: "service:jmx:rmi:///jndi/rmi://" + jmxHost + ":" + jmxPort.toString() + "/jmxrmi", // optional
  port: jmxPort
});
jmxClient.connect();

jmxClient.on("connect", function() {
    console.log("Jmx client connected");
    client.connect(function(sessionId) {
        let count = 0;
        let nbRequest = 0;
        const startTime = new Date();
        (async function () {
            const requestPerPage = 250;
            const nbPara = 7;

            const collectedBuilds = fs.readdirSync(DEST).map(d => {
                if (d.indexOf('-') == -1) {
                    return parseInt(d.replace(".json", ""))
                } else {
                    return parseInt(d.split('-')[0])
                }
            }).sort();

            // start to scan from this Travis Job ID
            let minId = 480040000
            const start = minId;
            console.log(minId, collectedBuilds[collectedBuilds.length - 1], collectedBuilds[collectedBuilds.length - 1] - minId)
            for (let i = 0; i < nbPara; i ++) {
                async.forever(async () => {
                    var queueSize = await checkQueueSize();
                    if (queueSize < waitQueueSize) {
                        return new Promise(async resolve => {
/*                            var queuesize = await checkQueueSize();*/
                            const previous = minId;
                            minId = minId - requestPerPage + 1;
                            const jobIds = scanner.generateIds(previous, requestPerPage, true);
                            try {
                                const jobs = await scanner.getJobsFromIds(jobIds);
                                nbRequest++;
                                fs.writeFile(DEST + jobIds[requestPerPage - 1] + '-' + jobIds[0] + '.json', JSON.stringify(jobs), (err, data) => {
                                    //console.log(++count, job.id, job.config.language, job.started_at)
                                });
                                for (let i in jobs) {
                                    if (jobs[i].state == "failed" && jobs[i].config.language == "java") {
                                        client.publish(destination, jobs[i]["build_id"].toString());
                                    }
                                }
                                console.log(start - jobIds[requestPerPage - 1], jobIds[0], jobIds[requestPerPage - 1], parseInt((nbRequest/((new Date() - startTime)/1000))*requestPerPage) + " job/sec", jobs[jobs.length - 1].started_at)
                            } catch(e) {
                                console.log(e);
                            }
                            resolve();
                        });
                    } else {
                        console.log("queueSize: " + queueSize.toString() + " -> QueueSize limit exceeded, will now run slow/sleep mode for a while");
                        sleep.sleep(sleepTime);
                    }
                });
            }
        })();
    });
});


function checkQueueSize() {
    return new Promise((resolve,reject) => {
        jmxClient.getAttribute("org.apache.activemq:type=Broker,brokerName=localhost,destinationType=Queue,destinationName=pipeline", "QueueSize", async function(data) {
            resolve(data.longValue);
        });
    });
}