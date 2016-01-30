angular.module('starter.controllers', [])

  //.controller('DashCtrl', function ($scope) {
  //})

  .controller('ListsCtrl', function ($scope, Lists) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.lists = Lists.all();
    $scope.remove = function (list) {
      Lists.remove(list);
    };
  })

  .controller('ListDetailCtrl', function ($scope, $stateParams, Lists) {
    $scope.list = Lists.get($stateParams.listId);
    $scope.remove = function (itemId) {
      Lists.removeItem(itemId);
    };
  })

  .controller('AccountCtrl', function ($scope) {
    $scope.settings = {
      enableFriends: true
    };
  })

  .controller('TabCtrl', function ($scope, $ionicTabsDelegate) {
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

        ApiAIPlugin.levelMeterCallback(function(level){
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
            alert(JSON.stringify(response));
          },
          function (error) {
            // place your error processing here
            alert(error);
          });
      } catch (e) {
        alert(e);
      }
    };

    $scope.stopListening = function() {
      ApiAIPlugin.stopListening();
    };

    $scope.doOnSelect = function() {
      console.info("called doOnSelect");
    };
    $scope.doOnDeselect = function() {
      console.info("called doOnDeselect");
    }
  });
