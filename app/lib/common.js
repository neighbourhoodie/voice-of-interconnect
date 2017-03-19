module.exports = common

function common (hoodie) {
  document.body.addEventListener('click', (event) => {
    const el = event.target.closest('[data-dismiss]')

    if (!el) {
      return
    }

    if (el.dataset.dismiss) {
      document.querySelector(el.dataset.dismiss).classList.remove('show')
    }
  })
}
