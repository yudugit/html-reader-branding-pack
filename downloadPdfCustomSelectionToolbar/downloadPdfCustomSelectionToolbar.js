var downloadPdfCustomSelectionToolbar = $('#downloadPdfCustomSelectionToolbar');
var downloadPdfCustomSelectionToolbarButtons = {
    cancel: $('#downloadPdfCustomSelectionCancel'),
    select: $('#downloadPdfCustomSelectionSelect'),
    done: $('#downloadPdfCustomSelectionDone'),
    all: $('.downloadPdfCustomSelectionButton')
};

var downloadPdfCustomSelectionToolbarInit = function() {
    addDownloadPdfCustomSelectionToolbarButtonEventListeners();
    yudu_events.subscribe(yudu_events.ALL, yudu_events.DOWNLOAD_PDF_CUSTOM_SELECTION_TOOLBAR.UPDATE_SELECT_BUTTON_LABEL,
            updateDownloadPdfCustomSelectionToolbarSelectButtonLabel, false);
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
};


var cssFiles = [yudu_commonFunctions.createBrandingPath('downloadPdfCustomSelectionToolbar/style.css')];
yudu_commonFunctions.loadCss(cssFiles, downloadPdfCustomSelectionToolbarInit);