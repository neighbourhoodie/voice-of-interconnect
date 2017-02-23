# voice-of-interconnect

>  Offline First demo app for IBM InterConnect 2017

`voice-of-interconnect` is a simple HTML/CSS/JavaScript app and uses [Hoodie](https://github.com/hoodiehq/hoodie)
for its backend.

![System Architecture](assets/system-architecture.png)

## Requirements

You need Node.js v6 or newer. We recommend the latest [Node LTS version](https://nodejs.org/en/).
For local development, the Hoodie Backend is using PouchDB to persist its data.
For production, a CouchDB or Cloudant is recommended

## Local Setup

```
git clone https://github.com/gr2m/voice-of-interconnect.git
cd hoodie
npm install
```

Start hoodie and pass a valid CouchDB URL with credentials of an admin user

```
npm start -- --dbUrl=http://admin:secret@mycouchdomain.com:5984/
```

In a 2nd terminal tab, start the dev server

```
npm run dev
```

If you want to test the build version of the app, run `npm run build` and
open http://localhost:8080 (served directly from Hoodie)

## Connecting to Watson Services

When deployed to Bluemix, the credentials for Speech to Text and AlchemyLanguage
are read out directly from `VCAP_SERVICES`.

To connect to the watson services from other environments, you have to set the
following 3 environment variables

1. `SPEECH_TO_TEXT_USERNAME`
1. `SPEECH_TO_TEXT_PASSWORD`
1. `ALCHEMY_API_KEY`

If they are not set, the services are simulated.

## Deployment

See [Deployment docs](http://docs.hood.ie/en/latest/guides/deployment.html) as well as [Deploy to Bluemix](https://github.com/hoodiehq/hoodie-app-tracker/blob/master/deployment.md#deploy-with-bluemix)

## Scripts

For testing integration with Watson Services

```
# Speech to Text (uploads hardcoded file from public/assets)
SPEECH_TO_TEXT_USERNAME=... SPEECH_TO_TEXT_PASSWORD=... node bin/speech-to-text.js
# Sentiment (pass any text you like)
ALCHEMY_API_KEY=... node bin/text-to-sentiment.js Marvin is a sore loser
```

## License

Copyright 2017 Neighbourhoodie Software GmbH and Make&Model Inc

[Apache 2.0](LICENSE)
