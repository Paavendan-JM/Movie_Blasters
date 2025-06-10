<template>
  <div class="container">
    <h1>🎬 Movie Blasters</h1>

    <!-- Show instructions & language selection BEFORE game starts -->
    <div v-if="!started">
      <div class="instructions">
        <h2>📝 Instructions</h2>
        <ul>
          <li>Guess the movie using up to 5 clues.</li>
          <li>Each wrong guess adds 5 seconds.</li>
          <li>Game ends if you guess wrong 5 times.</li>
          <li>Pick your preferred language to begin.</li>
        </ul>
      </div>

      <div class="language-buttons">
        <button @click="selectLanguage('English')" :class="{ active: selectedLanguage === 'English' }">English</button>
        <button @click="selectLanguage('Hindi')" :class="{ active: selectedLanguage === 'Hindi' }">Hindi</button>
        <button @click="selectLanguage('Tamil')" :class="{ active: selectedLanguage === 'Tamil' }">Tamil</button>
        <button @click="selectLanguage('Malayalam')" :class="{ active: selectedLanguage === 'Malayalam' }">Malayalam</button>
      </div>

      <button @click="startGame" :disabled="!selectedLanguage || loading">
        {{ loading ? 'Loading movies...' : 'Play Game' }}
      </button>
    </div>

    <!-- Game area -->
    <div v-else>
      <p>🕒 Time: {{ timer }} seconds</p>
      <p>Clue: {{ currentRound + 1 }} / 5</p>

      <div class="clue-box" v-if="gameMovie">
        <strong>Clue {{ currentRound + 1 }}:</strong> {{ gameMovie.clues[currentRound] }}
      </div>

      <input
        v-model="guess"
        placeholder="Guess the movie"
        @keyup.enter="submitGuess"
        :disabled="gameOver"
      />
      <button @click="submitGuess" :disabled="gameOver">Submit</button>

      <p v-if="message">{{ message }}</p>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h2>{{ message }}</h2>
        <p>The correct answer was: <strong>{{ gameMovie.name }}</strong></p>
        <p v-if="won">You've taken {{ timer }} seconds.</p>
        <p v-else>You've wasted {{ timer }} seconds.</p>
        <button @click="closeModal">Play Again</button>
        <button @click="shareGame">Share</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const started = ref(false)
const currentRound = ref(0)
const guess = ref('')
const message = ref('')
const gameOver = ref(false)
const timer = ref(0)
const showModal = ref(false)
const won = ref(false)
const loading = ref(true)
const movies = ref([])
const gameMovie = ref(null)
const selectedLanguage = ref('')
let timerInterval = null

const loadMovies = async () => {
  try {
    const response = await fetch('/.netlify/functions/getMovie.js')
    if (!response.ok) throw new Error('Failed to fetch movies')
    movies.value = await response.json()
  } catch (e) {
    console.error(e)
    message.value = 'Error loading movie data.'
  } finally {
    loading.value = false
  }
}

const selectLanguage = (lang) => {
  selectedLanguage.value = lang
}

const startGame = () => {
  if (!selectedLanguage.value) {
    alert('Please select a language first.')
    return
  }

  console.log("All movie languages:", movies.value.map(m => m.language));
  console.log("All movies:", movies.value);

  console.log("Selected language:", selectedLanguage.value);
  console.log("Movie languages:", movies.value.map(m => m.language));

  const filteredMovies = movies.value.filter(
  (m) => m.language === selectedLanguage.value
)

  if (filteredMovies.length === 0) {
    alert('No movies found for this language.')
    return
  }

  const randomIndex = Math.floor(Math.random() * filteredMovies.length)
  gameMovie.value = filteredMovies[randomIndex]

  started.value = true
  currentRound.value = 0
  guess.value = ''
  message.value = ''
  showModal.value = false
  won.value = false
  gameOver.value = false
  timer.value = 0

  timerInterval = setInterval(() => {
    timer.value++
  }, 1000)
}

const submitGuess = () => {
  if (gameOver.value) return

  const userGuess = guess.value.trim().toLowerCase()
  const correctAnswer = gameMovie.value.name.toLowerCase()

  if (userGuess === correctAnswer) {
    message.value = '✅ Correct... You WON !!!'
    gameOver.value = true
    clearInterval(timerInterval)
    showModal.value = true
    won.value = true
  } else {
    if (currentRound.value >= 4) {
      message.value = '❌ Game Over!'
      gameOver.value = true
      clearInterval(timerInterval)
      showModal.value = true
      won.value = false
    } else {
      message.value = '❌ Wrong guess. +5 seconds penalty. Next clue...'
      currentRound.value++
      timer.value += 5
    }
  }

  guess.value = ''
}

const closeModal = () => {
  showModal.value = false
  resetGame()
}

const resetGame = () => {
  started.value = false
  clearInterval(timerInterval)
  message.value = ''
  guess.value = ''
  currentRound.value = 0
  timer.value = 0
}

const shareGame = () => {
  const link = window.location.href
  navigator.clipboard.writeText(link).then(() => {
    alert('Game link copied! Share it with your friends.')
  })
}

onMounted(() => {
  loadMovies()
})
</script>

<style scoped>
.container {
  z-index: 1;
  background-color: #000;
  padding: 40px 30px;
  border-radius: 10%;
  color: white;
  text-align: center;
  box-shadow: 0 0 10px 4px #07a907;
}

.instructions {
  background-color: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  text-align: left;
}

.instructions ul {
  list-style: disc;
  padding-left: 20px;
}

.language-buttons {
  margin-bottom: 20px;
}

.language-buttons button {
  margin: 5px;
}

.language-buttons .active {
  background-color: #1e6f1e;
  border: 2px solid #fff;
}

.clue-box {
  border: 2px solid #228b22;
  padding: 15px;
  margin: 20px 0;
  font-size: 1.2em;
  border-radius: 8px;
  background-color: rgba(34, 139, 34, 0.2);
}

input {
  padding: 12px;
  font-size: 18px;
  width: 70%;
  margin-top: 15px;
  border-radius: 6px;
  border: none;
  outline: none;
}

button {
  padding: 12px 24px;
  margin: 10px 5px;
  cursor: pointer;
  border-radius: 8px;
  border: none;
  background-color: #228b22;
  color: white;
  font-weight: bold;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

button:disabled {
  background-color: gray;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #1e6f1e;
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.modal-content {
  background-color: #1e1e1e;
  color: white;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 0 10px 2px #07a907;
}
</style>
