module.exports = findWatsonCredentials

function findWatsonCredentials (server) {
  if (process.env.VCAP_SERVICES) {
    server.log(['info', 'app'], 'Reading credentials from VCAP_SERVICES')
    const services = JSON.parse(process.env.VCAP_SERVICES)

    server.app.alchemy = {
      apiKey: services.alchemy_api.credentials.apikey
    }
    server.app.speechToText = {
      username: services.speech_to_text.credentials.username
    }
    server.app.speechToText = {
      password: services.speech_to_text.credentials.password
    }

    return
  }

  const envVariables = [
    'SPEECH_TO_TEXT_USERNAME',
    'SPEECH_TO_TEXT_PASSWORD',
    'ALCHEMY_API_KEY'
  ]
  const unsetEnvVariables = envVariables.filter(name => !process.env[name]).join(', ')
  if (unsetEnvVariables) {
    server.log(['info', 'app'], `Simulating Watson services (unset env: ${unsetEnvVariables})`)
    server.app.simulateWatson = true
    return
  }

  server.log(['info', 'app'], `Connecting to Watson services using credentials from env`)

  server.app.alchemy = {
    apiKey: process.env.ALCHEMY_API_KEY
  }
  server.app.speechToText = {
    username: process.env.SPEECH_TO_TEXT_USERNAME
  }
  server.app.speechToText = {
    password: process.env.SPEECH_TO_TEXT_PASSWORD
  }
}
