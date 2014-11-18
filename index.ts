/// <reference path="typings/tsd.d.ts" />
/// <reference path="lib/color.ts" />

interface IColorScope extends ng.IScope {
  value : string
  hue : number
  saturation : number
  lightness : number
}

angular.module('skColorEditor', []).directive('skColorEditor', function () {
  return {
    restrict: 'E',
    scope: {value: '='},
    templateUrl: 'sk-color-editor.html',
    link: function (scope:IColorScope) {
      // Internal state
      var hsl = new Color.HSL(0, 0, 0);

      // Initialize scope (needed?)
      scope.value = '#000000';
      scope.hue = 0;
      scope.saturation = 0;
      scope.lightness = 0;

      // Update scope from state
      scope.$watch(function () {
        return hsl.toColor();
      }, function (value:number) {
        scope.value = Color.stringify(value);
        scope.hue = hsl.hue;
        scope.saturation = hsl.saturation;
        scope.lightness = hsl.lightness;
      });

      // Update state from scope
      scope.$watch('value', function (value:string) {
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
