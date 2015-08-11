/**
 * calendarDemoApp - 0.9.0
 */
var app = angular.module('calendarDemoApp', ['ui.calendar', 'ui.bootstrap'])
        .controller('CalendarCtrl', CalendarCtrl);

function CalendarCtrl($scope, $compile, $timeout, uiCalendarConfig) {
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    $scope.eventTemplates = eventTemplates;

    $scope.changeTo = 'Hungarian';
    /* event source that pulls from google.com */
    $scope.eventSource = {
        url: "http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
        className: 'gcal-event',           // an option!
        currentTimezone: 'America/Chicago' // an option!
    };
    /* event source that contains custom events on the scope */
    $scope.events = [
      { title: 'All Day Event', start: new Date(y, m, d), end: new Date(y, m, d), occupied: 10, guaranteed: 15 },
      { title: 'Long Event', start: new Date(y, m, d - 5), end: new Date(y, m, d - 2), occupied: 15, guaranteed: 15 },
      { id: 999, title: 'Repeating Event', start: new Date(y, m, d - 3, 16, 0), allDay: false, occupied: 11, guaranteed: 15 },
      { id: 999, title: 'Repeating Event', start: new Date(y, m, d + 4, 16, 0), allDay: false, occupied: 10, guaranteed: 15 },
      { title: 'Birthday Party', start: new Date(y, m, d + 1, 19, 0), end: new Date(y, m, d + 1, 22, 30), allDay: false, occupied: 10, guaranteed: 15 },
      { title: 'Click for Google', start: new Date(y, m, 28), end: new Date(y, m, 29), url: 'http://google.com/', occupied: 15, guaranteed: 15 }
    ];
    /* event source that calls a function on every view switch */
    $scope.eventsF = function (start, end, timezone, callback) {
        var s = new Date(start).getTime() / 1000;
        var e = new Date(end).getTime() / 1000;
        var m = new Date(start).getMonth();
        var events = [{ title: 'Feed Me ' + m, start: s + (50000), end: s + (100000), allDay: false, className: ['customFeed'] }];
        callback(events);
    };

    $scope.calEventsExt = {
        color: '#f00',
        textColor: 'yellow',
        events: [
           { type: 'party', title: 'Lunch', start: new Date(y, m, d, 12, 0), end: new Date(y, m, d, 14, 0), allDay: false },
           { type: 'party', title: 'Lunch 2', start: new Date(y, m, d, 12, 0), end: new Date(y, m, d, 14, 0), allDay: false },
           { type: 'party', title: 'Click for Google', start: new Date(y, m, 28), end: new Date(y, m, 29), url: 'http://google.com/' }
        ]
    };
    /* alert on eventClick */
    $scope.alertOnEventClick = function (date, jsEvent, view) {
        $scope.alertMessage = (date.title + ' was clicked ');
    };
    /* alert on Drop */
    $scope.alertOnDrop = function (event, delta, revertFunc, jsEvent, ui, view) {
        $scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
    };
    /* alert on Resize */
    $scope.alertOnResize = function (event, delta, revertFunc, jsEvent, ui, view) {
        $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
    };
    /* add and removes an event source of choice */
    $scope.addRemoveEventSource = function (sources, source) {
        var canAdd = 0;
        angular.forEach(sources, function (value, key) {
            if (sources[key] === source) {
                sources.splice(key, 1);
                canAdd = 1;
            }
        });
        if (canAdd === 0) {
            sources.push(source);
        }
    };
    /* add custom event*/
    $scope.addEvent = function () {
        $scope.events.push({
            title: 'Open Sesame',
            start: new Date(y, m, 28),
            end: new Date(y, m, 29),
            className: ['openSesame']
        });
    };
    /* remove event */
    $scope.remove = function (index) {
        $scope.events.splice(index, 1);
    };
    /* Change View */
    $scope.changeView = function (view, calendar) {
        uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
    };
    /* Change View */
    $scope.renderCalender = function (calendar) {
        $timeout(function () {
            if (uiCalendarConfig.calendars[calendar]) {
                uiCalendarConfig.calendars[calendar].fullCalendar('render');
            }
        });
    };

    function getTemplate(templates, viewMode) {
        var template = '';

        switch (viewMode) {
            case 'month':
                template = templates.monthTemplate;
                break;
            case 'agendaWeek':
                template = templates.weekTemplate;
                break;
            case 'agendaDay':
                template = templates.dayTemplate;
                break;
        }

        return template;
    };

    function getEventStatus(occupiedSlotsCount, guaranteedSlotsCount) {
        var statuses = ['available', 'near-capacity', 'full-capacity'];

        if (occupiedSlotsCount == guaranteedSlotsCount) {
            return statuses[2];
        }

        if (guaranteedSlotsCount - occupiedSlotsCount <= 4) {
            return statuses[1];
        }

        return statuses[0];
    }

    function createEventViewModel(event) {
        var eventViewModel = {};

        eventViewModel.parsedStart = Date.parse(event.start);
        if (event.end) { eventViewModel.parsedEnd = Date.parse(event.end); }

        eventViewModel.occupiedSlotsCount = event.occupied;
        eventViewModel.guaranteedSlotsCount = event.guaranteed;

        eventViewModel.eventStatus = getEventStatus(eventViewModel.occupiedSlotsCount, eventViewModel.guaranteedSlotsCount);
        eventViewModel.title = event.title;

        return eventViewModel;
    }

    $scope.eventRender = function (event, element, view) {
        var currentScope = $scope.$new(true);
        currentScope.eventViewModel = createEventViewModel(event);

        var template = getTemplate($scope.eventTemplates, view.type);
        var compiledTemplate = $compile(template)(currentScope);

        return compiledTemplate;
    };

    $scope.data = false;

    /* config object */
    $scope.uiConfig = {
        calendar: {
            height: 450,
            editable: true,
            header: {
                left: 'title',
                center: '',
                right: 'today prev,next'
            },
            eventClick: $scope.alertOnEventClick,
            eventDrop: $scope.alertOnDrop,
            eventResize: $scope.alertOnResize,
            eventRender: $scope.eventRender
        }
    };

    $scope.changeLang = function () {
        if ($scope.changeTo === 'Hungarian') {
            $scope.uiConfig.calendar.dayNames = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];
            $scope.uiConfig.calendar.dayNamesShort = ["Vas", "Hét", "Kedd", "Sze", "Csüt", "Pén", "Szo"];
            $scope.changeTo = 'English';
        } else {
            $scope.uiConfig.calendar.dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            $scope.uiConfig.calendar.dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            $scope.changeTo = 'Hungarian';
        }
    };
    /* event sources array*/
    $scope.eventSources = [$scope.events, $scope.eventSource, $scope.eventsF];
    $scope.eventSources2 = [$scope.calEventsExt, $scope.eventsF, $scope.events];
}
/* EOF */