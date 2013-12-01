var whenIn = angular.module("WhenIn", ['ionic', 'ngRoute', 'ngAnimate']);

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
    
    $routeProvider.otherwise({
        redirectTo: '/home'
    });
});

whenIn.controller('LoginCtrl', function($scope, $location, $timeout) {
    $scope.headerTitle = "WhenIn";
    
    $scope.credentials = { username: "", password: ""};
    $scope.gotoregister = function() {
        $location.path('/register');   
    }

    $scope.errorClass = "errorHandlingResting";
    
    $scope.login = function() {
        
        if($scope.credentials.username === "" || $scope.credentials.password === "") {
          $scope.errorClass = "errorhandlingActive";
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
      
});

whenIn.controller('RegCtrl', function($scope, $location, $timeout) {
    
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

whenIn.controller('AddCtrl', function($scope, $location, $timeout) {
  $scope.toggleMenu = function() {
          $scope.sideMenuController.toggleLeft();
    };
    
    $scope.addquestion = function(q) {
        var Question = Parse.Object.extend("Questions");
        var question = new Question();
        
        question.set("header", q.questionHeader);
        question.set("question", q.questionText);
        
        
        question.save(null, {
          success: function() {
            $timeout(function() {
                console.log("question added");
            }, 100);
           
          }
        });
    };    
});

