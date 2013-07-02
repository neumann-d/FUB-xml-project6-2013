// Run query as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function() {

    chrome.tabs.getSelected(function(tab) {
        var url = tab.url;
        
        // StackOverflow.com Beispiel
        if (url.indexOf("http://stackoverflow.com/") === 0)
            getMyTags(tab.url);
        
        // BestBuy.com Beispiel
        else if (url.indexOf("http://www.bestbuy.com/") === 0)
            getMyBrandname(tab.url);
        
        else if (url.indexOf("http://www.europeana.eu/") === 0) {
            getMyArt(tab.url);
        }
        
        // XML Beispiel
        else if (url.indexOf("GetRecord") !== -1)
            getMyCreator(tab.url);
        
        // Visualisierung von Orten
        else if (isPlace(url)) {
            getPlaceName(url);
            getPlaceArea(url);
            getPlacePopulation(url);
            getThingAbstract(url);
            getThingThumbnail(url);
            getPlaceLocation(url);
        }
        
        // Allgemeines
        else {
            getThingName(url);
            getThingThumbnail(url);
            getThingAbstract(url);
        }
        

        $('#databtn').bind("click", function() {
            var graphQuery = "SELECT * FROM <" + url + "> WHERE { { ?s ?p ?o . } FILTER(langMatches(lang(?o), \"EN\") || langMatches(lang(?o), \"DE\") || LANG(?o) = \"\")}";
            chrome.tabs.create({url: "http://127.0.0.1/xmlProjektBackend/sparqlEndpoint.php?output=htmltab&query=" + encodeURIComponent(graphQuery) + ""});
        });
    });


});


/**
 * Fragt das Backend nach dem Autor der Publication auf der aktuellen Seite ab und sucht danach anderen Publicationen des gleichen Autors.
 */
function getMyCreator(url) {
    console.log("query= @prefix ns0: <http://purl.org/dc/elements/1.1/> . \n select ?creator { \"" + url + "\" ns0:creator ?creator } ");
    $.ajax({
        type: "POST",
        url: sparqlEndpoint,
        data: {query: "@prefix ns0: <http://purl.org/dc/elements/1.1/> . \n select ?creator { \"" + url + "\" ns0:creator ?creator } "},
        dataType: "json",
        success: function(json) {
            var creators = new Array();
            console.log(json);

            var cBindings = json.results.bindings;


            for (var i = 0; i < cBindings.length; i++) {
                creators.push(cBindings[i].creator.value);
            }
            console.log(creators);
            getOtherPubs(creators);
        }
    });
}

function getOtherPubs(creators) {
    // Baue den Filtersing
    var filterString = "filter (";

    for (var i = 0; i < creators.length; i++) {
        filterString = filterString + "?creator = \"" + creators[i] + "\" ";
        if (i < creators.length - 1)
            filterString = filterString + " || ";
    }
    filterString = filterString + ")";

    console.log(filterString);


    // Beim Klick auf den Button soll der zugehörige Graph angezeigt werden
    $('#showGraph').bind("click", function() {
        var graphQuery = "select ?url ?creator WHERE { ?url ns0:creator ?creator .  " + filterString + " }";
        chrome.tabs.create({url: "http://127.0.0.1/xmlProjektBackend/sgvizler-0.5/sgvizler.html?query=" + graphQuery});
    });

    // Frage weitere Publikationen ab
    $.ajax({
        type: "POST",
        url: so.sparqlEndpoint,
        data: "query= @prefix ns0: <http://purl.org/dc/elements/1.1/> .\n\
                   select distinct ?url ?title WHERE {?url ns0:creator ?creator .\n ?url ns0:title ?title .\n " + filterString + "}",
        dataType: "json",
        success: function(json) {
            console.log(json);

            //Bild
            $('#topImage').attr('src', 'http://www.moroks.com/adm/zbl/images/image_not_found.jpg');

            //Überschrift
            var heading = "Weitere Artikel von ";
            for (var i = 0; i < creators.length; i++) {
                heading = heading + creators[i];
                if (i < creators.length - 1)
                    heading = heading + " / ";
            }

            $('#heading').html(heading);

            //Inhalt
            var bindings = json.results.bindings;

            $('#content').html("<ul>");
            for (var i = 0; i < bindings.length; i++) {
                $('#content').append("<li><a href='" + bindings[i].url.value + "'>" + bindings[i].title.value + "</a></li>");
            }
            $('#content').append("</ul>");


        }
    });

}
;
