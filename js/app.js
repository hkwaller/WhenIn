var whenIn = angular.module("WhenIn", ['ionic', 'ngRoute', 'ngAnimate', 'google-maps', 'geolocation']);

whenIn.config(function($routeProvider, $locationProvider) {
    $routeProvider.when('/home', {
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl'    
    });
    
    $routeProvider.when('/login', {
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
    });
    
    $routeProvider.when('/register', {
        templateUrl: 'templates/register.html',
        controller: 'RegCtrl'
    });
    
    $routeProvider.when('/user', {
        templateUrl: 'templates/user.html',
        controller: 'UserCtrl'
    });
    
    $routeProvider.when('/archive', {
        templateUrl: 'templates/archive.html',
        controller: 'ArchiveCtrl'
    });
    
    $routeProvider.when('/add', {
        templateUrl: 'templates/add.html',
        controller: 'AddCtrl'
    });
    
    $routeProvider.when('/map', {
        templateUrl: 'templates/map.html',
        controller: 'MapCtrl'
    });

    $routeProvider.otherwise({
        redirectTo: '/login'
    });
});

whenIn.controller('LoginCtrl', function($scope, $location, $timeout) {
    $scope.headerTitle = "WhenIn";
    
    $scope.credentials = { username: "", password: ""};
    
    $scope.gotoregister = function() {
        $location.path('/register');   
    }

    $scope.errorClass = "errorHandlingResting";
    $scope.errormessage = "temp";
    
    
    $scope.login = function() {
        
        if($scope.credentials.username === "" || $scope.credentials.password === "") {
          $scope.errorClass = "errorhandlingActive";
          $scope.errormessage = "Both fields are required";
        } else {
             Parse.User.logIn($scope.credentials.username, $scope.credentials.password, {
                success: function(user) {
                    $scope.currentUser = user;
                    $scope.$apply();
                    
                    $timeout(function(){
                        $location.path("/home");
                    }, 100);
                },
                error: function(user, error) {
                    $timeout(function(){
                        $scope.errorClass = 'errorhandlingActive';
                        $scope.errormessage = 'Wrong username or password.';  
                    }, 100);
                }
                
            }); 
        }  
    }

});

whenIn.controller('MenuCtrl', function($scope, $location) {
       
    $scope.showProfile = function() {
        $location.path('/user');
    };  
    
    $scope.showArchive = function() {
        $location.path('/archive');
    };
    
    $scope.addQuestion = function() {
        $location.path('/add');
    };
    
    $scope.goHome = function() {
        $location.path('/home');
    };
    
    $scope.showMap = function() {
        $location.path('/map');
    };
    
    $scope.logout = function() {
        Parse.User.logOut();
        $location.path('/login');
    };
    

});

whenIn.controller('HomeCtrl', function($scope, $location, $timeout, Modal, $http) {
 
    $scope.toggleMenu = function() {
          $scope.sideMenuController.toggleLeft();
    };
    
    Modal.fromTemplateUrl('modal.html', function(modal) {
    $scope.modal = modal;
  }, {
    scope: $scope,
    animation: 'slide-in-up'
  });

  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function(form) {
    $scope.modal.hide();
    
    var Question = Parse.Object.extend("Questions");
    var question = new Question();
    
    question.set("header", form.questionHeader);
    question.set("question", form.questionText);

    question.save(null, {
        success: function() {
            $timeout(function() {
                console.log("Question added.");
            }, 100);
          }
        });
    };  
    
    $scope.questions = [];
    
   var qQuery = Parse.Object.extend("Questions");
    
    var query = new Parse.Query(qQuery);
    query.descending("createdAt");
    query.limit(3);

    var questions = [];
    
     query.find({
      success: function(results) {
        for (var i = 0; i < results.length; i++) {
            questions.push(results[i]);   
        };
      }
    }); 
    
    $timeout(function(){
        $scope.questions = questions;
    }, 1000);
    
    
    
    
    $scope.center = { latitude: 59.92960173988886, 
                    longitude: 10.731727894442757, };
    
    $scope.markClick = true;
    $scope.zoom = 13;
    $scope.fit = true;
    
    $scope.geolocationAvailable = navigator.geolocation ? true : false;
    
    $scope.markers = [];
                
    $scope.markerLat = null;
    $scope.markerLng = null;
    
    $scope.addmarker = function () {
        $scope.markers.push({
            latitude: parseFloat($scope.markerLat),
            longitude: parseFloat($scope.markerLng)
        });
        
        $scope.markerLat = null;
        $scope.markerLng = null;
    };
    
    (function() {  
        
        if ($scope.geolocationAvailable) {
            
            navigator.geolocation.getCurrentPosition(function (position) {
                $scope.center = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
               $scope.markers.push({latitude: position.coords.latitude,
                    longitude: position.coords.longitude});
                
                $scope.latitude = $scope.markers[0].latitude;
                $scope.longitude = $scope.markers[0].longitude;

                $scope.urlinfo = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + $scope.latitude + "," + $scope.longitude + "&sensor=true";
                
                $http.get($scope.urlinfo).then(function(res){
                
                    $scope.findmeh = res.data;
                    console.log($scope.findmeh.results[2].address_components[0].long_name);
                  
                });
                $scope.$apply();
            }, function () {
                
            });
        }	
    })();
 
});

whenIn.controller('RegCtrl', function($scope, $location, $timeout) {
    $scope.gotologin = function() {
      $location.path('/login');
    };
    
    $scope.signup = function(register) {
        var user = new Parse.User();
        user.set("username", register.username);
        user.set("name", register.name);
        user.set("email", register.mail);
        user.set("password", register.password);
    
        user.signUp(null, {
              success: function(user) {
                // Let admin know user is added
                  
                  $timeout(function(){
                      $location.path('/home');
                      (function() {
                      
                      
                      } ());
                      
                  }, 500);
              },
              error: function(user, error) {
                // Error handling
                  
              }
        });  
    };
    
    
    
});

whenIn.controller('ArchiveCtrl', function($scope, $location, $timeout) {
        
    $scope.toggleMenu = function() {
          $scope.sideMenuController.toggleLeft();
    };
    
    var qQuery = Parse.Object.extend("Questions");
    
    var query = new Parse.Query(qQuery);
    query.descending("createdAt");

    var questions = [];
    
     query.find({
      success: function(results) {
        for (var i = 0; i < results.length; i++) {
            questions.push(results[i]);   
        };
      }
    }); 
    
    $timeout(function(){
        console.log(questions);
        $scope.allQuestions = questions;
    }, 1000);

});

whenIn.controller('UserCtrl', function($scope, $location, $timeout) {
        
    $scope.toggleMenu = function() {
          $scope.sideMenuController.toggleLeft();
    };
    
    $scope.user = Parse.User.current();
    
    $scope.edit = true;

    $scope.goback = function() {
        $location.path('/home');
    
    };
    
    $scope.editProfile = function() {
        $scope.edit = $scope.edit === false ? true: false;
    };
    
    $scope.saveProfile = function(profile) {

        var query = new Parse.Query(Parse.User);
        query.equalTo("username", $scope.user.attributes.username);  
        query.find({
            success: function(results) {
                results[0].set("password", $scope.profile.password);
                results[0].set("username", $scope.profile.username);
                results[0].set("email", $scope.profile.email);
                results[0].set("name", $scope.profile.name);
                results[0].save(null, {
                  success: function(results) {
                    $timeout(function() {
                        $scope.confirmedProfile = "confirmedProfile";
                    }, 100);
            
                }
            });    
                
            }
        });
    
    };
});

whenIn.controller('AddCtrl', function($scope, $location, $timeout) {
  $scope.toggleMenu = function() {
          $scope.sideMenuController.toggleLeft();
    };
    
    $scope.currentUser = Parse.User.current();
    
    $scope.addquestion = function(q) {
        var Question = Parse.Object.extend("Questions");
        var question = new Question();
        
        question.set("header", q.questionHeader);
        question.set("question", q.questionText);
        question.set("name", $scope.currentUser.attributes.name);
        question.set("city", "Oslo");

        
        question.save(null, {
          success: function() {
            $timeout(function() {
                console.log("question added");
                $location.path('/archive');
            }, 100);
           
          }
        });
    };    
});

whenIn.controller('MapCtrl', function($scope, $http) {
    $scope.toggleMenu = function() {
          $scope.sideMenuController.toggleLeft();
           
    };
    $scope.center = { latitude: 59.92960173988886, 
                    longitude: 10.731727894442757, };
    
    $scope.markClick = true;
    $scope.zoom = 16;
    $scope.fit = true;
    
    $scope.geolocationAvailable = navigator.geolocation ? true : false;
    
    $scope.markers = [];
                
    $scope.markerLat = null;
    $scope.markerLng = null;
    
    $scope.addmarker = function () {
        $scope.markers.push({
            latitude: parseFloat($scope.markerLat),
            longitude: parseFloat($scope.markerLng)
        });
        
        $scope.markerLat = null;
        $scope.markerLng = null;
    };
    
    (function() {  
        
        if ($scope.geolocationAvailable) {
            
            navigator.geolocation.getCurrentPosition(function (position) {
                $scope.center = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
               $scope.markers.push({latitude: position.coords.latitude,
                    longitude: position.coords.longitude});
                
                $scope.latitude = $scope.markers[0].latitude;
                $scope.longitude = $scope.markers[0].longitude;

                $scope.urlinfo = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + $scope.latitude + "," + $scope.longitude + "&sensor=true";
                
                $http.get($scope.urlinfo).then(function(res){
                
                    $scope.findmeh = res.data;
                    console.log($scope.findmeh.results[2].address_components[0].long_name);
                  
                });
                $scope.$apply();
            }, function () {
                
            });
        }	
    })();
});

whenIn.directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if(event.which === 13) {
                    scope.$apply(function(){
                        scope.$eval(attrs.ngEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    });
