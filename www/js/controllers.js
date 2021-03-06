angular.module('musicapp.controllers', [])


.controller('ArtistCtrl', function($http,MusicService,$log,loginService,$scope) {
  var vm = this;
  var showing = false; 
  vm.getTracks = getTracks; 
  vm.searchTrack = searchTrack; 
  vm.isEnter = isEnter;
  vm.embedSong = embedSong;
  vm.streamSong = streamSong;
  vm.streamPause = streamPause; 
  vm.initCloud = MusicService.soundCloud.scInit();
  vm.mySC = MusicService.soundCloud;
  vm.user = loginService.currentUser.uid;
  vm.getUserSettings = getUserSettings;
  vm.warn = function(message){
    loginService.showAlert("Warning!","You are swipey!!!!");
  }

  $scope.$on('$ionicView.enter',function(e){
    getUserSettings(); 
  });


  function getUserSettings(){
    var id = vm.user; 
    var ref = firebase.database().ref().child('user_information/');
    ref.child(id).once('value',function(snapshot){
      var data = snapshot.val();
      vm.showingWidget = data.embed_player;
    })
  } 

 function embedSong(song){
  console.log("Embed song")
     var container = document.getElementById('soundCloudWidget');
     $log.info(container);
     vm.showingWidget = true; 
     event.stopPropagation();
     vm.mySC.embedSong(song,container);
 }


 function streamSong(song){
    event.stopPropagation();
    vm.mySC.scInit();
    vm.mySC.streamSong(song).then(function(currentStream){
      vm.currentStream = currentStream;
    })
 }

 function streamPause(song){
  vm.mySC.streamPause(song);
  vm.isStreaming = false; 
 }

  function isEnter(key){
    return MusicService.isEnter(key)
  }

  function searchTrack(query,key){
   if (isEnter(key)){
      vm.searchResults = {};
      vm.mySC.scInit();
      vm.mySC.searchTrack(query).then(function(tracks){
        vm.searchResults = tracks; 
      });
    }
  }
 
  function getTracks(){
      vm.mySC.scInit();
      vm.mySC.getTracks().then(function(tracks){
      vm.searchResults = tracks;
    });
  }
  getUserSettings();
   getTracks();
})

.controller('callbackCtrl',function($timeout,MusicService){
  vm = this; 
  vm.close = MusicService.close;
  vm.MusicService = MusicService; 
})

.controller('landingCtrl', function (loginService,$q,MusicService,$http,$scope, $firebaseAuth, $state, $log, $firebaseObject) {
  vm = this;
  vm.showLogin = false;
  vm.loginWithEmail = loginWithEmail;
  vm.showEmailLogin = showEmailLogin;
  vm.isEnter = isEnter; 
  vm.signInProvider = signInProvider;
  vm.showAlert = loginService.showAlert;

      function signInProvider(){
          loginService.signIn('google').then(function(data){
            if (loginService.user){
                  $state.go('tab.artist');
            } else {
                vm.showAlert("Login failed!","Something went wrong logging in and stuff. My bad.");
            }
        },function(data){
          console.log(data); 
        })
      }


      function isEnter(key){
        return MusicService.isEnter(key)
      }

      function showEmailLogin() {
        vm.showLogin = !vm.showLogin;
      }


        function loginWithEmail(key) {
            if (isEnter(key)){
              console.log(vm.email);
              if (vm.email !== undefined && vm.password !== undefined){
                loginService.loginWithEmail(vm.email,vm.password).then(function(data){
                  if (data.uid !== undefined){
                    vm.email = '';
                    vm.password = '';
                    vm.showLogin = !vm.showLogin;
                    $state.go('tab.artist');
                  }
                });
              } else {
                vm.showAlert("Login failed","The Email or Password is invalid!");
              }
            }
        }
      })


    .controller('SongsCtrl', function($scope, bandsintown,$log,MusicService) {
      var song = this; 
      song.getResults = getResults;
      song.isEnter = isEnter; 

      function isEnter(key){
        return MusicService.isEnter(key)
      }
      function getResults(query,key){
        if(isEnter(key)){
          $log.info("Getting results");
          bandsintown.getBand(query).then(function(response){
             song.resultsBand = response; 
             $log.info(song.resultsBand)
          })
        }
      }
    })
    .controller('AccountCtrl', function($scope,loginService,$firebaseArray,$firebaseObject,$log,$state) {
      var vm = this;
      vm.getUserSettings = getUserSettings;
      vm.toggleSetting   = toggleSetting;
      vm.user            = loginService.currentUser;
      vm.signout         = signOut; 

      function signOut(){
        msg = "Signing out";
        loginService.signOut(msg);
        $state.go('landing');
      }
    
      function toggleSetting(id,setting,set){
        var user = vm.user; 
        var ref = firebase.database().ref().child('user_information/');
        console.log(user.uid)
        ref.child(id).once("value",function(snapshot){
          var data = snapshot.val();
          ref.child(id).child(setting).set(set);
        })
        console.log(vm.settings)
      }
    
      $scope.$on('$ionicView.enter',function(e){
        getUserSettings(); 
      });


      function getUserSettings(){
        var ref = firebase.database().ref().child('user_information/').child(loginService.currentUser.uid);
         vm.settings = $firebaseObject(ref);
      }
});

