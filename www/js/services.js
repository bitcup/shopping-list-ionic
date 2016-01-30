angular.module('shopping-list.services', [])

    .factory('Lists', function () {
        var lists = [{
            id: guid(),
            name: 'Costco',
            items: [{
                id: guid(),
                name: "olive oil",
                purchased: false
            }, {
                id: guid(),
                name: "milk",
                purchased: true
            }]
        }, {
            id: guid(),
            name: 'Stop and Shop',
            items: [{
                id: guid(),
                name: "hummus",
                purchased: false
            }, {
                id: guid(),
                name: "pasta",
                purchased: true
            }, {
                id: guid(),
                name: "bread",
                purchased: false
            }]
        }, {
            id: guid(),
            name: 'Market Basket',
            items: [{
                id: guid(),
                name: "cheese",
                purchased: false
            }, {
                id: guid(),
                name: "milk",
                purchased: false
            }, {
                id: guid(),
                name: "chocolate",
                purchased: true
            }, {
                id: guid(),
                name: "pancake mix",
                purchased: false
            }]
        }];

        return {
            getAllLists: function () {
                return lists;
            },
            getList: function (listId) {
                for (var i = 0; i < lists.length; i++) {
                    if (lists[i].id === listId) {
                        return lists[i];
                    }
                }
                return null;
            },
            addList: function (listName) {
                this.getAllLists().push({
                    id: guid(),
                    name: listName,
                    items: []
                });
            },
            deleteList: function (list) {
                var pos = lists.indexOf(list);
                lists.splice(pos, 1);
            },
            removeItemFromList: function (itemId) {
                for (var i = 0; i < lists.length; i++) {
                    for (var j = 0; j < lists[i].items.length; j++) {
                        if (lists[i].items[j].id === itemId) {
                            var pos = lists[i].items.indexOf(lists[i].items[j]);
                            lists[i].items.splice(pos, 1);
                        }
                    }
                }
            },
            togglePurchased: function (itemId) {
                var item = this.findItem(itemId);
                if (item) {
                    item.purchased = !item.purchased;
                }
            },
            findItem: function (itemId) {
                for (var i = 0; i < lists.length; i++) {
                    for (var j = 0; j < lists[i].items.length; j++) {
                        if (lists[i].items[j].id === itemId) {
                            return lists[i].items[j];
                        }
                    }
                }
                return null;
            }
        };
    })
;

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}
