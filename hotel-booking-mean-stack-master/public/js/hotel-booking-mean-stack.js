!function(){angular.module("common-controllers",[]).config(["$routeProvider","$locationProvider",function($routeProvider,$locationProvider){$routeProvider.when("/profile",{templateUrl:"/templates/profile.html",controller:"ProfileController",controllerAs:"profile"}).when("/signup",{templateUrl:"/templates/signup.html",controller:"SignupController",controllerAs:"signup",caseInsensitiveMatch:!0}).when("/login",{templateUrl:"/templates/login.html",controller:"LoginController",controllerAs:"login",caseInsensitiveMatch:!0}).when("/view-hotel/:id",{templateUrl:"/templates/hotel.html",controller:"HotelController",controllerAs:"hotel"}).when("/admin",{templateUrl:"/templates/admin.html",controller:"AdminController",controllerAs:"admin",resolve:{validate:function($q,$location,SessionService){var validateAccess=$q.defer(),isAllowed=SessionService.isAdmin;return isAllowed||$location.path("/profile"),validateAccess.resolve(),validateAccess.promise}}}).otherwise({templateUrl:"/templates/landing.html",controller:"IndexController",controllerAs:"index"}),$locationProvider.html5Mode(!0)}]).controller("IndexController",["$scope","$window","SessionService",function($scope,$window,sessionService){$scope.session=sessionService,null!=$window.user&&sessionService.authSuccess($window.user),$scope.logout=function(){sessionService.logout()}}]).controller("LoginController",["$scope","$location","SessionService","growl",function($scope,$location,sessionService,growl){$scope.login=function(){sessionService.login(this.email,this.password).success(function(data){data.error?growl.addErrorMessage(data.error):(sessionService.authSuccess(data),$location.path(data.isAdmin?"/admin":"/profile"))})}}]).controller("SignupController",["$scope","UserService",function($scope,userService){$scope.signup=function(){var user={email:this.email,password:this.password,firstName:this.firstName,lastName:this.lastName};userService.create(user).success(function(){})}}]).controller("AdminController",["$scope","$location","HotelService","UserService",function($scope,$location,hotelService,userService){$scope.hotels={},$scope.users={},$scope.newHotel={},$scope.init=function(){$scope.newHotel={},userService.get().success(function(data){$scope.users=data}),hotelService.get().success(function(data){$scope.hotels=data})},$scope.createHotel=function(){$scope.hotelForm.submitAttempt=!0,$scope.hotelForm.$valid&&($scope.addHotel=!1,hotelService.create($scope.newHotel),$scope.init())},$scope.deleteUser=function(id){userService.delete(id).success(function(){})},$scope.deleteHotel=function(id){hotelService.delete(id).success(function(){})}}]).controller("ProfileController",["$scope","HotelService","UserService","SessionService","BookingService",function($scope,hotelService,userService,sessionService,bookingService){$scope.hotels={},$scope.bookings={},$scope.term=hotelService.term,$scope.getById=function(arr,id){for(var d=0,len=arr.length;len>d;d+=1)if(arr[d]._id===id)return arr[d]},$scope.init=function(){bookingService.get().success(function(data){var bkings=data;bkings&&hotelService.get().success(function(dataHotels){for(var i=0;i<bkings.length;i+=1){var bking=bkings[i];bkings[i].hotel=$scope.getById(dataHotels,bking.hotel)}$scope.bookings=bkings})})},$scope.searchHotels=function(){hotelService.search(this.term).success(function(data){data.length>0&&($scope.hotels=data,hotelService.term=$scope.term)})},$scope.cancelBooking=function(id){bookingService.delete(id).success(function(){$scope.init()})}}]).controller("HotelController",["$scope","$locale","$location","HotelService","BookingService",function($scope,$locale,$location,hotelService,bookingService){$scope.booking={type:void 0},$scope.currentYear=(new Date).getFullYear(),$scope.currentMonth=(new Date).getMonth()+1,$scope.months=$locale.DATETIME_FORMATS.MONTH,$scope.options=[{name:"Single Bed",type:"basic"},{name:"Double Bed",type:"basic"},{name:"Double Bed",type:"deluxe"},{name:"King Size Bed",type:"Maharaja"},{name:"Suite",type:"Lake View"}],$scope.$on("$routeChangeSuccess",function(event,current){$scope.init(current.pathParams.id),event.preventDefault()}),$scope.init=function(hoteId){hotelService.getHotel(hoteId).success(function(data){$scope.hotel=data})},$scope.bookHotel=function(){var newBooking={month:$scope.booking.month,year:$scope.booking.year,roomType:$scope.booking.roomType.type,creditCard:$scope.booking.creditCard,securityCode:$scope.booking.securityCode,checkOutDate:$scope.booking.checkOutDate,checkInDate:$scope.booking.checkInDate,creditCardName:$scope.booking.creditCardName,hotel:$scope.hotel};bookingService.create(newBooking).success(function(){})},$scope.backToSearch=function(){$location.path("/profile")},$scope.proceed=function(){$scope.paymentForm.$valid&&($scope.confirmBooking=!0)}}])}(),function(){angular.module("common-directives",[]).directive("redir",["$http",function(){return{restrict:"A",link:function(scope,element,attrs){element.on("click",function(e){e.preventDefault(),window.location=attrs.href})}}}]).directive("logout",["$http",function($http){return{restrict:"A",link:function(scope,element){element.on("click",function(e){e.preventDefault(),$http.post("/logout")})}}}]).directive("creditCardType",function(){return{require:"ngModel",link:function(scope,elm,attrs,ctrl){ctrl.$parsers.unshift(function(value){return scope.booking.type=/^5[1-5]/.test(value)?"fa fa-cc-mastercard":/^4/.test(value)?"fa fa-cc-visa":/^3[47]/.test(value)?"fa fa-cc-amex":/^6011|65|64[4-9]|622(1(2[6-9]|[3-9]\d)|[2-8]\d{2}|9([01]\d|2[0-5]))/.test(value)?"fa fa-cc-discover":void 0,ctrl.$setValidity("invalid",!!scope.booking.type),value})}}}).directive("cardExpiration",function(){return{require:"ngModel",link:function(scope,elm,attrs,ctrl){scope.$watch("[booking.month,booking.year]",function(value){return ctrl.$setValidity("invalid",!0),parseInt(scope.booking.year)===scope.currentYear&&scope.booking.month<=scope.currentMonth&&ctrl.$setValidity("invalid",!1),value},!0)}}})}(),function(){angular.module("common-factories",[]).factory("transformRequestAsFormPost",function(){function serializeData(data){if(!angular.isObject(data))return null==data?"":data.toString();var buffer=[];for(var name in data)if(data.hasOwnProperty(name)){var value=data[name];buffer.push(encodeURIComponent(name)+"="+encodeURIComponent(null==value?"":value))}var source=buffer.join("&").replace(/%20/g,"+");return source}function transformRequest(data,getHeaders){var headers=getHeaders();return headers["Content-Type"]="application/x-www-form-urlencoded; charset=utf-8",serializeData(data)}return transformRequest}).factory("myHttpResponseInterceptor",["$q","$location","growl",function($q,$location,growl){return{response:function(response){if("object"==typeof response.data){if(response.data.redirect)return $location.path(response.data.redirect),{}||$q.when(response);response.data.error&&growl.addErrorMessage(response.data.error)}return response||$q.when(response)}}}]).config(["$httpProvider",function($httpProvider){$httpProvider.interceptors.push("myHttpResponseInterceptor")}])}(),function(){angular.module("common-filters",[]).filter("range",function(){var filter=function(arr,lower,upper){for(var i=lower;upper>=i;i++)arr.push(i);return arr};return filter})}(),function(){angular.module("common-services",[]).factory("SessionService",["$rootScope","$http","$location","$q",function($rootScope,$http,$location,$q){var session={init:function(){this.resetSession()},resetSession:function(){this.currentUser=null,this.isAdmin=!1,this.isLoggedIn=!1},login:function(email,password){return $http.post("/login",{email:email,password:password})},logout:function(){var scope=this;$http.post("/logout").success(function(data){data.success&&(scope.resetSession(),$location.path("/index"))})},isAdminLoggedIn:function(){$http.get("/api/userData/").success(function(data){var validateAccess=$q.defer(),isAllowed=data.isAdmin;return isAllowed||$location.path("/profile"),validateAccess.resolve(),validateAccess.promise})},authSuccess:function(userData){this.currentUser=userData,this.isAdmin=userData.isAdmin,this.isLoggedIn=!0},authFailed:function(){this.resetSession(),console.log("Authentication failed")}};return session.init(),session}]).factory("HotelService",["$rootScope","$http",function($rootScope,$http){return{term:null,get:function(){return $http.get("/api/hotels/")},getHotel:function(id){return $http.get("/api/hotels/"+id)},create:function(hotelData){return $http.post("/api/admin/hotels",hotelData)},"delete":function(id){return $http.delete("/api/admin/hotels/"+id)},search:function(term){return $http.post("/api/hotels/search",{term:term})}}}]).factory("BookingService",["$rootScope","$http",function($rootScope,$http){return{get:function(){return $http.get("/api/bookings")},create:function(bookingData){return $http.post("/api/bookings",bookingData)},"delete":function(id){return $http.delete("/api/bookings/"+id)}}}]).factory("UserService",["$rootScope","$http",function($rootScope,$http){return{get:function(){return $http.get("/api/admin/users/")},create:function(userData){return $http.post("/signup",userData)},"delete":function(id){return $http.delete("/api/admin/users/"+id)}}}])}(),function(){angular.module("angular-growl",[]),angular.module("angular-growl").directive("growl",["$rootScope",function($rootScope){"use strict";return{restrict:"A",template:'<div class="growl">	<div class="growl-item alert" ng-repeat="message in messages" ng-class="computeClasses(message)">		<button type="button" class="close" ng-click="deleteMessage(message)">&times;</button>       <div ng-switch="message.enableHtml">           <div ng-switch-when="true" ng-bind-html="message.text"></div>           <div ng-switch-default ng-bind="message.text"></div>       </div>	</div></div>',replace:!1,scope:!0,controller:["$scope","$timeout","growl",function($scope,$timeout,growl){function addMessage(message){$scope.messages.push(message),message.ttl&&-1!==message.ttl&&$timeout(function(){$scope.deleteMessage(message)},message.ttl)}var onlyUnique=growl.onlyUnique();$scope.messages=[],$rootScope.$on("growlMessage",function(event,message){var found;onlyUnique?(angular.forEach($scope.messages,function(msg){message.text===msg.text&&message.severity===msg.severity&&(found=!0)}),found||addMessage(message)):addMessage(message)}),$scope.deleteMessage=function(message){var index=$scope.messages.indexOf(message);index>-1&&$scope.messages.splice(index,1)},$scope.computeClasses=function(message){return{"alert-success":"success"===message.severity,"alert-error":"error"===message.severity,"alert-danger":"error"===message.severity,"alert-info":"info"===message.severity,"alert-warning":"warn"===message.severity}}}]}}]),angular.module("angular-growl").provider("growl",function(){"use strict";var _ttl=null,_enableHtml=!1,_messagesKey="messages",_messageTextKey="text",_messageSeverityKey="severity",_onlyUniqueMessages=!0;this.globalTimeToLive=function(ttl){_ttl=ttl},this.globalEnableHtml=function(enableHtml){_enableHtml=enableHtml},this.messagesKey=function(messagesKey){_messagesKey=messagesKey},this.messageTextKey=function(messageTextKey){_messageTextKey=messageTextKey},this.messageSeverityKey=function(messageSeverityKey){_messageSeverityKey=messageSeverityKey},this.onlyUniqueMessages=function(onlyUniqueMessages){_onlyUniqueMessages=onlyUniqueMessages},this.serverMessagesInterceptor=["$q","growl",function($q,growl){function checkResponse(response){response.data[_messagesKey]&&response.data[_messagesKey].length>0&&growl.addServerMessages(response.data[_messagesKey])}function success(response){return checkResponse(response),response}function error(response){return checkResponse(response),$q.reject(response)}return function(promise){return promise.then(success,error)}}],this.$get=["$rootScope","$filter",function($rootScope,$filter){function broadcastMessage(message){translate&&(message.text=translate(message.text)),$rootScope.$broadcast("growlMessage",message)}function sendMessage(text,config,severity){var message,_config=config||{};message={text:text,severity:severity,ttl:_config.ttl||_ttl,enableHtml:_config.enableHtml||_enableHtml},broadcastMessage(message)}function addWarnMessage(text,config){sendMessage(text,config,"warn")}function addErrorMessage(text,config){sendMessage(text,config,"error")}function addInfoMessage(text,config){sendMessage(text,config,"info")}function addSuccessMessage(text,config){sendMessage(text,config,"success")}function addServerMessages(messages){var i,message,severity,length;for(length=messages.length,i=0;length>i;i++)if(message=messages[i],message[_messageTextKey]&&message[_messageSeverityKey]){switch(message[_messageSeverityKey]){case"warn":severity="warn";break;case"success":severity="success";break;case"info":severity="info";break;case"error":severity="error"}sendMessage(message[_messageTextKey],void 0,severity)}}function onlyUnique(){return _onlyUniqueMessages}var translate;try{translate=$filter("translate")}catch(e){}return{addWarnMessage:addWarnMessage,addErrorMessage:addErrorMessage,addInfoMessage:addInfoMessage,addSuccessMessage:addSuccessMessage,addServerMessages:addServerMessages,onlyUnique:onlyUnique}}]})}(),function(){angular.module("HotelApp",["ngResource","ngRoute","ngCookies","common-directives","common-factories","angular-growl","common-filters","common-controllers","common-services"])}();