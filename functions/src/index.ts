import * as functions from "firebase-functions";
import url = require("url");
import dotenv = require("dotenv");
import request = require("request");

export const accessToken = functions.https.onRequest((req, res) => {
  dotenv.config({path: __dirname + "/.env"});

  const queryObject = url.parse(req.url, true).query;
  const clientId = queryObject.client_id;
  const code = queryObject.code;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  console.log("clientSecret", clientSecret);

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
