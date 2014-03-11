//1.Есть ли данные в кэше.
//2.Если нет, то достать, распарсить и положить в кэш.
//3.Отобразить

window.onload = function() {
	var elem = document.getElementById('search_button');
	elem.addEventListener( "click", function(e){
		DisplayGitHubUserData();
		e.preventDefault();
		return false;
	});
}

function DisplayGitHubUserData() {
	username = document.getElementById('a').value;
	if (!document.getElementById('sp_email')) {
		createTags();
	}
	var exists;
	if ( exists = document.getElementById('not_exists')) {
		document.getElementById('result').removeChild(exists);
	}

	deleteOldUserFields();

	var infoFields = getUserFieldsFromCache('info_' + username);
  	if(!infoFields) {
  			xmlRequest('https://api.github.com/users/' + username, function(responseText) {
			infoFields = parseInfo(responseText);
			displayInfoFields(infoFields);		
			storeFieldsToCache("info_" + username, infoFields);
  		});
			
	}

  	else {
  	 	displayInfoFields(infoFields);		
  	};

  	var reposFields = getUserFieldsFromCache('repos_' + username);
  	if(!reposFields) {
  		reposFields = {};
  		xmlRequest('https://api.github.com/users/' + username + '/repos', function(responseText) {
			reposFields['repos'] = parseRepos(responseText);
			displayReposFields(reposFields['repos']);		
			storeFieldsToCache("repos_" + username, reposFields);
  		});
  	}
	else {
  	 	displayReposFields(reposFields['repos']);		
  	};
}
	
function createTags() {	
   	var divInfo = document.createElement('div');
		document.getElementById('result').appendChild(divInfo);

		var spanName = document.createElement('span');
		spanName.id = "sp_login";
		divInfo.appendChild(spanName);

		var spanEmail = document.createElement('span');
		spanEmail.id = "sp_email";
		divInfo.appendChild(spanEmail);

		var spanFollowers = document.createElement('span');
		spanFollowers.id = "sp_followers";
		divInfo.appendChild(spanFollowers);

		var divRepo = document.createElement('span');
		divRepo.id = "repos";
		document.getElementById('result').appendChild(divRepo);
}	
	
function deleteOldUserFields() {
	var today = Date.now();
	var dm, userFields;
	for (var fieldsKey in localStorage) {
		userFields =  JSON.parse(localStorage.getItem(fieldsKey));
		dm = today - userFields['timeout'];
		if ( dm < 86400000) { //если не протух
			userFields['timeout'] = undefined; 
		} else {
			localStorage.removeItem(fieldsKey);
		}	
	}
}

function getUserFieldsFromCache(fieldsKey) {
	var userFields =  JSON.parse(localStorage.getItem(fieldsKey));
	if (!userFields) {
		return false;	
	} 
	return userFields;
}

function storeFieldsToCache(fieldsKey, userFields) {
	var today = Date.now();
	userFields['timeout'] = today;
	localStorage.setItem(fieldsKey, JSON.stringify(userFields)); 
}

function parseInfo(respond) {

	var tmp;
	var infoFields = {};
	var fieldsList = {'login':{cutFromEnd:2,cutFromBegin:9},
							 'email':{cutFromEnd:2,cutFromBegin:9},
							 'followers':{cutFromEnd:1,cutFromBegin:12}};

	for(var fieldName in fieldsList) {
		var field = JSON.parse(respond);
		if((!field[fieldName]) ) {
			infoFields[fieldName] = 'No';		
		}
		else {
			infoFields[fieldName] = field[fieldName];
		}
   }

   return infoFields;
}

function parseRepos(respond) {
	var i = 0;
	var repoList = [];
	var repos = JSON.parse(respond);
	if(!repos) { return; }	

	for ( key in repos ) {
		repoList[i++] = repos[key].name;
	}

	return repoList;
}

function	displayReposFields(reposFields) {
	var reposList;
	if(!reposFields) {
		reposList = "No public repos";
	}
	else {
		reposList = "Repos: " + reposFields.join(", ");
	}
	reposTag = document.getElementById('repos');
	reposTag.innerHTML = reposList;
}	

function	displayInfoFields(infoFields) {

	delete infoFields['timeout'];
	var fieldsList = {'login':{field: 'Login'},
							 'email':{field: 'Email'},
							 'followers':{field: 'Followers'}};

	for(var fieldName in infoFields){
		var infoTag = document.getElementById("sp_" + fieldName);
		infoTag.innerHTML = fieldsList[fieldName].field + ": " + infoFields[fieldName] + "<br>";
   }
}	

//AJAX
function getXmlHttp(){
  var xmlhttp;
  try {
    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
  } catch (e) {
    try {
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } catch (E) {
      xmlhttp = false;
    }
  }
  if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
    xmlhttp = new XMLHttpRequest();
  }
  return xmlhttp;
}

function xmlRequest(url, callback) {
	var xmlhttp = getXmlHttp();
	xmlhttp.open('GET', url, true);
	xmlhttp.onreadystatechange = function() {
  		if (xmlhttp.readyState == 4) {
   		if (xmlhttp.status == 404 && ( !document.getElementById('not_exists'))) {
				var res;
				if ( res = document.getElementById('sp_email')) {
					var r = document.getElementById('result');
					while (r.firstChild) {
						r.removeChild(r.firstChild);
					}
				}
				var div = document.createElement('div');
				div.id = 'not_exists';
				div.innerHTML = 'User does not exist';
				document.getElementById('result').appendChild(div);
         }
   		if(xmlhttp.status == 200) {
				callback(xmlhttp.responseText);
         }
  		}
	};
	xmlhttp.send(null);
}

