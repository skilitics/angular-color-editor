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
    var ColorWheelUI = (function () {
        function ColorWheelUI(ctx, x, y, radius, innerRadius) {
            this.ctx = ctx;
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.innerRadius = innerRadius;
            this.SEGMENTS = 12;
            this.ZERO_ANGLE = -Math.PI / 2;
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
                var startHue = i / segments * 360;
                var endHue = (i + 1) / segments * 360;
                var startAngle = zeroAngle + i / segments * Math.PI * 2 - overdrawAngle;
                var endAngle = zeroAngle + (i + 1) / segments * Math.PI * 2;
                var fillStyle = ctx.createLinearGradient(this.polarX(startAngle, innerRadius), this.polarY(startAngle, innerRadius), this.polarX(endAngle, innerRadius), this.polarY(endAngle, innerRadius));
                fillStyle.addColorStop(0, 'hsl(' + startHue + ', 100%, 50%)');
                fillStyle.addColorStop(1, 'hsl(' + endHue + ', 100%, 50%)');
                ctx.fillStyle = fillStyle;
                ctx.beginPath();
                ctx.arc(x, y, radius, startAngle, endAngle, false);
                ctx.arc(x, y, innerRadius, endAngle, startAngle, true);
                ctx.closePath();
                ctx.fill();
            }
            ctx.fillStyle = null;
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
            ctx.fillStyle = null;
        };
        ColorWheelUI.prototype.drawHueSelection = function (hueAngle) {
            var ctx = this.ctx;
            var innerRadius = this.innerRadius;
            var radius = this.radius;
            ctx.beginPath();
            ctx.moveTo(this.polarX(hueAngle, innerRadius), this.polarY(hueAngle, innerRadius));
            ctx.lineTo(this.polarX(hueAngle, radius), this.polarY(hueAngle, radius));
            ctx.strokeStyle = '#000000';
            ctx.stroke();
        };
        ColorWheelUI.prototype.drawToneSelection = function (h, s, l) {
            var mx = Math.sqrt(0.75);
            var my = 0.5;
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
            ctx.strokeStyle = t < 0 ? '#ffffff' : '#000000';
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
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
    angular.module('skColorEditor', []).directive('skColorEditor', function () {
        return {
            restrict: 'E',
            scope: { value: '=', size: '=' },
            template: '<canvas width={{size}} height={{size}}>Requires canvas support</canvas>',
            link: function (scope, element) {
                var canvas = element.find('canvas')[0];
                var ctx = canvas.getContext('2d');
                var ui;
                scope.$watch("value", draw, true);
                scope.$watch('size', function (value) {
                    var radius = parseInt(value) / 2 | 0;
                    ui = new sk.ColorWheelUI(ctx, radius, radius, radius, radius - 30);
                    if (scope.value) {
                        draw(scope.value);
                    }
                });
                function draw(value) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    if (ui && value)
                        ui.draw(value);
                }
            }
        };
    });
})(sk || (sk = {}));
//# sourceMappingURL=index.js.map