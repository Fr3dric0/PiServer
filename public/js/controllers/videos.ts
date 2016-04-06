/**
 * Created by Acer on 04.04.2016.
 */
let app = angular.module('piserverApp', []);

app.controller('VidCtrl', ($scope, $http) => {
    $http.get("/api/v1").then(
        // SUCCESS
        (data) => {
            console.log(data);
        },
        // ERROR
        (err) => {

        }
    );
});