angular.module('shopping-list.controllers', [])

    .controller('ListsCtrl', function ($scope, $ionicListDelegate, $log, ListsModel) {
        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        //

        $scope.$on('$ionicView.enter', function (e) {
            getAll();
        });

        function parseAll(result) {
            $scope.lists = result.data;
            $scope.newList.name = '';
            $ionicListDelegate.closeOptionButtons();
        }

        function getAll() {
            ListsModel.getAllLists().then(function (result) {
                parseAll(result);
            });
        }

        $scope.lists = [];
        $scope.newList = {name: ''};

        $scope.deleteList = function (list) {
            ListsModel.deleteList(list.id).then(function (result) {
                parseAll(result);
            });
        };

        $scope.clearItemsInList = function (list) {
            ListsModel.clearList(list.id).then(function (result) {
                parseAll(result);
            });
        };

        $scope.addList = function () {
            if (!isEmptyOrSpaces($scope.newList.name)) {
                $scope.lists = ListsModel.createList($scope.newList.name).then(function (result) {
                    parseAll(result);
                });
            } else {
                //getAll();
            }
        };

        //$scope.updateList = function (list) {
        //    ListsModel.update(list.id, list).then(function (result) {
        //        getAll();
        //    });
        //};
    })

    .controller('ItemsCtrl', function ($scope, $ionicListDelegate, $stateParams, ListsModel) {

        $scope.$on('$ionicView.enter', function (e) {
            getAll();
        });

        function parseAll(result) {
            $scope.list = result.data;
            $scope.newItem.name = '';
            $ionicListDelegate.closeOptionButtons();
        }

        function getAll() {
            ListsModel.getList($stateParams.listId).then(function (result) {
                parseAll(result);
            });
        }

        $scope.newItem = {name: '', purchased: false};

        $scope.deleteItem = function (item) {
            ListsModel.deleteItemFromList($stateParams.listId, item.id).then(function (result) {
                parseAll(result);
            });
        };

        $scope.togglePurchased = function (item) {
            ListsModel.togglePurchased($stateParams.listId, item.id).then(function (result) {
                parseAll(result);
            });
        };

        $scope.addItem = function () {
            if (!isEmptyOrSpaces($scope.newItem.name)) {
                ListsModel.addItemToList($stateParams.listId, $scope.newItem.name).then(function (result) {
                    parseAll(result);
                });
            } else {
                //getAll();
            }
        };
    })

    .controller('AccountCtrl', function ($scope) {
        $scope.settings = {
            enableFriends: true
        };
    })

    .controller('TabCtrl', function ($scope, $location, $ionicTabsDelegate, ListsModel) {
        $scope.sendVoice = function () {
            try {

                ApiAIPlugin.setListeningStartCallback(function () {
                    //parentElement.setAttribute('style', 'display:block;');
                });

                ApiAIPlugin.setListeningFinishCallback(function () {
                    //parentElement.setAttribute('style', 'display:none;');
                });

                ApiAIPlugin.setRecognitionResultsCallback(function (results) {
                    console.log(results);
                });

                ApiAIPlugin.levelMeterCallback(function (level) {
                    var transform = "scale3d(" + (level + 1.0) + ", " + (level + 1.0) + ", " + (level + 1.0) + ")";

                    /*
                     circle1.style.transform = transform;
                     circle1.style.webkitTransform = transform;

                     circle2.style.transform = transform;
                     circle2.style.webkitTransform = transform;

                     circle3.style.transform = transform;
                     circle3.style.webkitTransform = transform;
                     */
                });

                ApiAIPlugin.requestVoice(
                    {}, // empty for simple requests, some optional parameters can be here
                    function (response) {
                        // place your result processing here
                        //alert(JSON.stringify(response));

                        if (response.status.code === 200) {
                            var voiceAction = response.result.action;
                            var voiceParams = response.result.parameters;
                            //alert("voiceAction:" + voiceAction + ", voiceParams: " + JSON.stringify(voiceParams));
                            var list, path, listId, itemName;
                            if (voiceAction === "useList") {
                                //alert("switching to list: " + voiceParams.list);
                                list = ListsModel.getListByName(voiceParams.list);
                                //alert("found list: " + JSON.stringify(list));
                                if (list != null) {
                                    $location.path('/tab/lists');
                                    $scope.$apply();
                                    $location.path('/tab/lists/' + list.id);
                                    $scope.$apply();
                                }
                            }
                            else if (voiceAction === "addItemToList") {
                                path = $location.path();
                                //alert("path=" + path);
                                if (path.indexOf('/tab/lists/') == -1) {
                                    alert('Please select a list first.');
                                } else {
                                    listId = path.substr(path.lastIndexOf('/') + 1);
                                    list = ListsModel.getList(listId);
                                    itemName = voiceParams.item;
                                    //alert("found list: " + JSON.stringify(list) + ", adding item: " + itemName);
                                    if (list != null) {
                                        ListsModel.addItemToList(list, itemName);
                                        $scope.$apply();
                                    }
                                }
                            }
                            else if (voiceAction === "removeItemFromList") {
                                path = $location.path();
                                //alert("path=" + path);
                                if (path.indexOf('/tab/lists/') == -1) {
                                    alert('Please select a list first.');
                                } else {
                                    listId = path.substr(path.lastIndexOf('/') + 1);
                                    list = ListsModel.getList(listId);
                                    itemName = voiceParams.item;
                                    //alert("found list: " + JSON.stringify(list) + ", removing item: " + itemName);
                                    if (list != null) {
                                        ListsModel.removeItemByNameFromList(list, itemName);
                                        $scope.$apply();
                                    }
                                }
                            }
                        }

                    },
                    function (error) {
                        // place your error processing here
                        alert(error);
                    });
            } catch (e) {
                alert(e);
            }
        };

        $scope.stopListening = function () {
            ApiAIPlugin.stopListening();
        };

        $scope.doOnSelect = function () {
            console.info("called doOnSelect");
        };
        $scope.doOnDeselect = function () {
            console.info("called doOnDeselect");
        }
    });

function isEmptyOrSpaces(str) {
    return str === null || str.match(/^ *$/) !== null;
}