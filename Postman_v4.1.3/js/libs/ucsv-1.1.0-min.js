/*!
 * UCSV 1.1.0
 * Provided under MIT License.
 *
 * Copyright 2010-2012, Peter Johnson
 * http://www.uselesscode.org/javascript/csv/
 */
var CSV = (function() {
    var f = /^\d+$/,
        g = /^\d*\.\d+$|^\d+\.\d*$/,
        i = /^\s|\s$|,|"|\n/,
        b = (function() {
            if (String.prototype.trim) {
                return function(j) {
                    return j.trim()
                }
            } else {
                return function(j) {
                    return j.replace(/^\s*/, "").replace(/\s*$/, "")
                }
            }
        }());

    function h(j) {
        return Object.prototype.toString.apply(j) === "[object Number]"
    }

    function a(j) {
        return Object.prototype.toString.apply(j) === "[object String]"
    }

    function d(j) {
        if (j.charAt(j.length - 1) !== "\n") {
            return j
        } else {
            return j.substring(0, j.length - 1)
        }
    }

    function e(k) {
        var p, m = "",
            o, n, l;
        for (n = 0; n < k.length; n += 1) {
            o = k[n];
            for (l = 0; l < o.length; l += 1) {
                p = o[l];
                if (a(p)) {
                    p = p.replace(/"/g, '""');
                    if (i.test(p) || f.test(p) || g.test(p)) {
                        p = '"' + p + '"'
                    } else {
                        if (p === "") {
                            p = '""'
                        }
                    }
                } else {
                    if (h(p)) {
                        p = p.toString(10)
                    } else {
                        if (p === null) {
                            p = ""
                        } else {
                            p = p.toString()
                        }
                    }
                }
                m += l < o.length - 1 ? p + "," : p
            }
            m += "\n"
        }
        return m
    }

    function c(t, p) {
        t = d(t);
        var q = "",
            l = false,
            m = false,
            o = "",
            r = [],
            j = [],
            k, n;
        n = function(s) {
            if (m !== true) {
                if (s === "") {
                    s = null
                } else {
                    if (p === true) {
                        s = b(s)
                    }
                }
                
                if(true) { //this should be set to false if you want conversion to num
                    if (f.test(s)) {
                        s = parseInt(s, 10)
                    } else {
                        if (g.test(s)) {
                            s = parseFloat(s, 10)
                        }
                    }
                }
            }
            return s
        };
        for (k = 0; k < t.length; k += 1) {
            q = t.charAt(k);
            if (l === false && (q === "," || q === "\n")) {
                o = n(o);
                //to fix \r at the end of the last column
                if(typeof o === "string") {
                    o = o.replace(new RegExp(String.fromCharCode(13), 'g'), '');
                }
                r.push(o);
                if (q === "\n") {
                    j.push(r);
                    r = []
                }
                o = "";
                m = false
            } else {
                if (q !== '"') {
                    o += q
                } else {
                    if (!l) {
                        l = true;
                        m = true
                    } else {
                        if (t.charAt(k + 1) === '"') {
                            o += '"';
                            k += 1
                        } else {
                            l = false
                        }
                    }
                }
            }
        }
        o = n(o);
        r.push(o);
        j.push(r);
        return j
    }
    if (typeof exports === "object") {
        exports.arrayToCsv = e;
        exports.csvToArray = c
    }
    return {
        arrayToCsv: e,
        csvToArray: c
    }
}());