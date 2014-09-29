var mypopup=0;

var authenticate=$.jStorage.get("authenticate");
window.uploadUrl = 'upload.php';
angular.module('starter.controllers', ['restservicemod','angularFileUpload','ngCordova'])
//...........................upload image

.controller('MyCtrl', function($scope, $http, $timeout, $upload,RestService) {
	$scope.usingFlash = FileAPI && FileAPI.upload != null;
	$scope.fileReaderSupported = window.FileReader != null && (window.FileAPI == null || FileAPI.html5 != false);
	$scope.uploadRightAway = true;
	$scope.changeAngularVersion = function() {
		window.location.hash = $scope.angularVersion;
		window.location.reload(true);
	};
	$scope.hasUploader = function(index) {
		return $scope.upload[index] != null;
	};
	$scope.abort = function(index) {
		$scope.upload[index].abort(); 
		$scope.upload[index] = null;
	};
	$scope.angularVersion = window.location.hash.length > 1 ? (window.location.hash.indexOf('/') === 1 ? 
			window.location.hash.substring(2): window.location.hash.substring(1)) : '1.2.20';
	$scope.onFileSelect = function($files) {
		$scope.selectedFiles = [];
		$scope.progress = [];
		if ($scope.upload && $scope.upload.length > 0) {
			for (var i = 0; i < $scope.upload.length; i++) {
				if ($scope.upload[i] != null) {
					$scope.upload[i].abort();
				}
			}
		}
		$scope.upload = [];
		$scope.uploadResult = RestService.getuploads();
		$scope.selectedFiles = $files;
		$scope.dataUrls = [];
		for ( var i = 0; i < $files.length; i++) {
			var $file = $files[i];
			if ($scope.fileReaderSupported && $file.type.indexOf('image') > -1) {
				var fileReader = new FileReader();
				fileReader.readAsDataURL($files[i]);
				var loadFile = function(fileReader, index) {
					fileReader.onload = function(e) {
						$timeout(function() {
							$scope.dataUrls[index] = e.target.result;
						});
					}
				}(fileReader, i);
			}
			$scope.progress[i] = -1;
			if ($scope.uploadRightAway) {
				$scope.start(i);
			}
		}
	};
	
	$scope.start = function(index) {
		$scope.progress[index] = 0;
		$scope.errorMsg = null;
		if ($scope.howToSend == 1) {
			$scope.upload[index] = $upload.upload({
				url: uploadUrl,
				method: $scope.httpMethod,
				headers: {'my-header': 'my-header-value'},
				data : {
					myModel : $scope.myModel
				},
				/* formDataAppender: function(fd, key, val) {
					if (angular.isArray(val)) {
                        angular.forEach(val, function(v) {
                          fd.append(key, v);
                        });
                      } else {
                        fd.append(key, val);
                      }
				}, */
				/* transformRequest: [function(val, h) {
					console.log(val, h('my-header')); return val + '-modified';
				}], */
				file: $scope.selectedFiles[index],
				fileFormDataName: 'file'
			});
			$scope.upload[index].then(function(response) {
				$timeout(function() {
					$scope.uploadResult.push(response.data);
                   
				});
			}, function(response) {
				if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
			}, function(evt) {
				// Math.min is to fix IE which reports 200% sometimes
				$scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
			});
			$scope.upload[index].xhr(function(xhr){
//				xhr.upload.addEventListener('abort', function() {console.log('abort complete')}, false);
			});
		} else {
			var fileReader = new FileReader();
            fileReader.onload = function(e) {
		        $scope.upload[index] = $upload.http({
		        	url: uploadUrl,
					headers: {'Content-Type': $scope.selectedFiles[index].type},
					data: e.target.result
		        }).then(function(response) {
					$scope.uploadResult.push(response.data);
				}, function(response) {
					if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
				}, function(evt) {
					// Math.min is to fix IE which reports 200% sometimes
					$scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
				});
            }
	        fileReader.readAsArrayBuffer($scope.selectedFiles[index]);
		}
	};
	
	$scope.dragOverClass = function($event) {
		var items = $event.dataTransfer.items;
		var hasFile = false;
		if (items != null) {
			for (var i = 0 ; i < items.length; i++) {
				if (items[i].kind == 'file') {
					hasFile = true;
					break;
				}
			}
		} else {
			hasFile = true;
		}
		return hasFile ? "dragover" : "dragover-err";
	};
})
//...........................upload image
.controller('AppCtrl', function($scope, $ionicModal, $timeout, RestService) {
  // Form data for the login modal
  $scope.loginData = {};
   $scope.loginlogout="Login";
    $scope.isloggedin=0;
    //authentication
    
        if(RestService.authenticate()!=false)
          {
            //$scope.uid=data.id;
             // console.log(data.id);
            $scope.isloggedin=1;
            $scope.loginlogout="Logout";
          }
        
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
    var loginn=function(data, status){
       $.jStorage.set('authenticate',data);
        authenticate=$.jStorage.get('authenticate');
        console.log(authenticate.id);
        $scope.isloggedin=1;
            $scope.loginlogout="Logout";
    };
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);
      RestService.login($scope.loginData.username,$scope.loginData.password).success(loginn);
    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('RegisterEvent',function($scope, $ionicPopup, $timeout, $stateParams, RestService) {
    // Pop up for event registered
    $scope.id=$stateParams.id;
    $scope.uid=$stateParams.uid;
    var find= function (data, status) {
            console.log(data);
             
             $scope.event = data;
            console.log($scope.event.tickets[0].id)
        };
    RestService.findone($stateParams.id).success(find);
    
    var ticketsaved=function(data, status){
            console.log(data);
            alert("ticketsaved");
        mypopup = $ionicPopup.show({
            title: 'See you at the event',
            template: '<div class="text-center"><h1 class="ion-ios7-checkmark balanced"></h1>            <p>Registration Complete</p>            <div class="padding">                <button class="button button-block button-light">Discover more events</button>                <button class="button button-block button-stable">View Tickets</button>            </div>        </div>'
        });
        $timeout(function() {
      mypopup.close();
    }, 1000);
        };
    $scope.eventRegistered = function() {
        RestService.saveticket($stateParams.uid,$stateParams.id,$scope.event.tickets[0].id,1).success(ticketsaved);
       /* */
        
        
    };
    
})
        
.controller('DiscoverCtrl', function($scope, $stateParams, RestService) {
        var home=function(data, status){
            console.log(data);
            $scope.find=data;
        };
        var iplatlong = function (data, status){
                    //console.log(data.city);
                    $scope.ipcity=data.city;
                RestService.upcomingevents($scope.ipcity).success(home);
                    };
                    var ipjson = function (data, status){
                        //console.log(data.ip);
                        $scope.myip=data.ip;
                        RestService.getiplatlongjson(data.ip).success(iplatlong);
                    };
                    RestService.getipjson().success(ipjson);
        //$scope.id="3";
       // RestService.find().success(home);
})        
.controller('MyeventsCtrl', function($scope, $stateParams, RestService) {
       var home=function(data, status){
            console.log(data);
            $scope.find=data;
        };
    //aunthenticate
       
        if(RestService.authenticate()!=false)
          {
              RestService.find(authenticate.id).success(home);
              $scope.uid=authenticate.id;
              $scope.isloggedin=1;
              $scope.loginlogout="Logout";
          }
        
    //aunthenticate
    //start make event live
            var eventlive=function(data, status){
                console.log(data);
                RestService.find($scope.uid).success(home);   
            };
            $scope.makelive=function(id){
                RestService.makeeventlive(id).success(eventlive);
            };
    //end make event live
        var eventdeleted = function (data, status) {
	            RestService.find($scope.uid).success(home);
	            alert("Event Deleted");
	        };
	        $scope.deleteevent = function (id) {
	            RestService.deleteevent(id).success(eventdeleted);
	        };
        
})      

.controller('MyprofileCtrl', function($scope, $stateParams, RestService, $http, $timeout, $upload, $cordovaCamera, $cordovaFile) {
    
     console.log("my upload");
     $scope.myupload=RestService.getuploads();
    $scope.getlast=function() {
        return $scope.myupload[$scope.myupload.length-1];
    };
    //aunthenticate
       
	   var user = function (data, status) {
	            console.log(data);
	            $scope.organizer = {};
	            $scope.organizer = data;
	        };
        if(RestService.authenticate()!=false)
          {
	          RestService.findoneuser(authenticate.id).success(user);
              $scope.uid=authenticate.id;
              $scope.isloggedin=1;
              $scope.loginlogout="Logout";
          }
        
    //aunthenticate
    
    
    //Capture Image
    $scope.takePicture = function () {
        var options = {
            quality: 40,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            encodingType: Camera.EncodingType.JPEG
        };

        $cordovaCamera.getPicture(options).then(function (imageData) {
            // Success! Image data is here
            $scope.cameraimage = imageData;
            $scope.uploadPhoto();
        }, function (err) {
            // An error occured. Show a message to the user
        });

        //Upload photo
        var server = 'http://digitalmindsinc.co/eglapp11/admin/index.php/event/uploadfile';

        //File Upload parameters: source, filePath, options
        $scope.uploadPhoto = function () {
            console.log("function called");
            $cordovaFile.uploadFile(server, $scope.cameraimage, options)
                .then(function (result) {
                    console.log(result);
                    result = JSON.parse(result.response);
                    filenameee = result;
                    $scope.filename2 = result.file_name;
                    $scope.addretailer.store_image = $scope.filename2;
                    alert(result);

                }, function (err) {
                    // Error
                    //console.log(err);
                    console.log("Error");
                }, function (progress) {
                    // constant progress updates
                console.log("progress");
                    alert("Progress");
                });

        };

    }
    
    //...................................start saveorganizer.................................................
    var saved = function (data, status) {
	            console.log(data);
	            alert("Organizer Updated");
	        };
	        $scope.saveorganizer = function (organizer) {
                console.log(organizer.logo);
                console.log($scope.getlast());
	            $scope.allvalidation = [{
	                field: $scope.organizer.firstname,
	                validation: ""
                },{
	                field: $scope.organizer.contact,
	                validation: ""
                },{
	                field: $scope.organizer.description,
	                validation: ""
                }];
	            var check = formvalidation();
	            console.log(check);
	            if (check) {
                    if($scope.getlast() || $scope.getlast()=="")
                    {
                        organizer.logo =$scope.getlast();
                    }else{
                        organizer.logo=organizer.logo;
                    }
	                
	                console.log(organizer.logo);
	                console.log(organizer);
	                RestService.saveorganizer(organizer).success(saved);
	            }
	        };

	        function formvalidation() {
	            var isvalid2 = true;
	            for (var i = 0; i < $scope.allvalidation.length; i++) {
	                console.log("checking");
	                console.log($scope.allvalidation[i].field);
	                if ($scope.allvalidation[i].field == "" || !$scope.allvalidation[i].field) {
	                    $scope.allvalidation[i].validation = "ng-dirty";
	                    isvalid2 = false;
	                }
	            }
	            return isvalid2;
	        }
    //...................................end saveorganizer.................................................
       
    
})       
.controller('SponsorCtrl', function($scope, $stateParams, RestService) {
    //aunthenticate
        if(RestService.authenticate()!=false)
          {
              console.log(authenticate);
            $scope.uid=authenticate.id;
              console.log(authenticate.id);
            $scope.isloggedin=1;
            $scope.loginlogout="Logout";
          }
    //aunthenticate
        
	    $scope.detail = false;
	    $scope.topdiv = false;
	    if ($stateParams.eid) {
	        $scope.topdiv = false;
	    } else {
	        $scope.topdiv = true;
	    }
       var find = function (data, status) {
	        //  $scope.area.city=data.city;
            console.log(data);
	        $scope.detail = true;
	        console.log(data.sponsor);
	        $scope.alldata = data;
            
            for(var i=0; i<data.sponsor.length ; i++)
            {
                if(data.printimpression[i]!=0)
                {
                $scope.greendiv[data.sponsor[i]] ="reddiv" ;
                $scope.remaining[data.sponsor[i]]=parseInt($scope.remaining[data.sponsor[i]])+parseInt(data.printimpression[i]);
                }
                if(data.preqr[i]!=0)
                {
                    $scope.remainingpreqr=parseInt($scope.remainingpreqr)+parseInt(data.preqr[i]);
                }
                if(data.postqr[i]!=0)
                {
                 $scope.remainingpostqr=parseInt($scope.remainingpreqr)+parseInt(data.postqr[i]);   
                }
                if(data.reminder[i]!=0)
                {
                    $scope.remainingreminder=parseInt($scope.remainingpreqr)+parseInt(data.reminder[i]);
                }
                if(data.confirmation[i]!=0)
                {
                    $scope.remainingconfirmation=parseInt($scope.remainingpreqr)+parseInt(data.confirmation[i]);
                }
                
            }
           /* for(var i=0;i<data.printimpression.length;i++)
            {
                
                $scope.remaining[]=data.printimpression[i]; 
            }*/
	        //$scope.form.event = data.id;

	        //$scope.demo=$scope.alldata[{id}];
	    };
	    if ($stateParams.eid) {
	        RestService.findone($stateParams.eid).success(find);
	    }
})

.controller('DiscoverinnerCtrl', function($scope, $stateParams, RestService) {
        $scope.id=$stateParams.id;
        console.log($scope.id);
    
    //aunthenticate
       
        if(RestService.authenticate()!=false)
          {
              console.log(authenticate);
            $scope.uid=authenticate.id;
              console.log(authenticate.id);
            $scope.isloggedin=1;
            $scope.loginlogout="Logout";
          }
        
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

.controller('UpdateeventCtrl', function($scope, $stateParams, RestService) {
    $scope.loginlogout="Login";
    $scope.isloggedin=0;
    
	        var user = function (data, status) {
	            console.log(data);
	            $scope.organizername = data.firstname;
	            $scope.form.organizer = data.id;

	        };
    if(RestService.authenticate()!=false)
          {
            console.log(authenticate);
	        RestService.findoneuser(authenticate.id).success(user);
            $scope.isloggedin=1;
            $scope.loginlogout="Logout";
          }
        var event = function (data, status) {
	            console.log(data);
	            $scope.form = {};
	            $scope.form = data;
	            $scope.form.categoty = data.categoty;
	            $scope.ipath = "views/f1.php?id=event" + data.organizerid + "&logo=" + data.logo;
	        };

	        var topics = function (data, status) {
	            $scope.topics = data;
	            RestService.findone($scope.value).success(event)

	        };
	        var categories = function (data, status) {
	            $scope.categories = data;
	            TopicService.getmydetails().success(topics);
	        };

	        CategoryService.getmydetails().success(categories);

    
})


.controller('MyticketsCtrl', function($scope, $stateParams, RestService) {
    $scope.loginlogout="Login";
    $scope.isloggedin=0;
    var userticket=function(data,status){
           console.log(data);
           $scope.data=data;
       };
    
    
    if(RestService.authenticate()!=false)
          {
           // $scope.uid=data.id;
              RestService.getuserticket(authenticate.id).success(userticket);
              console.log(authenticate);
            $scope.isloggedin=1;
            $scope.loginlogout="Logout";
          }
        
    
})


.controller('CreateeventCtrl', function($scope, $stateParams, RestService, TopicService, CategoryService) {
    //aunthenticate
        var user=function(data,status){
            console.log(data);
            $scope.organizername=data.firstname;
            $scope.form.organizer=data.id;
        };
        if(RestService.authenticate()!=false)
          {
              
          RestService.findoneuser(authenticate.id).success(user);
              console.log(authenticate);
            $scope.uid=authenticate.id;
              console.log(authenticate.id);
            $scope.isloggedin=1;
            $scope.loginlogout="Logout";
          }
    //aunthenticate
    $scope.ipath="templates/f2.php?id=event";
      $scope.form={};
     //map //###########################################Map#########################################################https://www.google.co.in/maps/search//@19.2107346,73.1063761,15z
     $scope.visible=false;
     $scope.showmap=function(){
         $scope.visible=true;
     };
     $scope.hidemap=function(){
         $scope.visible=false;
     };
     var mapp=function(data, state){
         console.log(data.results[0].geometry.location.lat);
         console.log(data.results[0].geometry.location.lng);
         $scope.form.locationlat=data.results[0].geometry.location.lat;
         $scope.form.locationlon=data.results[0].geometry.location.lng;
         
     };
     $scope.getmap=function(location,state,pin,street){
         console.log(location);
         console.log(state);
         console.log(street);
         console.log(pin);
         $scope.lmap=location+","+pin+","+state+","+street;
         console.log($scope.lmap);
         RestService.getmap($scope.lmap).success(mapp);
     };
                
     //###########################################Map#########################################################
    //########################################################################################
     $scope.form.tickets=[];
     $scope.form.category=[];
     $scope.form.topic=[];
      //$scope.total=0;
      $scope.visible=false;
     $scope.addticket=function(type){
         $scope.visible=true;
        
         $scope.userfreeticket={"name":"","qty":"","price":0,"pricetype":type};
       // $scope.userfreeticket=$scope.userfreeticket.join();
         $scope.form.tickets.push($scope.userfreeticket);
          $scope.total=$scope.form.tickets.qty;
     };
  
     
      $scope.remove=function(index){
          console.log("index:"+index);
        $scope.form.tickets.splice(index, 1);
     };
     //########################################################################################
    var topics = function (data, status) {
                $scope.topics = data;

            };
            TopicService.getmydetails().success(topics);

         var categories = function (data, status) {
             $scope.categories = data;

         };

         CategoryService.getmydetails().success(categories);
    
    // on submit
    var created = function (data, state) {
            //console.log(data);
            $scope.form.id=data;
            alert("Event Saved");
        };
    
    $scope.onsubmit = function (form) {
            console.log(form);
           // alert(form);
        form.ticketname=form.tickets[0].name;
        form.ticketqty=form.tickets[0].qty;
        form.ticketprice=form.tickets[0].price;
        form.ticketpricetype=form.tickets[0].pricetype;
        for(var i= 1;i<form.tickets.length;i++)
        {
        form.ticketname+=","+form.tickets[i].name;
        form.ticketqty+=","+form.tickets[i].qty;
        form.ticketprice+=","+form.tickets[i].price;
        form.ticketpricetype+=","+form.tickets[i].pricetype;
        }

        //form.category=form.category.join();
        //form.topic=form.topic.join();
        RestService.createevent(form).success(created);
        };
    // on submit
    
    
})

.controller('PrintticketCtrl', function($scope, $stateParams, RestService, $timeout) {
    $scope.uid=$stateParams.uid;
    $scope.id=$stateParams.id;
    
        $scope.prebanner=true;
        $scope.qrcode=false;
        //timeout
            $timeout(function() {
                $scope.prebanner=false;
                $scope.qrcode=true;
                $scope.postqrimage="qrimage";
            }, 1000);
        
            $scope.image=[];
            $scope.preqrimage=[];
            $scope.postqrimage=[];
	        var printticket = function (data, status) {
                for(var i= 0;i<data.usertickets.length;i++)
        {
        $scope.addticket=$scope.addticket+parseInt(data.usertickets[i].quantity);
        }
                console.log(data);
                if(data.sponsor=="")
                {
                    for(var j=1 ; j <= 6 ; j++)
                    {
                            $scope.image[j]="../img/sponsor/nobanner.jpg";
                    }
                }
	            $scope.printticket = data;
                if(data.usertickets[0].postqrimage=="")
                {
                    $scope.postqrimage="nodisplay";
                }
                if(data.usertickets[0].preqrimage=="")
                {
                    $scope.predisplay="nodisplay";
                }
                $scope.imageqrpost=data.usertickets[0].postqrimage;
                $scope.imageqrpre=data.usertickets[0].preqrimage;
                
            
                for(var i=0 ; i < data.sponsor.length ; i++)
                {
                    for(var j=1 ; j <= 6 ; j++)
                    {
                        if(parseInt(data.sponsor[i].printval)==j)
                        {
                            $scope.image[j]=data.sponsor[i].image;
                            
                        }
                        if(!$scope.image[j])
                        {
                            $scope.image[j]="../img/sponsor/nobanner.jpg";
                        }
                    }
                    
                
                }
	        };
	        RestService.printticket($stateParams.uid, $stateParams.id).success(printticket);
})

.controller('SavedeventsCtrl', function($scope, $stateParams, RestService) {
    //aunthenticate
        var getevents=function(data, status){
        console.log(data);
        $scope.uevent=data;
        };
        if(RestService.authenticate()!=false)
          {
            $scope.uid=authenticate.id;
              console.log(authenticate.id);
              RestService.getsavedevents(authenticate.id).success(getevents);
            $scope.isloggedin=1;
            $scope.loginlogout="Logout";
          }
    //aunthenticate
    
    
});
