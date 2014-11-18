/// <reference path="typings/tsd.d.ts" />
declare module Color {
    var PATTERN: RegExp;
    function parse(value: string): number;
    function stringify(color: number): string;
    function fromRgb(r: number, g: number, b: number): number;
    function red(color: number): number;
    function green(color: number): number;
    function blue(color: number): number;
    class HSL {
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
interface IColorScope extends ng.IScope {
    value: string;
    hue: number;
    saturation: number;
    lightness: number;
}
