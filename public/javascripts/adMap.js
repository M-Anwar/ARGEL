var myCenter=new google.maps.LatLng(43.715,-79.256);       
var map;
var markers = [];
var maxLocations = 5;
var maxRadius = 25000; //50km diameter, similar to facebook ads
var minRadius = 1000; //1km min radius
var centerControlDiv; //UI for showing locations left
var editable = true;
var preload = null;

function initialize()
{
    navigator.geolocation.getCurrentPosition(showPosition);
    var mapProp = {
        center:myCenter,
        zoom:12,
        mapTypeId:google.maps.MapTypeId.ROADMAP,
          styles: [ { "featureType": "all", "elementType": "labels.text.fill", "stylers": [ { "color": "#ffffff" } ] }, { "featureType": "all", "elementType": "labels.text.stroke", "stylers": [ { "color": "#000000" }, { "lightness": 13 } ] }, { "featureType": "administrative", "elementType": "geometry.fill", "stylers": [ { "color": "#000000" } ] }, { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [ { "color": "#144b53" }, { "lightness": 14 }, { "weight": 1.4 } ] }, { "featureType": "landscape", "elementType": "all", "stylers": [ { "color": "#08304b" } ] }, { "featureType": "poi", "elementType": "geometry", "stylers": [ { "color": "#0c4152" }, { "lightness": 5 } ] }, { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [ { "color": "#d09607" } ] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [ { "color": "#e23c00" }, { "lightness": 25 } ] }, { "featureType": "road.arterial", "elementType": "geometry.fill", "stylers": [ { "color": "#000000" } ] }, { "featureType": "road.arterial", "elementType": "geometry.stroke", "stylers": [ { "color": "#0b3d51" }, { "lightness": 16 } ] }, { "featureType": "road.local", "elementType": "geometry", "stylers": [ { "color": "#b97c11" }, { "visibility": "on" } ] }, { "featureType": "road.local", "elementType": "geometry.stroke", "stylers": [ { "color": "#2d1101" }, { "visibility": "on" } ] }, { "featureType": "transit", "elementType": "all", "stylers": [ { "color": "#10b0d0" } ] }, { "featureType": "transit", "elementType": "labels.text", "stylers": [ { "visibility": "simplified" } ] }, { "featureType": "transit", "elementType": "labels.text.fill", "stylers": [ { "color": "#ffffff" } ] }, { "featureType": "water", "elementType": "all", "stylers": [ { "color": "#021019" } ] }, { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [ { "color": "#fdeeee" } ] } ]
    };
    map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
    if(editable){
        map.addListener('click', addCircle);         
    }

    centerControlDiv = document.createElement('div');
    var centerControl = new CenterControl(centerControlDiv, map);

    centerControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);
    updateLocations();
    
    if(preload){   
        for(var mark in preload){
            var loc = new google.maps.LatLng(preload[mark].lat,preload[mark].lng);
            var rad = preload[mark].radius;
            addCircle({latLng:loc,radius:rad});
        }
    }
}


function showPosition(position) {            
    map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
    if(!preload) //If there is not preloaded data, set a default location for convenience
        addCircle({latLng: map.getCenter()}); //Set default location to current location            
}

var countID =0; //Unique ID to keep track of markers
function addCircle(event){
    if(markers.length>=maxLocations){
        return;
    }
    countID++;
    var radius = 1000;
    if(event.radius){
        radius = event.radius;
    }
    var marker = new google.maps.Marker({
        position: event.latLng,
        title: "Inlcusion Location",                
        map: map,
        radius: radius,    
        address: '',
        id: countID

    });
    var infowindow = new google.maps.InfoWindow({
        content: ''
    }); 
    google.maps.event.addListener(infowindow, 'domready', function () {        
        $("#deleteButton" + marker.id).click(function() {
            marker.setMap(null);
            cityCircle.setMap(null);
            infowindow.setMap(null);
            infowindow = null;
            cityCircle = null;
            markers.splice(markers.indexOf(marker),1);
            marker = null;
            updateLocations();
        });
    });

    marker.addListener('click', function() {                
        infowindow.open(map, marker);
    });
    var cityCircle = new google.maps.Circle({
        strokeColor: '#f99a0e',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#f99a0e',
        fillOpacity: 0.35,
        map: map,
        editable: editable,                
        center: event.latLng,
        radius: radius
    });    
    
    google.maps.event.addListener(cityCircle, 'radius_changed', function() {  
        if(cityCircle.getRadius()>maxRadius){
            cityCircle.setRadius(maxRadius);                    
        }
        if(cityCircle.getRadius()<minRadius){
            cityCircle.setRadius(minRadius);
        }
        marker.radius = cityCircle.getRadius();
        updateLabel();
    });
    google.maps.event.addListener(cityCircle, 'center_changed', function() {               
        marker.setPosition(cityCircle.getCenter());
        updateLabel();
    });   
    var updateLabel = function(){              
        getAddress(marker.getPosition(), function(address){
            var content = "<div class='text-black'><h4 >" + address + "</h4> <p>Lat: " + marker.getPosition().lat() + 
                                  ", Long: " + marker.getPosition().lng() + "</p> <p>Radius: " + marker.radius/1000 + " km </p>";
            if(editable){
                content += '<button id="deleteButton' + marker.id + '">Delete</button></div>';
            }                                  
            infowindow.setContent(content);                            
        });                
    }
    updateLabel();            
    markers.push(marker);   
    updateLocations();
    // printMarkers();

}       

function printMarkers(){
    console.log("\n -- MARKERS --");
    console.log(markers.length);
    for(i = 0;i<markers.length;i++){
        console.log(markers[i].getPosition() + " : " + markers[i].radius);
    }
}
function updateLocations(){
    centerControlDiv.childNodes[0].childNodes[0].innerHTML = (markers.length)+ " of " + maxLocations + " Maximum locations assigned";
}
function getAddress(latLng, callback){        
    $.get('http://maps.googleapis.com/maps/api/geocode/json?latlng=' + latLng.lat() + ',' + latLng.lng() + '&sensor=true', function(data) {      
        callback(data.results[0].address_components[3].short_name + ", " + data.results[0].address_components[4].short_name);                
    });     
}       

function CenterControl(controlDiv, map) {
    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'The number of locations you can assign to have your ads shown';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '16px';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = '';
    controlUI.appendChild(controlText);

    // Setup the click event listeners: simply set the map to Chicago.
    controlUI.addEventListener('click', function() {
      //map.setCenter(chicago);
    });
}

//Initialize the map on page load
google.maps.event.addDomListener(window, 'load', initialize);