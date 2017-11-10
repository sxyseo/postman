chrome.app.runtime.onLaunched.addListener(function (launchData) {

    //is set to true when this script needs to create a new window to import the collection
    var toSendToNewWindow = false;

    chrome.system.display.getInfo(function (info) {
        var width = info[0].workArea.width,
            height = info[0].workArea.height,
            nWindows;

        if (width > 1400 && height > 800) {
            width = 1400;
            height = 800;
        }

        nWindows = chrome.app.window.getAll().length;

        if (nWindows === 0) {
            // Postman is not running, we need to create a new window
            toSendToNewWindow = true;
            chrome.app.window.create('html/requester.html', {
                "id": "postman-main",
                "bounds": {
                    width: width,
                    height: height
                },
                "outerBounds": {
                    width: width,
                    height: height
                }
            },
            function(win) {
                win.onClosed.addListener(function () {
                    console.log("On closing the window");
                });

                if (launchData.id === 'postman_collection') {
                    // Postman was launched by clicking on a URL, so wait until it's initialized, and
                    // then pass the URL to it.
                    chrome.runtime.onMessage.addListener(function (receivedMessage) {
                        if (receivedMessage === 'postmanInitialized' && toSendToNewWindow) {
                            chrome.runtime.sendMessage({
                                id: 'openCollectionFromURL',
                                event: 'importCollectionFromURL',
                                object: launchData // Contains the URL to import the collection from.
                            });
                            toSendToNewWindow = false; //the next postmanInitialized event should not re-trigger the importcollection message
                        }
                    });
                }
            });
        }
        else if (launchData.id === 'postman_collection') {
            // Postman was launched by clicking on a collection URL, and a Postman window was already open, so
            // just make the existing window import the collection.
            chrome.runtime.sendMessage({
                id: 'openCollectionFromURL',
                event: 'importCollectionFromURL',
                object: launchData
            });
        }
    });
});
