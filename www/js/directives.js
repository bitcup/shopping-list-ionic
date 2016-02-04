angular.module('shopping-list.directives', [])

    .directive('keyBind', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.keyBind, {'event': event});
                    });
                    event.preventDefault();
                }
            });
        };
    })

    .directive('focusMe', function ($timeout) {
        return {
            link: function (scope, element, attrs) {
                $timeout(function () {
                    element[0].focus();
                    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                        cordova.plugins.Keyboard.show(); //open keyboard manually
                    }
                }, 350);
            }
        };
    })
;