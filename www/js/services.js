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

        service.all = function () {
            return $http.get(getUrl());
        };

        service.fetch = function (id) {
            return $http.get(getUrlForId(id));
        };

        service.create = function (object) {
            return $http.post(getUrl(), object);
        };

        service.update = function (id, object) {
            return $http.put(getUrlForId(id), object);
        };

        service.delete = function (id) {
            return $http.delete(getUrlForId(id));
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
