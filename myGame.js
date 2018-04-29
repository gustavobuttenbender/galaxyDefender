
///////////////////////////////////////////
////////////// Space    //////////////////////
/////////////////////////////////////////

function Space() {
  this.canvas = null 
  this.context = null

  this.width = null
  this.height = null 

  this.background = null

  this.spaceship = null 
  this.spaceshipCannonShots = []
  
  this.enemyShips = []
}


Space.events = {
  KEYDOWN: 'keydown',
  KEYUP: 'keyup',
  TOUCHEND: 'touchend'
}

Space.dimensions = {
  MAX_WIDTH: 600,
  MAX_HEIGHT: 270
}

Space.keyCodes = {
  MOVE_UP: { key: 38, direction: -.5 },
  MOVE_DOWN: { key: 40, direction: .5 },
  MOVE_LEFT: { key: 37, direction: -.5 },
  MOVE_RIGHT: { key: 39, direction: .5 },
  SPACE: { key: 32 }
}


Space.prototype = {
  initSettings: function() {    
    this.canvas = document.createElement('canvas') 
    this.context = this.canvas.getContext('2d')
    this.canvas.width = Space.dimensions.MAX_WIDTH
    this.canvas.height = Space.dimensions.MAX_HEIGHT
    this.frameNo = 0      
    document.body.insertBefore(this.canvas, document.body.childNodes[0])
  
    this.background = new Background(this.canvas)
    this.spaceship = new Spaceship(this.canvas, this.canvas.height)

    this.start()
  },

  update: function() {
    if(this.enemyShips.length > 0) {

      this.enemyShips.forEach(enemyShip => {
        if(checkForCollision(this.spaceship, enemyShip)) {
          this.gameOver()
        }

        if(this.spaceshipCannonShots.length > 0 ) {
          this.spaceshipCannonShots.forEach(cannonShot => {
            if(checkForCollision(cannonShot, enemyShip)) {
              const indexOfEnemyShip = this.enemyShips.indexOf(enemyShip)
              const indexOfCannoShot = this.spaceshipCannonShots.indexOf(cannonShot) 
  
              this.enemyShips.splice(indexOfEnemyShip, 1)
              this.spaceshipCannonShots.splice(indexOfCannoShot, 1)
            }
          })
        }
      })
    }

    

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.frameNo += 1 

    if(this.frameNo === 1 || hasReachedIntervalToGenerateEnemies(this.frameNo, 100)) {
      let yPos = Math.floor(Math.random()*(this.canvas.height))
      this.enemyShips.push(new EnemyShip(this.canvas, yPos, this.canvas.width))
    }

    this.background.updatePosition()
    this.background.update()

    this.spaceship.updatePosition()
    this.spaceship.update()

    if(this.enemyShips.length > 0) {
      this.enemyShips.forEach(enemyShip => {
        enemyShip.updatePosition()
        enemyShip.update()
      })
    }

    if(this.spaceshipCannonShots.length > 0 ) {
      this.spaceshipCannonShots.forEach(cannonShot => {
        cannonShot.update()
        cannonShot.updatePosition()
      })
    }
  },

  start: function() {
    this.interval = setInterval(() => this.update(), 1)
  },
  
  gameOver: function() {
    clearInterval(this.interval)
  }
}


///////////////////////////////////////////
////////////// Spaceship    //////////////////////
/////////////////////////////////////////


function Spaceship(canvas, screenHeigth) {
  this.canvas = canvas
  this.context = canvas.getContext('2d')
  this.image = new Image()
  this.image.src = Spaceship.config.defaultImage
  this.width = Spaceship.dimensions.width
  this.height = Spaceship.dimensions.height 
  this.xPos = 0
  this.yPos = screenHeigth/2
  this.speedX = 0
  this.speedY = 0

  this.startListeningEvents()

  this.init()
}

Spaceship.dimensions = {
  width: 60,
  height: 30 
}

Spaceship.config = {
  defaultImage: 'images/ship.png'
}

Spaceship.prototype = {
  init: function() {
    this.xPos = 0 
    this.yPos = this.yPos - this.height/2
    this.draw(this.xPos, this.yPos)
  },

  draw: function (x, y) {
    this.context.drawImage(this.image, x, y, this.width, this.height)
  },

  update: function() {
    this.draw(this.xPos, this.yPos)
  },

  updatePosition: function() {
    this.xPos += this.speedX * this.checkLimitsX()
    this.yPos += this.speedY * this.checkLimitsY()
  },

  eventHandlers: function(e) {
    switch (e.type) {
      case Space.events.KEYDOWN:
        this.onKeyDown(e.keyCode)
        break;
      case Space.events.KEYUP:
        this.onKeyUp(e.keyCode) 
        break;
    }
  },

  startListeningEvents: function() {
    document.addEventListener(Space.events.KEYDOWN, (e) => this.eventHandlers(e))
    document.addEventListener(Space.events.KEYUP, (e) => this.eventHandlers(e))
  },

  onKeyDown: function(keyCode) {
    switch(keyCode) {
      case Space.keyCodes.MOVE_RIGHT.key:
        this.moveHorizontal(Space.keyCodes.MOVE_RIGHT.direction)
        break;
      case Space.keyCodes.MOVE_LEFT.key:
        this.moveHorizontal(Space.keyCodes.MOVE_LEFT.direction)
        break;
      case Space.keyCodes.MOVE_DOWN.key:
        this.moveVertical(Space.keyCodes.MOVE_DOWN.direction)
        break;
      case Space.keyCodes.MOVE_UP.key:      
        this.moveVertical(Space.keyCodes.MOVE_UP.direction)
        break;
      case Space.keyCodes.SPACE.key:
        this.cannonShot(this.canvas, this.xPos, this.yPos)
        break;
    }
  },

  onKeyUp: function(keyCode) {
    if(keyCode === Space.keyCodes.SPACE.key)
      return

    if(keyCode === Space.keyCodes.MOVE_UP.key || keyCode === Space.keyCodes.MOVE_DOWN.key)
      return this.stopMovingVertical(keyCode)
    this.stopMovingHorizontaly(keyCode)
  },

  moveHorizontal: function(direction) {
    return this.speedX = direction 
  },

  moveVertical: function(direction) {
    return this.speedY = direction
  },

  stopMovingVertical: function(keyCode) {
    if(keyCode === Space.keyCodes.MOVE_UP.key && this.speedY === Space.keyCodes.MOVE_UP.direction
    || (keyCode === Space.keyCodes.MOVE_DOWN.key && this.speedY === Space.keyCodes.MOVE_DOWN.direction))
      return this.speedY = 0 
  },

  stopMovingHorizontaly: function(keyCode) {
    if(keyCode === Space.keyCodes.MOVE_LEFT.key && this.speedX === Space.keyCodes.MOVE_LEFT.direction
    || (keyCode === Space.keyCodes.MOVE_RIGHT.key && this.speedX === Space.keyCodes.MOVE_RIGHT.direction))
        return this.speedX = 0 
  },

  checkLimitsX: function() {
    if (this.xPos === (Space.dimensions.MAX_WIDTH - this.width ) && this.speedX > 0){
      this.speedX = 0
      return 0    
    }
    if (this.xPos === 0 && this.speedX < 0){
      this.speedX = 0
      return 0
    }
    return 1
  },

  checkLimitsY: function() {
    if (this.yPos === (Space.dimensions.MAX_HEIGHT - this.height) && this.speedY > 0){
      this.speedY = 0
      return 0    
    }
    if (this.yPos === 0 && this.speedY < 0){
      this.speedY = 0
      return 0
    }
    return 1
  },
  cannonShot: function(canvas, spaceshipX, spaceshipY) {
    // So the should starts from the middle and front of the spaceship
    let cannonShotYPosition = spaceshipY + this.height/2
    let cannonShotXPosition = spaceshipX + this.width

    let cannonShot = new CannonShot(canvas, cannonShotXPosition, cannonShotYPosition)
    space.spaceshipCannonShots.push(cannonShot)
    
  }
}

///////////////////////////////////////////
////////////// CannonShot  //////////////////////
/////////////////////////////////////////


function CannonShot(canvas, spaceshipXPos, spaceshipYPos) {
  this.canvas = canvas
  this.context = canvas.getContext('2d')
  this.width = CannonShot.dimensions.MAX_WIDTH 
  this.height = CannonShot.dimensions.MAX_HEIGHT
  this.xPos = spaceshipXPos
  this.yPos = spaceshipYPos
  this.speedX = 0
  this.speedY = 0

  this.init()
}

CannonShot.config = {
  defaultSpeed: 1,
  color: 'red'
}

CannonShot.dimensions = {
  MAX_WIDTH: 5, 
  MAX_HEIGHT: 3
}

CannonShot.prototype = {
  init: function() {
    this.draw(this.xPos, this.yPos)
  },
  draw: function(x) {
    this.context.fillStyle = CannonShot.config.color
    this.context.fillRect(x, this.yPos, this.width, this.height)
  },
  update: function() {
    this.draw(this.xPos)
  },
  updatePosition: function() {
    this.xPos += CannonShot.config.defaultSpeed
  }
}


///////////////////////////////////////////
////////////// Background  //////////////////////
/////////////////////////////////////////


function Background(canvas) {
  this.canvas = canvas
  this.context = canvas.getContext('2d')
  this.image = new Image()
  this.image.src = Background.config.defaultImage
  this.width = Background.dimensions.MAX_WIDTH 
  this.height = Background.dimensions.MAX_HEIGHT
  this.xPos = 0
  this.yPos = 0
  this.speedX = 0
  this.speedY = 0

  this.init()
}

Background.config = {
  defaultImage: 'images/background-space.gif',
  defaultSpeed: -1
}

Background.dimensions = {
  MAX_WIDTH: 1782, 
  MAX_HEIGHT: Space.dimensions.MAX_HEIGHT
}

Background.prototype = {
  init: function() {
    this.draw(this.xPos, this.yPos)
  },
  draw: function(x) {
    this.context.drawImage(this.image, x , this.yPos, this.width, this.height)
    this.context.drawImage(this.image, x + this.width, this.yPos, this.width, this.height)
  },
  update: function() {
    if(this.xPos === -(Background.dimensions.MAX_WIDTH))
      this.xPos = 0 
    this.draw(this.xPos)
  },
  updatePosition: function() {
    this.xPos += Background.config.defaultSpeed
  }
}

///////////////////////////////////////////
////////////// EnemyShip  //////////////////////
/////////////////////////////////////////


function EnemyShip(canvas, yPos, screenWidth) {
  this.canvas = canvas
  this.context = canvas.getContext('2d')
  this.image = new Image()
  this.image.src = EnemyShip.config.defaultImage
  this.width = EnemyShip.dimensions.width 
  this.height = EnemyShip.dimensions.height
  this.xPos = screenWidth
  this.yPos = yPos
  this.speedX = 0
  this.speedY = 0

  this.init()
}

EnemyShip.config = {
  defaultImage: 'images/enemy-ship.png',
  defaultSpeed: -1.5
}

EnemyShip.dimensions = {
  width: 50,
  height: 50 
}

EnemyShip.prototype = {
  init: function() {
    this.draw(this.xPos, this.yPos)
  },
  draw: function(x) {
    this.context.drawImage(this.image, x, this.yPos, this.width, this.height)
  },
  update: function() {
    this.draw(this.xPos)
  },
  updatePosition: function() {
    this.xPos += EnemyShip.config.defaultSpeed
  } 
}

///////////////////////////////////////////
////////////// Game commands  //////////////////////
/////////////////////////////////////////


function hasReachedIntervalToGenerateEnemies(currentFrame, interval) {
  return (currentFrame / interval) % 1 == 0
}

function checkForCollision(component, obstacle) {
  let componentBottom = component.yPos + component.height 
  let componentRight = component.xPos + component.width 

  let obstacleBottom = obstacle.yPos + obstacle.height
  let obstacleRight = obstacle.xPos + obstacle.width 

  return !((componentBottom < obstacle.yPos) ||
          (component.yPos > obstacleBottom)  ||
          (componentRight < obstacle.xPos)  ||
          (component.xPos > obstacleRight))
}

function startGame() {
  space = new Space()
  space.initSettings()
}

startGame()

