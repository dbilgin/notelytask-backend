import * as functions from "firebase-functions";
import url = require("url");
import dotenv = require("dotenv");
import request = require("request");

const ALLOWED_ORIGINS = ["https://notelytask.com", "https://www.notelytask.com"];

export const accessToken = functions.https.onRequest((req, res) => {
  if (!!req.headers.origin && ALLOWED_ORIGINS.includes(req.headers.origin)) {
    res.set("Access-Control-Allow-Origin", req.headers.origin);
  }

  dotenv.config({path: __dirname + "/.env"});

  const queryObject = url.parse(req.url, true).query;
  const clientId = queryObject.client_id;
  const code = queryObject.code;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

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
          },
        },
        (error, response, body) => {
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
