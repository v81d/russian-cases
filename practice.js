let urlParams = new URLSearchParams(window.location.search);
let totalQuestions = Math.ceil(urlParams.get("questions")) || -1;
let questions = [];
let askedQuestions = [];
let currentQuestionIndex = -1;
let correctAnswers = 0;
let answeredQuestions = 0;
let finished = false;
let userAnswers = [];

document.querySelector("#next-button").addEventListener("click", (event) => {
    event.preventDefault();
    handleNext();
});

async function loadQuestions() {
    try {
        const response = await fetch("/json/practice.json");
        questions = await response.json();
        if (totalQuestions >= questions.length)
            totalQuestions = questions.length;
        if (totalQuestions <= 0) {
            document.getElementById("onboarding").style.display = "block";
            document.getElementById("quiz").style.display = "none";

            if ("questionCount-RussianCases" in localStorage) {
                document.getElementById("questionCount").value =
                    localStorage.getItem("questionCount-RussianCases");
            }
        } else showRandomQuestion();
    } catch (error) {
        console.error("Error loading questions:", error);
    }
}

function handleNext() {
    let questionCount = document.getElementById("questionCount").value;

    if (questionCount.length >= 1 && questionCount >= 1) {
        if (questionCount > questions.length)
            localStorage.setItem(
                "questionCount-RussianCases",
                questions.length
            );
        else localStorage.setItem("questionCount-RussianCases", questionCount);

        window.history.replaceState(
            null,
            null,
            "?questions=" + localStorage.getItem("questionCount-RussianCases")
        );

        document.getElementById("onboarding").style.display = "none";
        document.getElementById("quiz").style.display = "block";

        totalQuestions = Math.ceil(
            localStorage.getItem("questionCount-RussianCases")
        );

        showRandomQuestion();
    } else {
        alert("Please enter a valid number.");
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function showRandomQuestion() {
    if (
        answeredQuestions >= totalQuestions ||
        askedQuestions.length === questions.length
    ) {
        displayResults();
        return;
    }

    let randomIndex;

    do {
        randomIndex = Math.floor(Math.random() * questions.length);
    } while (askedQuestions.includes(randomIndex));

    askedQuestions.push(randomIndex);
    currentQuestionIndex = randomIndex;
    const questionData = questions[currentQuestionIndex];

    const questionElement = document.getElementById("question");
    const quizContent = document.getElementById("quiz-content");

    questionElement.textContent = questionData.question;
    quizContent.innerHTML = "";

    if (questionData.type === "multiple-choice") {
        const shuffledOptions = questionData.options
            .map((option, index) => ({ text: option, originalIndex: index }))
            .sort(() => Math.random() - 0.5);

        questionData.shuffledOptions = shuffledOptions;
        questionData.shuffledCorrectIndex = shuffledOptions.findIndex(
            (option) => option.originalIndex === questionData.correct
        );

        shuffledOptions.forEach((option, index) => {
            const label = document.createElement("label");
            label.className = "quiz-label";

            const input = document.createElement("input");
            input.type = "radio";
            input.name = "answer";
            input.value = index;
            input.classList.add("radio-button");

            const buttonSpan = document.createElement("span");
            buttonSpan.style = "display: flex; align-items: center;";
            buttonSpan.className = "quiz-radio-button";
            buttonSpan.innerHTML = `<h3 style="display: flex; margin: 0 12.5px 0 0; padding: 0; background-color: #B1BDC2; color: white; border-radius: 8px; min-width: 32px; width: 32px; height: 100%; align-items: center; justify-content: center;">${
                index + 1
            }</h3> ${option.text}`;

            label.appendChild(input);
            label.appendChild(buttonSpan);
            quizContent.appendChild(label);
        });
    } else if (questionData.type === "true-false") {
        questionData.options.forEach((option, index) => {
            const label = document.createElement("label");
            label.className = "quiz-label";

            const input = document.createElement("input");
            input.type = "radio";
            input.name = "answer";
            input.value = index;
            input.classList.add("radio-button");

            const buttonSpan = document.createElement("span");
            buttonSpan.style = "display: flex; align-items: center;";
            buttonSpan.className = "quiz-radio-button";
            buttonSpan.innerHTML = `<h3 style="display: flex; margin: 0 12.5px 0 0; padding: 0; background-color: #B1BDC2; color: white; border-radius: 8px; min-width: 32px; width: 32px; height: 100%; align-items: center; justify-content: center;">${
                index + 1
            }</h3> ${option}`;

            label.appendChild(input);
            label.appendChild(buttonSpan);
            quizContent.appendChild(label);
        });
    } else if (questionData.type === "open-ended") {
        const input = document.createElement("input");
        input.type = "text";
        input.name = "answer";
        input.placeholder = "Input your answer...";
        input.autocomplete = "off";
        input.id = "open-ended-answer";
        quizContent.appendChild(input);
        input.focus();
    }

    updateProgress();
}

function handleSubmit() {
    const submitButton = document.getElementById("submit-button");
    submitButton.disabled = true;

    if (currentQuestionIndex === -1) {
        console.error("No question is currently being displayed.");
        return;
    } else if (finished === true) {
        window.location.href = "/practice.html";
        return;
    }

    const questionData = questions[currentQuestionIndex];
    let isCorrect = false;
    let userAnswerText = "";

    if (questionData.type === "multiple-choice") {
        const selectedOption = document.querySelector(
            'input[name="answer"]:checked'
        );
        if (selectedOption) {
            const userAnswerIndex = parseInt(selectedOption.value, 10);
            const originalIndex =
                questionData.shuffledOptions[userAnswerIndex].originalIndex;
            isCorrect = originalIndex === questionData.correct;
            userAnswerText = questionData.options[originalIndex];
        } else {
            isCorrect = false;
            userAnswerText = "";
        }
    } else if (questionData.type === "true-false") {
        const selectedOption = document.querySelector(
            'input[name="answer"]:checked'
        );
        if (selectedOption) {
            const userAnswerIndex = parseInt(selectedOption.value, 10);
            isCorrect = userAnswerIndex === questionData.correct;
            userAnswerText = questionData.options[userAnswerIndex];
        } else {
            isCorrect = false;
            userAnswerText = "";
        }
    } else if (questionData.type === "open-ended") {
        userAnswerText = document
            .getElementById("open-ended-answer")
            .value.trim();
        isCorrect =
            userAnswerText.toLowerCase() ===
            questionData.correctAnswer.toLowerCase();
    }

    if (isCorrect) {
        correctAnswers++;
    }

    userAnswers.push({
        question: questionData.question,
        userAnswer: userAnswerText,
        correctAnswer: questionData.correctAnswer,
        isCorrect: isCorrect,
    });

    answeredQuestions++;
    showRandomQuestion();
}

function updateProgress() {
    const progressDisplay = document.getElementById("progress-display");
    const progressPercentage = (answeredQuestions / totalQuestions) * 100;
    progressDisplay.style.width = `${progressPercentage}%`;
}

function displayResults() {
    finished = true;

    let messages = [
        [
            "Excellent work, case ace!",
            "You are a true linguist!",
            "You deserve a round of applause!",
            "Way to go, wizard!",
            "May you reap the fruits of success!",
            "You are going to ace your test!",
        ],
        [
            "You are a star!",
            "Keep up the good work!",
            "Continue shining!",
            "You are unstoppable!",
            "Congratulations!",
            "Your hard work is paying off!",
        ],
        [
            "Don't give up!",
            "Only a few steps away!",
            "Almost there!",
            "So close!",
            "Just two more steps to the goal!",
            "Only one inch away from the bullseye!",
        ],
        [
            "Better luck next time!",
            "Keep practicing and you'll get it!",
            "Don't lose hope, you'll get it soon!",
            "Don't worry, the phoenix must burn to emerge!",
            "Let failure be your teacher, not your undertaker!",
            "Stay motivated and don't lose hope!",
        ],
    ];

    let score = Math.round((correctAnswers / totalQuestions) * 100) || 0;
    let message;

    if (score == 100) {
        message = messages[0][Math.floor(Math.random() * 6)];
    } else if (score <= 99 && score >= 80) {
        message = messages[1][Math.floor(Math.random() * 6)];
    } else if (score <= 89 && score >= 65) {
        message = messages[2][Math.floor(Math.random() * 6)];
    } else if (score <= 64) {
        message = messages[3][Math.floor(Math.random() * 6)];
    }

    document.getElementById("question").innerHTML = "Quiz Complete!";
    document.getElementById(
        "quiz-content"
    ).innerHTML = `You answered ${correctAnswers} out of ${Math.round(
        totalQuestions
    )} question${
        totalQuestions > 1 ? "s" : ""
    } correctly, receiving a score of ${score}%. ${message}<br><br>`;

    const overview = document.createElement("div");

    userAnswers.forEach((answer) => {
        let id = questions.findIndex((i) => i.question === answer.question);

        const answerDiv = document.createElement("div");
        answerDiv.innerHTML = `
            <p><strong>${answer.isCorrect ? "✔️" : "❌"} Question:</strong> ${
            answer.question
        } <sub style="color: #999;">[#${id + 1}]</sub></p>
            <p><strong>Your Answer:</strong> ${
                answer.userAnswer === "" ? "Skipped" : answer.userAnswer
            } ${answer.isCorrect ? "(Correct)" : "(Incorrect)"}</p>
            <p><strong>Correct Answer:</strong> ${answer.correctAnswer}</p>
            ${userAnswers.at(-1) === answer ? "" : "<hr>"}
        `;
        overview.appendChild(answerDiv);
    });

    document.getElementById("quiz-content").appendChild(overview);
    document.getElementById("submit-button").innerText = "Retry";
    document.getElementById("submit-button").addEventListener("click", function() {
        window.location.href = "/practice.html";
    });

    const progressDisplay = document.getElementById("progress-display");
    progressDisplay.style.width = "100%";
}

document.querySelector(".submit").addEventListener("click", (event) => {
    event.preventDefault();
    handleSubmit();
});

document.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        document
            .querySelector(
                `#${
                    document.querySelector("#quiz").style.display === "block"
                        ? "submit"
                        : "next"
                }-button`
            )
            .click();
    } else if (
        ["1", "2", "3", "4"].includes(event.key) &&
        document.querySelector("#quiz").style.display === "block"
    ) {
        document
            .querySelector(
                `input[type="radio"][value="${Number(event.key) - 1}"]`
            )
            .click();
    } else {
        return;
    }

    event.preventDefault();
});

loadQuestions();