"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const url = require("url");
const dotenv = require("dotenv");
const request = require("request");
const { OAuth2Client } = require('google-auth-library');
const ALLOWED_ORIGINS = ["https://notelytask.com", "https://www.notelytask.com", "http://localhost:60836"];
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
    console.log(__dirname);
    if (!clientId || !code) {
        res.sendStatus(400);
    }
    else {
        request.post("https://github.com/login/oauth/access_token", {
            json: {
                "client_id": clientId,
                "code": code,
                "client_secret": clientSecret,
                "redirect_uri": "http://localhost:60836/github"
            },
        }, (error, response, body) => {
            console.log(body);
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
app.post('/google_verify', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!!req.headers.origin && ALLOWED_ORIGINS.includes(req.headers.origin)) {
        res.set("Access-Control-Allow-Origin", req.headers.origin);
    }
    dotenv.config({ path: __dirname + "/.env" });
    const queryObject = url.parse(req.url, true).query;
    const idToken = queryObject.id_token;
    if (!idToken) {
        res.sendStatus(400);
    }
    const client = new OAuth2Client();
    try {
        yield client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        res.status(200).send();
    }
    catch (message) {
        console.error(message);
        res.status(401).send();
    }
}));
app.listen(port, () => {
    return console.log(`server is listening on ${port}`);
});
//# sourceMappingURL=app.js.map