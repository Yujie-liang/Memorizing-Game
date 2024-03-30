const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}
const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52));
  },
  //依照不同遊戲狀態執行不同行為
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return;
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      //return
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(model.triedTimes += 1)
        view.flipCards(card)
        model.revealedCards.push(card)
        if (model.isRevealedCardsMatched()) {
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairedCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            view.stopTimer()
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()  // 加在這裡
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          console.log(model.isRevealedCardsMatched())
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)

        }
        break
      //return
    }
    console.log(this.currentState)
    console.log(model.revealedCards)
  },
  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}

const model = {
  revealedCards: [],
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 == this.revealedCards[1].dataset.index % 13
  },
  score: 0,
  triedTimes: 0,
  sec: 0
}

const view = {
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `<p>${number}</p>
        <img src="${symbol}">
        <p>${number}</p>`
  },
  getCardElement(index) {
    return `<div class="card back" data-index="${index}">
      </div>`
  },
  displayCards(indexes) {
    const rootElement = document.querySelector('.cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },
  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        const index = Number(card.dataset.index)
        card.innerHTML = this.getCardContent(index)
        return
      }
      // 回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  pairedCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },
  renderScore(score) {
    document.querySelector('.score').innerText = `Score: ${score}`
  },
  renderTriedTimes(triedTimes) {
    document.querySelector('.tried').innerText = `You've tried: ${triedTimes} times`
  },
  appendWrongAnimation(...cards) {
    cards.map((card) => {
      card.classList.add('wrong')
      card.addEventListener('animationend', function () {
        card.classList.remove('wrong')
      })
    })
  },
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('.header')
    header.before(div)
  },
  startTimer() {
    timerId = setInterval(this.updateTime, 1000);
  },
  updateTime() {
    model.sec++; // 每次調用增加1秒
    let minutes = Math.floor(model.sec / 60);
    let seconds = model.sec % 60;

    // 確保時間格式始終是兩位數
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    // 更新計時器顯示
    document.querySelector('.timer').innerText = `Time has passed: ${minutes}:${seconds}`;
  },
  stopTimer() {
    clearInterval(timerId)
  }
}

const utility = { //外掛函式
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

controller.generateCards();

view.startTimer();
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', function () {
    controller.dispatchCardAction(card)
  })
})
