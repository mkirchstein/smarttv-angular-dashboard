(function(window, angular, undefined){
    
    'use strict';

    /**
     * Create a new module and
     * attach all dependencies
     */
    angular
        .module('widget', [])
        .service('widgetService', ['$timeout', '$q', '$document', service])
        .directive('ngWidget', ['$compile', directive]);


    function service($timeout, $q, $document){

        var deferred = $q.defer(),
            promise = deferred.promise;


        /**
         * @function _getFormattedHour
         * @private
         */
        var _getFormattedHour = function(){

            var now = new Date();
            var locale = 'nl-be';

            return {
                year: now.getFullYear(),
                month: (/[a-z]+/gi.exec(now.toLocaleString(locale, { month: "short" })))[0].substring(0, 3),
                day: now.getDate(),
                hours: _formatDoubleDigit(now.getHours()),
                minutes: _formatDoubleDigit(now.getMinutes()),
                seconds: _formatDoubleDigit(now.getSeconds())
            }
        };


        /**
         * @function _formatDoubleDigit
         * @private
         */
        var _formatDoubleDigit = function(digit){

            return ('0' + digit).slice(-2);
        };


        /**
         * @function heartbeat
         * @public
         */
        var heartbeat = function(callback, interval){

            promise.then(function(){

                callback(_getFormattedHour(new Date()));
                
                $timeout(function(){ heartbeat(callback, interval); }, interval);
            });
        };


        $document.ready(deferred.resolve);

        return {
            heartbeat : heartbeat
        };
    }


    /**
     * @function directive
     * @private
     */ 
    function directive($compile){

        /**
         * @type {string} 
         * @private
         */
        var templateStart = '<figure class="front">';

        var templateHeader = [
            '<md-grid-tile-header ng-if="header">',
                '<header>',
                    '<h2>{{title}}</h2>',
                '</header>',
            '</md-grid-tile-header>'
        ].join('');

        var templateFooter = [
            '<md-grid-tile-footer ng-if="footer">',
                '<footer>',
                    '<p>',
                        '<span ng-if="status">{{status}}</span>',
                        '<span ng-if="lastUpdated">Last updated {{lastUpdated}}</span>',
                    '</p>',
                '</footer>',
            '</md-grid-tile-footer>'
        ].join('');

        var templateEnd = '</figure>';


        /**
         * @function _getTemplate
         * @private
         */
        var _getTemplate = function(type, customTemplate){

            var template = [];
            
            template.push(templateStart);
            template.push(templateHeader);

            switch(type){
                case 'clock':
                    template.push('<ng-widget-clock></ng-widget-clock>');
                    break;
                case 'list':
                    template.push('<ng-widget-list></ng-widget-list>');
                    break;
                case 'value':
                    template.push('<ng-widget-value></ng-widget-value>');
                    break;
                case 'percentage':
                    template.push('<ng-widget-percentage></ng-widget-percentage>');
                    break;
                case 'image':
                    template.push('<ng-widget-image></ng-widget-image>');
                    break;
                default:
                    template.push(customTemplate ? customTemplate : '<ng-widget-value></ng-widget-value>');
                    break;        
            }
            
            template.push(templateFooter);
            template.push(templateEnd);

            return template.join('');
        };


        /**
         * @function link
         * @public
         */
        var link = function(scope, element, attrs){

            /** default values */
            scope.header  = (typeof scope.header === 'undefined') ? true : scope.header;
            scope.footer  = (typeof scope.footer === 'undefined') ? true : scope.footer;
            scope.title   = scope.title   || 'Widget Title';


            /** Load html template in current element based on widgetType */
            element.html(_getTemplate(attrs.widgetType || scope.widgetType, scope.customTemplate));

            /** Render the element and inject the scope */
            $compile(element.contents())(scope);
        };

        /**
         * controller is an attribute with the name widget-id
         */
        return {
            link: link,
            controller: '@',
            name: 'widgetId'
        };
    }
        
})(window, window.angular);