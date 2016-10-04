exports.contains = function(object, value){
    if(object.indexOf(value) > -1){
        return true;
    }else{
        return false;
    }
}

exports.filterEntries = function(filterEntry, entries){
    var list = [];
    for(var index in entries){
        var entry = entries[index];

        //Filtering activities
        if(filterEntry.fname!=undefined && !exports.contains(entry.fname, filterEntry.fname)){
            continue;
        }
        if(filterEntry.lname!=undefined && !exports.contains(entry.lname, filterEntry.lname)){
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
                    if(exports.contains(filterEntry.languages, str)){
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
                    if(exports.contains(filterEntry.availability, str)){
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

exports.filterEntries_mongo = function(filterEntry, Entry, callback){
    var list = [];

    var query = {};
    var and_query = [];

    if(filterEntry.fname!=undefined && filterEntry.fname.length>0){
        and_query.push({'fname': filterEntry.fname});
    }

    if(filterEntry.lname!=undefined && filterEntry.lname.length>0){
        and_query.push({'lname': filterEntry.lname});
    }

    var or_queries = [];
    if(filterEntry.experience>=0){
        and_query.push({'experience': filterEntry.experience});
    }
    if(filterEntry.languages.length>0){
        and_query.push({'languages': {$in: filterEntry.languages}});   
    }
    
    if(filterEntry.availability.length>0){
        and_query.push({'availability': {$in: filterEntry.availability}});   
    }
    
    if(and_query.length>0){
        query = {$and: and_query};    
    }
    console.log(JSON.stringify(query));

    Entry.find(query).exec(callback);
}

exports.get_matching_entires = function(filterEntry, all_entries, max_entries){
	var list = [];

	for(var index in all_entries){
        var entry = all_entries[index];
        var fname = entry.fname;
        var lname = entry.lname;
        var exp = entry.experience;

        //Filtering activities
		var matchingFirstName = filterEntry.fname!=undefined && fname == filterEntry.fname;
		var matchingLastName = filterEntry.lname!=undefined && lname == filterEntry.lname; 
		var matchingExperience = filterEntry.experience>=0 && exp == filterEntry.experience;
		var containsLanguages = false; 
		var containsAvailability = false;
		
		if(filterEntry.languages.length>0){
			if(entry.languages.length==0){
				containsLanguages = false;
			}else{
				for (var index in entry.languages) {
                    var str = entry.languages[index];
                    if(exports.contains(filterEntry.languages, str)){
						containsLanguages = true;
						break;
					}
                }
			}
		}
		if(filterEntry.availability.length>0){
			if(entry.availability.length==0){
				containsAvailability = false;
			}else{
				for (var index in entry.availability) {
                    var str = entry.availability[index];
                    if(exports.contains(filterEntry.availability, str)){
						containsLanguages = true;
						break;
					}
                }
			}
		}
		
		if(list.length < max_entries){
			if(!matchingFirstName && !matchingLastName && (matchingExperience || containsAvailability || containsLanguages) ){
				list.push(entry);
			}
		} else {
			break;
		}
    }
    return list;
}

exports.get_matching_entires_mongo = function(filterEntry, Entry, max_entries, callback){
    var query = {};
    var and_query = [];

    if(filterEntry.fname!=undefined){
        and_query.push({'fname': {'$ne': filterEntry.fname}});
    }

    if(filterEntry.lname!=undefined){
        and_query.push({'lname': {'$ne': filterEntry.lname}});
    }

    var or_queries = [];
    if(filterEntry.experience>=0){
        or_queries.push({'experience': filterEntry.experience});
    }
    or_queries.push({'languages': {$in: filterEntry.languages}});
    or_queries.push({'availability': {$in: filterEntry.availability}});

    and_query.push({$or: or_queries});
    query = {$and: and_query};

    Entry.find(query).limit(max_entries).exec(callback);

}

exports.is_valid_query = function(data){
    var parameters = ['fname', 'lname', 'languages', 'experience', 'availability'];
    var all_languages = ["java", "python", "ruby", "c", "c++"];
    var all_availabilities = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    var keys = Object.keys(data);
    for(var index in keys){
        var k = keys[index];
        if(!exports.contains(parameters, k)){
            return false;
        }
    }
    if(data.experience!=undefined && data.experience != parseInt(data.experience)){
        return false;
    }

    for(var index in data.languages){
        var l = data.languages[index];
        if(!exports.contains(all_languages, l)){
            return false;
        }
    }

    for(var index in data.availability){
        var a = data.availability[index];
        if(!exports.contains(all_availabilities, a)){
            return false;
        }
    }

    return true;
}

exports.clean = function(data){
    if(data.experience==""){
        data.experience = -1; // default value
    }
    data = exports.clean_languages(data);
    data = exports.clean_availability(data);
    return data;
}

exports.clean_languages = function(data){
    if(typeof(data.languages) != "object"){
        if(data.languages==undefined){
            data.languages = []
        }else{
            data.languages = [data.languages]
        }
    }
    return data;
}

exports.clean_availability = function(data){
    if(typeof(data.availability) != "object"){
        if(data.availability==undefined){
            data.availability = []
        }else{
            data.availability = [data.availability]
        }
    }
    return data;
}

exports.isNewUser = function(cookies){
    var keys = [];
    if(cookies == undefined){
        return true;
    }
    for(var key in cookies){
        keys.push(key);
    }

    if(exports.contains(keys, "fname") && exports.contains(keys, "lname")){
        return false;
    }else{
        return true;
    }
}