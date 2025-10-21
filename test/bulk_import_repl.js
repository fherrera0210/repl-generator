
// NOTE: DO NOT EDIT TEXT BELOW

var csv = require("fast-csv");
var async = require("async");

/**
 * This module is maintained by Digital Marketing.
 * Please consult with a Digital Marketing Dev if you have any questions regarding the contents of this file.
 * NOTE: This REPL uses a predefined csv to import. Place csv information in 'newData' variable.
 * 
 * @version 0.1.2
 * @author jpi
 * @date 02/20/2025
 */

/**** BEGIN: REQUIRED! ****/
var myConfig = {
        // set this to the sitename -- generally 'primary
        // but can be any site in the siteConfig.json file
        to_siteName : "primary", // primary
        client: site.client // mung
};

(async function main(){
    var newData = `"<csv is placed here>"`;
        /* var newData = `from,to,type
/events/,/our-events/,staticNoQuery
/events/this-weekend/,/our-events/things-to-do-this-weekend/,staticNoQuery
/things-to-do/,/explore-downtown/,staticNoQuery
/events/family-friendly/,/our-events/things-to-do-with-kids/,staticNoQuery
/things-to-do/family-fun/kids-activities/,/our-events/things-to-do-with-kids/,staticNoQuery
/things-to-do/free-attractions/,/our-events/things-to-do-for-free/,staticNoQuery
/restaurants/,/explore-downtown/restaurants/,staticNoQuery
/things-to-do/outdoors/,/outdoors/,staticNoQuery
/things-to-do/attractions-and-museums/,/explore-downtown/attractions/,staticNoQuery
/events/richmond-festivals/,/our-events/,staticNoQuery
/events/outdoor-events/,/outdoors/,staticNoQuery
/things-to-do/attractions-and-museums/museums/,/explore-downtown/attractions/,staticNoQuery
/restaurants/events/,/explore-downtown/restaurants/,staticNoQuery
/things-to-do/free-attractions/family-fun/,/our-events/things-to-do-for-free/,staticNoQuery
/things-to-do/attractions-and-museums/attractions/,/explore-downtown/attractions/,staticNoQuery
/things-to-do/free-attractions/museums/,/explore-downtown/attractions/,staticNoQuery
/things-to-do/shop/,/explore-downtown/shopping/,staticNoQuery
/things-to-do/nightlife/,/our-events/things-to-do-this-weekend/,staticNoQuery
/things-to-do/outdoors/belle-isle/,/outdoors/belle-isle/,staticNoQuery
/things-to-do/arts-and-culture/,/explore-downtown/arts-and-culture/,staticNoQuery
/things-to-do/arts-and-culture/performing-arts/,/explore-downtown/arts-and-culture/,staticNoQuery
/events/arts-and-culture/,/our-events/,staticNoQuery
/things-to-do/free-attractions/outdoor-destination/,/outdoors/,staticNoQuery
/event/friday-cheers/46156/,/our-events/friday-cheers/,staticNoQuery
/listing/riverfront-canal-cruises/957/,/listing/riverfront-canal-cruises/437/,staticNoQuery
/things-to-do/outdoors/james-river/,/outdoors/james-river-activities/,staticNoQuery
/events/submit-your-event/,/our-events/submit-your-event/,staticNoQuery
/listing/american-civil-war-museum/920/,/listing/american-civil-war-museum/2/,staticNoQuery
/listing/benchtop-brewing-co/12613/,/listing/benchtop-brewing/136/,staticNoQuery
/things-to-do/free-attractions/art-galleries/,/explore-downtown/arts-and-culture/art-galleries/,staticNoQuery
/listing/institute-for-contemporary-art/4383/,/listing/institute-for-contemporary-art-at-vcu/308/,staticNoQuery
/about/,/about-us/,staticNoQuery
/contact/,/about-us/contact-us/,staticNoQuery
/partners/about/,/partners/,staticNoQuery
/listing/the-valentine/899/,/listing/the-valentine/662/,staticNoQuery
/events/richmond-festivals/2nd-street-festival/,/our-events/2nd-street-festival/,staticNoQuery
/listing/american-civil-war-museum-white-house-of-the-confederacy/891/,/listing/white-house-of-the-confederacy/720/,staticNoQuery
/events/richmond-festivals/dominion-riverrock/,/our-events/dominion-energy-riverrock/,staticNoQuery
/event/the-dinner-detective-comedy-mystery-dinner-show/46085/,/our-events/2nd-street-festival/,staticNoQuery
/restaurants/tours/,/explore-downtown/restaurants/,staticNoQuery
/blog/post/celebrate-juneteenth-in-the-richmond-region/,/news/post/how-to-celebrate-juneteenth-in-richmond-va/,staticNoQuery
/listing/belle-isle/1255/,/listing/belle-isle/619/,staticNoQuery
/listing/poe-museum/893/,/listing/edgar-allen-poe-museum/5/,staticNoQuery
/listing/belle-isle/4547/,/listing/belle-isle/619/,staticNoQuery
/listing/coalition-theater/3582/,/listing/coalition-theater/452/,staticNoQuery
/things-to-do/attractions-and-museums/va-museum-of-fine-arts/,/live-downtown/historic-neighborhoods/,staticNoQuery
/events/richmond-festivals/richmond-folk-festival/,/our-events/richmond-folk-festival/,staticNoQuery
/listing/dominion-energy-center-for-the-performing-arts/1169/,/listing/dominion-energy-center-for-the-performing-arts/453/,staticNoQuery
/listing/black-history-museum-and-cultural-center-of-virginia/896/,/listing/black-history-museum-and-cultural-center-of-virginia/3/,staticNoQuery
/listing/gather-&-hem/12640/,/listing/gather-%26-hem/281/,staticNoQuery
/things-to-do/tours/street-art/,/explore-downtown/arts-and-culture/richmond-street-art/,staticNoQuery
/listing/walking-the-ward-with-gary-flowers/6665/,/listing/walking-the-ward-with-gary-flowers/613/,staticNoQuery
/partners/about/rrt-staff/,/about-us/our-staff/,staticNoQuery`; */
        insertRedirects(newData);
})();

function insertRedirects(source){
    var typeMap = {
        "static" : 0,
        "staticNoQuery" : 1,
        "regex" : 2
    };
    
    var api = site.plugins.nav.apis.redirects;
    var count = 0;
    var docs = [];
    var info = { batches : 0, matched : 0, modified : 0, upserted : 0 };
    var start = new Date();
    
    async.series([
        function(cb) {
            // !!!DANGER -- remove({}) WILL DELETE FROM ALL SITES!!!
            // api.remove({}, cb);
            // api.remove({ site_name : myConfig.to_siteName }, cb);
            
            cb(null);
        },
        function(cb) {
            var err = null;
            var line = 1;
            
            var args = { headers : true, quoteColumns : true, trim : true };
            var tmp = csv.fromString(source, args);
            tmp.on("data", function(row) {
                if (err !== null) { return; }
                if (row.from === undefined || row.to === undefined || row.type === undefined) {
                    err = new Error("CSV column names are invalid");
                }
                
                line++;
                
                if (isExactType(row.type)) {
                    row.from = queryAlphaSort(row.from)
                }
                
                var doc = {
                    active : true,
                    site_name : myConfig.to_siteName,
                    type : typeMap[row.type] !== undefined ? typeMap[row.type] : "BAD_TYPE",
                    from : row.from,
                    to : row.to,
                    statuscode : 301
                };
                
                count++;
                
                docs.push(doc);
            }).on("end", function() {
                cb(err);
            });
        },
        function(cb) {
            if (count === 0) {
                return cb(null);
            }
            
            // bulk inserts in batches of 1000
            
            async.whilst(
                function() { return docs.length > 0; },
                function(cb) {
                    var toInsert = docs.splice(0, 1000);
                    
                    var bulk = api.collection.initializeUnorderedBulkOp();
                    
                    toInsert.forEach(function(doc) {
                        // if redirect with site + type + from already exists, we update it, else we insert
                        var filter = { site_name: myConfig.to_siteName, type : doc.type, from : doc.from };
                        bulk.find(filter).upsert().replaceOne(doc);
                    });
                    
                    bulk.execute(function(err, rtn) {
                        if (err && err.errmsg) { return cb(new Error(err.errmsg)); }
                        else if (err) { return cb(err); }
                        
                        info.batches += rtn.ok;
                        info.upserted += rtn.nUpserted;
                        info.matched += rtn.nMatched;
                        info.modified += rtn.nModified;
                        
                        cb(null);
                    });
                },
                cb
            );
        }
    ], function(err) {
        if (err) { return cb(err); }
        
        var end = new Date();
        var taken = (end - start) + "ms";
        
        cb(null, { date : end, taken : taken, message : "Processed "+count+" Redirects" , info : info });
    });
    
    /*
     * Functions
     */
    function isExactType(type) {
        return (type === "static");        
    }
    
    function queryAlphaSort(pathString) {
        var pathObj = pathString.split('?');
        if (pathObj[1]) {
        
            var pairsRaw = pathObj[1].split("&");
            var pairs = [];
            pairsRaw.forEach(function(val, i) {
                var temp = val.split("=");
                
                pairs.push({ key : temp[0], value : temp[1] });
            });
            
            pairs = sortBy(pairs, [["key", "alpha", "asc"], ["value", "alpha", "asc"]]);
            
            var endQuery = pairs.map(function(val, i) {
                return val.key + (val.value === undefined ? "" : "=" + val.value);
            }).join("&");
            
            // delete urlObj.get;
            // urlObj.query = endQuery;
            pathObj[1] = endQuery;
            
            return pathObj[0] +'?' + pathObj[1];
        } else {
            return pathString;
        }
    }
    
    function parse(pathString) {
        if (pathString === undefined) { throw new Error("Parameter 'url' must be a string, not undefined") }
        console.log(pathString);
        var a = pathString;
        var auth = a.auth ? a.auth.split(":") : undefined;
        var r = {
            url : pathString, 
            scheme : undefined,
            auth : auth,
            user : auth !== undefined ? auth[0] : undefined, 
            pass : auth !== undefined ? auth[1] : undefined,
            host : a.hostname !== null ? a.hostname : undefined, 
            port : a.port !== null ? Number(a.port) : undefined, 
            path : a.pathname !== null ? a.pathname : undefined,
            query : a.query !== null ? a.query : undefined, 
            hash : undefined
        };
        r.get = qs.parse(r.query, { depth : 20, arrayLimit : 999 });
        return r;
    }
    
    function sortBy(arr, prop, type, dir) {
        if (arr.length <= 1) { return arr; } // if the array is length 0 or 1 bail early
        
        var isSingle = prop instanceof Array && prop[0] instanceof Array ? false : true;
        var sortOps;
        if (isSingle === true) {
            sortOps = [{ prop : prop, type : type, dir : dir }];
        } else {
            // if multiple the arguments come in on prop so we need to unfold to an object
            sortOps = new Array(prop.length);
            for(var i = 0; i < prop.length; i++) {
                sortOps[i] = { prop : prop[i][0], type : prop[i][1], dir : prop[i][2] };
            }
        }
        
        // our prop should always be an array for lookup purposes
        for(var i = 0; i < sortOps.length; i++) {
            var op = sortOps[i];
            if (op.prop instanceof Array === false) { op.prop = [op.prop]; }
        }
        
        // go through the array and extract the values from it so that way we don't have to do a look-up on each comparison
        var temp = new Array(arr.length);
        for(var i = 0; i < arr.length; i++) {
            var item = arr[i];
            var result = { values : new Array(sortOps.length), index : i, sortOps : sortOps };
            for(var j = 0; j < sortOps.length; j++) {
                var op = sortOps[j];
                
                var value = item;
                for(var k = 0; k < op.prop.length; k++) {
                    value = value[op.prop[k]];
                    if (value === undefined) { break; }
                }
                
                result.values[j] = {
                    raw : value, // original value needed in some comparisons
                    clean : op.type === "alpha" && value !== undefined ? value.toLowerCase() : value
                }
            }
            
            temp[i] = result;
        }
        
        temp.sort(propCompare);
        
        // after the sort is completed, recompose our data array based on the indexes from our mapped array
        var done = new Array(temp.length);
        for(var i = 0; i < temp.length; i++) {
            done[i] = arr[temp[i].index];
        }
        return done;
    }
    
    function propCompare(a, b) {
        for(var i = 0; i < a.sortOps.length; i++) {
            var op = a.sortOps[i];
            var aVal = a.values[i].clean;
            var aValRaw = a.values[i].raw;
            var bVal = b.values[i].clean;
            var bValRaw = b.values[i].raw;
            var comp;
            
            if (aVal === undefined && bVal !== undefined) {
                comp = 1; // in an ascending sort undefined sorts to last, so if aVal is undefined bVal is smaller
            } else if (aVal !== undefined && bVal === undefined) {
                comp = -1; // in an ascending sort undefined sorts to last, so if bVal is undefined aVal is smaller
            } else if (aVal === undefined && bVal === undefined) {
                comp = 0; // both undefined, consider them equal
            } else if (op.type === "alpha") {
                // in alpha compare we want to compare without case first (all lower), and then with case, this way A goes before a and both go before B
                comp = aVal > bVal ? 1 : aVal < bVal ? -1 : aValRaw > bValRaw ? 1 : aValRaw < bValRaw ? -1 : 0;
            } else if (op.type === "numeric") {
                comp = aVal - bVal;
            } else if (op.type === "natural") {
                comp = naturalCompare(aVal, bVal);
            }
            
            if (comp !== 0) {
                comp *= op.dir === "asc" ? 1 : -1; // with a descending query we reverse the polarity
                return comp;
            }
        }
        
        return 0;
    }
}

