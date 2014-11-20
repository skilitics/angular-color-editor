/// <reference path="typings/tsd.d.ts" />
declare module sk.Color {
    var PATTERN: RegExp;
    function parse(value: string): number;
    function stringify(color: number): string;
    function fromRgb(r: number, g: number, b: number): number;
    function red(color: number): number;
    function green(color: number): number;
    function blue(color: number): number;
    interface IHSL {
        hue: number;
        saturation: number;
        lightness: number;
    }
    class HSL implements IHSL {
        hue: number;
        saturation: number;
        lightness: number;
        constructor(hue: number, saturation: number, lightness: number);
        toColor(): number;
        toString(): string;
    }
    function toHSL(color: number): HSL;
    function hue(color: number): number;
    function saturation(color: number): number;
    function lightness(color: number): number;
    function clampValue(value: number): number;
    function normalizeHue(hue: number): number;
    function fromHsl(hue: number, saturation: number, lightness: number): number;
}
declare module sk {
    enum ColorWheelHit {
        None = 0,
        Hue = 1,
        Tone = 2,
    }
    class ColorWheelUI {
        private ctx;
        x: number;
        y: number;
        radius: number;
        innerRadius: number;
        SEGMENTS: number;
        ZERO_ANGLE: number;
        TONE_MAX_X: number;
        TONE_MAX_Y: number;
        constructor(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, innerRadius: number);
        draw(hsl: Color.IHSL): void;
        hitTest(hsl: Color.IHSL, x: number, y: number): ColorWheelHit;
        down(hit: ColorWheelHit, hsl: Color.IHSL, x: number, y: number): void;
        private drawHueWheel();
        private drawToneTriangle(hue, hueAngle);
        private drawHueSelection(hueAngle);
        private drawToneSelection(h, s, l);
        private polarX(angle, radius);
        private polarY(angle, radius);
    }
}
declare module sk {
}
