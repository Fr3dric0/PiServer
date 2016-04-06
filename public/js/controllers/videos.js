/**
 * Created by Acer on 04.04.2016.
 */
var app = angular.module('piserverApp', []);
app.controller('VidCtrl', function ($scope, $http) {
    $http.get("/api/v1").then(
    // SUCCESS
    function (data) {
        console.log(data);
    }, 
    // ERROR
    function (err) {
    });
});
//# sourceMappingURL=videos.js.map