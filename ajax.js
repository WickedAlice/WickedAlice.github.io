function req() {
	xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange=function(){

	   if (xhttp.readyState==4 && xhttp.status==200){
//	    	document.getElementById("result").innerHTML = xhttp.responseText;
			alert(xhttp.responseText);
		}
   }
   
xhttp.open("GET", "https://github.com/feugenix", true);
xhttp.send();

}