import express from 'express';
import url = require("url");
import dotenv = require("dotenv");
import request = require("request");
const {OAuth2Client} = require('google-auth-library');

const ALLOWED_ORIGINS = ["https://notelytask.com", "https://www.notelytask.com", "http://localhost:60836"];
const app = express();
const port = 3000;

app.get('/', (_, res) => {
  res.send('Welcome to NotelyTask!');
});

app.post('/accessToken', (req, res) => {
  if (!!req.headers.origin && ALLOWED_ORIGINS.includes(req.headers.origin)) {
    res.set("Access-Control-Allow-Origin", req.headers.origin);
  }

  dotenv.config({path: __dirname + "/.env"});

  const queryObject = url.parse(req.url, true).query;
  const clientId = queryObject.client_id;
  const code = queryObject.code;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  console.log(__dirname);

  if (!clientId || !code) {
    res.sendStatus(400);
  } else {
    request.post(
        "https://github.com/login/oauth/access_token",
        {
          json: {
            "client_id": clientId,
            "code": code,
            "client_secret": clientSecret,
            "redirect_uri": "http://localhost:60836/github"
          },
        },
        (error, response, body) => {

          console.log(body);
          if (!error &&
            (response.statusCode >= 200 ||
              response.statusCode < 300) &&
              !body.error) {
            res.send(body);
          } else {
            res.status(400).send(body);
          }
        }
    );
  }
});

app.post('/google_verify', async (req, res) => {
  if (!!req.headers.origin && ALLOWED_ORIGINS.includes(req.headers.origin)) {
    res.set("Access-Control-Allow-Origin", req.headers.origin);
  }

  dotenv.config({path: __dirname + "/.env"});

  const queryObject = url.parse(req.url, true).query;
  const idToken = queryObject.id_token;

  if (!idToken) {
    res.sendStatus(400);
  }

  const client = new OAuth2Client();

  try {
    await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    res.status(200).send();
  } catch (message) {
    console.error(message);
    res.status(401).send();
  }
});

app.listen(port, () => {
  return console.log(`server is listening on ${port}`);
});