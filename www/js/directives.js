angular.module('starter.directives', [])


app.directive('mapDirective', mapDirective);
    function mapDirective(){
        return {
            restrict: 'E',
            controller:'MapCtrl',
            template: '<div class="search_map"> (map) </div>',
            link: function (scope, elem, attrs, ctrl){
               ctrl.createMap(elem);
            },
            replace: true
        }
    };


app.directive('mapDirective1', mapDirective1);
    function mapDirective1(){
        return {
            restrict: 'E',
            controller:'MapCtrl',
            template: '<div style="height: 100px; width:400px;">This is from directive1</div>',
            link: function (scope, elem, attrs, ctrl){
               ctrl.createMap(elem);
            },
            replace: true
        }
    }
