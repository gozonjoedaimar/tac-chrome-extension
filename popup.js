// TAC-STAT-COMPARE

(function($) {
    document.addEventListener('DOMContentLoaded', function() {
        var initText = document.createTextNode('Fetching data...');
        document.body.appendChild(initText);
        chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
            var url = tabs[0].url;

            tacCompareSummary(60, url, function(ajaxdata) {
                var pre = document.createElement('pre');
                pre.appendChild(document.createTextNode(JSON.stringify(ajaxdata, null, 2)));
                document.body.appendChild(pre);
                document.body.removeChild(initText);
            })

        });
    });
})(this.jQuery)