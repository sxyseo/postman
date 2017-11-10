var electronTracker = {
  apiVersion: '1',
  trackID: window.postman_ga_tracking_id, //tracking id
  clientID: null,
  appName: 'Postman',  //application name
  debug: false,
  performanceTracking: true,
  screenName: "",
  screenRes: window.outerWidth+"x"+window.outerHeight,
  viewport: window.innerWidth+"x"+window.innerHeight,
  sendRequest: function(data, callback){
    if(!this.clientID)
      this.clientID = this.generateClientID();

    var postData = "_v=ca1&ul=en-US&sd=24-bit&v="+this.apiVersion+"&tid="+this.trackID+"&cid="+this.clientID+"&an="+this.appName+"&av=";
    if(postman_electron) {
      postData = postData + pm.app.getVersion()+"&cd="+this.screenName;
    } else {
      postData = postData +chrome.runtime.getManifest()['version'];+"&cd="+this.screenName;
    }
    postData += "&sr="+this.screenRes+"&vp="+this.viewport;

    Object.keys(data).forEach(function(key) {
      var val = data[key];
      if(typeof val != "undefined")
        postData += "&"+key+"="+val;
    });

    var http = new XMLHttpRequest();
    var url = "https://www.google-analytics.com";
    if(!this.debug)
      url += "/collect";
    else
      url += "/debug/collect";

    http.open("POST", url, true);

    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    http.setRequestHeader("authority", "www.google-analytics.com");

    http.onreadystatechange = function() {
      if(http.readyState == 4 && http.status == 200) {
        if(callback)
          callback(true);
      }
      else
      {
        if(callback)
          callback(false);
      }
    }
    http.send(postData);
  },
  generateClientID: function()
  {
    var id = "";
    var possibilities = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 5; i++ )
      id += possibilities.charAt(Math.floor(Math.random() * possibilities.length));
    return id;
  },

  /*
   * Measurement Protocol
   * [https://developers.google.com/analytics/devguides/collection/protocol/v1/devguide]
   */

  screenView: function(screename){
    var data = {
      't' : 'screenview',
      'cd' : screename
    }
    this.screenName = screename;
    this.sendRequest(data);
  },

  appView: function(screename){
    var data = {
      't' : 'appview',
      'cd' : screename
    }
    this.screenName = screename;
    this.sendRequest(data);
  },
  
  event: function(category, action, label, value){
    var data = {
      't' : 'event',
      'ec' : category,
      'ea' : action,
      'el' : label,
      'ev' : value,
    }
    this.sendRequest(data);
  },
  exception: function(msg, fatal){
    var data = {
      't' : 'exception',
      'exd' : msg,
      'exf' : fatal || 0
    }
    this.sendRequest(data);
  },
  timing: function(category, variable, time, label){

    var data = {
      't' : 'timing',
      'utc' : category,
      'utv' : variable,
      'utt' : time,
      'utl' : label,
    }
    this.sendRequest(data);
  },
  custom: function(data){
    this.sendRequest(data);
  }
}

if(window) {
  window.electronTracker = electronTracker;
}

/*
 * Performance Tracking
 */

window.addEventListener("load", function() {

  electronTracker.appView('MainView');

  if(electronTracker.performanceTracking)
  {
    setTimeout(function() {
      var timing = window.performance.timing;
      var userTime = timing.loadEventEnd - timing.navigationStart;

      electronTracker.timing("performance", "pageload", userTime);

    }, 0);
  }

}, false);
