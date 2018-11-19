const testNoAssert = new RegExp("✖ (.*) Test finished without running any assertions");
const testPassed = new RegExp("(✔|✓) ([^\\(]+)( \\(([0-9\\.]+)(.+)\\))$");
const test2 = new RegExp("(ok|ko) ([0-9]+) (.*)$");
const test3 = new RegExp("Executed ([0-9]+) of ([0-9]+) (.*) \\(([0-9\\.]*) secs / ([0-9\\.]*) secs\\)");

const error = new RegExp("(.+):([0-9]+):([0-9]+) - error ([A-Z1-9]+): (.+)")

class JsParser {
    constructor() {
        this.tests = [];
        this.errors = [];
    }

    parse(line) {
        let result = testNoAssert.exec(line);
        if (result) {
            this.tests.push({
                name: result[1],
                body: "",
                nbTest: 1,
                nbFailure: 0,
                nbError: 1,
                nbSkipped: 0,
                time: 0
            });

        } else {
            result = testPassed.exec(line);
            if (result) {

                let time = 0;
                if (result[4] != null) {
                    time = parseFloat(result[4])
                    if (result[5] == "ms") {
                        time *= 0.001;
                    } else if (result[5] == "m") {
                        time *= 60;
                    }
                }
                this.tests.push({
                    name: result[2],
                    body: "",
                    nbTest: 1,
                    nbFailure: 0,
                    nbError: 0,
                    nbSkipped: 0,
                    time: time
                });
            } else {
                result = test2.exec(line);
                if (result) {
                    this.tests.push({
                        name: result[3],
                        body: "",
                        nbTest: 1,
                        nbFailure: result[1] != "ok" ? 1:0,
                        nbError: 0,
                        nbSkipped: 0,
                        time: 0
                    });
                } else {
                    result = test3.exec(line);
                    if (result) {
                        this.tests.push({
                            name: '',
                            body: "",
                            nbTest: 1,
                            nbFailure: result[3] != "SUCCESS" ? 1:0,
                            nbError: 0,
                            nbSkipped: 0,
                            time: parseFloat(result[5])
                        });
                    } else {
                        result = error.exec(line);
                        if (result) {
                            this.errors.push({
                                file: result[1],
                                line: parseInt(result[2]),
                                message: result[5]
                            });
                        }
                    }
                }
            }
        }
    }
}

module.exports.Parser = JsParser;