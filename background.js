chrome.action.onClicked.addListener(function() {
    let newURL = 'https://www.crunchyroll.com/';
    chrome.tabs.create({ url: newURL });
});

chrome.runtime.onInstalled.addListener(reason => {
    if (reason.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        let thankYouPage = 'https://github.com/romulo126/ex_-Crunchyroll/tree/main';
        chrome.tabs.create({ url: thankYouPage });
    }
    reloadTabs();
});
function reloadTabs() {
    chrome.tabs.query({ url: '*://*.crunchyroll.com/*' }, function(tabs) {
        if (tabs.length > 0) {
            tabs.forEach(tab => {
                chrome.tabs.reload(tab.id);
            });
        }
    });
}
