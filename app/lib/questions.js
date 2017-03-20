module.exports = questions

const QUESTIONS = [
  ['Let’s calibrate. Press the circle and describe something you really enjoy.', 'Let’s calibrate. Describe something you really enjoy'],
  'You do you. How about something very unpleasant?',
  'Over the river and through the trees, how does a bar of LTE feel to thee?',
  'On the train or in a plane, tell us about an offline experience that is a pain.',
  'We are out of questions :) Try anything you want!'
]

const $questionSpeech = document.querySelector('#question-speech')
const $questionText = document.querySelector('#question-text')

function questions (hoodie) {
  updateQuestion(hoodie)

  hoodie.store.on('add', (doc) => {
    if (isNote(doc)) {
      updateQuestion(hoodie)
    }
  })
}

function isNote (doc) {
  return !!doc.progress
}

function updateQuestion (hoodie) {
  hoodie.store.findAll()

  .then((docs) => {
    const numAnswers = docs.filter(isNote).length

    const currentQuestion = numAnswers >= 4 ? QUESTIONS[4] : QUESTIONS[numAnswers]

    if (Array.isArray(currentQuestion)) {
      $questionSpeech.textContent = currentQuestion[0]
      $questionText.textContent = currentQuestion[1]
    } else {
      $questionSpeech.textContent = currentQuestion
      $questionText.textContent = currentQuestion
    }
  })
}
