var http = require('http');
var url = require('url');
var qs = require('querystring');
var port = 8081;

var entries = [];

var contains = function(object, value){
    if(object.indexOf(value) > -1){
        return true;
    }else{
        return false;
    }
}

var landingPage = function(req, res, data){
    var html = '<body>' +
        '<form action="post_coder" method="post">' +
            'First name: <input type="text" name="fname"><br>' +
            'Last name: <input type="text" name="lname"><br>' +
            'Experience (in years): <input type="number" name="experience"><br><br>' +
            'Languages:<br>' +
            '<input type="checkbox" name="languages" value="java">Java' +
            '<input type="checkbox" name="languages" value="python">Python' +
            '<input type="checkbox" name="languages" value="ruby">Ruby' +
            '<input type="checkbox" name="languages" value="c">C' +
            '<input type="checkbox" name="languages" value="c++">C++<br><br>' +
            
            'Availability:<br>' +
            '<input type="checkbox" name="availability" value="monday">Monday' +
            '<input type="checkbox" name="availability" value="tuesday">Tuesday' +
            '<input type="checkbox" name="availability" value="wednesday">Wednesday' +
            '<input type="checkbox" name="availability" value="thursday">Thursday' +
            '<input type="checkbox" name="availability" value="friday">Friday' +
            '<input type="checkbox" name="availability" value="saturday">Saturday' +
            '<input type="checkbox" name="availability" value="sunday">Sunday' +
            '<br><br>' +

            '<br><input type="submit" value="Create Entry">' +
        '</form>' +
        '<hr>' +
        '<br/><a href="coders">View Entries</a>' +
    '</body>';
    return html;
}

var filterEntries = function(filterEntry){
    var list = [];
    for(var index in entries){
        var entry = entries[index];

        //Filtering activities
        if(filterEntry.fname!=undefined && !contains(entry.fname, filterEntry.fname)){
            continue;
        }
        if(filterEntry.lname!=undefined && !contains(entry.lname, filterEntry.lname)){
            continue;
        }
        if(filterEntry.experience>=0 && entry.experience!=filterEntry.experience){
            continue;
        }
        
        if(filterEntry.languages.length>0){
            if(entry.languages.length==0){
                continue;
            }else{
                var flag = true;
                for (var index in entry.languages) {
                    var str = entry.languages[index];
                    if(contains(filterEntry.languages, str)){
                        flag = false;
                        break;
                    }
                }
                if(flag){
                    continue;
                }
            }
        }

        if(filterEntry.availability.length>0){
            if(entry.availability.length==0){
                continue;
            }else{
                var flag = true;
                for (var index in entry.availability) {
                    var str = entry.availability[index];
                    if(contains(filterEntry.availability, str)){
                        flag = false;
                        break;
                    }
                }
                if(flag){
                    continue;
                }
            }
        }
        
        list.push(entry);
    }
    return list;
}

var getFilterHtml = function(data){
    var str = "";
    var fname = data.fname==undefined ? "" : data.fname;
    var lname = data.lname==undefined ? "" : data.lname;
    var langs = data.languages==undefined ? [] : data.languages;
    var avails = data.availability==undefined ? [] : data.availability;
    str += "<form action='coders' method='get'>" +
            "First name: <input type='text' name='fname' value='"+ (fname) +"'>" +
            "Last name: <input type='text' name='lname' value='"+ (lname) +"'>" +
            "Experience (in years): <input type='number' name='experience' value='"+ (data.experience<0 ? "" : data.experience) +"'><br><br>" +
            "Languages:<br>" +
            
            "<input type='checkbox' name='languages' value='java' "+ (contains(langs, "java") ? "checked" : "") +">Java" +
            "<input type='checkbox' name='languages' value='python' "+ (contains(langs, "python") ? "checked" : "") +">Python" +
            "<input type='checkbox' name='languages' value='ruby' "+ (contains(langs, "ruby")  ? "checked" : "") +">Ruby" +
            "<input type='checkbox' name='languages' value='c' "+ (contains(langs, "c")  ? "checked" : "") +">C" +
            "<input type='checkbox' name='languages' value='c++' "+ (contains(langs, "c++") ? "checked" : "") +">C++<br><br>" +
            "" +
            "   Availability:<br>" +
            "<input type='checkbox' name='availability' value='monday' "+ (contains(avails, "monday") ? "checked" : "") +">Monday" +
            "<input type='checkbox' name='availability' value='tuesday' "+ (contains(avails, "tuesday") ? "checked" : "") +">Tuesday" +
            "<input type='checkbox' name='availability' value='wednesday' "+ (contains(avails, "wednesday") ? "checked" : "") +">Wednesday" +
            "<input type='checkbox' name='availability' value='thursday' "+ (contains(avails, "thursday") ? "checked" : "") +">Thursday" +
            "<input type='checkbox' name='availability' value='friday' "+ (contains(avails, "friday") ? "checked" : "") +">Friday" +
            "<input type='checkbox' name='availability' value='saturday' "+ (contains(avails, "saturday") ? "checked" : "") +">Saturday" +
            "<input type='checkbox' name='availability' value='sunday' "+ (contains(avails, "sunday") ? "checked" : "") +">Sunday" +
            "<br>" +
            "<br><input type='submit' value='Filter Results'>" +
        "</form>";
    return str;
}

var getEntries = function(req, res, data){
    data = clean(data);
    console.log(JSON.stringify(data));

    var html = "";
    if(contains(req.headers['user-agent'].toLowerCase(), "chrome")){
        html += "<body style='background-color:pink;'>";
    }else{
        html += "<body>";
    }
    html += getFilterHtml(data);
    html += "<br> <h3>RESULTS</h3>";
    var entries = filterEntries(data);
    for(var index in entries){
        var entry = entries[index];

        html += "<div>";
        html += "Name: " + entry.fname + " " + entry.lname + "<br>Languages: ";
        for(var l in entry.languages){
            var str = entry.languages[l];
            html += " " + str.charAt(0).toUpperCase() + str.slice(1);
        }
        
        html += "<br>Availability: ";
        for(var a in entry.availability){
            var str = entry.availability[a];
            html += " " + str.charAt(0).toUpperCase() + str.slice(1);
        }
        
        html += "<br>Experience: " + (entry.experience<0 ? "" : (entry.experience + " years") );
        html += "<hr>";
        html += "</div>";
    }
    html += "</body>";
    return html;
}

var clean = function(data){
    if(data.experience==""){
        data.experience = -1; // default value
    }
    if(typeof(data.languages) != "object"){
        if(data.languages==undefined){
            data.languages = []
        }else{
            data.languages = [data.languages]
        }
    }
    if(typeof(data.availability) != "object"){
        if(data.availability==undefined){
            data.availability = []
        }else{
            data.availability = [data.availability]
        }
    }
    return data;
}

var createEntry = function(req, res, data){
    console.log(JSON.stringify(data));
    
    data = clean(data);
    entries.push(data);

    var html = "New entry created successfully. <br /> Total Entries: " + entries.length;
    html += "<br /> <br />";
    html += landingPage(req, res, {});
    return html;
}

var errorPage = function(req, res, data){
    var html = "<body>\
        ERROR\
    </body>";
    return html;
}

var routes = [
    {url: "/", method: "GET", callback: landingPage},
    {url: "/post_coder", method: "POST", callback: createEntry},
    {url: "/coders", method: "GET", callback: getEntries},
];

var mapper = function(req, res, data){
    var urlObj = url.parse(req.url, true);
    var callback = errorPage;
    console.log("Received request for : " + req.url + " -- " + req.method);
    for(var x in routes){
        var obj = routes[x];
        if(obj.url == urlObj.pathname && obj.method == req.method){
            callback = obj.callback;
            break;
        }
    }
    return callback(req, res, data);
}

http.createServer(function (req, res) {

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.writeHead(200);

    
    var data = "";
    if(req.method=="POST"){
        // var queryData = url.parse(request.url, true).query;

        req.on('data', function (chunk) {
            data += chunk;
        });
        req.on('end', function () {
            res.write('<html>');
            res.write(mapper(req, res, qs.parse(data)));
            
        });
    }else{
        var urlObj = url.parse(req.url, true);
        data = urlObj.query;
        res.write('<html>');
        res.write(mapper(req, res, data));
        res.end('\n</html>');
    }
    
}).listen(port);