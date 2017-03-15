exports.register = redirect
exports.register.attributes = {
  name: 'redirect'
}

// based on https://github.com/bendrucker/hapi-require-https/blob/dbc4c5773865897705b744625dce266459958dbc/index.js
// added redirect
function redirect (server, options, next) {
  server.ext('onRequest', function (request, reply) {
    const isHttp = request.headers['x-forwarded-proto'] ? request.headers['x-forwarded-proto'] === 'http' : request.connection.info.protocol === 'http'
    const host = request.headers['x-forwarded-host'] ? request.headers['x-forwarded-host'] : request.headers.host
    const isLocal = /^(localhost|127\.0\.0\.1)/.test(host)

    if (process.env.NO_REDIRECT) {
      return reply.continue()
    }

    if (isLocal) {
      return reply.continue()
    }

    if (!isHttp) {
      return reply.continue()
    }

    return reply()
      .redirect('https://' + host + request.url.path)
      .code(301)
  })
  next()
}
