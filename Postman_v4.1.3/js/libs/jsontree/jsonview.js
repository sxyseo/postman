    /*
 * ViewJSON
 * Version 1.0
 * A Google Chrome extension to display JSON in a user-friendly format
 *
 * This is a chromeified version of the JSONView Firefox extension by Ben Hollis: 
 * http://jsonview.com 
 * http://code.google.com/p/jsonview
 *
 * Also based on the XMLTree Chrome extension by Moonty & alan.stroop
 * https://chrome.google.com/extensions/detail/gbammbheopgpmaagmckhpjbfgdfkpadb
 *
 * port by Jamie Wilkinson (@jamiew) | http://jamiedubs.com | http://github.com/jamiew
 * MIT license / copyfree (f) F.A.T. Lab http://fffff.at
 * Speed Project Approved: 2h
 */
function jv_JSONFormatter() {
    // No magic required.
}

jv_JSONFormatter.prototype = {
    htmlEncode: function (t) {
        return t != null ? t.toString().replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;") : '';
    },

    decorateWithSpan: function (value, className) {
        return '<span class="' + className + ' jv">' + this.htmlEncode(value) + '</span>';
    },

    // Convert a basic JSON datatype (number, string, boolean, null, object, array) into an HTML fragment.
    valueToHTML: function(value) {
        var valueType = typeof value;

        var output = "";
        if (value == null) {
            output += this.decorateWithSpan('null', 'null');
        }
        else if (value && value.constructor.name=="BigNumber") {
            output += this.decorateWithSpan(value.toString(),'num');
        }
        else if (value && value.constructor == Array) {
            output += this.arrayToHTML(value);
        }
        else if (valueType == 'object') {
            output += this.objectToHTML(value);
        }
        else if (valueType == 'number') {
            output += this.decorateWithSpan(value, 'num');
        }
        else if (valueType == 'string') {
            if (/^(http|https):\/\/[^\s]+$/.test(value)) {
                value = this.htmlEncode(value);
                output += '"<a class="jv link cm-link" href="' + value + '">' + value + '</a>"';
            }
            //check for values of type '/users/3'
            else if(value[0]=='/') {
                output += '"<a class="jv link cm-link" href="' + value.substring(1) + '">' + value + '</a>"';
            }
            else {
                output += this.decorateWithSpan('"' + value + '"', 'string');
            }
        }
        else if (valueType == 'boolean') {
            output += this.decorateWithSpan(value, 'bool');
        }

        return output;
    },

    // Convert an array into an HTML fragment
    arrayToHTML: function(json) {
        var output = '[<ul class="array collapsible jv">';
        var hasContents = false;
        for ( var prop in json ) {
            hasContents = true;
            output += '<li class="jv">';
            output += this.valueToHTML(json[prop]);
            output += '</li>';
        }
        output += '</ul>]';

        if ( ! hasContents ) {
            output = "[ ]";
        }

        return output;
    },

    // Convert a JSON object to an HTML fragment
    objectToHTML: function(json) {
        var output = '{<ul class="obj collapsible jv">';
        var hasContents = false;
        for ( var prop in json ) {
            hasContents = true;
            output += '<li class="jv">';
            output += '<span class="prop jv">"' + this.htmlEncode(prop) + '"</span>: ';
            output += this.valueToHTML(json[prop]);
            output += '</li>';
        }
        output += '</ul>}';

        if ( ! hasContents ) {
            output = "{ }";
        }

        return output;
    },

    // Convert a whole JSON object into a formatted HTML document.
    jsonToHTML: function(json, callback) {
        var output = '';
        if( callback ){
            output += '<div class="callback jv">' + callback + ' (</div>';
            output += '<div id="json jv">';
        }else{
            output += '<div id="json jv">';
        }
        output += this.valueToHTML(json);
        output += '</div>';
        if( callback ){
            output += '<div class="callback jv">)</div>';
        }
        return this.toHTML(output);
    },

    // Produce an error document for when parsing fails.
    errorPage: function(error, data) {
        var output = '<div id="error jv">Error parsing JSON: '+error.message+'</div>';
        output += '<h1 class="jv">'+error.stack+':</h1>';
        output += '<div id="json jv">' + this.htmlEncode(data) + '</div>';
        return this.toHTML(output);
    },

    // Wrap the HTML fragment in a full document. Used by jsonToHTML and errorPage.
    toHTML: function(content) {
        return content;
    }
};

function cleanJSON(data) {
//    var prefixes = ['//', 'while(true);', 'for(;;);'],
//        i,
//        l,
//        pos;
//
//    for (i = 0, l = prefixes.length; i < l; i++) {
//        pos = data.indexOf(prefixes[i]);
//        if (pos === 0) {
//            return data.substring(prefixes[i].length);
//        }
//    }

    //return data;
    var lastIndex = data.lastIndexOf("}")+1;
    return data.substring(data.indexOf('{'),lastIndex);
}


function jv_processJSON(content) {
    //check for empty data
    if(content.length==0) {
        return -1;
    }

    this.jv_data = content;
    if(/^\<pre.*\>(.*)\<\/pre\>$/.test(this.jv_data)){
        // console.log("JSONView: data is wrapped in <pre>...</pre>, stripping HTML...");
        this.jv_data = this.jv_data.replace(/<(?:.|\s)*?>/g, ''); //Aggressively strip HTML.
    }

    //Test if what remains is JSON or JSONp
    var jv_json_regex = /^\s*([\[\{].*[\}\]])\s*$/; // Ghetto, but it works
    var jv_jsonp_regex = /^[\s\u200B\uFEFF]*([\w$\[\]\.]+)[\s\u200B\uFEFF]*\([\s\u200B\uFEFF]*([\[{][\s\S]*[\]}])[\s\u200B\uFEFF]*\);?[\s\u200B\uFEFF]*$/;
    var jv_jsonp_regex2 = /([\[\{][\s\S]*[\]\}])\);/
    var jv_is_json = jv_json_regex.test(this.jv_data);
    var jv_is_jsonp = jv_jsonp_regex.test(this.jv_data);
    // console.log("JSONView: is_json="+jv_is_json+" is_jsonp="+jv_is_jsonp);
    var jsonp_array;
    jv_is_json=true;

    try {
        JSONbig.parse(this.jv_data);
    }
    catch(e) {
        jv_is_json=true;
        this.jv_data = cleanJSON(this.jv_data);
        try {
            JSONbig.parse(this.jv_data);
        }
        catch(e) {
            jv_is_json=false;
        }
    }
    if(!jv_is_json) {
        //test for JSONP
        jsonp_array = this.jv_data.trim().match(/^([a-zA-Z_$][0-9a-zA-Z_$]*\()([\s\S]*)(\);?)$/)
        if(jsonp_array && jsonp_array.length===4) {
            jv_is_json=true;
            try {
                JSONbig.parse(jsonp_array[2])
            }
            catch(e) {
                jv_is_json=false;
            }
        }
    }
    if(jv_is_json) {
        this.jv_jsonFormatter = new jv_JSONFormatter();
        var jv_outputDoc = '';
        var jv_cleanData = '',
            jv_callback = '';

        var jv_callback_results =jv_jsonp_regex.exec(this.jv_data);
        if(jsonp_array && jsonp_array.length===4) {
            // console.log("THIS IS JSONp");
            jv_callback = jsonp_array[1].substring(0,jsonp_array[1].length-1);
            jv_cleanData = jsonp_array[2];
        } else {
            // console.log("Vanilla JSON");
            jv_cleanData = this.jv_data;
        }

        // Covert, and catch exceptions on failure
        try {
            var jv_jsonObj = JSONbig.parse(jv_cleanData);
            if ( jv_jsonObj || jv_jsonObj===false) {
                jv_outputDoc = this.jv_jsonFormatter.jsonToHTML(jv_jsonObj, jv_callback);
            } else {
                throw "There was no object!";
            }
        } catch(e) {
            console.log(e);
            jv_outputDoc = this.jv_jsonFormatter.errorPage(e, this.jv_data);
        }

        return jv_outputDoc;
    }
    else {
        return -1;
    }
}