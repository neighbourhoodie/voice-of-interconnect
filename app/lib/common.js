module.exports = common

function common (hoodie) {
  document.body.addEventListener('click', dismiss)
  document.body.addEventListener('touchend', dismiss)
}

function dismiss (event) {
  const el = event.target.closest('[data-dismiss]')

  if (!el) {
    return
  }

  if (el.dataset.dismiss) {
    document.querySelector(el.dataset.dismiss).classList.remove('show')
  }
}
