module sk {
  export class ColorWheelUI {
    SEGMENTS = 12;
    ZERO_ANGLE = -Math.PI / 2;

    constructor(private ctx:CanvasRenderingContext2D,
                public x:number,
                public y:number,
                public radius:number,
                public innerRadius:number) {
    }

    draw(hsl:Color.HSL) {
      var hueAngle = hsl.hue * Math.PI / 180 + this.ZERO_ANGLE;

      this.drawHueWheel();
      this.drawToneTriangle(hsl.hue, hueAngle);
      this.drawHueSelection(hueAngle);
      this.drawToneSelection(hueAngle, hsl.saturation, hsl.lightness);
    }

    private drawHueWheel() {
      // Draw a series of segments with a linear gradient to simulate a polar
      // gradient, which is not supported in canvas (or SVG, for that matter)
      // The segment count should be a factor of 6 to exactly match the primary and
      // secondary colors.
      var segments = this.SEGMENTS;
      var ctx = this.ctx;
      var x = this.x;
      var y = this.y;
      var radius = this.radius;
      var innerRadius = this.innerRadius;

      // Angle of -y (up), where we want the 0 hue (red) to be. Remember angles
      // are in radians (0-2pi), unlike hues, which are in degrees (0-360).
      var zeroAngle = this.ZERO_ANGLE;

      // Overdraw by ~1px at innerRadius to avoid the appearance of gaps due to
      // anti-aliasing.
      var overdrawAngle = Math.atan2(1, innerRadius);

      for (var i = 0; i != segments; i++) {
        // Compute the hues and angles at the start and end of the current segment.
        var startHue = i / segments * 360;
        var endHue = (i + 1) / segments * 360;
        var startAngle = zeroAngle + i / segments * Math.PI * 2 - overdrawAngle;
        var endAngle = zeroAngle + (i + 1) / segments * Math.PI * 2;

        // Create a linear gradient directly across the segment.
        // Putting the ends at innerRadius means there is no discontinuity
        // in colors, though it starts looking bad with larger factors between
        // inner and outer radii.
        var fillStyle = ctx.createLinearGradient(
          this.polarX(startAngle, innerRadius),
          this.polarY(startAngle, innerRadius),
          this.polarX(endAngle, innerRadius),
          this.polarY(endAngle, innerRadius));
        fillStyle.addColorStop(0, 'hsl(' + startHue + ', 100%, 50%)');
        fillStyle.addColorStop(1, 'hsl(' + endHue + ', 100%, 50%)');
        ctx.fillStyle = fillStyle;//'hsl('+startHue+', 100%, 50%)'

        // Draw and fill the segment.
        ctx.beginPath();
        ctx.arc(x, y, radius, startAngle, endAngle, false);
        ctx.arc(x, y, innerRadius, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = null;
    }

    private drawToneTriangle(hue:number, hueAngle:number) {
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

      // Draw a solid linear black-white gradient
      var fillStyle = ctx.createLinearGradient(blackX, blackY, whiteX, whiteY);
      fillStyle.addColorStop(0, '#000000');
      fillStyle.addColorStop(1, '#ffffff');
      ctx.fillStyle = fillStyle;
      ctx.fill();

      // Draw a transparent hue to opaque hue gradient over the same shape.
      // Canvas gradients are not pre-multiplied, so 'transparent'
      // is transparent black, eg. the midpoint would be half (25%) lightness.
      fillStyle = ctx.createLinearGradient(grayX, grayY, hueX, hueY);
      fillStyle.addColorStop(0, 'hsla(' + hue + ', 100%, 50%, 0)');
      fillStyle.addColorStop(1, 'hsla(' + hue + ', 100%, 50%, 1)');
      ctx.fillStyle = fillStyle;
      ctx.fill();

      ctx.fillStyle = null;
    }

    private drawHueSelection(hueAngle:number) {
      var ctx = this.ctx;
      var innerRadius = this.innerRadius;
      var radius = this.radius;

      ctx.beginPath();
      ctx.moveTo(
        this.polarX(hueAngle, innerRadius),
        this.polarY(hueAngle, innerRadius));
      ctx.lineTo(
        this.polarX(hueAngle, radius),
        this.polarY(hueAngle, radius));
      ctx.stroke();
    }

    private drawToneSelection(hueAngle:number, saturation:number, lightness:number) {
      var ctx = this.ctx;
      var radius = this.innerRadius;
    }

    private polarX(angle:number, radius:number):number {
      return this.x + Math.cos(angle) * radius;
    }

    private polarY(angle:number, radius:number):number {
      return this.y + Math.sin(angle) * radius;
    }
  }
}
