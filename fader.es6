console.clear()


// Util

const constraintNumber = (n, min = 0, max = 1) =>
  Math.min(Math.max(n, min), max)
/** @see https://github.com/processing/p5.js/blob/master/src/math/calculation.js */
const mapNumber = (n, start1, stop1, start2 = 0, stop2 = 1) =>
  ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2


// Implementation

class Fader extends HTMLElement {
  // “constructor”
  createdCallback() {
    // initial properties
    this.transitionTime = parseInt(this.getAttribute('transitionTime')) || 300
    this.amp = 0
    this.value = 0
    this.startValue = 0
    this.startX = 0

    // import handlers from prototype to obj
    this.onTouchStart = this.onTouchStart.bind(this)
    this.onTouchEnd = this.onTouchEnd.bind(this)
    this.onTouchMove = this.onTouchMove.bind(this)
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)

    // add handlers
    this.addEventListener('touchstart', this.onTouchStart, { passive: true })
    this.addEventListener('touchend', this.onTouchEnd, { passive: true })
    this.addEventListener('touchmove', this.onTouchMove, { passive: true })
    this.addEventListener('mousedown', this.onMouseDown)
  }

  // added to the DOM
  attachedCallback() {
    this.updateSlides()
  }


  // touch handlers
  onTouchStart(e) {
    this.startDragging(e.targetTouches[0].pageX)
  }
  onTouchMove(e) {
    this.drag(e.targetTouches[0].pageX)
  }
  onTouchEnd(e) {
    this.stopDragging()
  }


  // mouse handlers
  onMouseDown(e) {
    e.preventDefault()
    this.startDragging(e.pageX)
    window.addEventListener('mousemove', this.onMouseMove)
    window.addEventListener('mouseup', this.onMouseUp)
  }
  onMouseMove(e) {
    this.drag(e.pageX)
  }
  onMouseUp(e) {
    this.stopDragging()
    window.removeEventListener('mousemove', this.onMouseMove)
    window.removeEventListener('mouseup', this.onMouseUp)
  }



  // calculations
  startDragging(x) {
    this.cancelAnimation()
    this.startValue = this.value // store the current value
    this.startX = x // store where the interaction started
    this.amp = this.offsetWidth || 1000
  }
  drag(x) {
    const delta = constraintNumber(
      mapNumber(x - this.startX, -this.amp, this.amp, -1, 1),
      - this.startValue, 1 - this.startValue
    )

    this.value = this.startValue + delta

    this.updateSlides()
  }
  stopDragging() {
    this.snapToNearestSlide()
  }


  // show the right combination for the current value
  updateSlides() {
    const slides = this.children
    const slideSize = 1 / (slides.length - 1)

    for (let i = 1; i < slides.length; i++) {
      const start = (i - 1) * slideSize
      const stop = i * slideSize

      slides[i].style.opacity = constraintNumber(mapNumber(this.value, start, stop))
    }
  }

  snapToNearestSlide() {
    // @TODO duration? static? dynamic? configurable?
    this.animationStart = new Date()
    this.animationStop = new Date(this.animationStart.getTime() + this.transitionTime)
    this.animationStartX = this.value
    this.animationStopX = this.getNearestSlideValue()

    this.animate()
  }
  animate() {
    if (this.animationStop === null || this.animationStart === null) return

    const amp = this.animationStop - this.animationStart
    const time = Math.min(mapNumber(amp - (this.animationStop.getTime() - Date.now()), 0, amp), 1)
    const delta = this.animationStopX - this.animationStartX

    this.value = this.animationStartX + (this.easing(time) * delta)
    this.updateSlides()

    if (time >= 1) return

    if (window.requestAnimationFrame) window.requestAnimationFrame(this.animate.bind(this))
    else this.animate()
  }
  cancelAnimation() {
    this.animationStart = null
    this.animationStop = null
  }

  getNearestSlideValue() {
    const slides = this.children
    const slideSize = 1 / (slides.length - 1)

    for (let i = 0; i < slides.length; i++) {
      const start = (i * slideSize) - (slideSize / 2)
      const stop = start + slideSize

      if (this.value > start && this.value <= stop) {
        return constraintNumber(start + (slideSize / 2))
      }
    }

    return 0
  }

  // easing function
  easing(t) {
    // @see https://gist.github.com/gre/1650294
    return t <.5 ? 2*t*t : -1+(4-2*t)*t;
  }

  set value(x) {
    this._value = x
    this.dispatchEvent(new Event('change'))
  }
  get value() {
    return this._value
  }
}

document.registerElement('felds-fader', Fader)
