// For mobile navigation
module.exports = appNav

const $nav = document.querySelector('#app-nav')

const $showAbout = document.querySelector('.view__about')
const $showApp = document.querySelector('.view__app')
const $aboutDisplay = document.querySelector('.about')

const $closeAbout = document.querySelector('.close__about')
const $closeApp = document.querySelector('.close__app')

function appNav () {
  $showAbout.addEventListener('click', function (event) {
    event.preventDefault()

    $aboutDisplay.classList.add('active')
    $nav.classList.remove('active')
  })

  $showApp.addEventListener('click', function (event) {
    event.preventDefault()

    $showApp.classList.add('active')
    $aboutDisplay.classList.remove('active')
    $nav.classList.remove('active')
  })

  $closeAbout.addEventListener('click', function (event) {
    event.preventDefault()

    $aboutDisplay.classList.remove('active')
    $nav.classList.remove('active')
  })
}
