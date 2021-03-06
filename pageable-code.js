/*
 Pageable
 Copyright (c) 2017 Karl Saunders (http://mobius.ovh)
 Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.

 Version: 0.6.5

*/
(function(f, g) {
    "object" === typeof exports ? module.exports = g("Pageable") : "function" === typeof define && define.amd ? define([], g) : f.Pageable = g("Pageable")
})("undefined" !== typeof global ? global : this.window || this.global, function() {
    var f = function() {},
        g = function b(a, c) {
            for (var e in c)
                if (c.hasOwnProperty(e)) {
                    var d = c[e];
                    d && "[object Object]" === Object.prototype.toString.call(d) ? (a[e] = a[e] || {}, b(a[e], d)) : a[e] = d
                }
            return a
        },
        k = function(a, c, b) {
            var e;
            return function() {
                b = b || this;
                if (!e) return a.apply(b, arguments), e = !0, setTimeout(function() {
                    e = !1
                }, c)
            }
        },
        h = function(a) {
            this.instance = a;
            this.running = !1;
            this.config = this.instance.config.slideshow
        };
    h.prototype.start = function() {
        var a = this;
        a.running || (a.running = !0, a.instance.slideIndex = a.instance.index, a.instance.interval = setInterval(function() {
            a.instance.config.onBeforeStart.call(a.instance, a.instance.slideIndex);
            setTimeout(function() {
                    a.instance.config.infinite && a.instance._overScroll(!0);
                    a.instance.index < a.instance.pages.length - 1 ? a.instance.slideIndex++ : a.instance.slideIndex = 0;
                    a.instance.scrollToIndex(a.instance.slideIndex)
                },
                a.config.delay || 0)
        }, a.config.interval))
    };
    h.prototype.stop = function() {
        this.running && (clearInterval(this.instance.interval), this.running = this.instance.slideInterval = !1)
    };
    var d = function(a, c) {
        if (void 0 === a) return console.error("Pageable:", "No container defined.");
        var b = this,
            e = {
                pips: !0,
                animation: 300,
                delay: 0,
                throttle: 50,
                orientation: "vertical",
                easing: function(a, b, c, e, d) {
                    return -c * (a /= e) * (a - 2) + b
                },
                onInit: f,
                onUpdate: f,
                onBeforeStart: f,
                onStart: f,
                onScroll: f,
                onFinish: f,
                swipeThreshold: 50,
                freeScroll: !1,
                slideshow: !1,
                infinite: !1,
                childSelector: "[data-anchor]",
                events: {
                    wheel: !0,
                    mouse: !0,
                    touch: !0,
                    keydown: !0
                }
            };
        this.container = "string" === typeof a ? document.querySelector(a) : a;
        if (!this.container) return console.error("Pageable:", "The container could not be found.");
        this.config = g(e, c);
        this.events = this.config.events;
        if (this.config.anchors && Array.isArray(this.config.anchors)) {
            var d = document.createDocumentFragment();
            this.config.anchors.forEach(function(a) {
                var b = document.createElement("div");
                b.dataset.anchor = a;
                d.appendChild(b)
            });
            this.container.appendChild(d)
        }
        this.pages = this.container.querySelectorAll(this.config.childSelector);
        if (!this.pages.length) return console.error("Pageable:", "No child nodes matching the selector " + this.config.childSelector + " could be found.");
        this.horizontal = "horizontal" === this.config.orientation;
        this.anchors = [];
        this.pages.forEach(function(a, c) {
            var e = "undefined" !== typeof a.dataset.anchor ? a.dataset.anchor.replace(/\s+/, "-").toLowerCase() : a.classList.value.replace(/\s+/, "-").toLowerCase();
            a.id !== e && (a.id =
                e);
            b.anchors.push("#" + e);
            a.classList.add("pg-page");
            a.classList.toggle("pg-active", 0 == c)
        });
        this.axis = this.horizontal ? "x" : "y";
        this.mouseAxis = {
            x: "clientX",
            y: "clientY"
        };
        this.scrollAxis = {
            x: "scrollLeft",
            y: "scrollTop"
        };
        this.size = {
            x: "width",
            y: "height"
        };
        this.bar = this._getScrollBarWidth();
        this.oldIndex = this.slideIndex = this.index = 0;
        this.initialised = this.down = !1;
        this.touch = "ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch;
        this.init()
    };
    d.prototype.init = function() {
        if (!this.initialised &&
            !this.container.pageable) {
            var a = this.config;
            this.wrapper = document.createElement("div");
            this.container.parentNode.insertBefore(this.wrapper, this.container);
            this.wrapper.appendChild(this.container);
            this.wrapper.classList.add("pg-wrapper", "pg-" + a.orientation);
            this.wrapper.classList.add("pg-wrapper");
            this.container.classList.add("pg-container");
            document.body.style.margin = 0;
            document.body.style.overflow = "hidden";
            this.container.style.display = "inline-block";
            ["Prev", "Next"].forEach(function(b) {
                b = "nav" + b + "El";
                a[b] && ("string" === typeof a[b] ? this[b] = document.querySelector(a[b]) : a[b] instanceof Element && (this[b] = a[b]), this[b] && this[b].classList.add("pg-nav"))
            }, this);
            if (a.pips) {
                var c = document.createElement("nav"),
                    b = document.createElement("ul");
                c.classList.add("pg-pips");
                this.pages.forEach(function(a, c) {
                    var d = document.createElement("li"),
                        e = document.createElement("a"),
                        m = document.createElement("span");
                    e.href = "#" + a.id;
                    0 == c && e.classList.add("active");
                    e.appendChild(m);
                    d.appendChild(e);
                    b.appendChild(d)
                });
                c.appendChild(b);
                this.wrapper.appendChild(c);
                this.pips = Array.from(b.children)
            }
            this.pageCount = this.pages.length;
            this.lastIndex = this.pageCount - 1;
            a.infinite && this._toggleInfinite(!1, !0);
            this.bind();
            this.update();
            this._load();
            c = this._getData();
            this.config.onInit.call(this, c);
            this.emit("init", c);
            this.initialised = !0;
            this.container.pageable = this;
            a.slideshow && "function" === typeof h && (this.slider = new h(this), this.slider.start())
        }
    };
    d.prototype.bind = function() {
        this.callbacks = {
            wheel: this._wheel.bind(this),
            update: k(this.update.bind(this),
                this.config.throttle),
            load: this._load.bind(this),
            start: this._start.bind(this),
            drag: this._drag.bind(this),
            stop: this._stop.bind(this),
            click: this._click.bind(this),
            prev: this.prev.bind(this),
            next: this.next.bind(this),
            keydown: this._keydown.bind(this)
        };
        document.addEventListener("keydown", this.callbacks.keydown, !1);
        this.wrapper.addEventListener("wheel", this.callbacks.wheel, !1);
        window.addEventListener("resize", this.callbacks.update, !1);
        this.wrapper.addEventListener(this.touch ? "touchstart" : "mousedown", this.callbacks.start, !1);
        window.addEventListener(this.touch ? "touchmove" : "mousemove", this.callbacks.drag, !1);
        window.addEventListener(this.touch ? "touchend" : "mouseup", this.callbacks.stop, !1);
        this.navPrevEl && (this.navPrevEl.addEventListener("click", this.callbacks.prev, !1), this.navNextEl && this.navNextEl.addEventListener("click", this.callbacks.next, !1));
        document.addEventListener("click", this.callbacks.click, !1)
    };
    d.prototype.unbind = function() {
        this.wrapper.removeEventListener("wheel", this.callbacks.wheel);
        window.removeEventListener("resize",
            this.callbacks.update);
        this.wrapper.removeEventListener(this.touch ? "touchstart" : "mousedown", this.callbacks.start);
        window.addEventListener(this.touch ? "touchmove" : "mousemove", this.callbacks.drag);
        window.removeEventListener(this.touch ? "touchend" : "mouseup", this.callbacks.stop);
        document.removeEventListener("keydown", this.callbacks.keydown);
        this.navPrevEl && this.navPrevEl.removeEventListener("click", this.callbacks.prev, !1);
        this.navNextEl && this.navNextEl.removeEventListener("click", this.callbacks.next, !1);
        document.removeEventListener("click", this.callbacks.click)
    };
    d.prototype.scrollToPage = function(a) {
        this.scrollToIndex(a - 1)
    };
    d.prototype.scrollToAnchor = function(a) {
        this.scrollToIndex(this.anchors.indexOf(a))
    };
    d.prototype.scrollToIndex = function(a) {
        if (!this.scrolling && 0 <= a && a <= this.pages.length - 1) {
            var c = this.index;
            this.index = a;
            this.oldIndex = c;
            this._scrollBy(this._getScrollAmount(c))
        }
    };
    d.prototype.next = function() {
        if (this.config.infinite) {
            var a = this.index;
            if (a === this.lastIndex) return a++, this._scrollBy(-this.data.window[this.size[this.axis]],
                a)
        }
        this.scrollToIndex(this.index + 1)
    };
    d.prototype.prev = function() {
        if (this.config.infinite) {
            var a = this.index;
            if (0 === a) return a--, this._scrollBy(this.data.window[this.size[this.axis]], a)
        }
        this.scrollToIndex(this.index - 1)
    };
    d.prototype.update = function() {
        clearTimeout(this.timer);
        this.data = {
            window: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            container: {
                height: this.wrapper.scrollHeight,
                width: this.wrapper.scrollWidth
            }
        };
        var a = this.size[this.axis],
            c = this.horizontal ? this.size.y : this.size.x;
        this.wrapper.style["overflow-" +
            this.axis] = "scroll";
        this.wrapper.style[a] = this.data.window[a] + "px";
        this.wrapper.style[c] = this.data.window[c] + this.bar + "px";
        var b = this.config.infinite ? this.pages.length + 2 : this.pages.length,
            d = this.config.infinite ? this.data.window[a] : 0;
        this.container.style[a] = b * this.data.window[a] + "px";
        this.wrapper.style["padding-" + (this.horizontal ? "bottom" : "right")] = this.bar + "px";
        this.wrapper[this.scrollAxis[this.axis]] = this.index * this.data.window[a] + d;
        this.scrollSize = b * this.data.window[a] - this.data.window[a];
        this.scrollPosition =
            this.data.window[a] * this.index + d;
        this.pages.forEach(function(b, d) {
            this.horizontal && (b.style["float"] = "left");
            b.style[a] = this.data.window[a] + "px";
            b.style[c] = this.data.window[c] + "px"
        }, this);
        this.config.infinite && this.clones.forEach(function(b) {
            this.horizontal && (b.style["float"] = "left");
            b.style[a] = this.data.window[a] + "px";
            b.style[c] = this.data.window[c] + "px"
        }, this);
        this.config.onUpdate.call(this, this._getData());
        this.emit("update", this._getData())
    };
    d.prototype.orientate = function(a) {
        switch (a) {
            case "vertical":
                this.horizontal = !1;
                this.axis = "y";
                this.container.style.width = "";
                break;
            case "horizontal":
                this.horizontal = !0;
                this.axis = "x";
                this.container.style.height = "";
                break;
            default:
                return !1
        }
        this.wrapper.classList.toggle("pg-vertical", !this.horizontal);
        this.wrapper.classList.toggle("pg-horizontal", this.horizontal);
        this.config.orientation = a;
        this.update()
    };
    d.prototype.slideshow = function() {
        return this.slider
    };
    d.prototype.destroy = function() {
        if (this.initialised) {
            this.emit("destroy");
            this.unbind();
            document.body.style.margin = "";
            document.body.style.overflow =
                "";
            this.container.style.display = "";
            this.container.style.height = "";
            this.container.style.width = "";
            this.container.classList.remove("pg-container");
            this.wrapper.parentNode.replaceChild(this.container, this.wrapper);
            for (var a = 0; a < this.pages.length; a++) {
                var c = this.pages[a];
                c.style.height = "";
                c.style.width = "";
                c.style["float"] = "";
                c.classList.remove("pg-page");
                c.classList.remove("pg-active")
            }["Prev", "Next"].forEach(function(a) {
                    a = "nav" + a + "El";
                    this[a] && (this[a].classList.remove("active"), this[a].classList.remove("pg-nav"))
                },
                this);
            this.config.infinite && this._toggleInfinite(!0);
            this.config.slideshow && (this.slider.stop(), this.slider = !1);
            this.initialised = !1;
            delete this.container.pageable
        }
    };
    d.prototype.on = function(a, c) {
        this.listeners = this.listeners || {};
        this.listeners[a] = this.listeners[a] || [];
        this.listeners[a].push(c)
    };
    d.prototype.off = function(a, c) {
        this.listeners = this.listeners || {};
        !1 !== a in this.listeners && this.listeners[a].splice(this.listeners[a].indexOf(c), 1)
    };
    d.prototype.emit = function(a) {
        this.listeners = this.listeners || {};
        if (!1 !== a in this.listeners)
            for (var c = 0; c < this.listeners[a].length; c++) this.listeners[a][c].apply(this, [].slice.call(arguments, 1))
    };
    d.prototype._click = function(a) {
        if (a.target.closest) {
            var c = a.target.closest("a");
            c && this.anchors.includes(c.hash) && (a.preventDefault(), this.scrollToAnchor(c.hash))
        }
    };
    d.prototype._preventDefault = function(a) {
        a.preventDefault();
        a.stopPropagation()
    };
    d.prototype._keydown = function(a) {
        if (this.config.events.keydown) {
            if (this.scrolling || this.dragging) return a.preventDefault(), !1;
            var c = !1;
            void 0 !== a.key ? c = a.key : void 0 !== a.keyCode && (c = a.keyCode);
            var b = "Arrow" + ("x" === this.axis ? "Left" : "Up"),
                d = "Arrow" + ("x" === this.axis ? "Right" : "Down");
            if (c) switch (c) {
                case 33:
                case 37:
                case b:
                case "PageUp":
                    a.preventDefault();
                    this.prev();
                    break;
                case 34:
                case 39:
                case d:
                case "PageDown":
                    a.preventDefault(), this.next()
            }
        }
    };
    d.prototype._start = function(a) {
        var c = this._getEvent(a);
        if (this.scrolling || this.dragging) return !1;
        if ("touchstart" === a.type && !this.events.touch) return c.target.closest("a") || this._preventDefault(a), !1;
        if ("mousedown" === a.type && (!this.events.mouse || 0 !== a.button) || !c.target.closest(this.config.childSelector)) return !1;
        this._preventDefault(a);
        this.dragging = this.config.freeScroll;
        this.config.slideshow && this.slider.stop();
        this.down = {
            x: c.clientX,
            y: c.clientY
        };
        this.startIndex = this.index;
        this.config.onBeforeStart.call(this, this.index)
    };
    d.prototype._drag = function(a) {
        if (this.config.freeScroll && this.dragging && !this.scrolling) {
            a = this._getEvent(a);
            a = this._limitDrag(a);
            var c = this._getData();
            this.container.style.transform =
                this.horizontal ? "translate3d(" + a + "px, 0, 0)" : "translate3d(0, " + a + "px, 0)";
            c.scrolled -= a;
            this.config.onScroll.call(this, c, "drag");
            this.emit("scroll", c)
        }
    };
    d.prototype._stop = function(a) {
        var c = this,
            b = this._getEvent(a);
        a = function() {
            c.index < c.pages.length - 1 && c.index++
        };
        this.oldIndex = this.index;
        var d = Math.abs(b[this.mouseAxis[this.axis]] - this.down[this.axis]) >= this.config.swipeThreshold;
        d = this.down && d;
        this.config.slideshow && this.slider.start();
        if (this.dragging && !this.scrolling) this.dragging = b = this._limitDrag(b),
            d && (this.config.infinite && this._overScroll(0 > b, b), 0 < b ? 0 < c.index && c.index-- : a()), this._scrollBy(this._getScrollAmount(this.oldIndex) - b), this.down = !1;
        else if (this.down && !this.scrolling) {
            var f = b[this.mouseAxis[this.axis]] < this.down[this.axis];
            b = b[this.mouseAxis[this.axis]] > this.down[this.axis];
            d && (this.config.infinite && this._overScroll(f), f ? a() : b && 0 < c.index && c.index--);
            this.startIndex === this.index ? this.config.onFinish.call(this, this._getData()) : this._scrollBy(this._getScrollAmount(this.oldIndex));
            this.down = !1
        }
    };
    d.prototype._wheel = function(a) {
        a.preventDefault();
        if (this.events.wheel && !this.scrolling) {
            var c = this.index,
                b = this.index;
            a = 0 < a.deltaY;
            this.config.infinite && this._overScroll(a);
            a ? this.index < this.pages.length - 1 && c++ : 0 < this.index && c--;
            c !== b && (this.oldIndex = b, this.scrollToIndex(c))
        }
    };
    d.prototype._load = function(a) {
        if (a = location.hash)
            if (a = this.anchors.indexOf(a), -1 < a) {
                this.scrollPosition = this.data.window[this.size[this.axis]] * (a + (this.config.infinite ? 1 : 0));
                var c = this._getData();
                this.slideIndex = this.index =
                    a;
                this.pages.forEach(function(a, c) {
                    a.classList.toggle("pg-active", c === this.index)
                }, this);
                this._setNavs();
                this._setPips();
                this.config.onScroll.call(this, c);
                this.config.onFinish.call(this, c);
                this.emit("scroll", c)
            }
        this.update()
    };
    d.prototype._getEvent = function(a) {
        return this.touch ? "touchend" === a.type ? a.changedTouches[0] : a.touches[0] : a
    };
    d.prototype._getData = function() {
        return {
            index: this.index,
            scrolled: this.config.infinite ? this.scrollPosition - this.data.window[this.size[this.axis]] : this.scrollPosition,
            max: this.config.infinite ?
                this.scrollSize - 2 * this.data.window[this.size[this.axis]] : this.scrollSize
        }
    };
    d.prototype._overScroll = function(a) {
        var c = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : 0,
            b = this.index;
        b === this.lastIndex && a ? (b++, this._scrollBy(-this.data.window[this.size[this.axis]] - c, b)) : 0 !== b || a || (b--, this._scrollBy(this.data.window[this.size[this.axis]] - c, b))
    };
    d.prototype._scrollBy = function(a, c) {
        if (this.scrolling) return !1;
        this.scrolling = !0;
        this.config.onBeforeStart.call(this, this.oldIndex);
        this.emit("scroll.before",
            this._getData());
        this.config.slideshow && this.slider.stop();
        var b = this;
        b.timer = setTimeout(function() {
            var d = Date.now(),
                f = b._getScrollOffset();
            b.config.onStart.call(b, b.pages[b.index].id);
            b.emit("scroll.start", b._getData());
            b.frame = requestAnimationFrame(function l() {
                var e = Date.now() - d;
                if (e > b.config.animation) return cancelAnimationFrame(b.frame), b.container.style.transform = "", b.frame = !1, b.scrolling = !1, b.dragging = !1, b.config.slideshow && b.slider.start(), b.config.infinite && (c === b.pageCount ? b.index = 0 : -1 ===
                    c && (b.index = b.lastIndex)), e = b._getData(), window.location.hash = b.pages[b.index].id, b.pages.forEach(function(a, c) {
                    a.classList.toggle("pg-active", c === b.index)
                }, b), b.slideIndex = b.index, b._setPips(), b._setNavs(), b.config.onFinish.call(b, e), b.emit("scroll.end", e), !1;
                e = b.config.easing(e, b.dragging ? b.dragging : 0, a, b.config.animation);
                b.container.style.transform = b.horizontal ? "translate3d(" + e + "px, 0, 0)" : "translate3d(0, " + e + "px, 0)";
                b.scrollPosition = f[b.axis] - e;
                e = b._getData();
                b.config.infinite && (c === b.pageCount ?
                    e.scrolled = 0 : -1 === c && (e.scrolled = e.max));
                b.config.onScroll.call(b, e);
                b.emit("scroll", e);
                b.frame = requestAnimationFrame(l)
            })
        }, b.dragging ? 0 : b.config.delay)
    };
    d.prototype._getScrollOffset = function() {
        return {
            x: this.wrapper.scrollLeft,
            y: this.wrapper.scrollTop
        }
    };
    d.prototype._getScrollAmount = function(a, c) {
        void 0 === c && (c = this.index);
        var b = this.data.window[this.size[this.axis]];
        return b * a - b * c
    };
    d.prototype._getScrollBarWidth = function() {
        var a = document.body,
            c = document.createElement("div"),
            b = 0;
        return c.style.cssText =
            "width: 100; height: 100; overflow: scroll; position: absolute; top: -9999;", a.appendChild(c), b = c.offsetWidth - c.clientWidth, a.removeChild(c), b
    };
    d.prototype._toggleInfinite = function(a, c) {
        if (a && this.config.infinite) this.clones.forEach(function(a) {
            this.container.removeChild(a)
        }, this), this.config.infinite = !1;
        else if (!this.config.infinite || c) {
            this.config.infinite = !0;
            var b = this.pages[0].cloneNode(!0),
                d = this.pages[this.lastIndex].cloneNode(!0);
            b.id += "-clone";
            d.id += "-clone";
            b.classList.add("pg-clone");
            d.classList.add("pg-clone");
            b.classList.remove("pg-active");
            d.classList.remove("pg-active");
            this.clones = [b, d];
            this.container.insertBefore(d, this.pages[0]);
            this.container.appendChild(b)
        }
        this.update()
    };
    d.prototype._limitDrag = function(a) {
        a = a[this.mouseAxis[this.axis]] - this.down[this.axis];
        !this.config.infinite && (0 === this.index && 0 < a || this.index === this.pages.length - 1 && 0 > a) && (a /= 10);
        return a
    };
    d.prototype._setNavs = function() {
        this.navPrevEl && this.navPrevEl.classList.toggle("active", this.config.infinite || 0 < this.index);
        this.navNextEl &&
            this.navNextEl.classList.toggle("active", this.config.infinite || this.index < this.pages.length - 1)
    };
    d.prototype._setPips = function(a) {
        this.config.pips && (void 0 === a && (a = this.index), this.pips.forEach(function(c, b) {
            c.firstElementChild.classList.toggle("active", b == a)
        }))
    };
    return d
});