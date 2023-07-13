'use strict';

/*
|------------------------------------------------------------------------------
| Splash Screen
|------------------------------------------------------------------------------
*/

myApp.onPageInit('splash-screen', function(page) {
	setTimeout(()=> {
		MAIN.showView("inicio");
	}, 500);
});

/*
|------------------------------------------------------------------------------
| Inicio
|------------------------------------------------------------------------------
*/

myApp.onPageInit('inicio', function(page) {

	MAIN.setPage('inicio');

	localStorage.removeItem("uuid");
	localStorage.removeItem("base64_frente");
	// localStorage.removeItem("base64_reverso");

	

});

/*
|------------------------------------------------------------------------------
| Informacion Personal
|------------------------------------------------------------------------------
*/

myApp.onPageInit('informacion-personal', function(page) {
	
	MAIN.setPage('informacion_personal');
	
	gtag('event', 'Paso_1_boton_Continuar', {'Paso_1_boton_Continuar': 'Paso_1_boton_Continuar'});
	// dataLayer.push({'Paso_1_boton_Continuar': 'Paso_1_boton_Continuar'});	

	$(".page[data-page=informacion-personal] button").on("click", function(){
		let option = $(this).data("option");
		window.option = option;		
		$("#form").submit();
	});

	$(`.page[data-page=informacion-personal] [name="terminos"]`).on("change", function(){
		if(this.checked) $(`button`).removeAttr("disabled");
		else $(`button`).attr('disabled', 'true');
	});

	$(".page[data-page=informacion-personal] #form").validate({
		rules: {
			numero: { required: true, is_phone: true},
			correo: { is_email: true}
		},
    	errorElement : 'span',
		errorPlacement: function(error, element) {
			error.appendTo(element.closest('.item-content'));
		},
		submitHandler: function(form, e) {
			e.preventDefault();
			if(!$(`[name="terminos"]`).is(":checked")) return $(`<span class="error">Por favor acepte los terminos y condiciones</span>`).appendTo($(`input[name="terminos"]`).closest('.item-content'));

			let data = $(form).serialize();

			let data2 = new FormData(form);

			const queryString = window.location.search;
			const urlParams = new URLSearchParams(queryString);

			data+=  (urlParams.has('utm_source')) ? '&utm_source='+ urlParams.get('utm_source') : "";
			data+=  (urlParams.has('utm_medium')) ? '&utm_medium='+ urlParams.get('utm_medium') : "";
			data+=  (urlParams.has('utm_campaign')) ? '&utm_campaign='+ urlParams.get('utm_campaign') : "";
			data+=  (urlParams.has('utm_term')) ? '&utm_term='+ urlParams.get('utm_term') : "";
			data+=  (urlParams.has('utm_content')) ? '&utm_content='+ urlParams.get('utm_content') : "";



			MAIN.POST(`${API_URL}registro/crear`, data, function(res){
				if(res.status != "success") {
					if(res.data != null && typeof res.data.telefonoValido !== "undefined" && res.data.telefonoValido == false)
						MAIN.showView("numero_registrado");
					else
						return MAIN.showMessage("error", res.message);
				}			
					
				localStorage.setItem("uuid", res.data.uuid);

				
				if(window.option == "continuar_ine") 
				{
					gtag('event', 'Paso_2_boton_Continuar_con_INE', {'Paso_2_boton_Continuar_con_INE': 'Paso_2_boton_Continuar_con_INE'});
					// dataLayer.push({'Paso_2_boton_Continuar_con_INE': 'Paso_2_boton_Continuar_con_INE'});

					MAIN.showView("credencial_frente");
				}
				else{ 
					gtag('event', 'Paso_2_boton_Continuar_sin_INE', {'Paso_2_boton_Continuar_sin_INE': 'Paso_2_boton_Continuar_sin_INE'});
					// dataLayer.push({'Paso_2_boton_Continuar_sin_INE': 'Paso_2_boton_Continuar_sin_INE'});					
					MAIN.showView("informacion_personal_full");
				}
			});
		}
	});
});

myApp.onPageInit('credencial-frente', function(page) {	
		
	MAIN.setPage('credencial_frente');

	//Si ya existe la imagen: mostrarla
	let base64 = localStorage.getItem("base64_frente");
	if(base64){
		$("img.credencial").attr("src", base64);
		// $(".continuar").removeAttr("disabled");
	}

	$(".page[data-page=credencial-frente] .button-file").click(function(){		
		$(`[name="credencial_frente"]`).click();
	});

	$(`.page[data-page=credencial-frente] [name="credencial_frente"]`).on("change", function(){
		let file = $(`[name="credencial_frente"]`)[0].files[0] || null;

		if(file)
			MAIN.getBase64(file, function(err, base64) {
				if(err) return MAIN.showMessage("error", "Error al obtener imagen");
				localStorage.setItem("base64_frente", base64);
				$("img.credencial").attr("src", base64);
				// $(".continuar").removeAttr("disabled");
				MAIN.showView("credencial_frente_validar");
			});
	});

	$(".page[data-page=credencial-frente] .continuar").on("click", function(){

		
		$(`[name="credencial_frente"]`).click();
		

		gtag('event', 'Paso_3_boton_Continuar_foto_INE_frontal', {'Paso_3_boton_Continuar_foto_INE_frontal': 'Paso_3_boton_Continuar_foto_INE_frontal'});
		
	});
});

myApp.onPageInit('credencial-frente-validar', function(page) {	
	
	MAIN.setPage('credencial_frente_validar');

	let base64 = localStorage.getItem("base64_frente");
	if(base64) $("img.credencial").attr("src", base64);

	$(`.page[data-page=credencial-frente-validar] input[type="checkbox"]`).on("change", function(){
		let total_checkbox = $(`input[type="checkbox"]`).length,
			checked = $(`input[type="checkbox"]:checked`).length;

		if(total_checkbox == checked) $(".confirmar").removeAttr('disabled');
		else $(".confirmar").attr('disabled', 'true');
	});

	$(".page[data-page=credencial-frente-validar] .confirmar").on("click", function(){
		MAIN.POST(`${API_URL}registro/ocr_frente`, {base64}, function(res){
			if(res.status != "success") {
				gtag('event', 'Paso_4_boton_sin_verificar_foto_INE', {'Paso_4_boton_sin_verificar_foto_INE': 'Paso_4_boton_sin_verificar_foto_INE'});
				MAIN.showView("procesar_foto_error");
			}
			//MAIN.showView("credencial_reverso");
			gtag('event', 'Paso_4_boton_Confirmar_foto_INE', {'Paso_4_boton_Confirmar_foto_INE': 'Paso_4_boton_Confirmar_foto_INE'});
			MAIN.showView("informacion_personal_full");
			
			
		});
	});
});




myApp.onPageInit('informacion-personal-full', function(page) {
	
	MAIN.setPage('informacion_personal_full');

	var calendarCustomDateFormat = window.myApp.calendar({
	    	dateFormat: 'dd/mm/yyyy',
	    	monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto' , 'Septiembre' , 'Octubre', 'Noviembre', 'Diciembre'],
	    	dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
	    	toolbarCloseText: "Aceptar",
			input: '.page[data-page=informacion-personal-full] #calendar'
		}),
		pickerSexo = window.myApp.picker({
			toolbarCloseText: "Aceptar",
			input: '.page[data-page=informacion-personal-full] #picker-sexo',
			cols: [{
	  			textAlign: 'center',
	  			values: Object.values(CATALOGO_SEXO)
			}]
		}),
		pickerEstado = window.myApp.picker({
			toolbarCloseText: "Aceptar",
			input: '.page[data-page=informacion-personal-full] #picker-estado',
			cols: [{
	  			textAlign: 'center',
	  			values: Object.values(CATALOGO_ESTADO)
			}]
		});


	MAIN.getStatus( (user) => {
		let json = {};
		try{ json = JSON.parse(user.json_ocr_frente); }catch(ex){}

		let fecha_nacimiento = moment(json?.ocr?.fecha_nacimiento, "DD/MM/YYYY"), //.add(1, 'days'),
			sexo = json?.ocr?.sexo == "HOMBRE" ? "H" : (json?.ocr?.sexo == "MUJER" ? "M" : ""),
			estado_code = json?.ocr?.curp ? json?.ocr?.curp.substring(11,13) : "";

		if(user.fecha_nacimiento) calendarCustomDateFormat.setValue([fecha_nacimiento.toDate()]);
		else if(fecha_nacimiento.isValid()) calendarCustomDateFormat.setValue([fecha_nacimiento.toDate()]); // .format("YYYY-MM-DD")
		
		if(user.sexo) pickerSexo.setValue([user.sexo], 0);
		else if(CATALOGO_SEXO[sexo]) pickerSexo.setValue([CATALOGO_SEXO[sexo]], 0);
		
		if(user.lugar_de_nacimiento) pickerEstado.setValue([user.lugar_de_nacimiento], 0)
		else if(CATALOGO_ESTADO[estado_code]) pickerEstado.setValue([CATALOGO_ESTADO[estado_code]], 0);
		
		$(`[name="nombre"]`).val(user.nombre || json?.ocr?.nombre);
		$(`[name="apellido_paterno"]`).val(user.apellido_paterno || json?.ocr?.apellido_paterno);
		$(`[name="apellido_materno"]`).val(user.apellido_materno || json?.ocr?.apellido_materno);
	});

	$(".page[data-page=informacion-personal-full] #form").validate({
		rules: {
			nombre: { required: true},
			apellido_paterno: { required: true},
			apellido_materno: { required: true},
			fecha_nacimiento: { required: true},
			sexo: { required: true},
			estado: { required: true}
		},
    	errorElement : 'span',
		errorPlacement: function(error, element) {
			error.appendTo(element.closest('.item-content'));
		},
		submitHandler: function(form) {
			let data = $(form).serialize();
			
			MAIN.POST(`${API_URL}registro/datos_personales`, data, function(res){
				if(res.status != "success") {
					return MAIN.showMessage("error", res.message);
				}
				
				gtag('event', 'Paso_5_boton_Confirmar_datos_personales', {'Paso_5_boton_Confirmar_datos_personales': 'Paso_5_boton_Confirmar_datos_personales'});
				MAIN.showView("validar_datos");
			});
		}
	});
});


myApp.onPageInit('validar-datos', function(page) {
	
	MAIN.setPage('validar_datos');

	MAIN.getStatus( (user) => {
		let json_curp = {}, json_rfc = {};
		try{ json_curp = JSON.parse(user.json_curp); }catch(ex){}
		try{ json_rfc = JSON.parse(user.json_rfc); }catch(ex){}

		$(`[name="curp"]`).val(user.curp || json_curp?.curpdata?.[0]?.curp);
		$(`[name="rfc"]`).val(user.rfc || json_rfc?.rfc);
	});

	$(".page[data-page=validar-datos] #form").validate({
		rules: {
			curp: { required: true},
			rfc: { required: true}			
		},
    	errorElement : 'span',
		errorPlacement: function(error, element) {
			error.appendTo(element.closest('.item-content'));
		},
		submitHandler: function(form) {
			let data = $(form).serialize();
			
			MAIN.POST(`${API_URL}registro/curp_rfc`, data, function(res){


				if(res.status != "success") {
					if(res.data!= null && typeof res.data.curpValido !== "undefined" && res.data.curpValido == false){
						gtag('event', 'Paso_7_CURP_RFC_duplicado', {'Paso_7_CURP_RFC_duplicado': 'Paso_7_CURP_RFC_duplicado'});
						MAIN.showView("curp_registrado");
					}						
					else{
						gtag('event', 'Paso_7_CURP_RFC_sin_verificar', {'Paso_7_CURP_RFC_sin_verificar': 'Paso_7_CURP_RFC_sin_verificar'});
						MAIN.showView("procesar_datos_error");
					}
					// return MAIN.showMessage("error", res.message);
				}
				else{					

					gtag('event', 'Paso_6_boton_Confirmar_CURP_RFC', {'Paso_6_boton_Confirmar_CURP_RFC': 'Paso_6_boton_Confirmar_CURP_RFC'});

					MAIN.showView("domicilio");
				}
			});
		}
	});
});

myApp.onPageInit('domicilio', function(page) {
	
	MAIN.setPage('domicilio');

	let pickerEstado = window.myApp.picker({
		toolbarCloseText: "Aceptar",
		input: '.page[data-page=domicilio] #picker-estado',
		cols: [{
  			textAlign: 'center',
  			values: Object.values(CATALOGO_ESTADO)
		}]
	});

	MAIN.getStatus( (user) => {
		let ocr = {};
		try{ ocr = JSON.parse(user.json_ocr_frente).ocr;}catch(ex){}

		let calle_numero = ocr?.calle_numero || "",
			numero = calle_numero.match(/\d+(?=\D*$)/, "")?.[0] || "",
			calle = calle_numero.replace(numero, ""),
			estado_code = ocr?.curp ? ocr?.curp.substring(11,13) : "";

		if(user.estado) pickerEstado.setValue([user.estado], 0)
		else if(CATALOGO_ESTADO[estado_code]) pickerEstado.setValue([CATALOGO_ESTADO[estado_code]], 0);

		$(`[name="calle"]`).val(user.calle || calle);
		$(`[name="numero_exterior"]`).val(user.numero_exterior || numero);
		$(`[name="numero_interior"]`).val(user.numero_interior);
		$(`[name="codigo_postal"]`).val(user.codigo_postal || ocr?.codigo_postal);
		$(`[name="colonia"]`).val(user.colonia || ocr?.colonia);
		$(`[name="municipio"]`).val(user.municipio || ocr?.municipio);
	});

	$(".page[data-page=domicilio] #form").validate({
		rules: {
			calle: { required: true},
			numero_exterior: { required: true},
			codigo_postal: { required: true},		
			colonia: { required: true},
			municipio: { required: true},
			estado: { required: true}
		},
    	errorElement : 'span',
		errorPlacement: function(error, element) {
			error.appendTo(element.closest('.item-content'));
		},
		submitHandler: function(form, e) {
			let data = $(form).serialize();

			MAIN.POST(`${API_URL}registro/domicilio`, data, function(res){
				if(res.status != "success") {
					return MAIN.showMessage("error", res.message);
				}
				
				
				gtag('event', 'Paso_5_boton_Confirmar_datos_demograficos', {'Paso_5_boton_Confirmar_datos_demograficos': 'Paso_5_boton_Confirmar_datos_demograficos'});
				MAIN.showView("autorizacion");
			});
		}
	});
});


myApp.onPageInit('autorizacion', function(page) {
	
	MAIN.setPage('autorizacion');

	MAIN.getStatus( (user) => {
		$(`.phone-number`).html(`+52 ${user.numero}`);
	});

	$(`.page[data-page=autorizacion] [name="condiciones"]`).on("change", function(){
		if(this.checked) $(`button`).removeAttr("disabled");
		else $(`button`).attr('disabled', 'true');
	});

	$(".page[data-page=autorizacion] #form").validate({
		rules: {
			condiciones: { required: true}
		},
    	errorElement : 'span',
		errorPlacement: function(error, element) {
			error.appendTo(element.closest('.item-content'));
		},
		submitHandler: function(form, e) {
			e.preventDefault();
			if(!$(`[name="condiciones"]`).is(":checked")) return $(`<span class="error">Por favor acepte la autorización de consulta</span>`).appendTo($(`input[name="condiciones"]`).closest('.item-content'));
			let data = $(form).serialize();
			
			MAIN.POST(`${API_URL}registro/enviar_otp`, data, function(res){
				if(res.status != "success"){
					return MAIN.showMessage("error", res.message);
				}
				

				gtag('event', 'Paso_8_enviar_codigo', {'Paso_8_enviar_codigo': 'Paso_8_enviar_codigo'});

				MAIN.showView("autorizacion_validacion");
			});
		}
	});
});


myApp.onPageInit('autorizacion-validacion', function(page) {	

	MAIN.setPage('autorizacion_validacion');

	$(`.page[data-page=autorizacion-validacion] [name="codigo"]`).on("keyup", function(){
		let length = $(this).val().length;
		if(length > 0) $(`#form .button-submit`).removeAttr("disabled");
		else $(`#form .button-submit`).attr('disabled', 'true');
	});

	MAIN.getStatus( (user) => {
		$(`.phone-number`).html(`+52 ${user.numero}`);
	});

	$(".page[data-page=autorizacion-validacion] #form").validate({
		rules: {
			codigo: { required: true}
		},
    	errorElement : 'span',
		errorPlacement: function(error, element) {
			error.appendTo(element.closest('.item-content'));
		},
		submitHandler: function(form) {
			let data = $(form).serialize();
			
			MAIN.POST(`${API_URL}registro/validar_otp`, data, function(res){
				if(res.status != "success") {
					return MAIN.showMessage("error", res.message);
				}				

				gtag('event', 'Paso_9_aceptar_consulta_historial', {'Paso_9_aceptar_consulta_historial': 'Paso_9_aceptar_consulta_historial'});

				MAIN.showView("usuario_registrado");
			});
		}
	});
});

myApp.onPageInit('usuario-registrado', function(page) {

	MAIN.setPage('usuario_registrado');
	gtag('event', 'Paso_11_ya_estas_registrado', {'Paso_11_ya_estas_registrado': 'Paso_11_ya_estas_registrado'});

	MAIN.getStatus( (user) => {
		$(`.folio`).html(`[${(user.curp || "").substring(0,10)}]`);

		localStorage.removeItem("uuid");
		localStorage.removeItem("base64_frente");	
	});

	$(".page[data-page=usuario-registrado] .falabella").on("click", function(){
		location.href = 'https://www.falabella.com.mx/';
	});

	

});

myApp.onPageInit('procesar-foto-error', function(page) {
	
	MAIN.setPage('procesar_foto_error');

	$(".page[data-page=procesar-foto-error] .continuar").on("click", function(){
		MAIN.showView("informacion_personal_full");
	});
});

myApp.onPageInit('numero-registrado', function(page){

	MAIN.setPage('numero_registrado');

	$(".page[data-page=numero-registrado] .falabella").on("click", function(){
		location.href = 'https://www.falabella.com.mx/';
	});
});

myApp.onPageInit('procesar-datos', function(page){

	MAIN.setPage('procesar_datos');

	$(".page[data-page=procesar-datos] .falabella").on("click", function(){
		location.href = 'https://www.falabella.com.mx/';
	});
});

myApp.onPageInit('curp-registrado', function(page){

	MAIN.setPage('curp_registrado');

	$(".page[data-page=curp-registrado] .falabella").on("click", function(){
		location.href = 'https://www.falabella.com.mx/';
	});
});