//- drawers
function drawLooseString(context, t, x1, y1, x2, y2, stringLength) {
  const rightThickness = 10
  const leftThickness = 10
  const yDeltaScalar = 5
  const yDelta = Math.abs(Math.sin(t / 10) * yDeltaScalar)
  const deltaStringLength = stringLength + yDelta
  context.beginPath()
  context.moveTo(x1, y1)
  context.bezierCurveTo(x1, y1 + deltaStringLength, x2, y2 + deltaStringLength, x2, y2)
  context.lineTo(x2, y2 + rightThickness)
  context.bezierCurveTo(x2, y2 + deltaStringLength, x1, y1 + deltaStringLength, x1, y1 + leftThickness)
  context.closePath()
  context.fill()
}

//- canvas elements
function createLights() {
  const elements = []
  let lastElement = undefined

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
  }

  const add = (x, y) => {
    const distance = lastElement ? Math.sqrt((lastElement.x - x) ** 2 + (lastElement.y - y) ** 2) : 0
    const element = {
      x,
      y,
      stringLength: distance,
      life: 0,
    }

    elements.push(element)
    lastElement = element
  }

  const updater = () => {
    for (const element of elements) {
      element.life += 1
    }
  }

  return {
    lights,
    add,
    updater,
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
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  const { draw, resize } = createDrawer(context)
  const { lights, add, updater: lightUpdater } = createLights(context)
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
  })

  resizeFunc()
  animate(function () {
    lightUpdater()
    draw(background)
    draw(lights)
  })
}

main()
