angular.module('conFusion.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

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

.controller('MenuController', ['$scope', 'DishDAO', 'baseURL', 'favorite', '$ionicListDelegate', '$ionicPopup', '$ionicLoading',
                               function($scope, DishDAO, baseURL, favorite, $ionicListDelegate, $ionicPopup, $ionicLoading) {

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

  $ionicLoading.show({
    template: "<ion-spinner></ion-spinner> Loading...",
  });

  DishDAO.query(null,
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

  $scope.addFavorite = function(id) {
    favorite.add(id);
    $ionicListDelegate.closeOptionButtons();
  };

  $scope.removeFavorite = function(id) {
    var confirmPopup = $ionicPopup.confirm({
      title: "Confirm Delete",
      template: "Are you sure you want to delete this item from your favorites ?",
    });

    confirmPopup.then(function(res) {
      if (res) {
        favorite.remove(id);
      }
    });
    $ionicListDelegate.closeOptionButtons();
  };

  $scope.isFavorite = function(id) {
    return favorite.contains(id);
  };

}])

.controller('FavoritesController', ['$scope', '$controller', function($scope, $controller) {
  // In my implementation, a FavoriteController is just a specialized version of the
  // MenuController. I will simply extend it here to avoid code duplication.
  //
  // See http://stackoverflow.com/questions/16539999/angular-extending-controller (look into comments)
  // and https://docs.angularjs.org/api/ng/service/$controller
  $controller('MenuController', {$scope: $scope});

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

.controller('FeedbackController', ['$scope', 'FeedbackDAO', 'baseURL', function($scope, FeedbackDAO, baseURL) {

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
      FeedbackDAO.save($scope.feedback,
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

.controller('DishDetailController', ['$scope', 'DishDAO', '$stateParams', 'baseURL', 'favorite', 
                                      '$ionicPopover', '$ionicPopup',
                                     function($scope, DishDAO, $stateParams, baseURL, favorite, 
                                       $ionicPopover, $ionicPopup) {

  $scope.baseURL = baseURL;

  $scope.dish = {};
  $scope.showDish = false;
  $scope.message = "Loading...";

  $ionicPopover.fromTemplateUrl('templates/dish-detail-popover.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });


  $scope.addFavorite = function(id) {
    $scope.popover.hide().then(function() { 
      // wait till the end of the animation
      // before adding to the favorite to avoid
      // the menu "remove from favorites" to appear then
      favorite.add(id); 
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
        favorite.remove(id);
      }
    });
    $ionicListDelegate.closeOptionButtons();
  };

  $scope.isFavorite = function(id) {
    return favorite.contains(id);
  };

  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };

  $scope.closePopover = function() {
    $scope.popover.hide();
  };

  DishDAO.get({
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

.controller('IndexController', ['LeaderDAO', 'DishDAO', 'PromotionDAO', 'baseURL', '$scope',
  function(LeaderDAO, DishDAO, PromotionDAO, baseURL, $scope) {

    $scope.baseURL = baseURL;
    
    $scope.featured =
      $scope.promotion =
      $scope.ec = {};
    $scope.showLeaders =
      $scope.showPromotion =
      $scope.showEC = false;
    $scope.messageFeatured =
      $scope.messagePromition =
      $scope.messageEC = "Loading...";

    DishDAO.get({
        id: 0
      },
      function(data) {
        $scope.featured = data;
        $scope.showFeatured = true;
      },
      function(response) {
        $scope.messageFeatured = "Error: " + response.status + " " + response.statusText;
      }
    );
    PromotionDAO.getPromotion({
        id: 0
      },
      function(data) {
        $scope.promotion = data;
        $scope.showPromotion = true;
      },
      function(response) {
        $scope.messagePromotion = "Error: " + response.status + " " + response.statusText;
      }
    );
    LeaderDAO.getByRole({
        role: 'EC'
      },
      function(data) {
        // As I query by an attribute (abbr) instead
        // of by id, the response is an array
        $scope.ec = data[0];
        $scope.showEC = true;
      },
      function(response) {
        $scope.messageEC = "Error: " + response.status + " " + response.statusText;
      }
    );
  }
])


.controller('AboutController', ['LeaderDAO', '$scope', 'baseURL',
  function(LeaderDAO, $scope, baseURL) {

    $scope.baseURL = baseURL;


    $scope.leaders = {};
    $scope.showLeaders = false;
    $scope.message = "Loading...";

    LeaderDAO.query(null,
      function(data) {
        $scope.leaders = data;
        $scope.showLeaders = true;
        $scope.message = "";
      },
      function(response) {
        $scope.message = "Error: " + response.status + " " + response.statusText;
      }
    );
  }
])

;
