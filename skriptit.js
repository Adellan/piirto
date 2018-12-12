//menuvalikko---------------------------------------------------------------------------
$(document).one("pagebeforecreate", function () {
    $("#popupMenu").enhanceWithin().popup();
});

$(document).on("pagecontainerbeforeshow", function(event, ui) {
    var toPage = ui.toPage[0].id;
    $("#popupMenu a").show();

    if(toPage=="etusivu"){
        $("#etusivuLinkki").hide();
        window.removeEventListener("devicemotion", liike);
        
    } else if(toPage=="piirra"){
        $("#piirraLinkki").hide();
        
        window.addEventListener("devicemotion", liike);
        aloitaPiirto();
        
        //määrittää uuden lähtöpisteen piirrolle
        $("#piirraAlusta").on("tap", function(event) {
            var alusta = $("#piirraAlusta").offset();
            kynaX = event.pageX - alusta.left;
            kynaY = event.pageY - alusta.top;
        });
        
    } else if(toPage=="historia"){
        $("#historiaLinkki").hide();
        haeHistoria();
        window.removeEventListener("devicemotion", liike);
    }

});

//-----------------------------------------------------------------------------
document.addEventListener("deviceready", odr);
function odr(){
    console.log("laite on valmis");
    $(window).on("orientationchange", function(event){
       if(!window.orientation == 0){
           navigator.vibrate(300);
           alert("Käännä laite takaisin pystyasentoon");
       }
   });
    
    //siirtää selected-luokan värivalikossa näpäytyksen mukana
    $(".controls").on("tap", "li", function() {
        $(this).siblings().removeClass("selected");
        $(this).addClass("selected");
        vari = $(".selected").css("background-color");
    });
    
    //cancel-check, muuten tallentaisi
    $("#tallennaNappi").on("tap", function() {
        nimi=prompt("Nimeä piirroksesi");
        if(nimi === null){
            return;
        } else{
            tallenna();
        }
    });
    
    $("#sulje").on("tap", function() {
        navigator.app.exitApp();
    });
}

//piirtoalusta--------------------------------------------------------------------
var canvas;
var ctx;
var leveys = window.innerWidth;
var korkeus = window.innerHeight;

function aloitaPiirto(){
    canvas = document.getElementById("piirraAlusta");
    canvas.width = leveys * 0.93;
    canvas.height = korkeus * 0.67;
    ctx = canvas.getContext("2d");
    ctx.fillStyle = "#F9F5E5";  
    ctx.fillRect(0, 0, leveys, korkeus);
    //kynaX = canvas.width/2;
    //kynaY = canvas.height/2;
    kynaX = leveys/2;
    kynaY = korkeus/2;
}

function tyhjenna(){
    ctx.fillStyle = "#F9F5E5";
    ctx.fillRect(0, 0, leveys, korkeus);
    kynaX = leveys/2;
    kynaY = korkeus/2;


//piirto-----------------------------------------------------------------------------
var kynaX;
var kynaY;
var vari = "purple";

function liike(event) {
    var vanhaX = kynaX;
    var vanhaY = kynaY;
    if(kynaX < 0){
        kynaX = 0;
    }
    if(kynaX > canvas.width){
        kynaX = canvas.width -1;
    }
    if(kynaY < 0){
        kynaY = 0;
    }
    if(kynaY > canvas.height){
        kynaY = canvas.height;
    }
    kynaX += event.acceleration.x;
    kynaY -= event.acceleration.y/2 + event.acceleration.z;
    ctx.beginPath();
    ctx.lineWidth ="10";
    ctx.strokeStyle = vari;
    ctx.moveTo(vanhaX, vanhaY);
    ctx.lineTo(kynaX, kynaY);
    ctx.stroke();
}

//tallenna kuva-------------------------------------------------------------------
var temp;
var nimi;

function tallenna(){
    temp = {};
    temp["nimi"]=nimi;
    temp["kuva"]=canvas.toDataURL();
    temp["aika"]=haePaiva();
    
    //lähetys kantaan			
    $.ajax({
        type: "POST",
        data: temp,
        timeout: 4000,
        url: "PALVELIN_URL/lisaaKuva.php",
        success: function(){       
            alert("Tallennus onnistui!");
            //lopuksi piirtoalueen tyhjennys
            tyhjenna();
        },
        error: function(e){						
            alert("Tallennus ei onnistunut :( " + e.status + " " + e.statusText);	
        }
    });
}

//hae päiväys ja kellonaika--------------------------------------------------------
function haePaiva(){
    var now = new Date();
    var day = now.getDate();
    var month = now.getMonth()+1;
    var year = now.getFullYear();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var seconds = now.getSeconds();
    if(month < 10){
        month = "0" + month;
    }
    if(day < 10){
        day = "0" + day;
    }
    if(hour < 10){
        hour = "0" + hour;
    }
    if(minute < 10){
        minute = "0" + minute;
    }
    if(seconds < 10){
        seconds = "0" + seconds;
    }
    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + seconds;
}

//listaa entiset piirrokset historia-sivulle----------------------------------------
function haeHistoria(){
    $("#historiaLista").html("");
    $.ajax({
            type:"GET",
            url: "PALVELIN_URL/haePiirto.php",
            dataType: "json",
            timeout: 4000}
        ).done(function(result){
            $.each(result, function(index, value){
                $("#historiaLista").append("<li class='ui-grid-a'><div class='ui-block-a'><img src=" + value.kuva + " class='kuvalista'></div><div class='ui-block-b'>" + value.nimi + "<br>" + value.aika + "<br><a href='#' value=" + value.id + " class='poista' data-role='button' style='background-color: coral;'>Poista</a><br><a href='#' value=" + value.id + " class='muuta' data-role='button' style='background-color: yellow;'>Muuta nimi</a></div></li>").enhanceWithin();
            })}

        ).fail(function(err){
            alert("virhe: " + err.status + " " + err.statusText);
        })
}

$(document).on("tap", ".poista", function(event) {
    var poisto = $(this).attr("value");
    temp = {};
    temp["id"]=poisto;
    $.ajax({
    type: "POST",
    data: temp,
    timeout: 3000,
    url: "PALVELIN_URL/poistaKuva.php",
    success: function(){    
        alert("Poisto onnistui!");
        haeHistoria();
    },
    error: function(e){						
        alert("Poisto ei onnistunut :( " + e.status + " " + e.statusText);	
    }
    });
});

var uusinimi;
$(document).on("tap", ".muuta", function(event) {
			var muuta = $(this).attr("value");
            uusinimi=prompt("Anna uusi nimi");
                if(uusinimi === null){
                    return;
                } else{
                    console.log(uusinimi);
                    paivita(muuta);
                }
});

function paivita(muuta){
    temp = {};
    temp["id"]=muuta;
    temp["nimi"]=uusinimi;
    console.log(temp.id + " " + temp.nimi);
    $.ajax({
    type: "POST",
    data: temp,
    timeout: 3000,
    url: "PALVELIN_URL/muutaNimi.php",
    success: function(){ 
        haeHistoria();
        alert("Nimen vaihto onnistui!");
    },
    error: function(e){						
        alert("Nimen vaihto ei onnistunut :( " + e.status + " " + e.statusText);	
    }
    });
}
//debug-laatikko datasyötöllä, checkbox pysäyttää/jatkaa---------------------------
function deb(teksti){
    var el = $("#debug");
    var che = $("#check");
    if(che.prop("checked")){
        el.html(teksti + "<br>" + el.html());
    } 
}