angular.module('conFusion.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $localStorage) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = $localStorage.getObject('userinfo', '{}');
  $scope.reservation = $localStorage.getObject('reservation', '{}');

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    $localStorage.storeObject('userinfo', $scope.loginData);
    
    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

  // Create the reserve modal that we will use later
  $ionicModal.fromTemplateUrl('templates/reserve.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.reserveModal = modal;
  });

  // Open the reserve modal
  $scope.reserve = function() {
    $scope.reserveModal.show();
  };

  // Triggered in the reserve modal to close it
  $scope.closeReserve = function() {
    $scope.reserveModal.hide();
  };

  // Perform the reserve action when the user submits the login form
  $scope.doReserve = function() {
    console.log("Doing reservation", $scope.reservation);
    
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

  $scope.reservation = {
    numGuests: 0,
  };

  $scope.urlResolver = function(url) {
    return 'http://localhost:3000/' + url
  }
})

.controller('MenuController', ['$rootScope', '$scope', 'dishes', 'baseURL', 'favoriteFactory', 
                               '$ionicListDelegate', '$ionicPopup', '$ionicLoading',
                               '$localStorage', 
                               '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast',
                               function($rootScope, $scope, dishes, baseURL, favoriteFactory, 
                                   $ionicListDelegate, $ionicPopup, $ionicLoading,
                                   $localStorage,
                                   $ionicPlatform, $cordovaLocalNotification, $cordovaToast) {

  console.log('Start of MenuController');
  console.log(dishes);

  // See https://www.coursera.org/learn/hybrid-mobile-development/module/axpl2/discussions/laLZpMevEeW2Jgr23ucAdw
  // for the reason wgy the spinning wheel is implemented that way
  if (!dishes.$resolved) {
    $rootScope.$broadcast('loading:show');
    dishes.$promise.then(function(data) {
      $rootScope.$broadcast('loading:hide');
    },function(err) {
      $rootScope.$broadcast('loading:hide');
    });
  };

  $scope.baseURL = baseURL;

  $scope.tab = 0;
  $scope.filtText = '';
  $scope.message = "Loading...";

  $scope.dishes = [];
  $scope.showMenu = false;
  $scope.categories = [
    {id: 0, name:"All", filtText:""},
    {id: 2, name:"Appetizers", filtText: "appetizer"},
    {id: 3, name:"Mains", filtText: "mains"},
    {id: 4, name:"Dessert", filtText: "dessert"},
  ];

  /*
  $ionicLoading.show({
    template: "<ion-spinner></ion-spinner> Loading...",
  });

  $scope.dishes = menuFactory.query(null,
    function(data) {
      $scope.dishes = data;
      $scope.showMenu = true;
      $scope.message = "";
      $ionicLoading.hide();
    },
    function(response) {
      $scope.message = "Error: " + response.status + " " + response.statusText;
      $ionicLoading.hide();
    }
  );
  */

  $scope.dishes = dishes;

  $scope.select = function(setTab) {
    $scope.tab = setTab;

    var sel = $scope.categories.find(function(item) { return item.id == setTab});
    if (sel) {
      $scope.filtText = sel.filtText;
    } else {
      $scope.filtText = "";
    }
  };

  $scope.isSelected = function(checkTab) {
    return ($scope.tab === checkTab);
  };


  $scope.showDetails = false;
  $scope.toggleDetails = function() {
    $scope.showDetails = !$scope.showDetails;
  };

  // console.log(typeof dishes);
  // console.dir(dishes);
  function getDishName(id) {
    return dishes.find(function(dish) { return dish.id == id }).name;
  }

  $scope.addFavorite = function(id) {
    favoriteFactory.add(id);
    /* To adhere to the "Don't repeat yourself" principle,
       favorite persistance is handled by the favoriteFactory service.
       Not in each controller separately
    */
    $ionicListDelegate.closeOptionButtons();

    $ionicPlatform.ready(function () {
      $cordovaLocalNotification.schedule({
          id: 1,
          title: "Added Favorite",
          text: 'Added Favorite ' + getDishName(id),
      }).then(function () {
          console.log('Added Favorite '+getDishName(id));
      },
      function () {
          console.log('Failed to send notification ');
      });

      $cordovaToast
        .show('Added Favorite '+getDishName(id), 'long', 'center')
        .then(function (success) {
            // success
        }, function (error) {
            // error
        });
    });
  };

  $scope.removeFavorite = function(id) {
    var confirmPopup = $ionicPopup.confirm({
      title: "Confirm Delete",
      template: "Are you sure you want to delete this item from your favorites ?",
    });

    confirmPopup.then(function(res) {
      if (res) {
        favoriteFactory.remove(id);
        /* To adhere to the "Don't repeat yourself" principle,
           favorite persistance is handled by the favoriteFactory service.
           Not in each controller separately
        */
      }
    });
    $ionicListDelegate.closeOptionButtons();
  };

  $scope.isFavorite = function(id) {
    return favoriteFactory.contains(id);
  };

}])

.controller('FavoritesController', ['$scope', '$controller', 'dishes', 
                                    'favorites',
                                    function($scope, $controller, dishes, favorites) {

  // For compatibility with existing code ONLY
  $scope.favorites = favorites;

  // In my implementation, a FavoriteController is just a specialized version of the
  // MenuController. I will simply extend it here to avoid code duplication.
  //
  // See http://stackoverflow.com/questions/16539999/angular-extending-controller (look into comments)
  // and https://docs.angularjs.org/api/ng/service/$controller
  $controller('MenuController', {
    $scope: $scope,
    dishes: dishes,
  });

  // Favorite persistance is in the favoriteFactory in services.js

  $scope.shouldShowDelete = false;
  $scope.toggleDelete = function() {
    $scope.shouldShowDelete = !$scope.shouldShowDelete;
    console.log(shouldShowDelete);
  };
}])

.controller('ContactController', ['$scope', function($scope) {
  $scope.feedback = {
    mychannel: "",
    firstName: "",
    lastName: "",
    agree: false,
    email: ""
  };
  var channels = [{
    value: "tel",
    label: "Tel."
  }, {
    value: "Email",
    label: "Email"
  }];
  $scope.channels = channels;
  $scope.invalidChannelSelection = false;
}])

.controller('FeedbackController', ['$scope', 'feedbackFactory', 'baseURL', function($scope, feedbackFactory, baseURL) {

  $scope.baseURL = baseURL;

  $scope.sendFeedback = function() {
    console.log($scope.feedback);
    if ($scope.feedback.agree && ($scope.feedback.mychannel === "")) {
      $scope.invalidChannelSelection = true;
      console.log('incorrect');
    } else {
      // Valid feedback

      /*
          Save a *new* feedback on the server using a POST request.
      */
      feedbackFactory.save($scope.feedback,
        function() {
          $scope.message = "Feedback sent";
          $scope.sent = true;

          // Reset form (only in case of success)
          $scope.invalidChannelSelection = false;
          $scope.feedback = {
            mychannel: "",
            firstName: "",
            lastName: "",
            agree: false,
            email: ""
          };
          $scope.feedback.mychannel = "";

          $scope.feedbackForm.$setPristine();
          console.log($scope.feedback);
        },
        function(response) {
          $scope.message = "Error: " + response.status + " " + response.statusText;
          $scope.sent = false;

        }
      );

    }
  };
}])

.controller('DishDetailController', ['$scope', 'dish', '$stateParams', 'baseURL', 'favoriteFactory', 
                                      '$ionicPopover', '$ionicPopup', '$ionicModal',
                                      '$localStorage',
                                     function($scope, dish, $stateParams, baseURL, favoriteFactory, 
                                       $ionicPopover, $ionicPopup, $ionicModal,
                                       $localStorage) {

  $scope.baseURL = baseURL;

  $scope.dish = dish;
  $scope.showDish = false;
  $scope.message = "Loading...";

  $ionicPopover.fromTemplateUrl('templates/dish-detail-popover.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });

  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };

  $scope.closePopover = function() {
    $scope.popover.hide();
  };

  $ionicModal.fromTemplateUrl('templates/dish-comment.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.commentModal = modal;
  });

  // Triggered in the comment modal to close it
  $scope.closeComment = function() {
    $scope.commentModal.hide();
  };

  $scope.commentData = {
    rating : 5,
    // Pre-fill the author comment field with login data
    author: $localStorage.getObject('userinfo', '{username=""}').username,
    comment: "",
    date: null,
  };

  // Close the popover and open the comment modal
  $scope.comment = function() {
    $scope.popover.hide();

    // Default message for favorite dishes
    if (!$scope.commentData.comment && $scope.isFavorite($scope.dish.id)) {
      $scope.commentData.comment = "One of my favorites !";
    }
    $scope.commentModal.show();
  };

  // Send the comment
  $scope.doComment = function() {
    $scope.commentModal.hide();

    $scope.dish.comments.push({
      rating: $scope.commentData.rating,
      author: $scope.commentData.author,
      comment: $scope.commentData.comment,
      date: new Date(),
    });

    /*
      push back the changes on the serve using a PUT request.
    */
    $scope.dish.$update(function() {
      // Reset the form
      $scope.commentData.rating = 5;
      $scope.commentData.comment = "";
      $scope.commentData.date = null;

      $scope.commentForm.reset();
    });
  };

  $scope.addFavorite = function(id) {
    $scope.popover.hide().then(function() { 
      // wait till the end of the animation
      // before adding to the favorite to avoid
      // the menu "remove from favorites" to appear then
      favoriteFactory.add(id); 
      /* To adhere to the "Don't repeat yourself" principle,
         favorite persistance is handled by the favoriteFactory service.
         Not in each controller separately
      */
    });
  };

  $scope.removeFavorite = function(id) {
    $scope.closePopover();

    var confirmPopup = $ionicPopup.confirm({
      title: "Confirm Delete",
      template: "Are you sure you want to delete this item from your favorites ?",
    });

    confirmPopup.then(function(res) {
      if (res) {
        favoriteFactory.remove(id);
        /* To adhere to the "Don't repeat yourself" principle,
           favorite persistance is handled by the favoriteFactory service.
           Not in each controller separately
        */
      }
    });
    $ionicListDelegate.closeOptionButtons();
  };

  $scope.isFavorite = function(id) {
    return favoriteFactory.contains(id);
  };

  /*
  $scope.dish = menuFactory.get({
      id: parseInt($stateParams.id, 10)
    },
    function(data) {
      console.log(data);
      $scope.dish = data;
      $scope.showDish = true;
    },
    function(response) {
      $scope.message = "Error: " + response.status + " " + response.statusText;
    }
  );
  */
}])

// ASSIGNMENT 3
.controller('CommentFormController', function() {
  /*
    I didn't use $scope to solve this problem as they will not be supported
    in Angular 2 according to this discution on the forum:

    https://www.coursera.org/learn/angular-js/module/J5XIt/discussions/YSZJ6p6LEeWGxBJdkUHhbw
  */
  this.comment = {
    comment: "",
    rating: 5,
    author: "",
    date: null
  };

  this.sendComment = function(dish) {
    this.comment.date = new Date();
    dish.comments.push(this.comment);
    /*
      push back the changes on the serve using a PUT request.
    */
    dish.$update(function() {
      this.comment = {
        comment: "",
        rating: 5,
        author: "",
        date: null
      };
    });
  };

  this.reset = function(form) {
    form.$setPristine();
  };
})

.controller('IndexController', ['leader', 'dish', 'promotion', 'baseURL', '$scope',
  function(leader, dish, promotion, baseURL, $scope) {

    $scope.baseURL = baseURL;
    
    $scope.dish = dish;
    $scope.promotion = promotion;
    $scope.leader = leader;

    leader.$promise.then(function(data) {
      leader = data[0];
    });

    console.log("leader");
    console.log(leader);
    console.log("dish");
    console.log(dish);
  }
])


.controller('AboutController', ['leaders', '$scope', 'baseURL',
  function(leaders, $scope, baseURL) {

    $scope.baseURL = baseURL;


    $scope.leaders = leaders;
    $scope.showLeaders = false;
    $scope.message = "Loading...";
  }
])

;
