/*
   Copyright 2016 Sylvain Leroux, Jogesh Muppala

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
angular.module('conFusion.controllers', [])

.controller('AppCtrl', function(baseURL, $scope, $ionicModal, 
              $timeout, $localStorage, 
              $ionicPlatform, $cordovaCamera, $cordovaImagePicker,
              $cordovaToast) {

  console.log("Start of AppCtrl");

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

    $cordovaToast
      .show('Logged in\n(always work for demo)', 'long', 'bottom');
    
    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

  // REGISTRATION
  $scope.registration = {};

  // Create the registration modal that we will use later
  $ionicModal.fromTemplateUrl('templates/register.html', {
      scope: $scope
  }).then(function (modal) {
      $scope.registerform = modal;
  });

  // Triggered in the registration modal to close it
  $scope.closeRegister = function () {
      $scope.registerform.hide();
  };

  // Open the registration modal
  $scope.register = function () {
      $scope.registerform.show();
  };

  // Perform the registration action when the user submits the registration form
  $scope.doRegister = function () {
      console.log('Registering', $scope.registration);

      // Simulate a registration delay. Remove this and replace with your registration
      // code if using a registration system
      $timeout(function () {
          $scope.loginData.username = $scope.registration.username;
          $localStorage.storeObject('userinfo', $scope.loginData);

          $scope.closeRegister();
      }, 1000);
  };

  $ionicPlatform.ready(function() {
    //
    // CAMERA
    //
    if (typeof Camera !== 'undefined') {
      var cameraOptions = {
          quality: 50,
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: Camera.PictureSourceType.CAMERA,
          allowEdit: true,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 100,
          targetHeight: 100,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false
      };
      $scope.takePicture = function() {
          $cordovaCamera.getPicture(cameraOptions).then(function(imageData) {
              $scope.registration.imgSrc = "data:image/jpeg;base64," + imageData;
          }, function(err) {
              console.log(err);
          });

          $scope.registerform.show();

      };
    } else {
      $scope.takePicture = function() {
        console.log("Camera unavailable");
      }      
    }

    //
    // GALLERIE
    //
    $scope.selectPicture = function() {
        $cordovaImagePicker.getPictures({
          maximumImagesCount: 1,
          quality: 50,
          // https://github.com/wymsee/cordova-imagePicker and
          // http://ngcordova.com/docs/plugins/imagePicker/ disagree
          // on the height/width semantic.
          //
          // Apparently, setting both will ensure the image fit in the given
          // dimensions preserving the aspect ratio. This is NOT what
          // is explained in http://ngcordova.com/docs/plugins/imagePicker/
          height: 100, 
          width: 100,
        }).then(function(results) {
            if (results.length) {
              console.log("Load picture: " + results[0]);
              $scope.registration.imgSrc = results[0];
            }
        }, function(err) {
            console.log("getPictures: " + err);
        });

        $scope.registerform.show();

    }

  });

  // RESERVE TABLE

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
    if (typeof url === "undefined") {
      return "";
    }

    return baseURL + url;
  }
})

.controller('MenuController', ['$rootScope', '$scope', 'dishes', 'baseURL', 'favoriteFactory', 
                               '$ionicListDelegate', '$ionicPopup', '$ionicLoading',
                               '$localStorage', 
                               '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast',
                               '$cordovaVibration',
                               function($rootScope, $scope, dishes, baseURL, favoriteFactory, 
                                   $ionicListDelegate, $ionicPopup, $ionicLoading,
                                   $localStorage,
                                   $ionicPlatform, $cordovaLocalNotification, $cordovaToast,
                                   $cordovaVibration) {

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
  $scope.message = '';

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

    // TODO: factore out that code to the App controller to
    // reduce code duplication.
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

  $scope.deleteFavorite = function(id) {
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

        // FIXME: Factore me out to avoid duplication (esp. the duration parameter)
        //        Better design would use event on add/remove favorite
        // ONLY wrapped in $ionicPlatform.ready() for conformance with the assignment requirements
        // but this is subject to discussions.
        // See https://www.coursera.org/learn/hybrid-mobile-development/discussions/hX2UGci6EeW-3A75XHu5kw
        $ionicPlatform.ready(function() {
          $cordovaVibration.vibrate(100);
        });
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
                                      '$ionicPlatform', '$cordovaLocalNotification', 
                                      '$cordovaToast',
                                      '$cordovaVibration',
                                     function($scope, dish, $stateParams, baseURL, favoriteFactory, 
                                       $ionicPopover, $ionicPopup, $ionicModal,
                                       $localStorage,
                                       $ionicPlatform, $cordovaLocalNotification, 
                                       $cordovaToast,
                                       $cordovaVibration) {

  $scope.baseURL = baseURL;

  $scope.dish = dish;
  $scope.showDish = false;
  $scope.message = '';

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
    author: $localStorage.getObject('userinfo', '{"username":""}').username,
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

      // TODO: factore out that code to the App controller to
      // reduce code duplication.
      $ionicPlatform.ready(function () {
        $cordovaLocalNotification.schedule({
            id: 1, // FIXME: should we update the id globally for the whole app ?
            title: "Added Favorite",
            text: 'Added Favorite ' + $scope.dish.name,
        }).then(function () {
            console.log('Notification send '+ $scope.dish.name);
        },
        function () {
            console.log('Failed to send notification ');
        });

        $cordovaToast
          .show('Added Favorite '+ $scope.dish.name, 'long', 'bottom')
          .then(function (success) {
            console.log('Notification send '+ $scope.dish.name);
          }, function (error) {
            console.log('Failed to put toast notification ');
          });
      });

    });
  };

  $scope.deleteFavorite = function(id) {
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

        // FIXME: Factore me out to avoid duplication (esp. the duration parameter)
        //        Better design would use event on add/remove favorite
        // ONLY wrapped in $ionicPlatform.ready() for conformance with the assignment requirements
        // but this is subject to discussions.
        // See https://www.coursera.org/learn/hybrid-mobile-development/discussions/hX2UGci6EeW-3A75XHu5kw
        $ionicPlatform.ready(function() {
          $cordovaVibration.vibrate(100);
        });
      }
    });
    if (typeof $ionicListDelegate != "undefined") {
      $ionicListDelegate.closeOptionButtons();
    }
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

.controller('IndexController', ['leader', 'dish', 'promotion', 'baseURL', '$scope', '$location',
  function(leader, dish, promotion, baseURL, $scope, $location) {
  
  console.log("Start of IndexController");

    $scope.baseURL = baseURL;
    
    $scope.dish = dish;
    $scope.promotion = promotion;
    $scope.leader = leader;

    leader.$promise.then(function(data) {
      leader = data[0];
    });

    $scope.go = function(path) {
      $location.path( path );
    };
  }

])


.controller('AboutController', ['leaders', '$scope', 'baseURL',
  function(leaders, $scope, baseURL) {

    $scope.baseURL = baseURL;


    $scope.leaders = leaders;
    $scope.showLeaders = false;
    $scope.message = '';
  }
])

;
