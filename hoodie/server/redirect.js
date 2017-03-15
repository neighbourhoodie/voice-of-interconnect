exports.register = redirect
exports.register.attributes = {
  name: 'redirect'
}

// based on https://github.com/bendrucker/hapi-require-https/blob/dbc4c5773865897705b744625dce266459958dbc/index.js
// added redirect
function redirect (server, options, next) {
  server.ext('onRequest', function (request, reply) {
    const isHttp = request.connection.info.protocol === 'http'
    const host = request.headers.host
    const isLocal = /^(localhost|127\.0\.0\.1)/.test(host)

    if (isHttp && !isLocal) {
      return reply()
        .redirect('https://' + host + request.url.path)
        .code(301)
    }

    reply.continue()
  })
  next()
}
