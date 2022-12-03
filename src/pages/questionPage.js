import {
  ANSWERS_LIST_ID,
  START_OVER_BUTTON_ID,
  USER_INTERFACE_ID,
  SUBMIT_ANSWER_BUTTON_ID,
  NEX_PAGE_BUTTON,
  PREV_PAGE_BUTTON,
} from '../constants.js';
import { createQuestionElement } from '../views/questionView.js';
import { createAnswerElement } from '../views/answerView.js';
import { quizData } from '../data.js';
import { initWelcomePage } from './welcomePage.js';

let data =
  window.localStorage.getItem('quizData') !== null
    ? JSON.parse(window.localStorage.getItem('quizData'))
    : JSON.parse(JSON.stringify(quizData));

export const initQuestionPage = () => {
  const userInterface = document.getElementById(USER_INTERFACE_ID);
  userInterface.innerHTML = '';

  if (data.currentQuestionIndex >= data.questions.length) {
    data.currentQuestionIndex = 0;
  }

  if (data.currentQuestionIndex < 0) {
    data.currentQuestionIndex = data.questions.length - 1;
  }

  const currentQuestion = data.questions[data.currentQuestionIndex];

  const correctAnswersCount = countCorrectAnswers(data.questions);

  const questionElement = createQuestionElement(
    currentQuestion.text,
    correctAnswersCount,
    data.questions.length
  );

  userInterface.appendChild(questionElement);

  const answersListElement = document.getElementById(ANSWERS_LIST_ID);

  for (const [key, answerText] of Object.entries(currentQuestion.answers)) {
    const answerElement = createAnswerElement(key, answerText);
    answerElement.addEventListener(
      'click',
      selectAnswer(currentQuestion, answerElement, key)
    );
    answersListElement.appendChild(answerElement);
    if (data.questions[data.currentQuestionIndex].selected === key) {
      assignSelectedClass(answerElement);
      if (data.questions[data.currentQuestionIndex].submitted === true) {
        checkAnswer(currentQuestion);
      }
    }
  }

  document
    .getElementById(START_OVER_BUTTON_ID)
    .addEventListener('click', startOver);

  document
    .getElementById(SUBMIT_ANSWER_BUTTON_ID)
    .addEventListener('click', submitAnswer(currentQuestion));

  document.getElementById(NEX_PAGE_BUTTON).addEventListener('click', nextPage);

  document.getElementById(PREV_PAGE_BUTTON).addEventListener('click', prevPage);
};

const startOver = () => {
  window.localStorage.clear();
  data = JSON.parse(JSON.stringify(quizData));
  initWelcomePage();
};

const selectAnswer = (currentQuestion, answerElement, key) => () => {
  if (currentQuestion.submitted === false) {
    if (
      Object.keys(currentQuestion.answers).includes(currentQuestion.selected)
    ) {
      const prevAnswer = document.querySelector('.selected');
      if (prevAnswer != null) {
        prevAnswer.classList.remove('selected');
      }
    }
    currentQuestion.selected = key;
    assignSelectedClass(answerElement);
  } else {
    alert('You cannot change your answer!');
  }
};

const assignSelectedClass = (answerElement) => {
  answerElement.classList.add('selected');
};

const submitAnswer = (currentQuestion) => () => {
  if (
    Object.keys(currentQuestion.answers).includes(currentQuestion.selected) &&
    currentQuestion.submitted === false
  ) {
    currentQuestion.submitted = true;
    checkAnswer(currentQuestion);
    saveAnswers();
  }
};

const updateCounter = () => {
  const counter = document.querySelector('.counter');
  counter.innerHTML =
    `${countCorrectAnswers(data.questions)}/` + counter.innerHTML.split('/')[1];
};

const saveAnswers = () => {
  window.localStorage.setItem('quizData', JSON.stringify(data));
};

const checkAnswer = (currentQuestion) => {
  const selectedAnswer = document.querySelector('.selected');
  selectedAnswer.classList.remove('selected');
  if (currentQuestion.selected === currentQuestion.correct) {
    selectedAnswer.classList.add('right');
    updateCounter();
  } else {
    selectedAnswer.classList.add('wrong');
    document
      .querySelector(`.${currentQuestion.correct}-opt`)
      .classList.add('right');
  }

  document.getElementById(SUBMIT_ANSWER_BUTTON_ID).style.display = 'none';
};

export const nextPage = () => {
  data.currentQuestionIndex = data.currentQuestionIndex + 1;

  initQuestionPage();
};

export const prevPage = () => {
  data.currentQuestionIndex = data.currentQuestionIndex - 1;

  initQuestionPage();
};

const countCorrectAnswers = (questionsArray) => {
  return questionsArray
    .map(({ correct, selected, submitted }) => ({
      correct,
      selected,
      submitted,
    }))
    .filter((question) => {
      return question.submitted === true;
    })
    .filter((question) => {
      return question.selected === question.correct;
    }).length;
};
