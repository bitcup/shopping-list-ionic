angular.module('shopping-list.services', ['ngResource'])

    .service('ListsModel', function ($http, $log, API_HOST) {
        var service = this,
            baseUrl = '/api/v1.0',
            objectName = '/lists';

        function getUrl() {
            return API_HOST + baseUrl + objectName;
        }

        function getUrlForId(id) {
            return getUrl() + '/' + id;
        }

        service.getAllLists = function () {
            return $http.get(getUrl());
        };

        service.getList = function (listId) {
            return $http.get(getUrlForId(listId));
        };

        service.createList = function (listName) {
            return $http.post(getUrl(), listName);
        };

        service.clearList = function (listId) {
            return $http.post(getUrlForId(listId) + '/clearItems');
        };

        service.deleteList = function (listId) {
            return $http.delete(getUrlForId(listId));
        };

        service.addItemToList = function (listId, itemName) {
            return $http.post(getUrlForId(listId) + '/addItem', itemName);
        };

        service.deleteItemFromList = function (listId, itemId) {
            return $http.delete(getUrlForId(listId) + '/deleteItem/' + itemId);
        };

        service.togglePurchased = function (listId, itemId) {
            return $http.post(getUrlForId(listId) + '/togglePurchased', itemId);
        };
    })

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
