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

    .directive('eventFocus', function(focus) {
        return function(scope, elem, attr) {
            elem.on(attr.eventFocus, function() {
                focus(attr.eventFocusId);
            });

            // Removes bound events in the element itself
            // when the scope is destroyed
            scope.$on('$destroy', function() {
                elem.off(attr.eventFocus);
            });
        };
    })
;