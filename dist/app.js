"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const url = require("url");
const dotenv = require("dotenv");
const request = require("request");
const ALLOWED_ORIGINS = ["https://notelytask.com", "https://www.notelytask.com"];
const app = (0, express_1.default)();
const port = 3000;
app.get('/', (_, res) => {
    res.send('Welcome to NotelyTask!');
});
app.post('/accessToken', (req, res) => {
    if (!!req.headers.origin && ALLOWED_ORIGINS.includes(req.headers.origin)) {
        res.set("Access-Control-Allow-Origin", req.headers.origin);
    }
    dotenv.config({ path: __dirname + "/.env" });
    const queryObject = url.parse(req.url, true).query;
    const clientId = queryObject.client_id;
    const code = queryObject.code;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !code) {
        res.sendStatus(400);
    }
    else {
        request.post("https://github.com/login/oauth/access_token", {
            json: {
                "client_id": clientId,
                "code": code,
                "client_secret": clientSecret,
            },
        }, (error, response, body) => {
            if (!error &&
                (response.statusCode >= 200 ||
                    response.statusCode < 300) &&
                !body.error) {
                res.send(body);
            }
            else {
                res.status(400).send(body);
            }
        });
    }
});
app.listen(port, () => {
    return console.log(`server is listening on ${port}`);
});
//# sourceMappingURL=app.js.map