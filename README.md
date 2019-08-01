# Travis Scanner

## Install

```js
cd script
npm install
npm run-script build
```

## Usage

### Run as ActiveMQ BuildRainer for Repairnator
If no activeMQ or activeMQ version supporting JMX, run this docker image.
```
    docker run -d --net=host antonw/activemq-jmx
```
Webpage can be visited at [http://localhost:8161/](http://localhost:8161/). Then more dependencies to be installed for npm.
```js
npm install stomp-client jmx sleep
```
Set enviroment variables in ActiveMQcollect_withEnv.sh and run with
```
sudo ./ActiveMQcollect_withEnv
```
or run with just default config
```
npm run-script ActiveMQcollect
```
Clean up by deleting docker image
```
docker ps -a
docker rm CONTAINER_ID -f
```

### Download jobs

Download all the Travis-CI jobs into `DEST` folder (see `script/collect.js`). The JSON files are called `X-Y.json`, eg `480037011-480037260.json`. This means that the file contains all jobs between 480037011 and 480037260. This is way more performant that saving one job per file.

```js
npm run-script collect
```

### TravisCI real-time

User interface that monitors the jobs that are currently running at Travis-CI

```js
npm run-script server
open http://localhost:9080
```

## Parse Travis-CI log

```js
const log_parser = require("./parser/parser-init").parser;
job = {id: '480040000'}
log_parser(job, (tests, errors) => {
    job.tests = tests;
    job.errors = errors;
    let count = 0;
    let nbFailure = 0;
    let nbError = 0;
    let nbSkipped = 0;
    let time = 0.0;
    for (let test of tests) {
        count += test.nbTest;
        nbFailure += test.nbFailure;
        nbError += test.nbError;
        nbSkipped += test.nbSkipped;
        time += test.time;
    }
    console.log(count, nbFailure, nbError, nbSkipped, time, errors.length)
});
```
