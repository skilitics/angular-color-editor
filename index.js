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
})(Color || (Color = {}));
angular.module('skColorEditor', []).directive('skColorEditor', function () {
    return {
        restrict: 'E',
        scope: { value: '=' },
        templateUrl: 'sk-color-editor.html',
        link: function (scope) {
            var hsl = new Color.HSL(0, 0, 0);
            scope.value = '#000000';
            scope.hue = 0;
            scope.saturation = 0;
            scope.lightness = 0;
            scope.$watch(function () {
                return hsl.toColor();
            }, function (value) {
                scope.value = Color.stringify(value);
                scope.hue = hsl.hue;
                scope.saturation = hsl.saturation;
                scope.lightness = hsl.lightness;
            });
            scope.$watch('value', function (value) {
                var color = Color.parse(value);
                if (!isNaN(color)) {
                    hsl = Color.toHSL(color);
                }
            });
            scope.$watchGroup('hue saturation lightness'.split(' '), function () {
                hsl = new Color.HSL(scope.hue, scope.saturation, scope.lightness);
            });
        }
    };
});
//# sourceMappingURL=index.js.map