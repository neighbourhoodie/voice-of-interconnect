/* global localStorage */
module.exports = appNav

const $nav = document.querySelector('#app-nav')

const $showAbout = document.querySelector('.view__about')
const $showApp = document.querySelector('.view__app')
const $aboutDisplay = document.querySelector('.about')

const $closeAbout = document.querySelector('.close__about')

function appNav () {
  $showAbout.addEventListener('click', showAbout)
  $showApp.addEventListener('click', showApp)
  $closeAbout.addEventListener('click', showApp)

  if (localStorage.getItem('seenWelcome')) {
    return showApp()
  }
}

function showAbout (event) {
  event.preventDefault()

  $aboutDisplay.classList.add('active')
  $nav.classList.remove('active')

  localStorage.setItem('seenWelcome', '1')
}

function showApp (event) {
  if (event) {
    event.preventDefault()
  }

  $showApp.classList.add('active')
  $aboutDisplay.classList.remove('active')
  $nav.classList.remove('active')

  localStorage.setItem('seenWelcome', '1')
}
