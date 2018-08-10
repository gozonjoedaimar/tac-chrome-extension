// TAC-STAT-COMPARE

(function($) {
    var currentTab = chrome.tabs;
    var initStat = function(base) {
        var mainBody = document.getElementById('unit-info-list');
        mainBody.innerHTML = "";
        var initText = document.createTextNode('Fetching data...');
        var initEl = document.createElement('small');
        initEl.appendChild(initText);
        var initClasses = 'rounded bg-dark col p-3 ml-3 mr-3 mb-0 text-white';
        initEl.classList.add(...initClasses.split(' '));
        mainBody.appendChild(initEl);
        currentTab.query({'currentWindow': true,'active': true}, function (tabs) {
            var url = tabs[0].url;

            if (!url.includes('alchemistcodedb.com/units')) {
                mainBody.innerHTML = "";
                var warning = document.createElement('small');
                warning.classList.add(..."rounded col p-3 mr-3 ml-3 mb-0 text-white bg-danger".split(' '));
                $(warning).html('Invalid url. Please visit <a target="_blank" class="text-white" href="http://www.alchemistcodedb.com/units"><u>http://www.alchemistcodedb.com/units</u></a>');
                mainBody.appendChild(warning);
                return;
            }

            tacCompareSummary(base, url, function(ajaxdata) {
                var pre = document.createElement('pre');
                pre.appendChild(document.createTextNode(JSON.stringify(ajaxdata, null, 2)));
                pre.classList.add('col-12');
                // mainBody.appendChild(pre);

                var unitTable = document.createElement('table');
                var unitTableCont = document.createElement('div');
                var unitTableContClasses = "col-12 mb-2";
                unitTableCont.classList.add(...unitTableContClasses.split(' '));
                var tableHead = $(`<h5>${ajaxdata.unitName} (${base}) <br/>(${ajaxdata.rank}) (${ajaxdata.elem})</h5>`);

                if (ajaxdata.icon) {
                    var unitIcon = document.createElement('img');
                    unitIcon.src = ajaxdata.icon;
                    unitIcon.classList.add(..."img-thumbnail float-left mr-2 mb-2 bg-secondary border-warning".split(' '));
                    unitIcon.width = 60;
                    unitTableCont.appendChild(unitIcon);
                }

                console.log(ajaxdata);

                unitTableCont.appendChild(tableHead.get(0));
                unitTableCont.appendChild(unitTable);

                mainBody.appendChild(unitTableCont);

                unitTableClasses = "table table-dark table-sm";
                unitTable.classList.add(...unitTableClasses.split(' '));
                $(unitTable).DataTable({
                    dom: 't',
                    data: ajaxdata.data,
                    autoWidth: false,
                    columns: [
                        {
                            title: "info",
                            data: "info"
                        },
                        {
                            title: "hp",
                            data: "hp"
                        },
                        {
                            title: "patk",
                            data: "patk"
                        },
                        {
                            title: "pdef",
                            data: "pdef"
                        },
                        {
                            title: "matk",
                            data: "matk"
                        },
                        {
                            title: "mdef",
                            data: "mdef"
                        },
                        {
                            title: "dex",
                            data: "dex"
                        },
                        {
                            title: "agi",
                            data: "agi"
                        },
                        {
                            title: "crit",
                            data: "crit"
                        },
                        {
                            title: "luck",
                            data: "luck"
                        },
                        {
                            title: "jewels",
                            data: "jewels"
                        },
                    ],
                    columnDefs: [
                        {
                            target: "_all",
                            defaultContent: "&nbsp;"
                        }
                    ]
                });
                
                if (initEl.parentElement) mainBody.removeChild(initEl);
            })

        });
    }
    document.addEventListener('DOMContentLoaded', function() {
        let baseSelector = document.getElementById('base-id');
        initStat(parseInt(baseSelector.value));
        baseSelector.addEventListener('change', function() {
            initStat(parseInt(this.value));
        })
    });
})(this.jQuery)