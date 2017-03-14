const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js')
const {NATURAL_LANGUAGE_UNDERSTANDING_USERNAME, NATURAL_LANGUAGE_UNDERSTANDING_PASSWORD} = process.env

if (!NATURAL_LANGUAGE_UNDERSTANDING_USERNAME || !NATURAL_LANGUAGE_UNDERSTANDING_PASSWORD) {
  console.log('Error: NATURAL_LANGUAGE_UNDERSTANDING_USERNAME & NATURAL_LANGUAGE_UNDERSTANDING_PASSWORD must be set.')
  process.exit(1)
}

console.log(`\nNaturalLanguageUnderstandingV1.VERSION_DATE_2017_02_27 ==============================`)
console.log(NaturalLanguageUnderstandingV1.VERSION_DATE_2017_02_27)

// see https://github.com/watson-developer-cloud/node-sdk#natural-language-understanding
const nlu = new NaturalLanguageUnderstandingV1({
  username: NATURAL_LANGUAGE_UNDERSTANDING_USERNAME,
  password: NATURAL_LANGUAGE_UNDERSTANDING_PASSWORD,
  version_date: NaturalLanguageUnderstandingV1.VERSION_DATE_2017_02_27
})

var params = {
  text: process.argv.slice(2).join(' '),
  language: 'en',
  features: {
    concepts: {},
    keywords: {
      sentiment: true,
      emotion: true
    }
  }
}

console.log('Getting sentiment for "%s".', params.text)
nlu.analyze(params, function (error, result) {
  if (error) {
    console.log(error)
    return
  }

  console.log(JSON.stringify(result, null, 2))
})
