import { ReportingSquare } from "./ReportingSquare.js"
import { ConstructUrl } from "./ConstructURL.js"
var maximumiLatitude;
var macimumLongitude;
var intervalID; //id per la creazione delle richieste in loop
var infoWindow;
var map;
var myJsonArr;
var objectReportingArray = [];
var actualLatitude;
var actualLongitude;
var slider;
var output;
var bottone;
var contenitoreDiv;
var selettoreRegione;
var selettoreProvincia;
var selettoreComune;
window.initMap = function () {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 5,
        mapTypeId: "terrain",
    });
    getLocation();
    infoWindow = new google.maps.InfoWindow();
};
window.onload = function () {
    // cambio di criteri di ricerca
    bottone = document.getElementById("bottone");
    bottone.addEventListener("click", changeResearchParamters);
    //fine cambio fi criteri di ricerca
    actualLatitude = localStorage.getItem("latitude");
    actualLongitude = localStorage.getItem("longitude");
    /*Parte slider*/
    slider = document.getElementById("myRange");
    output = document.getElementById("demo");
    slider.addEventListener("mouseup", function () {
        console.log("hai alzato il mouse " + slider.value);
        richiestaHTTPConDistanza(actualLatitude, actualLongitude, slider.value);
        //qui andremo a fare una ricerca passando come valori distanza e coordinate
    });
    slider.oninput = function () {
        output.innerHTML = slider.value;
    }
    /*Fine parte slider*/
    /**Inizio Parte selettori */
    contenitoreDiv = document.getElementById("contenitoreDiv");
    selettoreRegione = document.getElementById("regione");
    selettoreProvincia = document.getElementById("provincia");
    selettoreComune = document.getElementById("comune");
    selettoreRegione.addEventListener("change", regioneSelezionata);
    selettoreProvincia.addEventListener("change", provinciaSelezionata);
    selettoreComune.addEventListener("change", comuneSelezionato);
    /**FIne parte selettori */

};
//Parti delle Richieste
function richiestaHTTPConDistanza(latitude, longitude, distance) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
            myJsonArr = JSON.parse(this.responseText);
            visualizzareInMappa();
        }
    };
    xhttp.open("GET", ConstructUrl.constructURLForReaserchWDistance(latitude, longitude, distance), true);
    xhttp.send();

}
/**richiesta http per la selezione del posto */
function richiestaProvinceComuni(tipoDiRicerca, codice) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
            var listaPosti = JSON.parse(this.responseText);

            changeSelectors(tipoDiRicerca, listaPosti);
        }
    };
    switch (tipoDiRicerca) {
        case 'province':
            xhttp.open("GET", ConstructUrl.constructURLForFindProvinces(codice), true);
            xhttp.send();
            break;
        case 'comuni':
            xhttp.open("GET", ConstructUrl.constructURLForFindComunes(codice), true);
            xhttp.send();
            break;

    }
}
//ricerca incendi per comune
function richiestaHTTPIncendiConComune(comune, gravity) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
            console.log(this.responseText);
            myJsonArr = JSON.parse(this.responseText);
            visualizzareInMappa();
        }
    }
    if (gravity == null) {
        xhttp.open("GET", ConstructUrl.constructURLForComunes(comune), true);
        console.log(ConstructUrl.constructURLForComunes(comune));
        xhttp.send();
    }
    else {
        xhttp.open("GET", ConstructUrl.constructURLForComunes(comune, gravity), true);
        xhttp.send();
    }



}
function periodicalRequest(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
            myJsonArr = JSON.parse(this.responseText);
            visualizzareInMappa();
        }
    };
    xhttp.open("GET", ConstructUrl.getLastReaserch(), true);
    console.log("sei dentro la periodical Request e questa è l'ultima search : \n"+ConstructUrl.getLastReaserch());
    xhttp.send();
}
//Fine Parti per le richieste
function visualizzareInMappa() {

    if (myJsonArr.length == 1) {
        var reportingSquare = new ReportingSquare(parseFloat(myJsonArr.latitudine), parseFloat(myJsonArr.longitudine));
        reportingSquare.createCircle1km().setMap(map);
        objectReportingArray.push(reportingSquare);
    } else if (myJsonArr.length > 1) {
        for (let item in myJsonArr) {
            var reportingSquare = new ReportingSquare(parseFloat(myJsonArr[item].latitudine), parseFloat(myJsonArr[item].longitudine));
            var cerchio=reportingSquare.createCircle100m(map);
            objectReportingArray.push(cerchio);
        }
    }
    else {
        console.log("nessun incendio")
    }
}
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(setCenterMap);
    } else {
        console.log("error")
    }
}
function setCenterMap(position) {
    localStorage.setItem('latitude', position.coords.latitude);
    localStorage.setItem('longitude', position.coords.longitude);
    map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));

}
//ritroveremo gli oggetti json da aggiungere e da eliminare che poi dovranno essere stmpati od eliminati()
function provaDelControlIF() {
    var elementiDaAggiungereJSON = JSON.parse("[]");
    var elementiDaEliminareJSON = JSON.parse("[]");
    var jsonDiPartenza = JSON.parse(['[{"ip":45},{"ip":55},{"ip":67}]']);
    var jsonArrivato = JSON.parse('[{"ip":45},{"ip":55},{"ip":57}]');
    var elementiDaAggiugereObject = controlIfJSONChanged(jsonDiPartenza, jsonArrivato);
    var elementiDaEliminareObject = controlIfJSONChanged(jsonArrivato, jsonDiPartenza);
    for (var item in elementiDaAggiugereObject) {
        var itemStringfy = JSON.stringify(elementiDaAggiugereObject[item]);
        if (itemStringfy != "{}") {
            elementiDaAggiungereJSON.push(JSON.parse(itemStringfy))
        }
    }
    for (var item in elementiDaEliminareObject) {
        var itemStringfy = JSON.stringify(elementiDaEliminareObject[item]);
        if (itemStringfy != "{}") {
            elementiDaEliminareJSON.push(JSON.parse(itemStringfy));
        }
    }
    console.log(elementiDaAggiungereJSON);
    console.log(elementiDaEliminareJSON);
}
function controlIfJSONChanged(obj1, obj2) {
    const result = {};
    if (Object.is(obj1, obj2)) {
        return undefined;
    }
    if (!obj2 || typeof obj2 !== 'object') {
        return obj2;
    }
    Object.keys(obj1 || {}).concat(Object.keys(obj2 || {})).forEach(key => {
        if (obj2[key] !== obj1[key] && !Object.is(obj1[key], obj2[key])) {
            result[key] = obj2[key];
        }
        if (typeof obj2[key] === 'object' && typeof obj1[key] === 'object') {
            const value = controlIfJSONChanged(obj1[key], obj2[key]);
            if (value !== undefined) {
                result[key] = value;
            }
        }
    });
    return result;
}
/*parte della gestione dello slider*/
/*fine parte gestione dello slider*/
/*Inizio parte funzioni Ricerca per regione,provincia, comune */
function regioneSelezionata() {
    richiestaProvinceComuni("province", selettoreRegione.value);
}
function provinciaSelezionata() {
    richiestaProvinceComuni("comuni", selettoreProvincia.value);

}
function comuneSelezionato() {
    removeAllPolygons();
    richiestaHTTPIncendiConComune(selettoreComune.value, null);
    intervalID=setInterval(periodicalRequest,5000);
    /**Qua vado a cercare gli incendi */

}

function changeSelectors(tipoDiRicerca, listaPosti) {

    switch (tipoDiRicerca) {
        case 'province':
            selettoreProvincia.innerHTML = '';
            for (let i in listaPosti) {
                var opt = document.createElement('option');
                // create text node to add to option element (opt)
                opt.appendChild(document.createTextNode(listaPosti[i].nome));
                // set value property of opt
                opt.value = listaPosti[i].id;
                // add opt to end of select box (sel)
                selettoreProvincia.appendChild(opt);
            }
            break;
        case 'comuni':
            selettoreComune.innerHTML = '';
            for (let i in listaPosti) {
                var opt = document.createElement('option');
                // create text node to add to option element (opt)
                opt.appendChild(document.createTextNode(listaPosti[i].nome));
                // set value property of opt
                opt.value = listaPosti[i].nome;
                // add opt to end of select box (sel)
                selettoreComune.appendChild(opt);
            }
            break;

    }

}
/**fine parte regione provincia comune */
// cambiare i parametri di ricerca
function changeResearchParamters() {
    console.log("stai cercando di cambiare i parametri");
    if (contenitoreDiv.style.display === "none") {
        contenitoreDiv.style.display = "block";
    } else {
        contenitoreDiv.style.display = "none";


    }
}
// fine cambio dei parametri di ricerca
function removeAllPolygons() {
    for (let item in objectReportingArray) {
        objectReportingArray[item].setMap(null);
    }
    objectReportingArray = [];

}