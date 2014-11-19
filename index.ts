/// <reference path="typings/tsd.d.ts" />
/// <reference path="lib/_all.ts" />

module sk {
  interface IColorEditorScope extends ng.IScope {
    value : Color.HSL
    size : string
  }

  angular.module('skColorEditor', []).directive('skColorEditor', function () {
    return {
      restrict: 'E',
      scope: {value: '=', size: '='},
      template: '<canvas width={{size}} height={{size}}>Requires canvas support</canvas>',
      link: function (scope:IColorEditorScope, element:ng.IAugmentedJQuery) {
        var canvas = <HTMLCanvasElement> element.find('canvas')[0];
        var ctx = canvas.getContext('2d');
        var ui:ColorWheelUI;

        scope.$watch("value", draw, /*objectEquality: */true);

        scope.$watch('size', function (value) {
          var radius = parseInt(value) / 2 | 0;
          ui = new ColorWheelUI(ctx, radius, radius, radius, radius - 30);
          if (scope.value) {
            draw(scope.value);
          }
        });

        function draw(value) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (ui && value) ui.draw(value);
        }
      }
    };
  });
}
