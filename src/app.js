function animate(callback) {
  const tps = 1000 / 60
  let lastTime = 0
  let elapsed = 0

  requestAnimationFrame(function tick(time) {
    const delta = time - lastTime
    lastTime = time
    elapsed += delta

    while (elapsed >= tps) {
      callback()
      elapsed -= tps
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

function background(context, info) {
  context.fillStyle = 'ivory'
  context.fillRect(0, 0, info.width, info.height)
}

function createLights() {
  const elements = []

  const lights = (context) => {
    context.fillStyle = '000'
    for (const { x, y } of elements) {
      context.beginPath()
      context.arc(x, y, 5, 0, Math.PI * 2)
      context.fill()
    }
  }

  const add = (x, y) => {
    elements.push({ x, y })
  }

  return {
    lights,
    add,
  }
}

function main() {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  const { draw, resize } = createDrawer(context)
  const { lights, add } = createLights(context)
  const resizeFunc = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    resize(window.innerWidth, window.innerHeight)
  }

  document.body.appendChild(canvas)
  window.addEventListener('resize', resizeFunc)
  canvas.addEventListener('mousedown', e => {
    add(e.clientX, e.clientY)
  })

  resizeFunc()
  animate(function () {
    draw(background)
    draw(lights)
  })
}

main()
