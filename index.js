/*
Zendesk Documentation:
https://developer.zendesk.com/rest_api
https://developer.zendesk.com/rest_api/docs/support/introduction

Google Documentation: 
https://cloud.google.com/nodejs/docs/reference/speech/1.0.x
https://github.com/googleapis/nodejs-speech

*/

const zendeskManager = require("./zendeskManager.js");
var fs = require("fs");
var https = require("https");
var path = require("path");
var speech = require("@google-cloud/speech");
const client = new speech.SpeechClient();
var tickets = [];
var transcribed = [];

const zendesk = new zendeskManager({
    host: "", // the part before zendesk.com
    token: "", // API token generated in the Admin Center of Zendesk
    email: "", // The domain after the username Example: @gmail.com
    debug: false // See what happens with the Zendesk requests
});

function download(id, url, cb) {
    if (id && url) {
        var voicemail = fs.createWriteStream(path.join(__dirname + "/files/" + id + ".wav"));
        https.get(url, function (res) {
            if ([301, 302].indexOf(res.statusCode) > -1) {
                download(id, res.headers.location, cb);
                return;
            }
            res.pipe(voicemail);
            cb(true);
        });
    } else {
        return console.log("Missing parameters");
    }
};

async function uploadFile(request, cb) {
    const [operation] = await self.client.longRunningRecognize(request);
    const [response] = await operation.promise();
    if (response.results.length === 0) cb("This voicemail cannot be transcribed");
    const transcription = response.results.map(result => result.alternatives[0].transcript).join('\n');
    cb(transcription);
};

function transcribe(id) {
    if (id) {
        zendesk.get("/api/v2/tickets" + id + "/comments.json", "", function (response) {
            if (response && response.comments) {
                download(id, response.comments[0].attachments[0].content_url, function (file) {
                    if (file) {
                        var upload = fs.readFileSync(path.join(__dirname + "/files/" + id + ".wav"));
                        if (upload) {
                            uploadFile({
                                audio: {
                                    content: upload.toString("base64")
                                },
                                config: {
                                    model: "phone_call",
                                    sampleRateHertz: 44100,
                                    languageCode: "LINEAR16",
                                    enabledAutomaticPuncuation: true
                                }
                            }, function (transcription) {
                                if (transcription) {
                                    zendesk.put("/api/v2/tickets/" + id + ".json", {
                                        ticket: {
                                            status: "new",
                                            comment: {
                                                body: "Transcription: " + transcription,
                                                author_id: 404 // get this attribute from the /api/v2/users.json endpoint
                                            }
                                        }
                                    }, "", function (response) {
                                        if (response) {
                                            transcribed.push(id);
                                            ticket.splice(tickets.indexOf(id), 1);
                                            if (tickets.length > 0) {
                                                setTimeout(function () {
                                                    transcribe(tickets[0]);
                                                }, 20 * 1000); // Twenty second timeout between voicemails to make sure they don't overlap
                                            }
                                        }
                                    });
                                }
                            }).catch(console.error);
                        }
                    }
                })
            } else {
                console.log("Error loading ticket");
            }
        });
    } else {
        console.log("No id found");
    }
}

function run() {
    zendesk.get("/api/v2/search.json?query=type:ticket status:new", "", function (response) {
        if (response && response.results) {
            response.results.forEach(function (ticket) {
                if (ticket && ticket.subject.toLowerCase().indexOf("message from") > -1 && transcribed.indexOf(ticket.id) === -1 && ticket.description.toLowerCase() === "non-standard content type of email: audio/wav. document added as attachment.") {
                    tickets.push(ticket.id);
                }
            });
            if (tickets.length > 0) {
                transcribe(tickets[0]);
            }
        }
    });
};

setInterval(function () {
    run();
}, 10 * 60 * 1000); // Runs every 10 minutes to prevent API overflow
