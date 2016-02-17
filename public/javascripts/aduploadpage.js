$(document).ready(function() { //Onload	
    
    //Populate the age selection menus
    var ageBottomRange = $("#ageBottomRange");
    var ageTopRange = $("#ageTopRange");
    for(var i = 1;i<100;i++){        
        ageBottomRange.append($("<option >").val(i).text(i));
        ageTopRange.append($("<option >").val(i).text(i));
    }
    ageBottomRange.val(18); //Default values
    ageTopRange.val(38);
    
    //File Preview events
    reader2 = window.URL || window.webKitURL;    
    $("#fileChoose").change(showPreview);
    
    //Submit onclick
    $("#submitbutton").click(uploadAd);
    
    $('#descTags').tagit({        
        // This will make Tag-it submit a single form value, as a comma-delimited field.
        singleField: true,        
        allowSpaces: true
    });

});
function uploadAd(event){
    //Upload the ad and all its meta-data to the server
    
    var myFormData = new FormData();     
     
    var missingField = false;
    //Populate the form data
    $.each($('#contentUpload').serializeArray(), function(i, field) {
        if(field.value =="" || !field.value){       
            missingField = true;
            return;
        }        
        myFormData.append(field.name, field.value);
    });
    if(missingField){
        scrollToTop("Please include a name and description for your advertisement");
        return;
    }
    
    //Get the file data as well
    var file = $("#fileChoose")[0].files[0];
    if(!file){ 
        scrollToTop("Please choose a video or picture to upload as your advertisement");
        return;
    }
    myFormData.append('videoAd', file);
    
    //Get the age and gender
    var ageBottom = $('#ageBottomRange').val();
    var ageTop = $('#ageTopRange').val();
    var gender = $("input[type='radio'][name='genderOptions']:checked").val();
    
    //For tags now to keep things compatible, later we shall change this;
    var average = (parseInt(ageBottom) + parseInt(ageTop))/2;
    var range = (parseInt(ageTop) - parseInt(ageBottom))/2;
    var tags = gender + ", " + average + ", " + range;
    
    myFormData.append('tags', tags);
    
     //Get the descriptor tags 
    $.each($('#tagsUpload').serializeArray(), function(i, field) {
        myFormData.append(field.name,field.value);
    });
    
    //Get the location positions and radii
    var sendLocations = {}
    for(var i=0; i<markers.length;i++){
        sendLocations[i] = {lat: markers[i].getPosition().lat(), lng:markers[i].getPosition().lng(),radius:markers[i].radius};        
    }
    myFormData.append('locations',JSON.stringify(sendLocations));    
  
    //Send the data to the server - Only works if authenticated
    $.ajax({ // create an AJAX call...     
        dataType: "JSON",
        data: myFormData,
        processData: false,
        contentType: false,                
        type: 'POST', // GET or POST
        url: '/adupload', // the file to call   
        enctype: 'multipart/form-data',
        success: function(data, status) { // on success..             
           if (typeof data.redirect == 'string'){
               window.location = data.redirect;
           }
        },
        error: function(xhr, desc, err) { // on success..                    
            console.log(desc);
            window.location = '/';
        }
    });
}


function showPreview(event){
    //Shows a preview when a file is chosen (Either an image or a video)
    
    var countFiles = $(this)[0].files.length;
    var imgPath = $(this)[0].value;
    var extn = imgPath.substring(imgPath.lastIndexOf('.') + 1).toLowerCase();       
    var image_holder = $("#preview");
    var video_holder = $("#videoPreview");  

    if (typeof (FileReader) != "undefined") {   //Check to see if we can even do this (HTML5 required)                       
        var reader = new FileReader();

        if (extn == "png" || extn == "jpg" || extn == "jpeg") { //For images
            reader.onload = function (e) {
                image_holder.attr('src',e.target.result);
                video_holder.attr('src','');
                image_holder.show();
                video_holder.hide();
            }
        }else if(extn =="mp4" || extn =="mov" || extn=="ogg" || extn=="ogv"){ //For videos


            if (reader2 && reader2.createObjectURL) {                    
                url = reader2.createObjectURL(this.files[0]);                
                video_holder.attr('src',url);
                image_holder.attr('src','');
                image_holder.hide();
                video_holder.show();                    
                return;
            }

            reader.onload = function (e) { //Fall back - extremely slow avoid this
                console.log("Setting src path");                   
                video_holder.attr('src',e.target.result);
                image_holder.attr('src','');
                image_holder.hide();
                video_holder.show();
            }
        }else{ //If the user selects any other file type, then dont allow it, reset
            console.log("Please select only images and videos");
            image_holder.attr('src','assets/images/adplaceholder.png');
            image_holder.show();
            video_holder.hide();
            $('#fileChoose').wrap('<form>').parent('form').trigger('reset');
            $('#fileChoose').unwrap();
            return;
        }           

        //Initiate the read file, it will call back into one of the methods defined above
        reader.readAsDataURL($(this)[0].files[0]); 
    }
    else {
        console.log("This browser does not support FileReader.");
    }   
}

function scrollToTop(errorMessage){
    //Scroll to the top and show an error message
    $('html, body').animate({scrollTop:0}, 'slow');
    $("#errorbox").empty();
    $("#errorbox").append("<div id = 'errorAlert' class ='alert alert-danger'>");
    $("<p class = 'leftside'> ERROR: " + errorMessage +"</p>").appendTo("#errorAlert");
}