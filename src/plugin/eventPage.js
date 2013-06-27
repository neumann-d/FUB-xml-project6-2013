/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

function getURL(details) {
    console.log(details.url);
	
	$.ajax({
        type: "GET",
		url: details.url,
		dataType: "xml",
		success: function(xml) {
			if (xml.documentElement.tagName == "OAI-PMH") {
				$.ajax({
					type: "POST",
					url: "http://192.168.1.3/index.php",
					data: "url=" + details.url,
					dataType: "text",
					success: function(text) {
						console.log("Backend Response: "+text);
					}
				});
			}
		}
	});
	
	
    $.ajax({
        type: "POST",
        url: "http://127.0.0.1/xmlProjektBackend/testEndpoint.php",
        data: "url=" + details.url,
        dataType: "text",
        success: function(text) {
            console.log("Backend Response: "+text);
        }
    });

}

// Listen for any changes to the URL of any tab.
chrome.webNavigation.onDOMContentLoaded.addListener(getURL);
