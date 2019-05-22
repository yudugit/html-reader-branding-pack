
/**
 * Sharing controls
 */
var sharingShowing = false;
var shareCurrentPage = false;
var onShareCallback = null;

// Retrieve all jQuery objects dynamically, since the targets aren't reliably added to the DOM in time for
// sharing initialisation.
var sharingUI = {
    //share button on the toolbar
    getShareButton: function() { return $('#share');},
    //Share sheet drop down elements
    dropdown: {
        getContainer: function() { return $('#shareContainer'); },
        getCurrentPage: function() { return $('#currentPage'); },
        getFirstPage: function() { return $('#firstPage'); }
    }
};

var initSharing = function() {

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

    sharingUI.dropdown.getContainer().addClass(yudu_commonSettings.isDesktop ? "isDesktop" : "touchDevice");
    var sharingManager = yudu_commonFunctions.createHammerJSTapManager(sharingUI.dropdown.getContainer()[0]);
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

    sharingUI.dropdown.getCurrentPage().toggleClass("selected");
    sharingUI.dropdown.getFirstPage().toggleClass("selected");
};

var setOnShareCallback = function(callback) {
    if (callback && typeof callback === 'function') {
        onShareCallback = callback;
    }
}

var invokeOnShareCallback = function(sharingVisible) {
    if (onShareCallback && typeof onShareCallback === 'function') {
        onShareCallback(sharingVisible);
    }
}

var toggleShareAction = function() {
    var sharingVisible = toggleSharing(true);
    invokeOnShareCallback(sharingVisible);

    // placeholder for hiding other modal pop-overs
};

var toggleSharing = function(toggle, show) {
    var shouldShow = toggle ? !sharingShowing : show;

    if(shouldShow == sharingShowing) {
        return sharingShowing;
    }
    if (shouldShow) {
        sharingUI.dropdown.getContainer().show();
    } else {
        sharingUI.dropdown.getContainer().hide();
    }
    sharingShowing = shouldShow;
    setSharingLeftPosition();
    return sharingShowing;
};

var setSharingLeftPosition = function() {
    if(!sharingShowing) {
        return;
    }
    var shareButtonLeft = sharingUI.getShareButton().offset().left;
    var shareLeft = Math.min(shareButtonLeft, yudu_commonSettings.width / yudu_commonSettings.pixelDensity - sharingUI.dropdown.getContainer().width() - 10);
    sharingUI.dropdown.getContainer().css({"left": shareLeft, "width": sharingUI.dropdown.getContainer().width()});
};

var hideSharing = function() {
    if (!sharingShowing) {
        return;
    }
    toggleSharing(false, false);
};

var cssFiles = [yudu_commonFunctions.createBrandingPath('toolbar/style.css')];
yudu_commonFunctions.loadCss(cssFiles, initSharing);
