/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

function getURL(details) {
    console.log(details.url);
	
	if(details.url.indexOf("GetRecord") !== -1) {
		$.ajax({
			type: "POST",
			url: "http://127.0.0.1/xmlProjektBackend/OAIEndPoint.php",
			data: {url: details.url},
			dataType: "text",
			success: function(text) {
				console.log("Backend Response: "+text);
			}
		});
	}
	
    $.ajax({
        type: "POST",
        url: "http://127.0.0.1/xmlProjektBackend/defaultEndpoint.php",
        data: "url=" + details.url,
        dataType: "text",
        success: function(text) {
            console.log("Backend Response: "+text);
        }
    });

}

// Listen for any changes to the URL of any tab.
chrome.webNavigation.onDOMContentLoaded.addListener(getURL);
