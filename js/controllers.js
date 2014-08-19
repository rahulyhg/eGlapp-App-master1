angular.module('starter.controllers', ['restservicemod'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, RestService) {
  // Form data for the login modal
  $scope.loginData = {};
   $scope.loginlogout="Login";
    $scope.isloggedin=0;
    //authentication
    var authenticate=function(data, status){
          if(data!="false")
          {
              $scope.loginlogout="Logout";
            $scope.isloggedin=1;
          }
        };
        RestService.authenticate().success(authenticate);
    //authentication
  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  },

  // Open the login modal
  $scope.login = function() {
      if($scope.isloggedin==0)
      {
        $scope.modal.show();
      }else{
          var logout=function(data, status){
            $scope.loginlogout="Login";
            $scope.isloggedin=0;
          };
        RestService.logout().success(logout);
      }
  };

  // Perform the login action when the user submits the login form
    var login=function(data, status){
        console.log(data);
    };
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);
      RestService.login($scope.loginData.username,$scope.loginData.password).success(login);
    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('DiscoverCtrl', function($scope, $stateParams, RestService) {
        var home=function(data, status){
            console.log(data);
            $scope.find=data;
        };
        $scope.id="3";
        RestService.findcategoryevent($scope.id).success(home);
})

.controller('DiscoverinnerCtrl', function($scope, $stateParams, RestService) {
        $scope.id=$stateParams.id;
        console.log($scope.id);
    
    //aunthenticate
        var authenticate=function(data, status){
        if(data!="false")
          {
            $scope.uid=data.id;
            $scope.isloggedin=1;
            $scope.loginlogout="Logout";
          }
        };
        RestService.authenticate().success(authenticate);
    //aunthenticate
    
        var find= function (data, status) {
            console.log(data);
             $scope.event = data;
        };
        
            RestService.findone($stateParams.id).success(find);
    //savedevents#########################3
        var saved=function(data, status){
            if(data==1)
            {
                alert("Event Saved");
            }else{
                alert("Already Saved");
            }
        };
        $scope.saveevent=function(){
            RestService.savedevents($scope.uid,$scope.id).success(saved);
        };
    //savedevents#########################3
})

.controller('MyticketsCtrl', function($scope, $stateParams, RestService) {
    $scope.loginlogout="Login";
    $scope.isloggedin=0;
    var userticket=function(data,status){
           console.log(data);
           $scope.data=data;
       };
    var authenticate=function(data, status){
        if(data!="false")
          {
              RestService.getuserticket(data.id).success(userticket);
            //console.log(data.id);
            $scope.isloggedin=1;
            $scope.loginlogout="Logout";
          }
        };
        RestService.authenticate().success(authenticate);
})

.controller('PrintticketCtrl', function($scope, $stateParams, RestService) {
    $scope.uid=$stateParams.uid;
    $scope.id=$stateParams.id;
    var printticket=function(data, status){
            console.log(data);
            $scope.printticket=data;
        };
    RestService.printticket($stateParams.uid,$stateParams.id).success(printticket);
})

.controller('SavedeventsCtrl', function($scope, $stateParams, RestService) {
    //aunthenticate
        var getevents=function(data, status){
        console.log(data);
        $scope.uevent=data;
        };
        var authenticate=function(data, status){
        if(data!="false")
          {
            $scope.uid=data.id;
            RestService.getsavedevents($scope.uid).success(getevents);
            $scope.isloggedin=1;
            $scope.loginlogout="Logout";
          }
        };
        RestService.authenticate().success(authenticate);
    //aunthenticate
    
    
});
