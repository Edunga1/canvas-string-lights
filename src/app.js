//- formulas
function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

//- drawers
function drawLooseString(context, t, x1, y1, x2, y2, stringLength, blurry = false) {
  const rightThickness = 10
  const leftThickness = 10
  const yDeltaScalar = 50
  const timeModifier = Math.min(2 / t, 1.0)
  const yDelta = Math.abs(Math.cos(t / 5) * yDeltaScalar) * timeModifier
  const stringDepth = stringLength + yDelta

  context.fillStyle = blurry ? '#ccc' : '#030'
  context.beginPath()
  context.moveTo(x1, y1)
  context.bezierCurveTo(x1, y1 + stringDepth, x2, y2 + stringDepth, x2, y2)
  context.lineTo(x2, y2 + rightThickness)
  context.bezierCurveTo(x2, y2 + stringDepth, x1, y1 + stringDepth, x1, y1 + leftThickness)
  context.closePath()
  context.fill()
}

function drawLight(context, x, y, border = false, blurry = false) {
  context.save()
  context.fillStyle = blurry ? '#ccc' : '#fc0'
  context.strokeStyle = border ? '#f00' : context.fillStyle
  context.lineWidth = 1
  context.beginPath()
  context.arc(x, y, 5, 0, Math.PI * 2)
  context.fill()
  context.stroke()
  context.restore()
}

//- canvas elements
function createLights() {
  let lightIndex = 0
  const searchRadius = 10
  const elements = []
  const temporaryElements = []
  let lastElement = undefined

  function distanceToLast(x, y) {
    return lastElement ? distance(lastElement.x, lastElement.y, x, y) : 0
  }

  function getElement(id) {
    return elements.find(e => e.id === id)
  }

  function newElement(x, y) {
    return {
      id: lightIndex++,
      x,
      y,
      stringLength: distanceToLast(x, y),
      life: 0,
      highlighted: false,
    }
  }

  function updateElement(element) {
    element.life += 1
  }

  const lights = (context) => {
    let prev = undefined

    for (const element of elements) {
      const { x, y, stringLength, life } = element

      if (prev) {
        drawLooseString(context, life, prev.x, prev.y, x, y, stringLength, false)
      }

      drawLight(context, x, y, element.highlighted, false)

      // end
      prev = element
    }

    for (const element of temporaryElements) {
      const { x, y, stringLength } = element

      if (prev) {
        drawLooseString(context, 0, prev.x, prev.y, x, y, stringLength, true)
      }

      drawLight(context, x, y, false, true)
    }
  }

  const add = (x, y) => {
    const element = newElement(x, y)
    elements.push(element)
    lastElement = element
  }

  const addTemporary = (x, y) => {
    const element = newElement(x, y)
    temporaryElements.push(element)
  }

  const clearTemporaries = () => {
    temporaryElements.length = 0
  }

  const updater = () => {
    for (const element of elements) {
      updateElement(element)
    }
    for (const element of temporaryElements) {
      updateElement(element)
    }
  }

  const findByPosition = (x, y) => {
    return elements.find(e => distance(e.x, e.y, x, y) < searchRadius)?.id
  }

  const move = (id, x, y) => {
    const element = getElement(id)
    if (element !== undefined) {
      element.x = x
      element.y = y
    }
  }

  const highlight = (id, only) => {
    for (const element of elements) {
      element.highlighted = only ? element.id === id : element.id === id || element.highlighted
    }
  }

  return {
    lights,
    add,
    updater,
    addTemporary,
    clearTemporaries,
    findByPosition,
    move,
    highlight,
  }
}

function background(context, info) {
  context.fillStyle = 'ivory'
  context.fillRect(0, 0, info.width, info.height)
}

//- application
function animate(callback) {
  const tps = 1000 / 60
  let lastTime = 0
  let elapsed = 0

  requestAnimationFrame(function tick(time) {
    const delta = time - lastTime
    lastTime = time
    elapsed += delta

    if (elapsed >= tps) {
      callback()
      elapsed = 0
    }

    requestAnimationFrame(tick)
  })
}

function createDrawer(context) {
  let info = {
    width: 0,
    height: 0,
  }

  const draw = (func) => {
    context.save()
    func(context, info)
    context.restore()
  }

  const resize = (width, height) => {
    info.width = width
    info.height = height
  }

  resize()

  return {
    draw,
    resize,
  }
}

function main() {
  let isPressed = false
  let movingLight = undefined
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  const { draw, resize } = createDrawer(context)
  const {
    lights,
    add,
    updater: lightUpdater,
    addTemporary,
    clearTemporaries,
    findByPosition,
    move: moveLight,
    highlight,
  } = createLights(context)
  const resizeFunc = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    resize(window.innerWidth, window.innerHeight)
  }
  add(100, 100)
  add(200, 120)
  add(300, 200)
  add(500, 400)
  add(700, 300)
  add(1000, 600)

  document.body.appendChild(canvas)
  window.addEventListener('resize', resizeFunc)

  canvas.addEventListener('mouseup', e => {
    if (movingLight === undefined) {
      add(e.clientX, e.clientY)
      clearTemporaries()
    }
    isPressed = false
    movingLight = undefined
  })

  canvas.addEventListener('mousedown', e => {
    isPressed = true
    movingLight = findByPosition(e.clientX, e.clientY)
  })

  canvas.addEventListener('mousemove', e => {
    if (isPressed && movingLight === undefined) {
      clearTemporaries()
      addTemporary(e.clientX, e.clientY)
    }

    if (movingLight !== undefined) {
      moveLight(movingLight, e.clientX, e.clientY)
    }

    highlight(findByPosition(e.clientX, e.clientY), true)
  })

  resizeFunc()
  animate(function() {
    lightUpdater()
    draw(background)
    draw(lights)
  })
}

main()
