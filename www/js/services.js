'use strict';
angular.module('conFusion.services',['ngResource'])
    .constant("baseURL","http://localhost:3000/")

    /*
        I didn't follow exactly the way things are implemented in the course
        as the given design didn't seem good to me.
        Please feel free to comment on the forum:

        https://www.coursera.org/learn/angular-js/module/tJ7jz/discussions/cTtOOKQCEeWiXxLB9mtqCw/replies/NR4ed6cbEeWoGg6ulZMPEw/comments/J4SMDKcjEeWG0xJGD15hdw

        Basically, I think the correct behavior should be to create only *one*
        resource manager for each resource type and made them available as services.

        As factory-based resource are lazy-initialized, this does not imply
        any overhead.

        Once you have the resource manager available for dependency injection,
        it is trivial to create/read/update/delete object from the persistence
        store as you will see in the controller.

        See on the forum for the meaning of "DAO":

        https://www.coursera.org/learn/angular-js/module/tJ7jz/discussions/koGgqKcCEeWiXxLB9mtqCw
    */

    .factory('menuFactory', ['$resource', 'baseURL', function($resource, baseURL) {
        return $resource(baseURL+'dishes/:id', null, {
            // extra methods
            update: {
                // the purpose of the update method is to send modified object
                // back to the server by using a PUT request instead of a POST
                // request like in the default "save" method.
                //
                // Please feel free to comment on the forum:
                //
                // https://www.coursera.org/learn/angular-js/module/tJ7jz/discussions/VCtNNac0EeWhLRIkesxXNw
                method: 'PUT', params: { id: '@id' }
            },
        });
    }])

    .factory('leaderFactory', ['$resource', 'baseURL', function($resource, baseURL) {
        return $resource(baseURL+'leadership/:id', null, {
            // extra methods
            getByRole: { params: {abbr:'@role'}, method: 'GET', isArray: true }
        });
    }])

    .factory('promotionFactory', ['$resource', 'baseURL', function($resource, baseURL) {
        return $resource(baseURL+'promotions/:id', null, {
            // extra methods
            getPromotion: {
                // The only purpose of this function is to comply with the assignment
                // request for a method name "getPromotion".
                // The standard .get method will perform *exactly* the same task.
                // See https://docs.angularjs.org/api/ngResource/service/$resource#returns
                method: "GET"
            },
            getPromotions: {
                // The only purpose of this function is to comply with the assignment
                // request for a method named "getPromotions".
                // The standard .query method will perform *exactly* the same task.
                // See https://docs.angularjs.org/api/ngResource/service/$resource#returns
                method: "GET", isArray: true
            }
        });
    }])

    .factory('feedbackFactory', ['$resource', 'baseURL', function($resource, baseURL) {
        return $resource(baseURL+'feedback/:id', null, {
            // extra methods
        });
    }])


    .factory('favorites', ['$resource', 'baseURL', function($resource, baseURL) {
        var favorites = Object.create(null);
        // Better using Object.create(null) above rather than {}
        // to ensure there is no properties in the prototype chain that
        // would confuse the `in`  operator
        //
        // See http://stackoverflow.com/questions/15518328/creating-js-object-with-object-createnull
        // and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create

        var favorites = {
            contains: function(id) {
                return id in favorites;
            },
            add: function(id) {
                favorites[id] = true;
            },
            remove: function(id) {
                delete favorites[id];
            },
            filter: function(ids) {
                return ids.filter(function(dish) { return dish.id in favorites; });
            }
        };

        return favorites;
    }])

    .filter('favoriteFilter', ['favorite', function(favorite) {
        return function(dishes) {
            return favorite.filter(dishes);
        };
    }])

;