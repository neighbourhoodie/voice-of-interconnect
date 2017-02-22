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

Start the server

```
npm start
```

Start the server without persisting any data (great for testing)

```
npm start -- --inMemory
```

Persist data in a CouchDB / Cloudant.

```
npm start -- --dbUrl=http://admin:secret@mycouchdomain.com:5984/
```

For debugging user data, using CouchDB or Cloudant is probably the best option,
as Hoodie has no built-in admin UI for user data yet.

## Deployment

See [Deployment docs](http://docs.hood.ie/en/latest/guides/deployment.html) as well as [Deploy to Bluemix](https://github.com/hoodiehq/hoodie-app-tracker/blob/master/deployment.md#deploy-with-bluemix)

## Scripts

For testing integration with Watson Services

```
SPEECH_TO_TEXT_USERNAME=... SPEECH_TO_TEXT_PASSWORD=... node bin/speech-to-text.js
```

## License

Copyright 2017 Neighbourhoodie Software GmbH and Make&Model Inc

[Apache 2.0](LICENSE)
