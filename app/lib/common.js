module.exports = common

function common (hoodie) {
  document.body.addEventListener('click', (event) => {
    if (event.target.dataset.dismiss) {
      document.querySelector(event.target.dataset.dismiss).classList.remove('show')
    }
  })
}
