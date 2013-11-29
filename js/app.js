var app = angular.module("app", ['ngRoute', 'google-maps']).config(function($routeProvider) {
    $routeProvider.when('/login', {
        templateUrl: 'login.html',
        controller: 'LoginController'
    });
    
    $routeProvider.when('/home', {
        templateUrl: 'home.html',
        controller: 'HomeController'
    });
    
    $routeProvider.when('/register', {
       templateUrl: 'register.html',
        controller: 'RegisterController'
    });
    
    $routeProvider.when('/addquestion', {
        templateUrl: 'addquestion.html',
        controller: 'QuestionController'
    });
    
    $routeProvider.when('/user', {
        templateUrl: 'user.html',
        controller: 'UserController'
    });
    
    $routeProvider.when('/questions', {
        templateUrl: 'questions.html',
        controller: 'AllQuestionsController'
    });
    
    
    $routeProvider.otherwise({ redirectTo: '/login' });
});

app.controller('LoginController', function($scope, $location, $timeout) {
    $scope.credentials = { username: "", password: "" };
    $scope.alerts = { newClass: "hidden", message: "" };
    
    $scope.register = function() {
        $location.path('/register');   
    }
    
    $scope.login = function() {
        
        if($scope.credentials.username === "" || $scope.credentials.password === "") {
          $scope.alerts.message = 'Please fill in the required fields';
          $scope.alerts.newClass = 'visible';
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
                        $scope.alerts.newClass = 'visible';
                        $scope.alerts.message = 'Wrong username or password.';  
                    }, 100);
                }
                
            }); 
        }  
    }
});


app.controller('HomeController', function($scope, $http, $location) {    
    $scope.user = Parse.User.current();
    
    $scope.logout = function() {
        Parse.User.logOut();
        $scope.currentUser = null;
        $location.path('/login');
        $scope.fullname = "";
    }; 
    
    $scope.userprofile = function() {
        $location.path('/user');
    };
    
    $scope.addquestion = function() {
        $location.path('/addquestion');
    };
    
    $scope.allquestions = function() {
        $location.path('/questions');
    };
    
    $http.get('data/cities.json').then(function(res){
          $scope.cities = res.data;                
    });
    
    
    
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
    
    $scope.addquestion = function() {
        $location.path('/addquestion');
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


app.controller('RegisterController', function($scope, $timeout, $location) {
    $scope.goback = function() {
        $location.path('/login');
    };
    
    $scope.signup = function(form) {
        var user = new Parse.User();
        user.set("username", form.username);
        user.set("name", form.name);
        user.set("email", form.mail);
        user.set("password", form.password);
    
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

app.controller('QuestionController', function($scope, $location, $timeout) {
    $scope.alerts = { newClass: "hidden", message: "" };
    
    $scope.goback = function() {
        $location.path('/home');
    };
    
    $scope.addquestion = function(form) {
        var Question = Parse.Object.extend("Questions");
        var question = new Question();
        
        question.set("header", form.qHeader);
        question.set("question", form.qText);
   
        question.save(null, {
          success: function() {
            $timeout(function() {
                $scope.alerts.message = 'Question added';
                $scope.alerts.newClass = 'passchange';
            }, 100);
            $timeout(function() {
                $location.path('/questions');
            }, 2000);
          }
        });
    };
    
    
        
});

app.controller('UserController', function($scope, $location, $timeout) {
    $scope.user = Parse.User.current();
    
    $scope.alerts = { newClass: "hidden", message: "" };

    
    $scope.goback = function() {
        $location.path('/home');
    
    };
    
    $scope.changepassword = function() {
        console.log($scope.newpassword);

        var query = new Parse.Query(Parse.User);
        query.equalTo("username", $scope.user.attributes.username);  
        query.find({
            success: function(results) {
                results[0].set("password", $scope.newpassword);
                results[0].save(null, {
                  success: function(results) {
                    $timeout(function() {
                        $scope.alerts.message = 'Password changed';
                        $scope.alerts.newClass = 'passchange';
                    }, 100);
            
                }
            });    
                
            }
        });
    
    };
    console.log($scope.user.attributes.name);

});

app.controller('AllQuestionsController', function($scope, $timeout, $location) {
    $scope.goback = function() {
        $location.path('/home');
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