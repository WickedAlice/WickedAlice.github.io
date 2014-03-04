//1.Есть ли данные в кэше.
//2.Если нет, то достать, распарсить и положить в кэш.
//3.Отобразить

function DisplayGitHubUserData(username) {

	if (!document.getElementById('sp_email')) {
		createTags();
	}

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

  	var reposFields;
  	reposFields = getUserFieldsFromCache('repos_' + username);
  	if(!reposFields){
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
	
function getUserFieldsFromCache(fieldsKey) {
	var userFields =  JSON.parse(localStorage.getItem(fieldsKey));

	if (!userFields) {
		return false;	
	} 
	var now = new Date();
	var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()).valueOf();
	var dm = today - userFields['timeout'];
	if ( dm < 86400000) { //если не протух
		userFields['timeout'] = undefined; 
		return userFields;
	} else {
		localStorage.removeItem(fieldsKey);
		return false;
	}
}

function storeFieldsToCache(fieldsKey, userFields) {
	var now = new Date();
	var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()).valueOf();
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
		var exp = new RegExp (fieldName + "\":.*",'ig');
  		var field = respond.match(exp);
		if(!field) { tmp = "no " + fieldName; }	
		else {
			tmp = field[0].slice(fieldsList[fieldName].cutFromBegin);
			var len = tmp.length - fieldsList[fieldName].cutFromEnd;
			tmp = tmp.slice(0, len);
	  	}
		infoFields[fieldName] = tmp;
   }

   return infoFields;
}

function parseRepos(respond){
	var i;
	var repos = respond.match(/"name":.*/ig);
	if(!repos) { return repos; }	
	for (i = 0; i < repos.length ; i++) {
		repos[i] = repos[i].slice(9);
		repos[i] = repos[i].slice(0, repos[i].length-2);
	}	
	return repos;
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
   		if(xmlhttp.status == 200) {
				callback(xmlhttp.responseText);
         }
  		}
	};
	xmlhttp.send(null);
}

