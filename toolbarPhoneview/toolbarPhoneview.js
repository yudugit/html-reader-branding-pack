
/**
 * Sharing controls
 */
var sharingShowing = false;
var sharingUI = {};
var shareCurrentPage = false;

var toolbarInit = function() {
    yudu_events.subscribe(yudu_events.ALL, yudu_events.TAP, hideTogglables, false);
    initSharing();
    initUserPreferences();
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

    sharingUI.dropdown.firstPage.attr('tabIndex', '-1');

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

    if (yudu_toolbarSettings.sharing.emailEnabled || yudu_toolbarSettings.sharing.twitter || yudu_toolbarSettings.sharing.facebook || yudu_toolbarSettings.sharing.linkedIn) {
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

    if(yudu_toolbarSettings.sharing.linkedIn) {
        addSharingButton('linkedIn', yudu_sharingSettings.linkedInIconPath, yudu_sharingFunctions.shareLinkedIn);
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

// This is called when the share toolbar button is called - changing it may disable sharing.
var toggleShareAction = function(makeVisible) {
    if (makeVisible == true || makeVisible == false) {
        toggleSharing(false, makeVisible);
    } else {
        toggleSharing(true);
    }
};

var toggleSharing = function(toggle, show) {
    var shouldShow = toggle ? !sharingShowing : show;

    if(shouldShow == sharingShowing) {
        return sharingShowing;
    }
    if (shouldShow) {
        sharingUI.dropdown.container.show();
        sharingUI.dropdown.firstPage.focus();
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

var hideTogglables = function() {
    hideSharing();
    hideUserPreferences();
};

/**
 * User preferences controls
 */
var userPreferencesShowing = false;
var userPreferencesUI = {};

var initUserPreferences = function() {
    userPreferencesUI = {
        //preferences button on the toolbar
        userPreferencesButton: $('#userPreferences'),
        //preferences drop down elements
        dialog: {
            container: $('#yudu_userPreferences'),
            checkboxes: $('#yudu_userPreferences input')
        }
    };

    userPreferencesUI.dialog.checkboxes.change(function(event) {
        var checkbox = $(event.target);
        var settingName = checkbox.parent().attr('data-setting-name');
        var value = checkbox.is(':checked');

        if (settingName && window.yudu_commonFunctions.updateUserPreferenceSetting) {
            window.yudu_commonFunctions.updateUserPreferenceSetting(settingName, value);
        }
    });

    setUserPreferencesLeftPosition();
    enableUserPreferencesSettings();
};

var enableUserPreferencesSettings = function() {
    var foundEnabledSetting = false;

    for (var settingName in yudu_toolbarSettings.userPreferences) {
        if (!yudu_toolbarSettings.userPreferences.hasOwnProperty(settingName))continue;

        var setting = yudu_toolbarSettings.userPreferences[settingName];
        if (!setting.show) continue;

        var fields = $('#yudu_userPreferences').children('div[data-setting-name=' + settingName + ']');
        fields.show();

        if (setting.default) {
            fields.find("input[type='checkbox']").prop('checked', true);
        }

        foundEnabledSetting = foundEnabledSetting || (fields.length > 0);
    }

    return foundEnabledSetting;
};

var toggleUserPreferencesAction = function(makeVisible) {
    if (makeVisible == true || makeVisible == false) {
        toggleUserPreferences(false, makeVisible);
    } else {
        toggleUserPreferences(true);
    }
};

var toggleUserPreferences = function(toggle, show) {
    var shouldShow = toggle ? !userPreferencesShowing : show;

    if (shouldShow == userPreferencesShowing) {
        return userPreferencesShowing;
    }
    if (shouldShow) {
        userPreferencesUI.dialog.container.show();
        $('#yudu_userPreferences')[0].firstElementChild.firstElementChild.focus();
    } else {
        userPreferencesUI.dialog.container.hide();
    }
    userPreferencesShowing = shouldShow;
    setUserPreferencesLeftPosition();
    return userPreferencesShowing;
};

var setUserPreferencesLeftPosition = function() {
    if (!userPreferencesShowing) {
        return;
    }

    var userPreferencesButtonLeft = userPreferencesUI.userPreferencesButton.offset().left;
    var userPreferencesLeft = Math.min(userPreferencesButtonLeft, yudu_commonSettings.width / yudu_commonSettings.pixelDensity - userPreferencesUI.dialog.container.width() - 10);
    userPreferencesUI.dialog.container.css({"left": userPreferencesLeft});
};

var hideUserPreferences = function() {
    if (!userPreferencesShowing) {
        return;
    }

    toggleUserPreferences();
};

var cssFiles = [yudu_commonFunctions.createBrandingPath('toolbarPhoneview/style.css')];
yudu_commonFunctions.loadCss(cssFiles, toolbarInit);

// Make source available in developer tools
//@ sourceURL=toolbarPhoneview.js