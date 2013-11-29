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
    
    $routeProvider.when('/allquestions', {
        templateUrl: 'questions.html',
        controller: "AllQuestionsController',
    });
    
    $routeProvider.otherwise({ redirectTo: '/login' });
});

app.controller('LoginController', function($scope, $location) {
    $scope.credentials = { username: "", password: "" };
    $scope.alerts = { newClass: "hidden", message: "" };
    
    $scope.login = function() {
      if (($scope.credentials.username === "admin" || $scope.credentials.username === "Admin") && $scope.credentials.password === "test") {
        $location.path('/home'); 
      } else if($scope.credentials.username === "" || $scope.credentials.password === "") {
          $scope.alerts.message = 'Please fill in the required fields';
          $scope.alerts.newClass = 'visible';
      } else {
        $scope.alerts.newClass = 'visible';
        $scope.alerts.message = 'Wrong username or password.';  
      }
    };
    
    $scope.register = function() {
        $location.path('/register');   
    }

});


app.controller('HomeController', function($scope, $http, $location) {
    $scope.message = "Welcome to ";
    
    
    $scope.newquestion = function() {
        $scope.message = "The awesome ";
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


app.controller('RegisterController', function($scope) {
    
});

app.controller('QuestionController', function($scope) {

});

