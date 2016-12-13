'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var constraintNumber = function constraintNumber(n) {
  var min = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var max = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  return Math.min(Math.max(n, min), max);
};
/** @see https://github.com/processing/p5.js/blob/master/src/math/calculation.js */
var mapNumber = function mapNumber(n, start1, stop1) {
  var start2 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var stop2 = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
  return (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
};

// Implementation

var Fader = function (_HTMLElement) {
  _inherits(Fader, _HTMLElement);

  function Fader() {
    _classCallCheck(this, Fader);

    return _possibleConstructorReturn(this, (Fader.__proto__ || Object.getPrototypeOf(Fader)).apply(this, arguments));
  }

  _createClass(Fader, [{
    key: 'createdCallback',

    // “constructor”
    value: function createdCallback() {
      // initial properties
      this.transitionTime = parseInt(this.getAttribute('transitionTime')) || 300;
      this.amp = 0;
      this.value = 0;
      this.startValue = 0;
      this.startX = 0;

      // import handlers from prototype to obj
      this.onTouchStart = this.onTouchStart.bind(this);
      this.onTouchEnd = this.onTouchEnd.bind(this);
      this.onTouchMove = this.onTouchMove.bind(this);
      this.onMouseDown = this.onMouseDown.bind(this);
      this.onMouseMove = this.onMouseMove.bind(this);
      this.onMouseUp = this.onMouseUp.bind(this);

      // add handlers
      this.addEventListener('touchstart', this.onTouchStart, { passive: true });
      this.addEventListener('touchend', this.onTouchEnd, { passive: true });
      this.addEventListener('touchmove', this.onTouchMove, { passive: true });
      this.addEventListener('mousedown', this.onMouseDown);
    }

    // added to the DOM

  }, {
    key: 'attachedCallback',
    value: function attachedCallback() {
      this.updateSlides();
    }

    // touch handlers

  }, {
    key: 'onTouchStart',
    value: function onTouchStart(e) {
      this.startDragging(e.targetTouches[0].pageX);
    }
  }, {
    key: 'onTouchMove',
    value: function onTouchMove(e) {
      this.drag(e.targetTouches[0].pageX);
    }
  }, {
    key: 'onTouchEnd',
    value: function onTouchEnd(e) {
      this.stopDragging();
    }

    // mouse handlers

  }, {
    key: 'onMouseDown',
    value: function onMouseDown(e) {
      e.preventDefault();
      this.startDragging(e.pageX);
      window.addEventListener('mousemove', this.onMouseMove);
      window.addEventListener('mouseup', this.onMouseUp);
    }
  }, {
    key: 'onMouseMove',
    value: function onMouseMove(e) {
      this.drag(e.pageX);
    }
  }, {
    key: 'onMouseUp',
    value: function onMouseUp(e) {
      this.stopDragging();
      window.removeEventListener('mousemove', this.onMouseMove);
      window.removeEventListener('mouseup', this.onMouseUp);
    }

    // calculations

  }, {
    key: 'startDragging',
    value: function startDragging(x) {
      this.cancelAnimation();
      this.startValue = this.value; // store the current value
      this.startX = x; // store where the interaction started
      this.amp = this.offsetWidth || 1000;
    }
  }, {
    key: 'drag',
    value: function drag(x) {
      var delta = constraintNumber(mapNumber(x - this.startX, -this.amp, this.amp, -1, 1), -this.startValue, 1 - this.startValue);

      this.value = this.startValue + delta;

      this.updateSlides();
    }
  }, {
    key: 'stopDragging',
    value: function stopDragging() {
      this.snapToNearestSlide();
    }

    // show the right combination for the current value

  }, {
    key: 'updateSlides',
    value: function updateSlides() {
      var slides = this.children;
      var slideSize = 1 / (slides.length - 1);

      for (var i = 1; i < slides.length; i++) {
        var start = (i - 1) * slideSize;
        var stop = i * slideSize;

        slides[i].style.opacity = constraintNumber(mapNumber(this.value, start, stop));
      }
    }
  }, {
    key: 'snapToNearestSlide',
    value: function snapToNearestSlide() {
      // @TODO duration? static? dynamic? configurable?
      this.animationStart = new Date();
      this.animationStop = new Date(this.animationStart.getTime() + this.transitionTime);
      this.animationStartX = this.value;
      this.animationStopX = this.getNearestSlideValue();

      this.animate();
    }
  }, {
    key: 'animate',
    value: function animate() {
      if (this.animationStop === null || this.animationStart === null) return;

      var amp = this.animationStop - this.animationStart;
      var time = Math.min(mapNumber(amp - (this.animationStop.getTime() - Date.now()), 0, amp), 1);
      var delta = this.animationStopX - this.animationStartX;

      this.value = this.animationStartX + this.easing(time) * delta;
      this.updateSlides();

      if (time >= 1) return;

      if (window.requestAnimationFrame) window.requestAnimationFrame(this.animate.bind(this));else this.animate();
    }
  }, {
    key: 'cancelAnimation',
    value: function cancelAnimation() {
      this.animationStart = null;
      this.animationStop = null;
    }
  }, {
    key: 'getNearestSlideValue',
    value: function getNearestSlideValue() {
      var slides = this.children;
      var slideSize = 1 / (slides.length - 1);

      for (var i = 0; i < slides.length; i++) {
        var start = i * slideSize - slideSize / 2;
        var stop = start + slideSize;

        if (this.value > start && this.value <= stop) {
          return constraintNumber(start + slideSize / 2);
        }
      }

      return 0;
    }

    // easing function

  }, {
    key: 'easing',
    value: function easing(t) {
      // @see https://gist.github.com/gre/1650294
      return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
  }, {
    key: 'value',
    set: function set(x) {
      this._value = x;
      this.dispatchEvent(new Event('change', { bubbles: true }));
    },
    get: function get() {
      return this._value;
    }
  }]);

  return Fader;
}(HTMLElement);

document.registerElement('felds-fader', Fader);
//# sourceMappingURL=fader.js.map