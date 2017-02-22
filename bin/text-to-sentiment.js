const AlchemyLanguageV1 = require('watson-developer-cloud/alchemy-language/v1')

if (!process.env.ALCHEMY_API_KEY) {
  throw new Error('ALCHEMY_API_KEY must be set.')
}

// see https://github.com/watson-developer-cloud/node-sdk#alchemylanguage
const alchemyLanguage = new AlchemyLanguageV1({
  api_key: process.env.ALCHEMY_API_KEY
})

var params = {
  text: process.argv.slice(2).join(' ')
}

console.log('Getting sentiment for "%s".', params.text)
alchemyLanguage.sentiment(params, function (error, result) {
  if (error) {
    console.log(error)
    return
  }

  console.log(JSON.stringify(result, null, 2))
})
