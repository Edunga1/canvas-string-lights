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

function main() {
  const canvas = document.createElement('canvas')

  document.body.appendChild(canvas)

  animate(function () {
  })
}

main()
