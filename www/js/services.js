angular.module('starter.services', [])

  .factory('Lists', function () {
    var lists = [{
      id: 0,
      name: 'Costco',
      items: [{
        id: 0,
        name: "olive oil"
      }, {
        id: 1,
        name: "milk"
      }]
    }, {
      id: 1,
      name: 'Stop and Shop',
      items: [{
        id: 2,
        name: "hummus"
      }, {
        id: 3,
        name: "pasta"
      }, {
        id: 4,
        name: "bread"
      }]
    }, {
      id: 2,
      name: 'Market Basket',
      items: [{
        id: 5,
        name: "cheese"
      }, {
        id: 6,
        name: "milk"
      }, {
        id: 7,
        name: "chocolate"
      }, {
        id: 8,
        name: "pancake mix"
      }]
    }];

    return {
      all: function () {
        return lists;
      },
      remove: function (list) {
        lists.splice(lists.indexOf(list), 1);
      },
      removeItem: function (itemId) {
        for (var i = 0; i < lists.length; i++) {
          for (var j=0; j<lists[i].items.length; j++) {
            if (lists[i].items[j].id === parseInt(itemId)) {
              lists[i].items[j].splice(lists[i].items[j].indexOf(itemId), 1);
            }
          }
        }
      },
      get: function (listId) {
        for (var i = 0; i < lists.length; i++) {
          if (lists[i].id === parseInt(listId)) {
            return lists[i];
          }
        }
        return null;
      }
    };
  });
