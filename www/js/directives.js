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

    //.directive('focusMe', function ($timeout) {
    //    return {
    //        link: function (scope, element, attrs) {
    //            $timeout(function () {
    //                element[0].focus();
    //                if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
    //                    cordova.plugins.Keyboard.show(); //open keyboard manually
    //                }
    //            }, 350);
    //        }
    //    };
    //})

    //.directive('focusMe', function ($timeout, $parse) {
    //    return {
    //        //scope: true,   // optionally create a child scope
    //        link: function (scope, element, attrs) {
    //            var model = $parse(attrs.focusMe);
    //            scope.$watch(model, function (value) {
    //                console.log('value=', value);
    //                if (value === true) {
    //                    $timeout(function () {
    //                        element[0].focus();
    //                    });
    //                }
    //            });
    //            // to address @blesh's comment, set attribute value to 'false'
    //            // on blur event:
    //            element.bind('blur', function () {
    //                console.log('blur');
    //                scope.$apply(model.assign(scope, false));
    //            });
    //        }
    //    };
    //})

    .directive('focusMe', function($timeout) {
        return {
            link: function(scope, element, attrs) {
                scope.$watch(attrs.focusMe, function(value) {
                    if(value === true) {
                        console.log('value=',value);
                        //$timeout(function() {
                        element[0].focus();
                        scope[attrs.focusMe] = false;
                        cordova.plugins.Keyboard.show();
                        //});
                    }
                });
            }
        };
    })
;