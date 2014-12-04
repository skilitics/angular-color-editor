/// <reference path="typings/tsd.d.ts" />
/// <reference path="lib/_all.ts" />

module sk {
  interface IColorEditorScope extends ng.IScope {
    value : any // number|string|Color.IHSL
    hue : number
    saturation : number
    lightness : number
    size : ()=>number
    innerSize : ()=>number
  }

  interface CaptureOnDownCallback {
    (event:MouseEvent):MouseEventListener
  }
  interface MouseEventListener {
    (event:MouseEvent):void
  }

  function captureOnDown(element:HTMLElement, callback:CaptureOnDownCallback) {
    element.addEventListener('mousedown', function (event) {
      event.preventDefault();
      var mouseMove = callback(event);
      if (mouseMove) {
        mouseMove(event);
        document.addEventListener('mousemove', mouseMove);
        document.addEventListener('mouseup', function mouseUp(event:MouseEvent) {
          document.removeEventListener('mousemove', mouseMove);
          document.removeEventListener('mouseup', mouseUp);
        });
      }
    });
  }

  angular.module('skColorEditor', []).directive('skColorEditor', () => {
    return {
      restrict: 'E',
      scope: { value: '=?', hue: '=?', saturation: '=?', lightness: '=?', size: '&', innerSize: '&?' },
      template: '<canvas>Requires canvas support</canvas>',
      link: (scope:IColorEditorScope, element:ng.IAugmentedJQuery) => {
        var canvas = <HTMLCanvasElement> element.find('canvas')[0];
        var ctx = canvas.getContext('2d');
        var ui:ColorWheelUI, hsl:Color.HSL;

        var applying = false;
        captureOnDown(canvas, function (event) {
          if (!ui || event.button != 0) return null;
          var rect = canvas.getBoundingClientRect();
          var hit = ui.hitTest(hsl, event.clientX - rect.left, event.clientY - rect.top);
          if (!hit) return null;
          return event => {
            var rect = canvas.getBoundingClientRect();
            ui.down(hit, hsl, event.clientX - rect.left, event.clientY - rect.top);
            applying || scope.$applyAsync((scope:IColorEditorScope) => {
              applying = false;
              scope.hue = hsl.hue;
              scope.saturation = hsl.saturation;
              scope.lightness = hsl.lightness;
            });
            applying = true;
          };
        });

        scope.$watch('value', value => {
          var color = NaN;
          if (typeof value == 'number')
            color = value & 0xFFFFFF;
          else if (typeof value == 'string')
            color = Color.parse(value);
          else if (typeof value == 'object' && "hue" in value && "saturation" in value && "lightness" in value) { // is IHSL
            hsl = value;
            draw();
          }
          if (!isNaN(color) && !(hsl && hsl.toColor() == color)) {
            hsl = Color.toHSL(color);
            draw();
          }
        });
        scope.$watchGroup('hue saturation lightness'.split(' '), values => {
          if (!values.some(isNaN)) {
            var hue = Color.normalizeHue(values[0]);
            var saturation = Color.clampValue(values[1]);
            var lightness = Color.clampValue(values[2]);
            hsl = new Color.HSL(hue, saturation, lightness);
            scope.value = Color.stringify(hsl.toColor());
            draw();
          }
        });

        scope.$watchGroup('size() innerSize()'.split(' '), values => {
          var size = values[0];
          if (typeof size == 'string') {
            size = parseFloat(size);
          }
          if (!isFinite(size)) {
            size = 200;
          }
          canvas.width = canvas.height = size;

          var innerSize = values[1];
          if (typeof innerSize == 'string') {
            if (/%$/.test(innerSize)) {
              innerSize = size * parseFloat(innerSize.substring(0, innerSize.length - 1));
            } else {
              innerSize = parseFloat(innerSize);
            }
          }
          if (!isFinite(innerSize)) {
            innerSize = size * 0.80;
          }

          var radius = size / 2 | 0;
          var innerRadius = innerSize / 2 | 0;
          ui = new ColorWheelUI(ctx, radius, radius, radius, innerRadius);
          draw();
        });

        var drawing = false;
        function draw() {
          // Firefox, at least, seems to have trouble keeping up with paints
          // inside a mouse-event on some platforms/configurations (leading to "choppy"
          // interaction). Throttle to only one delayed call, prefer requestAnimationFrame()
          // which should guarantee execution before next paint.
          drawing || (window.requestAnimationFrame || setTimeout)(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (ui && hsl) ui.draw(hsl);
            drawing = false;
          });
          drawing = true;
        }
      }
    };
  });
}
