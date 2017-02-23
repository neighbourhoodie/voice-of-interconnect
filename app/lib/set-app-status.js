module.exports = setAppStatus

function setAppStatus (status) {
  document.querySelector('#status').textContent = status
}
