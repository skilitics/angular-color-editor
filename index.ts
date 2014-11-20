/// <reference path="typings/tsd.d.ts" />
/// <reference path="lib/_all.ts" />

module sk {
  interface IColorEditorScope extends ng.IScope {
    value : any // number|string|Color.IHSL
    hue : number
    saturation : number
    lightness : number
    size : number
    innerSize : number
  }

  angular.module('skColorEditor', []).directive('skColorEditor', ['$document', ($document:ng.IDocumentService) => {
    return {
      restrict: 'E',
      scope: { value: '=?', hue: '=?', saturation: '=?', lightness: '=?', size: '=', innerSize: '=?' },
      template: '<canvas width={{size}} height={{size}} style="cursor: default; user-select: none">Requires canvas support</canvas>',
      link: (scope:IColorEditorScope, element:ng.IAugmentedJQuery) => {
        var canvas = <HTMLCanvasElement> element.find('canvas')[0];
        var ctx = canvas.getContext('2d');
        var ui:ColorWheelUI, hsl:Color.HSL;
        scope.size = 200;

        canvas.addEventListener('mousedown', event => {
          var rect = canvas.getBoundingClientRect();
          var hit = !ui ? ColorWheelHit.None : ui.hitTest(hsl, event.clientX - rect.left, event.clientY - rect.top);
          if (hit) {
            $document.on('mousemove', mouseMove);
            $document.on('mouseup', mouseUp);
            function mouseUp(event:JQueryMouseEventObject) {
              mouseMove(event);
              $document.off('mousemove', mouseMove);
              $document.off('mouseup', mouseUp);
            }
            function mouseMove(event:JQueryMouseEventObject) {
              var rect = canvas.getBoundingClientRect();
              ui.down(hit, hsl, event.clientX - rect.left, event.clientY - rect.top);
              draw();

              scope.$applyAsync((scope:IColorEditorScope) => {
                scope.hue = hsl.hue;
                scope.saturation = hsl.saturation;
                scope.lightness = hsl.lightness;
              });
            }
          }
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
          var hue = Color.normalizeHue(values[0]);
          var saturation = Color.clampValue(values[1]);
          var lightness = Color.clampValue(values[2]);
          hsl = new Color.HSL(hue, saturation, lightness);
          scope.value = Color.stringify(hsl.toColor());
          draw();
        });

        scope.$watchGroup('size innerSize'.split(' '), values => {
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

        function draw() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (ui && hsl) ui.draw(hsl);
        }
      }
    };
  }]);
}
