/* App Module */

angular
    .module('signApp', [
        'angularMoment',
        'ngNotify'
    ])
    .run(function($rootScope) {
        $rootScope.$on('$viewContentLoaded', function () {
            $(document).foundation();
        });
    });
