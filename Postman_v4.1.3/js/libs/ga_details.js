//TODO - Remove the 3 lines below
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-26564585-4']);
_gaq.push(['_trackPageview']);

var tracker_id = postman_ga_tracking_id;//'UA-43979731-6'; //Make 8 to 6 for production, 8 for staging
var app_name = 'Postman - REST Client (Packaged app)';
var service = analytics.getService(app_name);
var tracker = service.getTracker(tracker_id);
// TODO - add permission for tracking users.
tracker.sendAppView('MainView');