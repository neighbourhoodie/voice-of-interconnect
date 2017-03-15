# voice-of-interconnect

>  Offline First demo app for IBM InterConnect 2017

[![Build Status](https://travis-ci.org/neighbourhoodie/voice-of-interconnect.svg?branch=master)](https://travis-ci.org/neighbourhoodie/voice-of-interconnect)

`voice-of-interconnect` is a simple HTML/CSS/JavaScript app and uses [Hoodie](https://github.com/hoodiehq/hoodie)
for its backend.

![System Architecture](assets/system-architecture-diagram.png)

## Requirements

You need Node.js v6 or newer. We recommend the latest [Node LTS version](https://nodejs.org/en/).
For local development, the Hoodie Backend is using PouchDB to persist its data.
For production, a CouchDB or Cloudant is recommended

If you use the Speech to Text service and record audio in Chrome, you need
ffmpeg to be installed ([#35](https://github.com/neighbourhoodie/voice-of-interconnect/issues/35)).
If it’s not linked globally, you can set `FFMPEG_PATH`.

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

In a 2nd terminal tab, start the app or the visualization. You can also run
both at the same time, they use different ports

```
# start app
npm run app
# start visualization
npm run visualization
```

If you want to test the build version of the app, run `npm run build` and
open http://localhost:8080 (served directly from Hoodie). The visualization
is at http://localhost:8080/visualization/

## Connecting to Watson Services

When deployed to Bluemix, the credentials for Speech to Text and AlchemyLanguage
are read out directly from `VCAP_SERVICES`.

To connect to the watson services from other environments, you have to set the
following 3 environment variables

1. `SPEECH_TO_TEXT_USERNAME`
1. `SPEECH_TO_TEXT_PASSWORD`
1. `NATURAL_LANGUAGE_UNDERSTANDING_USERNAME`
1. `NATURAL_LANGUAGE_UNDERSTANDING_PASSWORD`

If they are not set, the services are simulated. There is a default timeout of
3000ms for both the transcription and sentiment analysis. You can change the
timeout with `WATSON_MOCK_TIMEOUT` (ms)

## Deployment

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/neighbourhoodie/voice-of-interconnect&branch=deploy-to-bluemix)

See [Deployment docs](http://docs.hood.ie/en/latest/guides/deployment.html) as well as [Deploy to Bluemix](https://github.com/hoodiehq/hoodie-app-tracker/blob/master/deployment.md#deploy-with-bluemix)

Note: the app is redirecting form `http://` to `https://` unless the host is
`localhost` or `127.0.0.1`. The redirect can be disabled with an environment
variable: `NO_REDIRECT=1`

## Scripts

For testing integration with Watson Services

```
# Speech to Text (uploads hardcoded file from public/assets)
SPEECH_TO_TEXT_USERNAME=... SPEECH_TO_TEXT_PASSWORD=... node bin/speech-to-text.js test/fixtures/speech.webm
# .webm and .ogg files are supported
# set FFMPEG_PATH for .webm if ffmpeg binary is not globally linked

# Sentiment (pass any text you like)
NATURAL_LANGUAGE_UNDERSTANDING_USERNAME=... NATURAL_LANGUAGE_UNDERSTANDING_PASSWORD=... node bin/text-to-sentiment.js Marvin is a sore loser
```

## License

Copyright 2017 Neighbourhoodie Software GmbH and Make&Model Inc

[Apache 2.0](LICENSE)
