module.exports = findWatsonCredentials

function findWatsonCredentials (server) {
  if (process.env.VCAP_SERVICES) {
    server.log(['info', 'app'], 'Reading credentials from VCAP_SERVICES')
    const services = JSON.parse(process.env.VCAP_SERVICES)

    server.app.naturalLanguageUnderstanding = {
      username: services['natural-language-understanding'][0].credentials.username,
      password: services['natural-language-understanding'][0].credentials.password
    }
    server.app.speechToText = {
      username: services['speech_to_text'][0].credentials.username,
      password: services['speech_to_text'][0].credentials.password
    }

    return
  }

  const envVariables = [
    'SPEECH_TO_TEXT_USERNAME',
    'SPEECH_TO_TEXT_PASSWORD',
    'NATURAL_LANGUAGE_UNDERSTANDING_USERNAME',
    'NATURAL_LANGUAGE_UNDERSTANDING_PASSWORD'
  ]
  const unsetEnvVariables = envVariables.filter(name => !process.env[name]).join(', ')

  if (unsetEnvVariables) {
    server.log(['info', 'app'], `Simulating Watson services (unset env: ${unsetEnvVariables})`)
    server.app.simulateWatson = true
    server.app.simulateWatsonTimeout = parseInt(process.env.WATSON_MOCK_TIMEOUT, 10) || 3000
    return
  }

  server.log(['info', 'app'], `Connecting to Watson services using credentials from env`)

  server.app.naturalLanguageUnderstanding = {
    username: process.env.NATURAL_LANGUAGE_UNDERSTANDING_USERNAME,
    password: process.env.NATURAL_LANGUAGE_UNDERSTANDING_PASSWORD
  }
  server.app.speechToText = {
    username: process.env.SPEECH_TO_TEXT_USERNAME,
    password: process.env.SPEECH_TO_TEXT_PASSWORD
  }
}
