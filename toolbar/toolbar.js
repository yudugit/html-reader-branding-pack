var controls = $('#controls');
var buttons = {};
var buttonCallbacks = {};
var visibleButtons = {
    __yudu_count: 0
};
var numberOfProductsSpan;

var toolbarInit = function() {
    registerForYuduEvents();
    createBar();
    initSharing();
    initContents();
    yudu_commonFunctions.toolbarFinishedLoading();
};

var registerForYuduEvents = function() {
    yudu_events.subscribe(yudu_events.ALL, yudu_events.TOOLBAR.FIT_WIDTH_OR_SCREEN_ACTION, fitWidthOrScreenAction, false);
    yudu_events.subscribe(yudu_events.ALL, yudu_events.TOOLBAR.UPDATE_SHOPPING_CART_BUTTON, handleShoppingCartEvent, false);
    yudu_events.subscribe(yudu_events.ALL, yudu_events.TOOLBAR.UPDATE_BOOKMARK_BUTTON, handleBookmarkUpdateEvent, false);
    yudu_events.subscribe(yudu_events.ALL, yudu_events.COMMON.RESIZE, onResize, false);
    yudu_events.subscribe(yudu_events.ALL, yudu_events.COMMON.TOUCH, hideTogglables, false);
    yudu_events.subscribe(yudu_events.ALL, yudu_events.COMMON.LOGIN_APPROVED, onLoginApproved, false);
    if (window.yudu_searchFunctions) {
        searchSetup();
    } else {
        yudu_events.subscribe(yudu_events.ALL, yudu_events.TOOLBAR.SEARCH_READY, searchSetup, false);
    }
};

var fitWidthOrScreenAction = function(event) {
    if (event.data.fitOnlyWidth) {
        if (!visibleButtons.hasOwnProperty('fitPage')) {
            buttons['fitPage'].css({"left": buttons['fitWidth'].css('left')});
            hideButton('fitWidth');
            showButton('fitPage');
        }
    } else {
        if (!visibleButtons.hasOwnProperty('fitWidth')) {
            buttons['fitWidth'].css({"left": buttons['fitPage'].css('left')});
            hideButton('fitPage');
            showButton('fitWidth');
        }
    }
};

var handleShoppingCartEvent = function(event) {
    var button = buttons['shoppingCart'];
    if (event.data.toggleIcon) {
        var highResIcons = yudu_toolbarSettings.shouldUseHighRes;
        var mainIconPath = getIconFor('shoppingCart', highResIcons);
        if (button.css('background-image').indexOf(mainIconPath.substr(1)) >= 0) {
            var highlightedIconPath = getIconFor('highlightedShoppingCart', highResIcons);
            button.css('background-image', 'url(' + highlightedIconPath + ')');
        } else {
            button.css('background-image', 'url(' + mainIconPath + ')');
        }
    }

    var numberOfProducts = event.data.numberOfProducts;
    if (numberOfProducts == null || numberOfProducts <= 0) {
        numberOfProductsSpan.html('');
    } else if (numberOfProducts < 100) {
        numberOfProductsSpan.html(numberOfProducts);
    } else {
        numberOfProductsSpan.html('99+');
    }
};

var handleBookmarkUpdateEvent = function(event) {
    var button = buttons['bookmark'];
    var bookmarked = event.data.bookmarkOn;
    var iconPath = getIconFor((bookmarked ? 'bookmarked' : 'bookmark'));
    button.children('img').attr('src', iconPath);
};

var createBar = function() {
    if (yudu_commonSettings.isDesktop) {
        if (yudu_toolbarSettings.logoSrc) {
            showLogo();
        }
        if (yudu_toolbarSettings.searchEnabled) {
            showSearchBar();
        }
    } else {
        controls.addClass('touchDevice');
    }
    createButtons();
    addButtonListener();
};

var showLogo = function() {
    var logoImage = $("<img>");
    logoImage.attr('src', yudu_toolbarSettings.logoSrc);
    logoImage.attr('id', 'logoImage');

    var logoLink = $("#logoLink");
    logoLink.append(logoImage);
    if (yudu_toolbarSettings.logoLinkUrlExists) {
        logoLink.click(yudu_toolbarFunctions.logoClicked);
    }
    logoLink.show();
};

var showSearchBar = function() {
    $("#desktopSearchContainer").css("display", "inline-block");

    var iconPath = getIconFor('search');
    var button = $('#desktopSearchGo');
    button.css('background-image', 'url(' + iconPath + ')');
};

var createButtons = function() {
    var highResIcons = yudu_toolbarSettings.shouldUseHighRes;
    if (yudu_toolbarSettings.editionListEnabled) {
        createButton('editionList', buttonOtherThanTogglableHit(this, yudu_toolbarFunctions.editionListClicked), highResIcons);
    }
    if (yudu_toolbarSettings.hasArticles) {
        createButton('phoneview', buttonOtherThanTogglableHit(this, yudu_toolbarFunctions.openPhoneView), highResIcons);
    }
    if (yudu_toolbarSettings.fullscreenModeEnabled) {
        initFullscreen(highResIcons);
    }
    createButton('zoomIn', buttonOtherThanTogglableHit(this, yudu_toolbarFunctions.zoomInClicked), highResIcons);
    createButton('zoomOut', buttonOtherThanTogglableHit(this, yudu_toolbarFunctions.zoomOutClicked), highResIcons);
    createButton('prevPage', buttonOtherThanTogglableHit(this, yudu_toolbarFunctions.prevPageClicked), highResIcons);
    createButton('nextPage', buttonOtherThanTogglableHit(this, yudu_toolbarFunctions.nextPageClicked), highResIcons);
    if (!yudu_toolbarSettings.pageModeStopToggle) {
        createButton('twoUpToggle', buttonOtherThanTogglableHit(this, yudu_toolbarFunctions.twoUpToggleClicked), highResIcons);
    }
    createButton('fitWidth', buttonOtherThanTogglableHit(this, yudu_toolbarFunctions.fitWidthClicked), highResIcons);
    createButton('fitPage', buttonOtherThanTogglableHit(this, yudu_toolbarFunctions.fitPageClicked), highResIcons);
    createButton('thumbnailToggle', toggleThumbnailsAction, highResIcons);
    if (yudu_contentsSettings.contentsData && yudu_contentsSettings.contentsData.length > 0) {
        createButton('contents', toggleContentsAction, highResIcons);
    }
    if (yudu_toolbarSettings.sharing.emailEnabled || yudu_toolbarSettings.sharing.twitter || yudu_toolbarSettings.sharing.facebook) {
        createButton('share', toggleShareAction, highResIcons);
    }
    if (yudu_toolbarSettings.hasDownloadablePdfAndIsNotApp) {
        createButton('downloadPdf', buttonOtherThanTogglableHit(this, yudu_toolbarFunctions.downloadPdfClicked), highResIcons);
    }
    if (yudu_toolbarSettings.searchEnabled && !yudu_commonSettings.isDesktop) {
        createButton('search', buttonOtherThanTogglableHit(this, yudu_toolbarFunctions.searchClicked), highResIcons);
    }
    if (yudu_toolbarSettings.bookmarksEnabled) {
        createButton('bookmark', buttonOtherThanTogglableHit(this, yudu_toolbarFunctions.bookmarkClicked), highResIcons);
    }
    if (yudu_toolbarSettings.notesEnabled) {
        createButton('note', buttonOtherThanTogglableHit(this, yudu_toolbarFunctions.notesClicked), highResIcons);
    }
    if (yudu_toolbarSettings.highlightsEnabled) {
        createButton('highlight', toggleDrawingModeAction, highResIcons);
    }
    if (yudu_toolbarSettings.orderFormEnabled) {
        numberOfProductsSpan = $(document.createElement('span'));
        numberOfProductsSpan.css('position', 'absolute');
        numberOfProductsSpan.css('bottom', '0px');
        numberOfProductsSpan.css('margin-left', '22px');
        numberOfProductsSpan.css('margin-bottom', (yudu_commonSettings.isDesktop ? '4' : '-4') + 'px');
        numberOfProductsSpan.css('font-size', '10px');
        createButton('shoppingCart', buttonOtherThanTogglableHit(this, yudu_toolbarFunctions.shoppingCartClicked), highResIcons);
        buttons['shoppingCart'].append(numberOfProductsSpan);
    }
    if (yudu_toolbarSettings.editionLaunchableHtmlEnabled) {
        createButton('editionLaunchableHtml',
            buttonOtherThanTogglableHit(this, yudu_toolbarFunctions.editionLaunchableHtmlClicked, highResIcons));
    }


    // if not logged into a protected edition, phoneview should not be available yet
    if (!yudu_toolbarFunctions.articlesAvailable()) {
        hideButton('phoneview');
        // note: the button is shown when the reader emits a `LOGIN_APPROVED` event - see the `onLoginApproved` function below
    }
    //the fitPage button is the toggled version of the fitWidth so hide it by default
    hideButton('fitPage');

    if (!yudu_commonSettings.isDesktop) {
        hideButton('prevPage');
        hideButton('nextPage');
        hideButton('zoomIn');
        hideButton('zoomOut');
        //if below 480px we assume it's a phone and hide the one up two up toggle
        if (yudu_commonSettings.width <= 480) {
            hideButton('twoUpToggle');
        }
        positionButtonsForTouch();
    }
};

var createButton = function(id, callback, highResIcons) {
    var iconPath = getIconFor(id, highResIcons);
    var button = $('<a type="button" class="control" id="' + id + '"></a>');
    if (!yudu_commonSettings.isDesktop) {
        button.addClass('touchControl');
    }

    buttonCallbacks[id] = callback;

    $('<img />')
        .attr('src', iconPath)
        .attr('id', id)
        .appendTo(button);

    newButton(id, button);
    button.insertBefore($('#rightControls'));
};

var createButtonNoIcon = function(id, callback) {
    var button = $('<a type="button" class="control" tabindex="-1" id="' + id + '"></a>');
    if (!yudu_commonSettings.isDesktop) {
        button.addClass('touchControl');
    }
    buttonCallbacks[id] = callback;
    newButton(id, button);
    button.insertBefore($('#rightControls'));
};

var newButton = function(id, button) {
    buttons[id] = button;
    if (!visibleButtons[id]) {
        visibleButtons.__yudu_count += 1;
    }
    visibleButtons[id] = button;
};

var hideButton = function(id) {
    if (buttons[id]) {
        buttons[id].hide();
        if (visibleButtons[id]) {
            delete visibleButtons[id];
            visibleButtons.__yudu_count -= 1;
        }
    }
};

var showButton = function(id) {
    if (buttons[id]) {
        buttons[id].show();
        if (!visibleButtons[id]) {
            visibleButtons[id] = buttons[id];
            visibleButtons.__yudu_count += 1;
        }
    }
};

/**
 * get the `src` path for the icon with the specified ID
 * @param id
 * @param highResIcons ; [optional] should the high res icons be used
 * @returns string ; path to the specified image (no checks performed for existence)
 */
var getIconFor = function(id, highResIcons) {
    if (typeof highResIcons == 'undefined') {
        highResIcons = yudu_toolbarSettings.shouldUseHighRes;
    }
    return yudu_toolbarSettings.toolbarIconBasePath
        + (highResIcons ? yudu_toolbarSettings.iconHighResPrefix : '')
        + id + yudu_toolbarSettings.iconFileExtension;
};

/**
 * Add a listener for tap events to the toolbar
 * Defers button check to the event handler, so that one handler manages all buttons
 */
var addButtonListener = function() {
    var controlsManager = yudu_commonFunctions.createHammerJSTapManager(controls[0]);
    controlsManager.on('tap', handleButtonPress);
};

/**
 * Callback for tap events on the toolbar
 * Checks if a button was pressed, and if so, activates its associated callback
 * @param event {*} fired by HammerJS, DOM event nested in `event.srcEvent`
 */
var handleButtonPress = function(event) {
    var element = event.target;
    if (element && element.id) {
        var callback = buttonCallbacks[element.id];
        if (typeof callback == 'function') {
            callback();
        }
    }
};

/**
 * Iterate over the visible buttons and apply positioning CSS
 * Cannot depend on actual visibility state of the buttons as race conditions sometimes
 *  mean the buttons will not be rendered (and hence not visible) on initial calculation
 */
var positionButtonsForTouch = function() {
    if (visibleButtons.__yudu_count == 0) {
        return;
    }
    var gap = controls.width() / visibleButtons.__yudu_count;
    var count = 0;
    // need to iterate over `buttons` to preserve button order
    for (var id in buttons) {
        if (visibleButtons.hasOwnProperty(id)) {
            var offset = (visibleButtons[id].outerWidth(true) / 2);
            var position = (gap / 2) + (gap * count) - offset;
            visibleButtons[id].css({"left": position });
            count++;
        }
    }
};

/**
 * Fullscreen Mode Controls
 */
var fullscreenUI;

/**
 * create and prepare the fullscreen button
 * @param highResIcons ; whether to use a high-resolution image for the icon
 */
var initFullscreen = function(highResIcons) {
    createButtonNoIcon('fullscreen', toggleFullscreen);
    fullscreenUI = {
        button: $('#fullscreen'),
        iconEnter: 'url(' + getIconFor('fullscreen-enter', highResIcons) + ')',
        iconExit: 'url(' + getIconFor('fullscreen-exit', highResIcons) + ')'
    };
    fullscreenUI.button.css('background-image', fullscreenUI.iconEnter);
    document.addEventListener('fullscreenchange', prepareFullscreenIcon);
    document.addEventListener('msfullscreenchange', prepareFullscreenIcon);
    document.addEventListener('mozfullscreenchange', prepareFullscreenIcon);
    document.addEventListener('webkitfullscreenchange', prepareFullscreenIcon);
};

/**
 * helper function to determine if the document is currently being shown fullscreen or not
 * @returns {*}
 */
var isFullscreen = function() {
    return document.fullscreenElement
        || document.msFullscreenElement
        || document.mozFullScreenElement
        || document.webkitFullscreenElement;
};

/**
 * Controls the entering/exiting of fullscreen mode
 */
var toggleFullscreen = function() {
    if (isFullscreen()) {
        yudu_toolbarFunctions.exitFullscreen();
    } else {
        yudu_toolbarFunctions.goFullscreen();
    }
    // this next call is potentially unnecessary due to the event listeners
    prepareFullscreenIcon();
};

/**
 * Ensures the icon is updated according to whether the reader is currently fullscreen
 * Should be called after updating the fullscreen state
 */
var prepareFullscreenIcon = function() {
    if (isFullscreen()) {
        fullscreenUI.button.css('background-image', fullscreenUI.iconExit);
    } else {
        fullscreenUI.button.css('background-image', fullscreenUI.iconEnter);
    }
};

/**
 * Sharing controls
 */
var sharingShowing = false;
var sharingUI = {};
var shareCurrentPage = false;

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
        addSharingButton('email', yudu_toolbarSettings.toolbarIconBasePath + 'email.png', yudu_sharingFunctions.shareEmail);
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
        yudu_toolbarFunctions.setAutoHide(false);
        toggleContents(false, false);
        yudu_thumbnailsFunctions.toggleThumbnails(false, false);
    } else {
        yudu_toolbarFunctions.setAutoHide(true);
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
 * Contents controls
 */
var contentsShowing = false;
var contentsUI = {};
var contentsCallbacks = {};

var initContents = function() {
    if (!yudu_contentsSettings.contentsData || yudu_contentsSettings.contentsData.length == 0) {
        return;
    }

    contentsUI = {
        //contents button on the toolbar
        contentsButton: $('#contents'),
        //Contents sheet drop down elements
        dropdown: {
            container: $('#contentsContainer'),
            list: $('#contentsList')
        }
    };

    /**
     * Callback for taps on the contents menu popup
     * @param event {*} fired by HammerJS, DOM event nested in `event.srcEvent`
     */
    var handleContentsInteraction = function(event) {
        if (!event.target.classList.contains('contentsLink')) {
            // not a link element
            return;
        }
        var contentsId = event.target.dataset.id;
        var callback = contentsId && contentsCallbacks[contentsId];
        typeof callback == 'function' && callback(event);
    };

    var contentsManager = yudu_commonFunctions.createHammerJSTapManager(contentsUI.dropdown.list[0]);
    contentsManager.on('tap', handleContentsInteraction);

    for (var i = 0, l = yudu_contentsSettings.contentsData.length; i < l; i++) {
        contentsUI.dropdown.list.append(renderContentsElement(yudu_contentsSettings.contentsData[i]));
    }

    //remove the last <hr> that was added
    contentsUI.dropdown.list.find('hr').last().remove();

    if (yudu_commonSettings.isDesktop) {
        contentsUI.dropdown.container.addClass('isDesktop');
    } else {
        contentsUI.dropdown.container.addClass('touchDevice');
        yudu_commonFunctions.enableScrollingWithoutDocumentBouncing(contentsUI.dropdown.container);
    }

    setContentsLeftPosition();
};

var renderContentsElement = function(contentsElementData) {
    var contentsId = generateContentsId();

    var contentsElementDiv = $('<div></div>');
    contentsElementDiv.addClass('contentsElement');

    var contentsLink = $('<div></div>');
    contentsLink.addClass('contentsLink');
    contentsLink.html(contentsElementData.description);
    contentsLink.attr('data-id', contentsId);

    var lineBreak = $('<hr>');

    contentsCallbacks[contentsId] = function() {
        yudu_commonFunctions.goToPage(contentsElementData.page);
        hideContents();
        yudu_commonFunctions.hideToolbar();
    };

    contentsElementDiv.append(contentsLink);
    contentsElementDiv.append(lineBreak);

    if (contentsElementData.children) {
        for (var i = 0, l = contentsElementData.children.length; i < l; i++) {
            contentsElementDiv.append(renderContentsElement(contentsElementData.children[i]));
        }
    }

    return contentsElementDiv;
};

/**
 * Helper to generate a unique ID (intended for contents menu items) each time it is called
 * Self-contained to prevent interference with the internal counter.
 */
var generateContentsId = (function() {
    var contentsCounter = 0;
    return function() {
        return 'contentsItem' + (contentsCounter++);
    };
}());

var toggleContentsAction = function() {
    if (toggleContents(true)) {
        yudu_toolbarFunctions.setAutoHide(false);
        yudu_thumbnailsFunctions.toggleThumbnails(false, false);
        toggleSharing(false, false);
    } else {
        yudu_toolbarFunctions.setAutoHide(true);
    }
};

var toggleContents = function(toggle, show) {
    var shouldShow = toggle ? !contentsShowing : show;

    if (shouldShow == contentsShowing) {
        return contentsShowing;
    }
    if (shouldShow) {
        contentsUI.dropdown.container.show();
    } else {
        contentsUI.dropdown.container.hide();
    }
    contentsShowing = shouldShow;
    setContentsLeftPosition();
    return contentsShowing;
};

var setContentsLeftPosition = function() {
    if (!contentsShowing) {
        return;
    }

    var contentsButtonLeft = contentsUI.contentsButton.offset().left;
    var contentsLeft = Math.min(contentsButtonLeft, yudu_commonSettings.width / yudu_commonSettings.pixelDensity - contentsUI.dropdown.container.width() - 10);
    contentsUI.dropdown.container.css({"left": contentsLeft});
};

var hideContents = function() {
    if (!contentsShowing) {
        return;
    }

    toggleContents(false, false);
};

/**
 * Thumbnails controls
 */
var toggleThumbnailsAction = function() {
    yudu_thumbnailsFunctions.toggleThumbnails(true);
    toggleSharing(false, false);
    toggleContents(false, false);
};

var hideThumbnails = function() {
    yudu_thumbnailsFunctions.toggleThumbnails(false, false);
};

/**
 * Drawing mode controls
 */
var toggleDrawingModeAction = function() {
    yudu_drawingToolbarFunctions.setHighlightingMode(true);
    toggleSharing(false, false);
    toggleContents(false, false);
    hideThumbnails();
};

/**
 * Search controls
 */
var searchSetup = function() {
    setSearchComponents();
    positionSearchResults();
};

var positionSearchResults = function() {
    if (yudu_commonSettings.isDesktop) {
        var position = {
            top: '34px',
            left: 'auto',
            bottom: 'auto',
            right: '0px'
        };
        var corners = {
            topLeft: '0px',
            topRight: '0px',
            bottomRight: '5px',
            bottomLeft: '5px'
        };
        yudu_searchFunctions.positionDesktopSearchResults(position, corners);
    }
};

var setSearchComponents = function() {
    if (yudu_commonSettings.isDesktop) {
        yudu_searchFunctions.setBrandableSearchComponents($('#desktopSearchText'), $('#desktopSearchGo'));
    }
};

/**
 * Miscellaneous controls
 */
var onResize = function () {
    if (!yudu_commonSettings.isDesktop) {
        positionButtonsForTouch();
    }
    setTogglableLeftPosition();
    positionSearchResults();
};

var onLoginApproved = function() {
    if (yudu_toolbarFunctions.articlesAvailable()) {
        showButton('phoneview');
        if (!yudu_commonSettings.isDesktop) {
            positionButtonsForTouch();
        }
        yudu_events.unsubscribe(yudu_events.ALL, yudu_events.COMMON.LOGIN_APPROVED, onLoginApproved, false);
    }
};

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


var cssFiles = [yudu_commonFunctions.createBrandingPath('toolbar/style.css')];
yudu_commonFunctions.loadCss(cssFiles, toolbarInit);

// Make source available in developer tools
//@ sourceURL=toolbar.js