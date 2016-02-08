// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('conFusion', ['ionic', 'ngCordova',
                             'conFusion.controllers', 'conFusion.services'])

.run(function($ionicPlatform, $rootScope, $ionicLoading, $cordovaSplashscreen, $timeout) {


  // POLYFILLS
  if (!Array.prototype.find) {
    Array.prototype.find = function(predicate) {
      if (this === null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      var list = Object(this);
      var length = list.length >>> 0;
      var thisArg = arguments[1];
      var value;

      for (var i = 0; i < length; i++) {
        value = list[i];
        if (predicate.call(thisArg, value, i, list)) {
          return value;
        }
      }
      return undefined;
    };
  }



  $rootScope.$on('loading:show', function() {
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner> Loading ...'
    })
  });

  $rootScope.$on('loading:hide', function() {
    $ionicLoading.hide();
  });
  /*
    $rootScope.$on('$stateChangeStart', function () {
        console.log('Loading ...');
        $rootScope.$broadcast('loading:show');
    });

    $rootScope.$on('$stateChangeSuccess', function () {
        console.log('done');
        $rootScope.$broadcast('loading:hide');
    });
  */

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    if ($cordovaSplashscreen) {
      $cordovaSplashscreen.hide();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/sidebar.html',
    controller: 'AppCtrl',
    resolve: {
      dishes: ['menuFactory', function(menuFactory) {
        return menuFactory.query();
      }],
    },
  })

  .state('app.home', {
    url: '/home',
    views: {
      'mainContent': {
        templateUrl: 'templates/home.html',
        controller: 'IndexController',
        resolve: {
          leader: ['leaderFactory', function(leaderFactory) {
            return leaderFactory.getByRole({abbr: 'WD'});
          }],
          dish: ['menuFactory', function(menuFactory) {
            return menuFactory.get({id: 0});
          }],
          promotion: ['promotionFactory', function(promotionFactory) {
            return promotionFactory.get({id: 0});
          }],
        },
      }
    }
  })

  .state('app.aboutus', {
    url: '/aboutus',
    views: {
      'mainContent': {
        templateUrl: 'templates/aboutus.html',
        controller: 'AboutController',
        resolve: {
          leaders: ['leaderFactory', function(leaderFactory) {
            return leaderFactory.query();
          }],
        },
      }
    }
  })

  .state('app.contactus', {
    url: '/contactus',
    views: {
      'mainContent': {
        templateUrl: 'templates/contactus.html',
        controller: 'ContactController'
      }
    }
  })

  .state('app.menu', {
    url: '/menu',
    views: {
      'mainContent': {
        templateUrl: 'templates/menu.html',
        controller: 'MenuController',
        // See https://www.coursera.org/learn/hybrid-mobile-development/discussions/EpxPAsjzEeWs-BKzmUStyw/replies/ppf9u8mFEeWUXxL-L9OQmQ/comments/HCzntcmwEeW7ZQq25xfj8w
        // for why dishes resolver has been moved up to the "app" state
      }
    }
  })

  .state('app.favorites', {
    url: '/favorites',
    views: {
      'mainContent': {
        templateUrl: 'templates/favorites.html',
        controller: 'FavoritesController',
        resolve: {
          // See https://www.coursera.org/learn/hybrid-mobile-development/discussions/EpxPAsjzEeWs-BKzmUStyw/replies/ppf9u8mFEeWUXxL-L9OQmQ/comments/HCzntcmwEeW7ZQq25xfj8w
          // for why dishes resolver has been moved up to the "app" state

          /*
              ONLY to comply with the suggested solution in the course
          */
          favorites: ['favoriteFactory', function(favoriteFactory) {
            return favoriteFactory.getFavorites();
          }],
        },
      },
    }
  })

  .state('app.dishdetails', {
    url: '/menu/:id',
    views: {
      'mainContent': {
        templateUrl: 'templates/dishdetails.html',
        controller: 'DishDetailController',
        resolve: {
          dish: ['menuFactory', '$stateParams', function(menuFactory, $stateParams) {
            return menuFactory.get({
              id: parseInt($stateParams.id, 10)
            });
          }],
        }
      }
    }
  })
  ;
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});