var downloadPdfCustomSelectionToolbar = $('#downloadPdfCustomSelectionToolbar');
var downloadPdfCustomSelectionToolbarButtons = {
    cancel: $('#downloadPdfCustomSelectionCancel'),
    select: $('#downloadPdfCustomSelectionSelect'),
    done: $('#downloadPdfCustomSelectionDone'),
    all: $('.downloadPdfCustomSelectionButton')
};
var downloadPdfCustomSelectionCheckBoxes = {
    left: $('#downloadPdfCustomSelectionLeftCheck'),
    right: $('#downloadPdfCustomSelectionRightCheck')
}

var downloadPdfCustomSelectionToolbarInit = function() {
    addDownloadPdfCustomSelectionToolbarButtonEventListeners();
    yudu_events.subscribe(yudu_events.ALL, yudu_events.DOWNLOAD_PDF_CUSTOM_SELECTION_TOOLBAR.UPDATE_SELECT_BUTTON_LABEL,
            updateDownloadPdfCustomSelectionToolbarSelectButtonLabel, false);
    yudu_events.subscribe(yudu_events.ALL, yudu_events.DOWNLOAD_PDF_CUSTOM_SELECTION_TOOLBAR.UPDATE_CURRENT_PAGES,
        updateDownloadPdfCustomSelectionIndicators, false);
    if (!yudu_commonSettings.isDesktop) {
        downloadPdfCustomSelectionToolbar.addClass('touchDevice');
        downloadPdfCustomSelectionToolbarButtons.all.addClass('touchDevice');
    }
};

/**
 * Add listeners for tap events to the toolbar buttons
 */
var addDownloadPdfCustomSelectionToolbarButtonEventListeners = function() {
    var cancelManager = yudu_commonFunctions.createHammerJSTapManager(downloadPdfCustomSelectionToolbarButtons.cancel[0]);
    cancelManager.on('tap', yudu_downloadPdfFunctions.downloadCustomSelectionCancelClicked);
    var selectManager = yudu_commonFunctions.createHammerJSTapManager(downloadPdfCustomSelectionToolbarButtons.select[0]);
    selectManager.on('tap', yudu_downloadPdfFunctions.downloadCustomSelectionSelectClicked);
    var doneManager = yudu_commonFunctions.createHammerJSTapManager(downloadPdfCustomSelectionToolbarButtons.done[0]);
    doneManager.on('tap', yudu_downloadPdfFunctions.downloadCustomSelectionDoneClicked);
};

var updateDownloadPdfCustomSelectionToolbarSelectButtonLabel = function(event) {
    downloadPdfCustomSelectionToolbarButtons.select.text(event.data.newLabel);
    if (event.data.newLabel == "Unselect") {
        downloadPdfCustomSelectionCheckBoxes.left.prop('checked', true);
        downloadPdfCustomSelectionCheckBoxes.right.prop('checked', true);
    } else {
        downloadPdfCustomSelectionCheckBoxes.left.prop('checked', false);
        downloadPdfCustomSelectionCheckBoxes.right.prop('checked', false);
    }
};

var updateDownloadPdfCustomSelectionIndicators = function (event) {
    if (event.data.leftPageNumber == null || event.data.rightPageNumber == null || event.data.leftPageNumber === 0) {
        downloadPdfCustomSelectionCheckBoxes.left.css('visibility', 'hidden');
    } else {
        downloadPdfCustomSelectionCheckBoxes.left.css('visibility', 'visible');
    }
}

var cssFiles = [yudu_commonFunctions.createBrandingPath('downloadPdfCustomSelectionToolbar/style.css')];
yudu_commonFunctions.loadCss(cssFiles, downloadPdfCustomSelectionToolbarInit);
