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

        service.getListByName = function (listName) {
            return $http.get(getUrl() + '/byName/' + listName);
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

        service.deleteItemByNameFromList = function (listId, itemName) {
            return $http.delete(getUrlForId(listId) + '/deleteItemByName/' + itemName);
        };

        service.togglePurchased = function (listId, itemId) {
            return $http.post(getUrlForId(listId) + '/togglePurchased', itemId);
        };
    })

    // interceptor to add Authorization header for all requests - calculates HMAC via RequestSigner
    // note: also, for this to work, the server needs to accept Authorization header
    // -- see 'Access-Control-Allow-Headers' in CorsFilter
    .factory('HMACInterceptor', function ($q, $log, RequestSigner, CredentialsHolder) {
        return {
            'request': function (config) {
                // add authorization header to remote requests only
                if (config.url.indexOf('http') == 0) {
                    $log.debug('signing request: ' + config.url);
                    var uri = (new URI(config.url)).pathname();
                    // get userId and privateKey of logged in user
                    // note: if user not logged in (requesting a login), then don't sign the request
                    if (CredentialsHolder.isLoggedIn()) {
                        var credentials = CredentialsHolder.getCredentials();
                        var signedRequest = RequestSigner.sign(uri, credentials.userId, credentials.privateKey);
                        config.headers.Authorization = signedRequest.userId + ':' + signedRequest.signature;
                        $log.debug('config.headers: ' + JSON.stringify(config.headers));
                    }
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
            sign: function (uri, userId, privateKey) {
                params.userId = userId;
                params.signature = CryptoJS.HmacSHA1(uri, privateKey).toString();
                return params;
            }
        }
    })

    // holder of userId and privateKey in local storage
    // - userId and privateKey are obtained in response to /login POST (on success)
    // - credential params are deleted on /logout success
    .factory('CredentialsHolder', ['$log', function ($log) {
        var params = {};
        return {
            getCredentials: function () {
                params.userId = window.localStorage.getItem("shopping-list.client.userId");
                params.privateKey = window.localStorage.getItem("shopping-list.client.privateKey");
                return params;
            },
            setCredentials: function (userId, privateKey) {
                $log.debug('saving userId and privateKey');
                window.localStorage.setItem("shopping-list.client.userId", userId);
                window.localStorage.setItem("shopping-list.client.privateKey", privateKey);
            },
            resetCredentials: function () {
                $log.debug('reset userId and privateKey');
                window.localStorage.removeItem("shopping-list.client.userId");
                window.localStorage.removeItem("shopping-list.client.privateKey");
            },
            isLoggedIn: function () {
                $log.debug('checking if user is logged in...');
                var userId = window.localStorage.getItem("shopping-list.client.userId");
                $log.debug('userId: ' + userId);
                return userId != null;
            }
        }
    }])

    // service to make login/logout requests to remote server
    .factory('AuthenticationService', ['$http', '$log', '$state', '$ionicPopup', 'CredentialsHolder', 'API_HOST',
        function ($http, $log, $state, $ionicPopup, CredentialsHolder, API_HOST) {
            return {
                login: function (user) {
                    // THIS SHOULD BE HTTPS because privateKey should not be exposed over http
                    $http.post(API_HOST + '/api/v1.0/login', user)
                        .success(function (data) {
                            CredentialsHolder.setCredentials(data.userId, data.privateKey);
                            $state.go('tab.lists');
                        })
                        .error(function (data, status, headers, config) {
                            $log.debug('in AuthenticationService, there was an error in login - status: ' + status);
                            if (status == 401) {
                                setTimeout(function () {
                                    $ionicPopup.alert({
                                        title: 'Error',
                                        content: 'Incorrect username or password'
                                    }).then(function (res) {
                                    });
                                }, 100);
                            }
                            else if (status == 404) {
                                setTimeout(function () {
                                    $ionicPopup.alert({
                                        title: 'Could not reach server',
                                        content: 'Please try again later'
                                    }).then(function (res) {
                                    });
                                }, 100);
                            }
                            else {
                                setTimeout(function () {
                                    $ionicPopup.alert({
                                        title: 'Error',
                                        content: 'Please try again later'
                                    }).then(function (res) {
                                    });
                                }, 100);
                            }
                        });
                },
                logout: function () {
                    $log.debug('user logged out');
                    CredentialsHolder.resetCredentials();
                    $state.go('login');
                }
            }
        }])
;
