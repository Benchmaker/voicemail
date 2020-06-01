const request = require("request");

class Zendesk {
    constructor(opts) {
        this.host = opts.host;
        this.token = opts.token;
        this.email = opts.email;
        this.debug = opts.debug;
    };
    get(endpoint, agent, callback) {
        var _self = this;
        if (endpoint && agent) {
            request.get(_self.host + endpoint, {
                json: true,
                headers: {
                    Authorization: 'Basic ' + new Buffer.from(agent + _self.email + '/token:' + _self.token).toString('base64')
                }
            }, function (error, response, body) {
                if (error) callback(error);
                else if (!error && body) callback(body);
            });
        }
    };
    put(endpoint, data, agent, callback) {
        var _self = this;
        if (endpoint && data && agent) {
            request.put(_self.host + endpoint, {
                json: true,
                body: data,
                headers: {
                    Authorization: 'Basic ' + new Buffer.from(agent + _self.email + '/token:' + _self.token).toString('base64')
                },
            }, function (error, body, response) {
                if (error) callback(error);
                else if (!error && body) callback(body);
            });
        }
    };
    post(endpoint, data, agent, callback) {
        var _self = this;
        if (endpoint && data && agent) {
            request.post(_self.host + endpoint, {
                json: true,
                body: data,
                headers: {
                    Authorization: 'Basic ' + new Buffer.from(agent + _self.email + '/token:' + _self.token).toString('base64')
                },
            }, function (error, body, response) {
                if (error) callback(error);
                else if (!error && body) callback(body);
            });
        }
    };
}

module.exports = Zendesk;