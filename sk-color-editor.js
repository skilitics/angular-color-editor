var sk;
(function (sk) {
    var Color;
    (function (Color) {
        Color.PATTERN = /^#[0-9a-fA-F]{6}$/;
        function parse(value) {
            if (!Color.PATTERN.test(value)) {
                return NaN;
            }
            return parseInt(value.substr(1), 16);
        }
        Color.parse = parse;
        function stringify(color) {
            var r = color.toString(16);
            return "#00000".substr(0, 7 - r.length) + r;
        }
        Color.stringify = stringify;
        function fromRgb(r, g, b) {
            return Math.round(clampValue(r) * 0xFF) << 16 | Math.round(clampValue(g) * 0xFF) << 8 | Math.round(clampValue(b) * 0xFF);
        }
        Color.fromRgb = fromRgb;
        function red(color) {
            return (color >> 16 & 0xFF) / 0xFF;
        }
        Color.red = red;
        function green(color) {
            return (color >> 8 & 0xFF) / 0xFF;
        }
        Color.green = green;
        function blue(color) {
            return (color >> 0 & 0xFF) / 0xFF;
        }
        Color.blue = blue;
        var HSL = (function () {
            function HSL(hue, saturation, lightness) {
                this.hue = hue;
                this.saturation = saturation;
                this.lightness = lightness;
            }
            HSL.prototype.toColor = function () {
                return fromHsl(this.hue, this.saturation, this.lightness);
            };
            HSL.prototype.toString = function () {
                return "hsl(" + this.hue.toFixed(0) + ", " + this.saturation.toFixed(3) + ", " + this.lightness.toFixed(3) + ")";
            };
            return HSL;
        })();
        Color.HSL = HSL;
        function toHSL(color) {
            var r = red(color), g = green(color), b = blue(color);
            var max = Math.max(r, g, b), min = Math.min(r, g, b);
            var chroma = max - min;
            var h = 0, s = 0, l = (min + max) / 2;
            if (chroma) {
                h = hueImpl(r, g, b, max, chroma);
                s = chroma / (1 - Math.abs(min + max - 1));
            }
            return new HSL(h, s, l);
        }
        Color.toHSL = toHSL;
        function hue(color) {
            var r = red(color), g = green(color), b = blue(color);
            var max = Math.max(r, g, b), chroma = max - Math.min(r, g, b);
            if (!chroma)
                return 0;
            return hueImpl(r, g, b, max, chroma);
        }
        Color.hue = hue;
        function hueImpl(r, g, b, max, chroma) {
            var h;
            if (max == r) {
                h = (g - b) / chroma;
                if (h < 0)
                    h += 6;
            }
            else if (max == g) {
                h = (b - r) / chroma + 2;
            }
            else {
                h = (r - g) / chroma + 4;
            }
            return h * 60;
        }
        function saturation(color) {
            var r = red(color), g = green(color), b = blue(color);
            var max = Math.max(r, g, b), min = Math.min(r, g, b);
            return max == min ? 0 : (max - min) / (1 + Math.abs(min + max - 1));
        }
        Color.saturation = saturation;
        function lightness(color) {
            var r = red(color), g = green(color), b = blue(color);
            var max = Math.max(r, g, b), min = Math.min(r, g, b);
            return (min + max) / 2;
        }
        Color.lightness = lightness;
        function clampValue(value) {
            if (!(value > 0))
                return 0;
            if (!(value < 1))
                return 1;
            return value;
        }
        Color.clampValue = clampValue;
        function normalizeHue(hue) {
            if (!isFinite(hue))
                return 0;
            return hue >= 0 ? hue % 360 : hue - Math.floor(hue / 360) * 360;
        }
        Color.normalizeHue = normalizeHue;
        function fromHsl(hue, saturation, lightness) {
            hue = normalizeHue(hue);
            saturation = clampValue(saturation);
            lightness = clampValue(lightness);
            var h = hue / 60;
            var c = (1 - Math.abs(2 * lightness - 1)) * saturation;
            var x = c * (1 - Math.abs(h % 2 - 1));
            var r = 0, g = 0, b = 0;
            switch (h | 0) {
                case 0:
                    r = c;
                    g = x;
                    break;
                case 1:
                    g = c;
                    r = x;
                    break;
                case 2:
                    g = c;
                    b = x;
                    break;
                case 3:
                    b = c;
                    g = x;
                    break;
                case 4:
                    b = c;
                    r = x;
                    break;
                case 5:
                    r = c;
                    b = x;
                    break;
            }
            var m = lightness - c / 2;
            if (m < 0)
                m = 0;
            return fromRgb(r + m, g + m, b + m);
        }
        Color.fromHsl = fromHsl;
    })(Color = sk.Color || (sk.Color = {}));
})(sk || (sk = {}));
var sk;
(function (sk) {
    (function (ColorWheelHit) {
        ColorWheelHit[ColorWheelHit["None"] = 0] = "None";
        ColorWheelHit[ColorWheelHit["Hue"] = 1] = "Hue";
        ColorWheelHit[ColorWheelHit["Tone"] = 2] = "Tone";
    })(sk.ColorWheelHit || (sk.ColorWheelHit = {}));
    var ColorWheelHit = sk.ColorWheelHit;
    var ColorWheelUI = (function () {
        function ColorWheelUI(ctx, x, y, radius, innerRadius) {
            this.ctx = ctx;
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.innerRadius = innerRadius;
            this.SEGMENTS = 12;
            this.ZERO_ANGLE = -Math.PI / 2;
            this.TONE_MAX_X = Math.sqrt(0.75);
            this.TONE_MAX_Y = 0.5;
            this.hueGradients = this.createHueGradients();
        }
        ColorWheelUI.prototype.draw = function (hsl) {
            var h = sk.Color.normalizeHue(hsl.hue);
            var s = sk.Color.clampValue(hsl.saturation);
            var l = sk.Color.clampValue(hsl.lightness);
            var hueAngle = h * Math.PI / 180 + this.ZERO_ANGLE;
            this.drawHueWheel();
            this.drawToneTriangle(h, hueAngle);
            this.drawHueSelection(hueAngle);
            this.drawToneSelection(h, s, l);
        };
        ColorWheelUI.prototype.hitTest = function (hsl, x, y) {
            var dx = x - this.x, dy = y - this.y;
            var r2 = dx * dx + dy * dy;
            var radius = this.innerRadius;
            var i2 = radius * radius;
            var o2 = this.radius * this.radius;
            if (i2 <= r2 && r2 <= o2) {
                return 1 /* Hue */;
            }
            var r = hsl.hue * Math.PI / 180;
            var cr = Math.cos(r), sr = Math.sin(r);
            var nx = (dx * cr + dy * sr) / radius;
            var ny = (-dx * sr + dy * cr) / radius;
            var mx = this.TONE_MAX_X;
            var my = this.TONE_MAX_Y;
            var t = -nx / mx;
            var c = (my - ny) / (1 + my);
            var s = c / (1 - Math.abs(t));
            if (0 <= s && s <= 1) {
                return 2 /* Tone */;
            }
            return 0 /* None */;
        };
        ColorWheelUI.prototype.down = function (hit, hsl, x, y) {
            var dx = x - this.x, dy = y - this.y;
            switch (hit) {
                case 1 /* Hue */:
                    hsl.hue = (Math.atan2(dy, dx) - this.ZERO_ANGLE) * 180 / Math.PI;
                    break;
                case 2 /* Tone */:
                    var radius = this.innerRadius;
                    var r = hsl.hue * Math.PI / 180;
                    var cr = Math.cos(r), sr = Math.sin(r);
                    var nx = (dx * cr + dy * sr) / radius;
                    var ny = (-dx * sr + dy * cr) / radius;
                    var mx = this.TONE_MAX_X;
                    var my = this.TONE_MAX_Y;
                    if (ny > my) {
                        ny = my;
                        if (nx < -mx)
                            nx = -mx;
                        else if (nx > mx)
                            nx = mx;
                    }
                    else {
                        var u = (Math.abs(nx) * mx + (ny + 1) * (my + 1)) / 3;
                        u = sk.Color.clampValue(u);
                        if (ny < u * (my + 1) - 1) {
                            nx = u * (nx < 0 ? -mx : mx);
                            ny = u * (my + 1) - 1;
                        }
                    }
                    var t = -nx / mx;
                    var c = (my - ny) / (1 + my);
                    var s = c / (1 - Math.abs(t));
                    var l = (t + 1) / 2;
                    hsl.saturation = sk.Color.clampValue(s);
                    hsl.lightness = sk.Color.clampValue(l);
                    break;
            }
        };
        ColorWheelUI.prototype.drawHueWheel = function () {
            var segments = this.SEGMENTS;
            var ctx = this.ctx;
            var x = this.x;
            var y = this.y;
            var radius = this.radius;
            var innerRadius = this.innerRadius;
            var zeroAngle = this.ZERO_ANGLE;
            var overdrawAngle = Math.atan2(1, innerRadius);
            for (var i = 0; i != segments; i++) {
                var startAngle = zeroAngle + i / segments * Math.PI * 2 - overdrawAngle;
                var endAngle = zeroAngle + (i + 1) / segments * Math.PI * 2;
                ctx.fillStyle = this.hueGradients[i];
                ctx.beginPath();
                ctx.arc(x, y, radius, startAngle, endAngle, false);
                ctx.arc(x, y, innerRadius, endAngle, startAngle, true);
                ctx.closePath();
                ctx.fill();
            }
        };
        ColorWheelUI.prototype.createHueGradients = function () {
            var ctx = this.ctx;
            var segments = this.SEGMENTS;
            var zeroAngle = this.ZERO_ANGLE;
            var innerRadius = this.innerRadius;
            var overdrawAngle = Math.atan2(1, innerRadius);
            var result = [];
            for (var i = 0; i != segments; i++) {
                var startHue = i / segments * 360;
                var endHue = (i + 1) / segments * 360;
                var startAngle = zeroAngle + i / segments * Math.PI * 2 - overdrawAngle;
                var endAngle = zeroAngle + (i + 1) / segments * Math.PI * 2;
                var gradient = ctx.createLinearGradient(this.polarX(startAngle, innerRadius), this.polarY(startAngle, innerRadius), this.polarX(endAngle, innerRadius), this.polarY(endAngle, innerRadius));
                gradient.addColorStop(0, 'hsl(' + startHue + ', 100%, 50%)');
                gradient.addColorStop(1, 'hsl(' + endHue + ', 100%, 50%)');
                result.push(gradient);
            }
            return result;
        };
        ColorWheelUI.prototype.drawToneTriangle = function (hue, hueAngle) {
            var ctx = this.ctx;
            var radius = this.innerRadius;
            var blackAngle = hueAngle + Math.PI * 2 / 3;
            var whiteAngle = hueAngle - Math.PI * 2 / 3;
            var hueX = this.polarX(hueAngle, radius);
            var hueY = this.polarY(hueAngle, radius);
            var blackX = this.polarX(blackAngle, radius);
            var blackY = this.polarY(blackAngle, radius);
            var whiteX = this.polarX(whiteAngle, radius);
            var whiteY = this.polarY(whiteAngle, radius);
            var grayX = (whiteX + blackX) / 2;
            var grayY = (whiteY + blackY) / 2;
            ctx.beginPath();
            ctx.moveTo(hueX, hueY);
            ctx.lineTo(blackX, blackY);
            ctx.lineTo(whiteX, whiteY);
            ctx.closePath();
            var fillStyle = ctx.createLinearGradient(blackX, blackY, whiteX, whiteY);
            fillStyle.addColorStop(0, '#000000');
            fillStyle.addColorStop(1, '#ffffff');
            ctx.fillStyle = fillStyle;
            ctx.fill();
            fillStyle = ctx.createLinearGradient(grayX, grayY, hueX, hueY);
            fillStyle.addColorStop(0, 'hsla(' + hue + ', 100%, 50%, 0)');
            fillStyle.addColorStop(1, 'hsla(' + hue + ', 100%, 50%, 1)');
            ctx.fillStyle = fillStyle;
            ctx.fill();
        };
        ColorWheelUI.prototype.drawHueSelection = function (hueAngle) {
            var ctx = this.ctx;
            var innerRadius = this.innerRadius;
            var radius = this.radius;
            ctx.beginPath();
            ctx.moveTo(this.polarX(hueAngle, innerRadius), this.polarY(hueAngle, innerRadius));
            ctx.lineTo(this.polarX(hueAngle, radius), this.polarY(hueAngle, radius));
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#000000';
            ctx.stroke();
        };
        ColorWheelUI.prototype.drawToneSelection = function (h, s, l) {
            var mx = this.TONE_MAX_X;
            var my = this.TONE_MAX_Y;
            var t = 2 * l - 1;
            var c = (1 - Math.abs(t)) * s;
            var dx = -mx * t;
            var dy = my - c * (1 + my);
            var r = -h * Math.PI / 180;
            var cr = Math.cos(r);
            var sr = Math.sin(r);
            var rx = dx * cr + dy * sr;
            var ry = -dx * sr + dy * cr;
            var radius = this.innerRadius;
            var x = this.x + rx * radius;
            var y = this.y + ry * radius;
            var ctx = this.ctx;
            ctx.lineWidth = 2;
            ctx.strokeStyle = t < 0 ? '#ffffff' : '#000000';
            ctx.beginPath();
            ctx.arc(x, y, 3.5, 0, Math.PI * 2);
            ctx.stroke();
        };
        ColorWheelUI.prototype.polarX = function (angle, radius) {
            return this.x + Math.cos(angle) * radius;
        };
        ColorWheelUI.prototype.polarY = function (angle, radius) {
            return this.y + Math.sin(angle) * radius;
        };
        return ColorWheelUI;
    })();
    sk.ColorWheelUI = ColorWheelUI;
})(sk || (sk = {}));
var sk;
(function (sk) {
    function captureOnDown(element, callback) {
        element.addEventListener('mousedown', function (event) {
            event.preventDefault();
            var mouseMove = callback(event);
            if (mouseMove) {
                mouseMove(event);
                document.addEventListener('mousemove', mouseMove);
                document.addEventListener('mouseup', function mouseUp(event) {
                    document.removeEventListener('mousemove', mouseMove);
                    document.removeEventListener('mouseup', mouseUp);
                });
            }
        });
    }
    angular.module('skColorEditor', []).directive('skColorEditor', function () {
        return {
            restrict: 'E',
            scope: { value: '=?', hue: '=?', saturation: '=?', lightness: '=?', size: '=', innerSize: '=?' },
            template: '<canvas width={{size}} height={{size}}>Requires canvas support</canvas>',
            link: function (scope, element) {
                var canvas = element.find('canvas')[0];
                var ctx = canvas.getContext('2d');
                var ui, hsl;
                scope.size = 200;
                captureOnDown(canvas, function (event) {
                    if (!ui || event.button != 0)
                        return null;
                    var rect = canvas.getBoundingClientRect();
                    var hit = ui.hitTest(hsl, event.clientX - rect.left, event.clientY - rect.top);
                    if (!hit)
                        return null;
                    return function (event) {
                        scope.$apply(function (scope) {
                            var rect = canvas.getBoundingClientRect();
                            ui.down(hit, hsl, event.clientX - rect.left, event.clientY - rect.top);
                            scope.hue = hsl.hue;
                            scope.saturation = hsl.saturation;
                            scope.lightness = hsl.lightness;
                        });
                    };
                });
                scope.$watch('value', function (value) {
                    var color = NaN;
                    if (typeof value == 'number')
                        color = value & 0xFFFFFF;
                    else if (typeof value == 'string')
                        color = sk.Color.parse(value);
                    else if (typeof value == 'object' && "hue" in value && "saturation" in value && "lightness" in value) {
                        hsl = value;
                        draw();
                    }
                    if (!isNaN(color) && !(hsl && hsl.toColor() == color)) {
                        hsl = sk.Color.toHSL(color);
                        draw();
                    }
                });
                scope.$watchGroup('hue saturation lightness'.split(' '), function (values) {
                    var hue = sk.Color.normalizeHue(values[0]);
                    var saturation = sk.Color.clampValue(values[1]);
                    var lightness = sk.Color.clampValue(values[2]);
                    hsl = new sk.Color.HSL(hue, saturation, lightness);
                    scope.value = sk.Color.stringify(hsl.toColor());
                    draw();
                });
                scope.$watchGroup('size innerSize'.split(' '), function (values) {
                    var size = values[0];
                    if (typeof size == 'string') {
                        size = parseFloat(size);
                    }
                    if (!isFinite(size)) {
                        size = 200;
                    }
                    var innerSize = values[1];
                    if (typeof innerSize == 'string') {
                        if (/%$/.test(innerSize)) {
                            innerSize = size * parseFloat(innerSize.substring(0, innerSize.length - 1));
                        }
                        else {
                            innerSize = parseFloat(innerSize);
                        }
                    }
                    if (!isFinite(innerSize)) {
                        innerSize = size * 0.80;
                    }
                    var radius = size / 2 | 0;
                    var innerRadius = innerSize / 2 | 0;
                    ui = new sk.ColorWheelUI(ctx, radius, radius, radius, innerRadius);
                    draw();
                });
                var drawing = false;
                function draw() {
                    drawing || (requestAnimationFrame || setTimeout)(function () {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        if (ui && hsl)
                            ui.draw(hsl);
                        drawing = false;
                    });
                    drawing = true;
                }
            }
        };
    });
})(sk || (sk = {}));
//# sourceMappingURL=sk-color-editor.js.map