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

/*
||  Login Controller
*/


whenIn.controller('LoginCtrl', function($scope, $location, $timeout, $route) {
    $scope.reloadPage = function() {
        $route.reload();
    };
    
    $scope.headerTitle = "WhenIn";
    
    $scope.credentials = { username: "", password: ""};
    
    $scope.gotoregister = function() {
        $location.path('/register');   
    }

    $scope.errorClass = "errorHandlingResting";
    $scope.errormessage = "temp";
    
    
    // Loginfunksjon som sjekker bruker mot input og mot Parse og gir 
    // tilbakemelding hvis det blir problemer, eller videresender hvis funksjonen er vellykket
    
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

/*
||  Menu Controller
*/

whenIn.controller('MenuCtrl', function($scope, $location) {
    
    
    // Setter opp det ulike viewsen
    
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

/*
||  Home Controller
*/

whenIn.controller('HomeCtrl', function($scope, $location, $timeout, Modal, $http, $route) {
 
    $scope.toggleMenu = function() {
          $scope.sideMenuController.toggleLeft();
    };
    
    // Reload funksjon for refreshern
     $scope.reloadPage = function() {
        $timeout(function(){
            $route.reload();
        }, 500);
         
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
    $scope.currentUser = Parse.User.current();

    
    // Legger til nytt spørsmål og refresher siden hvis det lykkes
      
    var Question = Parse.Object.extend("Questions");
    var question = new Question();
    
    question.set("header", form.questionHeader);
    question.set("question", form.questionText);
    question.set("name", $scope.currentUser.attributes.name);
    question.set("city", "Oslo");

    question.save(null, {
        success: function() {
            $timeout(function() {
                console.log("Question added.");
                $route.reload();
            }, 100);
          }
        });
    };  
    
    
    // Henter ut spørsmålen fra Parse
    
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

    
    
    // Initierer kart
    
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
                
                
                // Lagrer info om nåværende punkt
                $http.get($scope.urlinfo).then(function(res){
                
                    $scope.findmeh = res.data;
                    $scope.locality = $scope.findmeh.results[0].address_components[2].long_name;
                    console.log($scope.findmeh.results[0].address_components[2].long_name);
                    console.log($scope.findmeh);
                  
                });
                $scope.$apply();
            }, function () {
                
            });
        }	
    })();
 
});

/*
||  Register Controller
*/

whenIn.controller('RegCtrl', function($scope, $location, $timeout) {
    $scope.gotologin = function() {
      $location.path('/login');
    };
    
    // Signupfunksjon for tillegging av bruker
    $scope.signup = function(register) {
        var user = new Parse.User();
        user.set("username", register.username);
        user.set("name", register.name);
        user.set("email", register.mail);
        user.set("password", register.password);
    
        user.signUp(null, {
              success: function(user) {
                // Let admin know user is added
                  $scope.currentUser = Parse.User.current();
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

/*
||  Arkiv Controller
*/

whenIn.controller('ArchiveCtrl', function($scope, $location, $timeout) {
        
    $scope.toggleMenu = function() {
          $scope.sideMenuController.toggleLeft();
    };
    
    // Henter ut spørsmål, igjen :/ 
    
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

/*
||  Bruker Controller
*/

whenIn.controller('UserCtrl', function($scope, $location, $timeout, $route) {
        
    $scope.toggleMenu = function() {
          $scope.sideMenuController.toggleLeft();
    };
    
    $scope.user = Parse.User.current();
    
    // Setter edit for toggle funksjonen
    $scope.edit = true;

    $scope.goback = function() {
        $location.path('/home');
    
    };
    
    $scope.editProfile = function() {
        $scope.edit = $scope.edit === false ? true: false;
    };
    
    
    // Sparer profil til Parse
    $scope.saveProfile = function(profile) {

        var query = new Parse.Query(Parse.User);
        query.equalTo("username", $scope.user.attributes.username);  
        query.find({
            success: function(results) {
                results[0].set("password", profile.password);
                results[0].set("username", profile.username);
                results[0].set("email", profile.email);
                results[0].set("name", profile.name);
                results[0].save(null, {
                  success: function(results) {
                    $scope.user = Parse.User.current();
                    $timeout(function() {
                        $scope.confirmedProfile = "confirmedProfile";
                        $timeout(function() {
                            $route.reload();
                        }, 500);
                    }, 500);
                }
            });    
                
            }
        });
    
    };
});


/*
||  Legg til spørsmål Controller
*/

whenIn.controller('AddCtrl', function($scope, $location, $timeout) {
  $scope.toggleMenu = function() {
          $scope.sideMenuController.toggleLeft();
    };
    
    $scope.currentUser = Parse.User.current();
    
    // Funksjon for å legge til spørsmål
    
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
/*
||  Map Controller
*/
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


// Eget direktiv for å få appen til å kjenne igjen "enter"-klikk
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
