angular.module('shopping-list.services', ['ngResource'])

    .factory('Lists', ['$resource', '$log', '$state', 'API_HOST',
        function ($resource, $log, $state, API_HOST) {
            // defines the endpoint, optional params, and method names (in addition to the default ones)
            var listsResource = $resource(API_HOST + '/api/v1.0/lists/:listId', {listId: '@id'});
            //var itemsForListResource = $resource(API_HOST + '/api/v1.0/lists/:listId/items', {listId: '@id'});

            var factory = {};

            factory.getAllLists = function () {
                $log.info("calling getAllLists...");
                return listsResource.query();
            };
            factory.createList = function (list) {
                return (new listsResource(list)).$save();
            };
            factory.getList = function (listId) {
                return listsResource.get({listId: listId});
            };
            factory.deleteList = function (list) {
                return listsResource.delete({listId: list.id});
            };
            //factory.addItemForList = function (listId, item) {
            //    return (new itemsForListResource(listId)).$save();
            //};
            factory.updateList = function (list) {
                return $resource(API_HOST + '/api/v1.0/lists/:listId', {listId: list.id}, {'updateOne': {method: 'PUT'}}).updateOne(list);
            };
            return factory;
        }])

    .factory('Items', ['$resource', '$log', '$state', 'API_HOST',
        function ($resource, $log, $state, API_HOST) {
            // defines the endpoint, optional params, and method names (in addition to the default ones)
            var itemsResource = $resource(API_HOST + '/api/v1.0/items/:itemId', {itemId: '@id'});

            var factory = {};

            factory.deleteItem = function (itemId) {
                return itemsResource.delete({itemId: itemId});
            };
            factory.updateItem = function (item) {
                return $resource(API_HOST + '/api/v1.0/items', {}, {'updateOne': {method: 'PUT'}}).updateOne(item);
            };
            return factory;
        }])

    // interceptor to add Authorization header for all requests - calculates HMAC via RequestSigner
    // note: also, for this to work, the server needs to accept Authorization header
    // -- see 'Access-Control-Allow-Headers' in CorsFilter
    .factory('HMACInterceptor', function ($q, $log, RequestSigner) {
        return {
            'request': function (config) {
                // add authorization header to remote requests only
                if (config.url.indexOf('http') == 0) {
                    $log.debug('signing request: ' + config.url);
                    var uri = (new URI(config.url)).pathname();
                    var signedRequest = RequestSigner.sign(uri, "abc");
                    config.headers.Authorization = signedRequest.userId + ':' + signedRequest.signature;
                    $log.debug('config.headers: ' + JSON.stringify(config.headers));
                }
                return config || $q.when(config);
            },
            'responseError': function (rejection) {
                $log.debug("http interceptor caught a response error with status=" + rejection.status);
                return $q.reject(rejection);
            }
        };
    })

    // add interceptor to sign remote requests
    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('HMACInterceptor');
    })

    // request signer
    // todo: include POST/PUT payload in signature calculations, not just URI
    .factory('RequestSigner', function () {
        var params = {};
        return {
            sign: function (uri, userId) {
                params.userId = userId;
                params.signature = CryptoJS.HmacSHA1(uri, "12345").toString();
                return params;
            }
        }
    })
;
