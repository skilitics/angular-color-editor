module Color {
  export var PATTERN:RegExp = /^#[0-9a-fA-F]{6}$/;

  export function parse(value:string):number {
    if (!PATTERN.test(value)) { // #RRGGBB only for now.
      return NaN;
    }
    return parseInt(value.substr(1), 16);
  }

  export function stringify(color:number):string {
    var r = color.toString(16);
    return "#00000".substr(0, 7 - r.length) + r;
  }

  export function fromRgb(r:number, g:number, b:number):number {
    return Math.round(clampValue(r) * 0xFF) << 16 |
      Math.round(clampValue(g) * 0xFF) << 8 |
      Math.round(clampValue(b) * 0xFF);
  }

  export function red(color:number):number {
    return (color >> 16 & 0xFF) / 0xFF;
  }

  export function green(color:number):number {
    return (color >> 8 & 0xFF) / 0xFF;
  }

  export function blue(color:number):number {
    return (color >> 0 & 0xFF) / 0xFF;
  }

  export class HSL {
    constructor(
      public hue:number,
      public saturation:number,
      public lightness:number) {}

    toColor() {
      return fromHsl(this.hue, this.saturation, this.lightness);
    }

    toString() {
      return "hsl("+
        this.hue.toFixed(0)+", "+
        this.saturation.toFixed(3)+", "+
        this.lightness.toFixed(3)+")";
    }
  }

  export function toHSL(color:number):HSL {
    // A lot of commonality in setting up hsl.
    var r = red(color), g = green(color), b = blue(color);
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var chroma = max - min;

    var h = 0, s = 0, l = (min + max) / 2;
    if (chroma) { // both of these are undefined for grey, use 0 for convenience.
      h = hueImpl(r, g, b, max, chroma);
      s = chroma / (1 - Math.abs(min + max - 1));
    }
    return new HSL(h, s, l);
  }

  // Returns a [0-360) hue from the color.
  export function hue(color:number):number {
    var r = red(color), g = green(color), b = blue(color);
    var max = Math.max(r, g, b), chroma = max - Math.min(r, g, b);
    if (!chroma) return 0; // Actually NaN, since it's a grey, but this is more useful
    return hueImpl(r, g, b, max, chroma);
  }

  // Helper for implementing toHSL() and hue(). Assumes non-zero chroma.
  function hueImpl(r:number, g:number, b:number, max:number, chroma:number):number {
    var h:number;
    if (max == r) {
      h = (g - b) / chroma;
      if (h < 0) h += 6;
    } else if (max == g) {
      h = (b - r) / chroma + 2;
    } else {
      h = (r - g) / chroma + 4;
    }
    return h * 60;
  }

  export function saturation(color:number):number {
    var r = red(color), g = green(color), b = blue(color);
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    return max == min ? 0 : (max - min) / (1 + Math.abs(min + max - 1));
  }

  export function lightness(color:number):number {
    var r = red(color), g = green(color), b = blue(color);
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    return (min + max) / 2;
  }

  export function clampValue(value:number):number {
    // Slightly weird negating here catches NaNs.
    if (!(value > 0)) return 0;
    if (!(value < 1)) return 1;
    return value;
  }

  // Normalize hue to [0, 360)
  export function normalizeHue(hue:number):number {
    // We could normally just "return hue % 360", except that
    // 'x % y' is defined as 'x - Math.trunc(x / y) * y',
    // that is, the remainder of x/y when rounded towards 0.
    // This means it is negative when x (xor y) is negative.
    // We want actual modular, that is 'x - Math.floor(x / y) * y'
    // which is always non-negative.
    return hue >= 0 ? hue % 360 : hue - Math.floor(hue / 360) * 360;
  }

  export function fromHsl(hue:number, saturation:number, lightness:number):number {
    hue = normalizeHue(hue);
    saturation = clampValue(saturation);
    lightness = clampValue(lightness);

    // http://en.wikipedia.org/wiki/HSL_and_HSV#From_HSL
    var h = hue / 60;
    var c = (1 - Math.abs(2 * lightness - 1)) * saturation;
    var x = c * (1 - Math.abs(h % 2 - 1));
    var r = 0, g = 0, b = 0;
    switch (h | 0) { // "x | 0" is truncate to integer: 3.75 -> 3
      case 0: r = c; g = x; break;
      case 1: g = c; r = x; break;
      case 2: g = c; b = x; break;
      case 3: b = c; g = x; break;
      case 4: b = c; r = x; break;
      case 5: r = c; b = x; break;
    }
    var m = lightness - c / 2;
    if (m < 0) m = 0; // If it rounds badly, this can happen.
    return fromRgb(r + m, g + m, b + m);
  }
}

