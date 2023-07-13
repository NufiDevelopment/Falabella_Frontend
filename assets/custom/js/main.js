'use strict';

var CATALOGO_SEXO = {'H':'Hombre', 'M': 'Mujer'},
	CATALOGO_ESTADO = {'AS': 'Aguascalientes', 'BC': 'Baja California', 'BS': 'Baja California Sur', 'CC': 'Campeche', 'CL': 'Coahuila de Zaragoza', 'CM': 'Colima', 'CS': 'Chiapas', 'CH': 'Chihuahua', 'DF': 'Distrito Federal', 'DG': 'Durango', 'GT': 'Guanajuato', 'GR': 'Guerrero', 'HG': 'Hidalgo', 'JC': 'Jalisco', 'MC': 'México', 'MN': 'Michoacán de Ocampo', 'MS': 'Morelos', 'NT': 'Nayarit', 'NL': 'Nuevo León', 'OC': 'Oaxaca', 'PL': 'Puebla', 'QT': 'Querétaro', 'QR': 'Quintana Roo', 'SP': 'San Luis Potosí', 'SL': 'Sinaloa', 'SR': 'Sonora', 'TC': 'Tabasco', 'TS': 'Tamaulipas', 'TL': 'Tlaxcala', 'VZ': 'Veracruz de Ignacio de la Llave', 'YN': 'Yucatán', 'ZS': 'Zacatecas'};

(function() {
	window.API_URL = "https://falabellaback.azurewebsites.net/api/v1/";
	window.myApp = new Framework7({
		cache: false,
		init: false,
		material: true,
		modalTitle: 'Flash Cards',
		notificationCloseButtonText: 'OK',
		scrollTopOnNavbarClick: true,
		pushState: true
	});

	window.mainView = myApp.addView('.view-main');
	window.$$ = Dom7;
})();

var MAIN = {
	showMessage: function (type, content, callback = null) {
	    window.myApp.modal({
	        title: type == "error" ? "Error" : type,
	        text: content,
	        buttons: [
	            {
	                text: 'Aceptar',
	                onClick: function () {
	                    if (callback != null)
	                        callback("aceptar");
	                }
	                // onClick: function() {
	                //     myApp.alert("You clicked 'Yes'");
	                // }
	            }, {
	                text: 'Cerrar',
	                onClick: function () {
	                    if (callback != null)
	                        callback("cerrar");
	                    //myApp.alert("You clicked 'No'");
	                }
	            }
	        ]
	    });
	},
	back: () => {
		window.mainView.router.back();
	},
	showView: function(view, start_top = false) {
	    window.mainView.router.load({
	    	reload: start_top,
	        url: view + '.html'
	    });
	},
	POST: function(url, data, callback, files = false, show_loader = true) {
	    let ajax = {
	        type: 'POST',
	        url: url,
	        crossDomain: true,
	        beforeSend: function (xhr) {
	        	setHeaders(xhr);
	        	if(show_loader)
	            	window.myApp.showIndicator();
	        },
	        complete: function () {
	        	if(show_loader)
	            	window.myApp.hideIndicator();
	        },
	        error: function (xhr, ajaxOptions, thrownError) {
	            console.log(thrownError);
	        },
	        data: data,
	        success: function (res) {
	            callback(res);
	        }
	    };

	    if (files) {
	        ajax.contentType = false;
	        ajax.processData = false;
	    }

	    $.ajax(ajax);
	},
	GET: function(url, callback, showLoading = true) {
	    let ajax = {
	        type: 'GET',
	        url: url,
	        crossDomain: true,
	        beforeSend: function (xhr) {
	        	setHeaders(xhr);
	            if (showLoading) window.myApp.showIndicator();
	        },
	        complete: function () {
	            if (showLoading) window.myApp.hideIndicator();
	        },
	        error: function (xhr, ajaxOptions, thrownError) {
	            console.log(thrownError);
	        },
	        success: function (res) {
	            callback(res);
	        }
	    };
	    $.ajax(ajax);
	},
	getStatus: function(callback = null){
		var uuid = localStorage.getItem("uuid");

		MAIN.GET(`${API_URL}registro/estatus`, function(res){
			if(res.status != "success")
				return MAIN.showMessage("Error", "Error al obtener registro, porfavor inicie el proceso nuevamente", function(){
					MAIN.showView("inicio", true);
				});

			if(callback) callback(res.data);
		}, true);
	},
	event: function(evento, identificador, callback = null){
		var uuid = localStorage.getItem("uuid");
		if(!uuid) return;
		console.log(`Evento: ${evento}, Identificador: ${identificador}`);
		
		MAIN.POST(`${API_URL}registro/evento`, {evento, identificador}, function(res){
			console.log("Respuesta evento: ", res);
			if(callback) callback();
		}, null, true);
	},
	getBase64: function(file, callback) {
	   	var reader = new FileReader();
	   	reader.readAsDataURL(file);
	   	reader.onload = function () {
	    	callback(null, reader.result);
	   	};
	   	reader.onerror = function (error) {
	    	callback(error, null);
	   	};
	},
	setPage: function(page){

		let pagePath = '/'+page+'.html';
		gtag('event', 'page_view', {
			page_title: document.title,
			page_location: 	location.href,
			page_path: pagePath,
			send_to: 'G-VYGWW1P5ZV'
		  });
	}
}

$$(document).on('ajaxStart', function (e) {
	window.myApp.showIndicator();
});

$$(document).on('ajaxComplete', function (e) {
	window.myApp.hideIndicator();
});

$$(document).on('pageInit', function(e) {
	if ($.validator) {
        $.extend($.validator.messages, {
            required: "Este campo es requerido.",
            email: "Por favor ingrese un correo válido.",
            maxlength: jQuery.validator.format("Por favor ingrese no más de {0} caracteres."),
            minlength: jQuery.validator.format("Por favor ingrese al menos {0} caracteres."),
            max: jQuery.validator.format("Por favor ingrese un número menor o igual a {0}."),
            min: jQuery.validator.format("Por favor ingrese un número mayor o igual a {0}."),
            number: jQuery.validator.format("Por favor ingrese un número válido.")
        });

        jQuery.validator.addMethod("is_email", function (value, element) {
            return value != "" ? /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value.toLowerCase()) : true;
        }, "Por favor ingrese un correo válido.");

        jQuery.validator.addMethod("is_phone", function (value, element) {
            return value != "" ? /^([0-9]{10})$/.test(value.trim()) : true;
        }, "Por favor ingrese un teléfono válido.");

        jQuery.validator.addMethod("is_time", function (value, element) {
            return value != "" ? /^([0-1][0-9]|20|21|22|23|24):([0-5][0-9])$/.test(value.toLowerCase()) : true;
        }, "Por favor ingrese una hora válida (HH:mm)");
    }

    $(".button-back").on("click", function(){
    	MAIN.back();
    });
});

function setHeaders(xhr) {
    xhr.setRequestHeader("uuid", localStorage.getItem("uuid"));
    return xhr;
}