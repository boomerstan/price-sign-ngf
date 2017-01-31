'use strict';

angular
    .module('signApp')
    .controller('DashboardController', [
        '$location',
        '$scope',
        '$http',
        '$q',
        '$interval',
        'ngNotify',
    function($location, $scope, $http, $q, $interval, ngNotify) {

    var decimalPlaces = 2,
        same  = "Price is same as on sign.",
        sames = "Prices are same as on sign.",
        diff  = "Price is different than on sign.",
        diffs = "Prices are different than on sign.";

    $scope.callCommodities = $http.get('data/commodities.json')
        .success(function (data) {
            $scope.commodities = data;
            $scope.commodity_checks = angular.copy(data);
        })
        .error(function(response){
            $scope.error = response;
        });

    $scope.callTiers = $http.get('data/tiers.json')
        .success(function (data) {
            $scope.tiers = data;
            $scope.tier_checks = angular.copy(data);
        })
        .error(function(response){
            $scope.error = response;
        });

    $scope.callPrices = $http.get('data/prices.json')
        .success(function (data) {
            $scope.prices = data;
            $scope.checks = angular.copy(data);
        })
        .error(function(response){
            $scope.error = response;
        });

    $q.all([$scope.callCommodities, $scope.callTiers, $scope.callPrices]).then(function (values) {
        $scope.checkSetup();
        $scope.calculatePricesOffset();
        $scope.checks = angular.copy($scope.prices);
        $scope.time = new Date();
        $scope.signPriceText = sames;
        $scope.signPriceState = false;
        $scope.signOffsetsState = false;
    });

    $scope.checkSetup = function(){
        // if no commodities or tiers then ngNotify
        if (0 == $scope.commodities.length && 0 == $scope.tiers.length) {
            ngNotify.set('Dashboard requires at least one commodity and one tier!',
                { type: 'error', position: 'top', sticky: true });
        } else if (0 == $scope.commodities.length) {
            ngNotify.set('Dashboard requires at least one commodity!',
                { type: 'error', position: 'top', sticky: true });
        } else if (0 == $scope.tiers.length) {
            ngNotify.set('Dashboard requires at least one tier!',
                { type: 'error', position: 'top', sticky: true });
        }
    };

    $scope.calculatePricesOffset = function () {
        // Calculates offset property for non-base tier prices
        $scope.commodities.forEach(function (commodity, indexC) {
            $scope.tiers.forEach(function (tier, indexT) {
                if(indexT !== 0 && $scope.prices[indexC][indexT].price) $scope.prices[indexC][indexT].offset =
                    $scope.rndFloat(($scope.prices[indexC][indexT].price - $scope.prices[indexC][0].price), decimalPlaces);
            })
        })
    };

    $scope.updateTierPrices = function (cid) {
        $scope.tiers.forEach(function (tier, indexT) {
            if(indexT !== 0) $scope.prices[cid][indexT].price =
                parseFloat(($scope.prices[cid][0].price + $scope.prices[cid][indexT].offset).toFixed(decimalPlaces))
        })
    };

    $scope.submitChangedPrices = function(cid) {
        //control for updating server prices
        if (cid) {// if cid has value submit just this commodity
            // $scope.submitChangedTierPrices(cid);
            if ($scope.$eval('forms.commodity'+cid)) $scope.$eval('forms.commodity'+cid).$setPristine();
        }
        else {// if cid has no value or is 0 submit all commodities
            $scope.commodities.forEach(function (commodity, indexC) {
                // $scope.submitChangedTierPrices(indexC);
                if ($scope.$eval('forms.commodity'+indexC)) $scope.$eval('forms.commodity'+indexC).$setPristine();
            });
        }
        angular.copy($scope.prices, $scope.checks);
        if ($scope.forms.dashBoard) $scope.forms.dashBoard.$setPristine();

        $scope.time = new Date();
        //notify user that price change was successfully applied TODO translate
        ngNotify.set('Price change successful! (simulated sign update)', { type: 'success', position: 'top', sticky: true });
    };

    $scope.resetPriceForm = function (cid){
        // cid = commodities index
        angular.copy($scope.checks[cid], $scope.prices[cid]);
        if ($scope.$eval('forms.commodity'+cid).$dirty) $scope.$eval('forms.commodity'+cid).$setPristine();
        if ($scope.forms.dashBoard.$dirty) $scope.forms.dashBoard.$setPristine();
    };

    $scope.resetDashboardForm = function(){
        angular.copy($scope.checks, $scope.prices);
        angular.copy($scope.commodity_checks, $scope.commodities);
        if ($scope.forms.dashBoard.$dirty) $scope.forms.dashBoard.$setPristine();
    };

    $scope.rndFloat = function (value, digits) {
        return parseFloat(value.toFixed(digits));
    };

    $scope.toggleDetailView = function() {
        $scope.detail === true ? $scope.detail = false : $scope.detail = true;
    };
}]);
