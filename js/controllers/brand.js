'use strict';

angular
    .module('signApp')
    .controller('BrandController', ['$scope', '$http', function($scope, $http) {

    $http.get('data/brand.json').success(function (data) {
        $scope.brand = data;
    });
}]);
