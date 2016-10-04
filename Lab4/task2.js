var express = require('express');
var bodyParser = require('body-parser')
var app = express();
// set the view engine to ejs
app.set('view engine', 'ejs');

var port = 8081;
var entries = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


var contains = function(object, value){
    if(object.indexOf(value) > -1){
        return true;
    }else{
        return false;
    }
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

app.use(function (req, res, next) {
	res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");
	next();
});

app.get('/', function(req, res){
 	res.render('landing_page');
});

app.post('/post_coder', function(req, res){
    data = clean(req.body);
    console.log(JSON.stringify(data));

    entries.push(data);

    res.render('post_success', {
    	total_entries: entries.length
    });
});

app.get("/coders", function(req, res){
	data = clean(req.query);
    console.log(JSON.stringify(data));

    var entries = filterEntries(data);

    res.render('coders', {
    	user_agent: req.headers['user-agent'].toLowerCase(),
    	entries: entries,
    	data: data
    });
});

app.get("/get_coder/firstname/:fname", function(req, res){
	data = clean(req.params);
    console.log(JSON.stringify(data));

    var entries = filterEntries(data);

    res.render('specific_coders', {
    	user_agent: req.headers['user-agent'].toLowerCase(),
    	entries: entries,
    });
});

app.get("/get_coder/lastname/:lname", function(req, res){
	data = clean(req.params);
    console.log(JSON.stringify(data));

    var entries = filterEntries(data);

    res.render('specific_coders', {
    	user_agent: req.headers['user-agent'].toLowerCase(),
    	entries: entries,
    });
});

var server = app.listen(port, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log("Now listening at Host=" + host + " & Port=" +port);
})