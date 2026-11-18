
(function () {
  "use strict";

  var ANSWER_KEY = {
    q1: { type: "single", answer: "a" },
    q2: { type: "single", answer: "b" },
    q3: { type: "single", answer: "b" },
    q4: { type: "single", answer: "c" },
    q5: { type: "single", answer: "b" },
    q6: { type: "text", answer: "clientserver" },
    q7: { type: "text", answer: "443" },
    q8: { type: "text", answer: "static" },
    q9: { type: "multi", answer: ["apache", "nginx", "iis"] },
    q10: { type: "multi", answer: ["rendering", "jsengine", "networking"] }
  };

  var TOTAL_QUESTIONS = Object.keys(ANSWER_KEY).length; // 10
  var PASS_PERCENT = 70;
  var TIME_LIMIT_SECONDS = 10 * 60;


  var ANSWER_DISPLAY = {
    q1: "HyperText Transfer Protocol",
    q2: "Gecko",
    q3: "Translating human-readable domain names into IP addresses",
    q4: "404",
    q5: "DOM",
    q6: "client-server",
    q7: "443",
    q8: "static",
    q9: "Apache HTTP Server, Nginx, and Microsoft IIS",
    q10: "Rendering Engine, JavaScript Engine, and Networking"
  };

  var form = document.getElementById("quiz-form");
  var timerBar = document.getElementById("quiz-timer-bar");
  var timeRemainingEl = document.getElementById("time-remaining");
  var resultsSection = document.getElementById("quiz-results");
  var resultsFlag = document.getElementById("results-flag");
  var resultsScore = document.getElementById("results-score");
  var resultsPercent = document.getElementById("results-percent");
  var resultsTime = document.getElementById("results-time");
  var resultsNote = document.getElementById("results-note");
  var submitBtn = document.getElementById("submit-quiz-btn");
  var resetBtn = document.getElementById("reset-quiz-btn");

  var secondsRemaining = TIME_LIMIT_SECONDS;
  var timerIntervalId = null;
  var quizStartTime = null; //
  var quizSubmitted = false;


  function normalizeText(str) {
    return String(str || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }

  function formatTime(totalSeconds) {
    var m = Math.floor(totalSeconds / 60);
    var s = totalSeconds % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function startTimer() {
    quizStartTime = Date.now();
    secondsRemaining = TIME_LIMIT_SECONDS;
    updateTimerDisplay();

    timerIntervalId = window.setInterval(function () {
      secondsRemaining--;

      if (secondsRemaining <= 0) {
        secondsRemaining = 0;
        updateTimerDisplay();
        stopTimer();

        gradeQuiz(true);
        return;
      }

      updateTimerDisplay();
    }, 1000);
  }

  function updateTimerDisplay() {
    timeRemainingEl.textContent = formatTime(secondsRemaining);

    if (secondsRemaining <= 60) {
      timerBar.classList.add("time-low");
    } else {
      timerBar.classList.remove("time-low");
    }
  }

  function stopTimer() {
    if (timerIntervalId !== null) {
      window.clearInterval(timerIntervalId);
      timerIntervalId = null;
    }
  }


  function getUserAnswer(qid, type) {
    if (type === "single") {
      var checked = form.querySelector('input[name="' + qid + '"]:checked');
      return checked ? checked.value : null;
    }
    if (type === "multi") {
      var boxes = form.querySelectorAll('input[name="' + qid + '"]:checked');
      var values = [];
      for (var i = 0; i < boxes.length; i++) {
        values.push(boxes[i].value);
      }
      return values;
    }
    var input = document.getElementById(qid + "-input");
    return input ? input.value : "";
  }


  function sameValues(a, b) {
    if (a.length !== b.length) return false;
    var sortedA = a.slice().sort();
    var sortedB = b.slice().sort();
    for (var i = 0; i < sortedA.length; i++) {
      if (sortedA[i] !== sortedB[i]) return false;
    }
    return true;
  }

  function isCorrect(qid, userAnswer) {
    var key = ANSWER_KEY[qid];
    if (key.type === "single") {
      return userAnswer === key.answer;
    }
    if (key.type === "multi") {
      return sameValues(userAnswer || [], key.answer);
    }

    return normalizeText(userAnswer) === key.answer;
  }


  function showQuestionFeedback(qid, correct) {
    var fieldset = document.getElementById("field-" + qid);
    var feedback = document.getElementById("feedback-" + qid);

    fieldset.classList.add(correct ? "correct" : "incorrect");
    feedback.classList.add(correct ? "correct" : "incorrect");
    feedback.hidden = false;

    if (correct) {
      feedback.textContent = "✓ Correct!";
    } else {
      feedback.innerHTML =
        "✗ Incorrect." +
        '<span class="quiz-correct-answer">Correct answer: ' +
        ANSWER_DISPLAY[qid] +
        "</span>";
    }
  }


  function setFormDisabled(disabled) {
    var controls = form.querySelectorAll("input, button[type='submit']");
    for (var i = 0; i < controls.length; i++) {
      controls[i].disabled = disabled;
    }
  }

  function gradeQuiz(timedOut) {
    if (quizSubmitted) return;
    quizSubmitted = true;
    stopTimer();

    var elapsedSeconds = Math.round((Date.now() - quizStartTime) / 1000);
    if (elapsedSeconds > TIME_LIMIT_SECONDS) {
      elapsedSeconds = TIME_LIMIT_SECONDS;
    }

    var correctCount = 0;
    var qids = Object.keys(ANSWER_KEY);
    for (var i = 0; i < qids.length; i++) {
      var qid = qids[i];
      var type = ANSWER_KEY[qid].type;
      var userAnswer = getUserAnswer(qid, type);
      var correct = isCorrect(qid, userAnswer);
      if (correct) correctCount++;
      showQuestionFeedback(qid, correct);
    }

    var percent = Math.round((correctCount / TOTAL_QUESTIONS) * 100);
    var passed = percent >= PASS_PERCENT;


    resultsSection.classList.remove("pass", "fail");
    resultsSection.classList.add(passed ? "pass" : "fail");
    resultsFlag.textContent = passed ? "✓ PASS" : "✗ FAIL";
    resultsScore.textContent = correctCount + " / " + TOTAL_QUESTIONS;
    resultsPercent.textContent = percent + "%";
    resultsTime.textContent = formatTime(elapsedSeconds);
    resultsNote.textContent = timedOut
      ? "Time's up! Your quiz was automatically submitted with the answers you had entered."
      : "A passing score is " + PASS_PERCENT + "% or higher.";
    resultsSection.hidden = false;
    resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });

    setFormDisabled(true);
    submitBtn.disabled = true;
  }

  function resetQuiz() {
    stopTimer();
    quizSubmitted = false;


    form.reset();
    setFormDisabled(false);
    submitBtn.disabled = false;


    var qids = Object.keys(ANSWER_KEY);
    for (var i = 0; i < qids.length; i++) {
      var qid = qids[i];
      var fieldset = document.getElementById("field-" + qid);
      var feedback = document.getElementById("feedback-" + qid);
      fieldset.classList.remove("correct", "incorrect");
      feedback.classList.remove("correct", "incorrect");
      feedback.hidden = true;
      feedback.textContent = "";
    }


    resultsSection.hidden = true;
    resultsSection.classList.remove("pass", "fail");
    timerBar.classList.remove("time-low");
    startTimer();

    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }


  form.addEventListener("submit", function (event) {
    event.preventDefault();
    gradeQuiz(false);
  });

  resetBtn.addEventListener("click", resetQuiz);


  startTimer();
})();
