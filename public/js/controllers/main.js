// Controller for index.html
var app = angular.module('piserverApp');
app.controller('avdCtrl', function ($scope, dataService) {
    $scope.avdelingar = {
        images: {
            url: '/images',
            name: 'Bilete',
            tmb_name: 'spongebob.jpg'
        },
        videos: {
            url: '/videos',
            name: 'Video',
            tmb_name: 'DSC_0786.JPG'
        }
    };
});
//# sourceMappingURL=main.js.map