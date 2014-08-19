var adminurl="http://localhost/eglapp/admin/index.php/";
var restservicemod = angular.module('restservicemod', [])
.factory('RestService',function($http)
{
    var demovar="hello";
	return {
		login:function(user,password){
            return $http.get(adminurl+"user/login?email="+user+"&password="+password,{});
        },
        authenticate: function(){
            return $http.get(adminurl+"user/authenticate",{});
        },
        logout: function () {
            return $http.get(adminurl+"user/logout",{});
        },
        findcategoryevent: function (id) {
            return $http.get(adminurl+"category/findalleventbycategory",{params: {category:id}});
        },
        findone: function (data) {
            return $http.get(adminurl+"event/findone?id="+data,{});
        },
        getuserticket: function (user) {
            return $http.get(adminurl+"order/viewalleventsbookedbyuser?user="+user,{});
        },
        printticket: function (id,eid) {
            return $http.get(adminurl+"order/viewticket?user="+id+"&event="+eid,{});
        },
        savedevents: function (uid,id) {
            return $http.get(adminurl+"event/savedevents?user="+uid+"&event="+id,{});
        },
        getsavedevents: function (uid) {
            return $http.get(adminurl+"event/getsavedevents?user="+uid,{});
        }
    }
});


