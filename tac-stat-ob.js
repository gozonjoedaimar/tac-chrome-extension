var tacCompareSummary = (unitLevel, unitsUrl, fromExtension) => {

var getUnitInfo = function(url) {
    return new Promise(function(resolve) {
        var settings = {
          "async": true,
          "crossDomain": true,
          "url": url,
          "method": "GET",
          "headers": {}
        }

        $.ajax(settings).done(function (response) {
          resolve(response);
        });
        
    });
};

class TACStat {
    constructor(baseType, bodyEl, selector, fromExtension) {
        this.body = bodyEl || $('body');
        this.baseType = [60,65,75,85];
        this.unitName = this.body.find('.heading h1').text();
        if (this.baseType.indexOf(baseType) < 0) {
            baseType = this.baseType[0];
            //this.refreshStat(baseType);
        } else {
            this.refreshStat(baseType, fromExtension);
        }
    }
    ajax(url, baseType, fromExtension) {
        var that = this;
        let icon = that.icon;
        delete(that.icon);

        console.log('Fetching url:', url);
        getUnitInfo(url).then(function(data) {
            data = data.replace('<body', '<body><div id="body"').replace('</body>', '</div></body>');
            var dom = $(data).filter('#body');
            var type = baseType || 60;
            dom.data('icon', icon);
            var tacStat = new TACStat(type, dom, null, fromExtension);
        });
    }
    statInfo() {
        return ['hp','patk','pdef','matk','mdef','dex','agi','crit','luck','jewels'];
    }
    logStats(fromExtension) {
        var that = this;
        var unitName = that.unitName;
        var rank = that.body.find('.unit-panel > div.card-body > table > tbody > tr:nth-child(2) > td').text();
        var elem = that.body.find('.unit-panel > div.card-body > table > tbody > tr:nth-child(1) > td span').data('title');
        console.log(unitName, 'Stats', `(${rank})`,`(${elem})`);
        var data = [
            this.baseStat,
            this.j1Stat,
            this.j2Stat,
            this.j3Stat,
        ];
        if (that.body.find('#j4-tab').length) data.push(this.j4Stat);
        if (fromExtension && typeof fromExtension == 'function') {
            fromExtension({unitName, rank, elem, data, icon: that.body.data('icon')});
        }
        console.table(data, ['info', ...this.statInfo()]);
    }
    loadPage(page, fn) {
        var that = this;
        return new Promise((res, rej) => {
            // location.href = page;
            setTimeout(() => {
                fn();
                res();
            }, 1000);            
        });
    }
    refreshStat(baseType = 60, fromExtension) {
        console.log(`Reading ${this.unitName} stats (${baseType})...`);
        if (this.baseType.indexOf(baseType) < 0) {
            console.error('Invalid baseType');
            return;
        }
        var that = this;
        that.loadPage("#stats",function() {
            that.getBaseStat(null, baseType);
        })
        .then(function() {
            return that.loadPage("#jobs", function() {
                // Init jobs
            });
        })
        .then(function() {
            return that.loadPage("#j1", function() {
                that.getJ1(1);                
            });
        })
        .then(function() {
            return that.loadPage("#j2", function() {
                that.getJ2(1);                
            });
        })
        .then(function() {
            return that.loadPage("#j3", function() {
                that.getJ3(1);                
            });
        })
        .then(function() {
            if (that.body.find('#j4-tab').length) {
                return that.loadPage("#j4", function() {
                    that.getJ4(1);                
                });
            }
            else {
                return;
            }
        })
        .then(function() {
            that.logStats(fromExtension);
        });
    }
    getBaseStat(selector, baseType) {
        var that = this;
        var tableEl = selector ? that.body.find(selector): that.body.find('#stats > div > div.card-body > div:nth-child(1) > div:nth-child(2) > table');
        var statColumn = this.baseType.indexOf(baseType) + 2;
        var values = tableEl.find('tr > td:nth-child('+statColumn+')').map((i, el) => { return parseFloat($(el).text()); });

        this.baseStat = (function() {
            var ob = {};
            var statInfo = that.statInfo();

            statInfo.forEach((element, i) => {
                ob[element] = values[i];
            });

            return ob;
        })();

        this.baseStat.info = `base (${baseType})`;

        return this.baseStat;
    }
    getJobStat(selector, total) {
        var that = this;
        var tableEl = selector ? that.body.find(selector) : that.body.find('#stats > div > div.card-body > div:nth-child(1) > div:nth-child(1) > table');
        var values = tableEl.find('tr > td:nth-child(2)').map((i, el) => { return parseFloat($(el).text()); });

        var baseStat = that.baseStat;
        var ob = {};
        var statInfo = that.statInfo();

        statInfo.forEach((element, i) => {
            var cellValue = isNaN(values[i]) ? 0: values[i];
            if (total)
                ob[element] = cellValue + baseStat[element];
            else
                ob[element] = cellValue;
        });

        return ob;
    }
    getJ1(total) {
        var that = this;
        this.j1Stat = {info: that.body.find('a#j1-tab').text() +' (job1)'};
        Object.assign(this.j1Stat, this.getJobStat('#j1 > div > div.card-body > div:nth-child(1) > div:nth-child(1) > table:nth-child(1)', total));
        return this.j1Stat;
    }
    getJ2(total) {
        var that = this;
        this.j2Stat = {info: that.body.find('a#j2-tab').text() +' (job2)'};
        Object.assign(this.j2Stat, this.getJobStat('#j2 > div > div.card-body > div:nth-child(1) > div:nth-child(1) > table:nth-child(1)', total));
        return this.j2Stat;
    }
    getJ3(total) {
        var that = this;
        this.j3Stat = {info: that.body.find('a#j3-tab').text() +' (job3)'};
        Object.assign(this.j3Stat, this.getJobStat('#j3 > div > div.card-body > div:nth-child(1) > div:nth-child(1) > table:nth-child(1)', total));
        return this.j3Stat;
    }
    getJ4(total) {
        var that = this;
        this.j4Stat = {info: that.body.find('a#j4-tab').text() +' (job4)'};
        Object.assign(this.j4Stat, this.getJobStat('#j4 > div > div.card-body > div:nth-child(1) > div:nth-child(1) > table:nth-child(1)', total));
        return this.j4Stat;
    }
}

var level = unitLevel;




if (unitsUrl) {


var settings = {
  "async": true,
  "crossDomain": true,
  "url": unitsUrl,
  "method": "GET",
  "headers": {}
}

$.ajax(settings).done(function (data) {
    data = data.replace('<body', '<body><div id="body"').replace('</body>', '</div></body>');
    var dom = $(data).filter('#body');
    var type = unitLevel || 60;
    var tacStat = new TACStat();            


    // Get stats for all
    var units = dom.find('a.listing-link');
    console.log('Unit links found:', units.length);
    if (!units.length) {
        if (dom.find('#j1-tab').length) {
            tacStat.refreshStat(level, fromExtension);
        }
        else {
            console.log('No units found.', `Please check if you're on the correct page.`);
        }
    }
    units.each(function(i, el) {
        var ahref = $(el).attr("href");
        var http = unitsUrl.split('/').splice(0,1);
        var basePath = unitsUrl.split('/').splice(2,1);
        link = http + '//' + basePath + ahref;
        tacStat.icon = $(el).find('.icon img:nth-child(1)').get(0).src;
        tacStat.ajax(link, level, fromExtension);
    });

});

    
} else {



// Load all in page
var tacStat = new TACStat();

// Check base
if (!level) {
    console.log('Please set base level.', tacStat.baseType);
    return;
}
else if (!tacStat.baseType.includes(level)) {
    console.log(level);
    console.log('Invalid base leve provided.', 'Select one of these:', tacStat.baseType);
    return;
}



    // Get stats for all
    var units = $('a.listing-link');
    console.log('Unit links found:', units.length);
    if (!units.length) {
        if ($('#j1-tab').length) 
            tacStat.refreshStat(level);
        else
            console.log('No units found.', `Please check if you're on the correct page.`);
    }
    units.each(function(i, el) {
    	tacStat.ajax(el.href, level);
    });

}


}