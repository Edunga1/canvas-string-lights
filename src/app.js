//- formulas
function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

//- drawers
function drawLooseString(context, t, x1, y1, x2, y2, stringLength) {
  const rightThickness = 10
  const leftThickness = 10
  const yDeltaScalar = 50
  const timeModifier = Math.min(5 / t, 1.0)
  const yDelta = Math.abs(Math.cos(t / 5) * yDeltaScalar) * timeModifier
  const stringDepth = stringLength + yDelta
  context.beginPath()
  context.moveTo(x1, y1)
  context.bezierCurveTo(x1, y1 + stringDepth, x2, y2 + stringDepth, x2, y2)
  context.lineTo(x2, y2 + rightThickness)
  context.bezierCurveTo(x2, y2 + stringDepth, x1, y1 + stringDepth, x1, y1 + leftThickness)
  context.closePath()
  context.fill()
}

//- canvas elements
function createLights() {
  const colorTemporary = '#ccc'
  const elements = []
  const temporaryElements = []
  let lastElement = undefined

  function distanceToLast(x, y) {
    return lastElement ? distance(lastElement.x, lastElement.y, x, y) : 0
  }

  function newElement(x, y) {
    return { x, y, stringLength: distanceToLast(x, y), life: 0 }
  }

  function updateElement(element) {
    element.life += 1
  }

  const lights = (context) => {
    let last = undefined

    context.fillStyle = '000'
    for (const element of elements) {
      // light
      const { x, y, stringLength, life } = element
      context.beginPath()
      context.arc(x, y, 5, 0, Math.PI * 2)
      context.fill()

      // line
      if (last) {
        drawLooseString(context, life, last.x, last.y, x, y, stringLength)
      }

      // end
      last = element
    }

    context.fillStyle = colorTemporary
    for (const element of temporaryElements) {
      const { x, y, stringLength } = element
      context.beginPath()
      context.arc(x, y, 5, 0, Math.PI * 2)
      context.fill()

      if (last) {
        drawLooseString(context, 0, last.x, last.y, x, y, stringLength)
      }
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

  return {
    lights,
    add,
    updater,
    addTemporary,
    clearTemporaries,
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
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  const { draw, resize } = createDrawer(context)
  const {
    lights,
    add,
    updater: lightUpdater,
    addTemporary,
    clearTemporaries,
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
    add(e.clientX, e.clientY)
    clearTemporaries()
    isPressed = false
  })
  canvas.addEventListener('mousedown', () => {
    isPressed = true
  })
  canvas.addEventListener('mousemove', e => {
    if (isPressed) {
      clearTemporaries()
      addTemporary(e.clientX, e.clientY)
    }
  })

  resizeFunc()
  animate(function () {
    lightUpdater()
    draw(background)
    draw(lights)
  })
}

main()
