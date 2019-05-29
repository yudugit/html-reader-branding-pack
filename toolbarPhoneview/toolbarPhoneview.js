
/**
 * Sharing controls
 */
var sharingShowing = false;
var sharingUI = {};
var shareCurrentPage = false;

var toolbarInit = function() {
    initSharing();
};

var initSharing = function() {
    sharingUI = {
        //share button on the toolbar
        shareButton: $('#share'),
        //Share sheet drop down elements
        dropdown: {
            container: $('#shareContainer'),
            currentPage: $('#currentPage'),
            firstPage: $('#firstPage')
        }
    };

    var sharingCallbacks = {};

    /**
     * Callback for taps on the sharing menu popup
     * @param event {*} fired by HammerJS, DOM event nested in `event.srcEvent`
     */
    var handleSharingInteraction = function(event) {
        var id = event.target.id;
        if (id && sharingCallbacks[id] && typeof sharingCallbacks[id] == 'function') {
            sharingCallbacks[id](event);
        }
    };

    sharingUI.dropdown.container.addClass(yudu_commonSettings.isDesktop ? "isDesktop" : "touchDevice");
    var sharingManager = yudu_commonFunctions.createHammerJSTapManager(sharingUI.dropdown.container[0]);
    sharingManager.on('tap', handleSharingInteraction);

    $(".noDrag").on("touchmove", function() {
        return false;
    });

    if (yudu_toolbarSettings.sharing.emailEnabled || yudu_toolbarSettings.sharing.twitter || yudu_toolbarSettings.sharing.facebook) {
        sharingCallbacks.currentPage = function() {
            toggleSharingPage(true);
        };
        sharingCallbacks.firstPage = function() {
            toggleSharingPage(false);
        };
    }

    /**
     * Helper that encapsulates creating and adding a button to the sharing popup
     * @param id {string} of the element on page acting as a button and that will contain the image
     * @param imgPath {string} URL of an image to use for the button
     * @param callback {Function} to call when the button is activated
     */
    var addSharingButton = function(id, imgPath, callback) {
        var button = document.getElementById(id);
        var icon = document.createElement('img');
        icon.classList.add('noPointerEvents'); // prevent the icon capturing interactions: let them pass to the button
        icon.src = imgPath;
        button.insertBefore(icon, button.firstChild);
        button.style.display = 'block';
        sharingCallbacks[id] = sharingCallback(callback);
    };

    /**
     * Create a callback for when a sharing button is activated
     * Wraps a callback in shared code to manage the UI changes
     * @param buttonCallback {Function} that triggers any unique behaviour assigned to the button
     * @returns {Function} that expects a HammerJS event, and passes it on
     */
    var sharingCallback = function(buttonCallback) {
        return function(event) {
            hideSharing();
            typeof buttonCallback == 'function' && buttonCallback(event);
            yudu_commonFunctions.hideToolbar();
        }
    };

    if (yudu_toolbarSettings.sharing.emailEnabled) {
        addSharingButton('email', yudu_sharingSettings.toolbarIconBasePath + 'email.png', yudu_sharingFunctions.shareEmail);
    }

    if(yudu_toolbarSettings.sharing.twitter) {
        addSharingButton('twitter', yudu_sharingSettings.twitterIconPath, yudu_sharingFunctions.shareTwitter);
    }

    if(yudu_toolbarSettings.sharing.facebook) {
        addSharingButton('facebook', yudu_sharingSettings.facebookIconPath, yudu_sharingFunctions.shareFacebook);
    }

    setSharingLeftPosition();
};

var toggleSharingPage = function(currentPageClicked) {
    if (currentPageClicked == shareCurrentPage) {
        return;
    }

    shareCurrentPage = currentPageClicked;

    yudu_sharingFunctions.togglePage(currentPageClicked);

    sharingUI.dropdown.currentPage.toggleClass("selected");
    sharingUI.dropdown.firstPage.toggleClass("selected");
};

var toggleShareAction = function() {
    if (toggleSharing(true)) {
   //qq     toggleContents(false, false);
    }
};

var toggleSharing = function(toggle, show) {
    var shouldShow = toggle ? !sharingShowing : show;

    if(shouldShow == sharingShowing) {
        return sharingShowing;
    }
    if (shouldShow) {
        sharingUI.dropdown.container.show();
    } else {
        sharingUI.dropdown.container.hide();
    }
    sharingShowing = shouldShow;
    setSharingLeftPosition();
    return sharingShowing;
};

var setSharingLeftPosition = function() {
    if(!sharingShowing) {
        return;
    }
    var shareButtonLeft = sharingUI.shareButton.offset().left;
    var shareLeft = Math.min(shareButtonLeft, yudu_commonSettings.width / yudu_commonSettings.pixelDensity - sharingUI.dropdown.container.width() - 10);
    sharingUI.dropdown.container.css({"left": shareLeft, "width": sharingUI.dropdown.container.width()});
};

var hideSharing = function() {
    if (!sharingShowing) {
        return;
    }
    toggleSharing(false, false);
};


/**
 * Miscellaneous controls
 */

/*
var onResize = function () {

    if (!yudu_commonSettings.isDesktop) {
        positionButtonsForTouch();
    }
    setTogglableLeftPosition();
    positionSearchResults();
};*/

var setTogglableLeftPosition = function() {
    setSharingLeftPosition();
    setContentsLeftPosition();
};

var hideTogglables = function() {
    hideSharing();
    hideContents();
    hideThumbnails();
};

var buttonOtherThanTogglableHit = function(scope, callback) {
    var args = Array.prototype.slice.call(arguments, 2);
    return function() {
        hideTogglables();
        return callback.apply(scope, args);
    };
};

toolbarInit();

// Make source available in developer tools
//@ sourceURL=toolbarPhoneview.js