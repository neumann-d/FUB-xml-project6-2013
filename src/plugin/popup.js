// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function getReco(tags) {
    // Baue den Filtersing
    var filterString = "filter (";

    for (var i = 0; i < tags.length; i++) {
        filterString = filterString + "?tag = \"" + tags[i] + "\" ";
        if (i < tags.length - 1)
            filterString = filterString + " || ";
    }
    filterString = filterString + ")";

    console.log(filterString);


    // Frage ähnliche Fragen ab
    $.ajax({
        type: "POST",
        url: so.sparqlEndpoint,
        data: "query= @prefix ns0: <http://purl.org/dc/elements/1.1/> .\n\
                   @prefix ns2: <http://poshrdf.org/ns/mf#> . \n\
                   select distinct ?url ?title WHERE {?url ns2:tag ?tag .\n ?url ns0:title ?title .\n " + filterString + "}",
        dataType: "json",
        success: function(json) {
            console.log(json);
            $('body').empty();
            $('body').append("<p>Ähnliche Fragen: </p>");
            $('body').append("<ul></ul>");
            
            var bindings = json.results.bindings;
            
            for(var i = 0; i < bindings.length; i++) {
                $('body ul').append("<li><a href='"+bindings[i].url.value+"'>"+ bindings[i].title.value+"</a></li>");
            }


        }
    });
    
    console.log("test");

}
;

var so = {
    sparqlEndpoint: "http://127.0.0.1/xmlProjektBackend/sparqlEndpoint.php",
    /**
     * Fragt das Backend zuerst nach den auf dieser Seite enthaltenen Tags ab.
     * Sucht danach im Backend nach Fragen mit den gleichen Tags und zeigt diese
     * im Popup an.
     * @public
     */
    getMyTags: function(url) {


        $.ajax({
            type: "POST",
            url: this.sparqlEndpoint,
            data: "query= @prefix ns2: <http://poshrdf.org/ns/mf#> . \n select ?tag { \"" + url + "\" ns2:tag ?tag } ",
            dataType: "json",
            success: function(json) {
                var tags = new Array();
                console.log(json);

                var tagBindings = json.results.bindings;


                for (var i = 0; i < tagBindings.length; i++) {
                    tags.push(tagBindings[i].tag.value);
                }
                console.log(tags);
                getReco(tags);

            }
        });
    }



};

// Run query as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function() {

    chrome.tabs.getSelected(function(tab) {
        var url = tab.url;
        if(url.indexOf("http://stackoverflow.com/") === 0)
            so.getMyTags(tab.url);
    });
});
