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
	localStorage.removeItem("uuid");
	localStorage.removeItem("base64_frente");
	localStorage.removeItem("base64_reverso");
});

/*
|------------------------------------------------------------------------------
| Informacion Personal
|------------------------------------------------------------------------------
*/

myApp.onPageInit('informacion-personal', function(page) {
	$(".page[data-page=informacion-personal] button").on("click", function(){
		let option = $(this).data("option");
		window.option = option;		
		$("#form").submit();
	});

	$(".page[data-page=informacion-personal] #form").validate({
		rules: {
			numero: { required: true, is_phone: true},
			correo: { required: true, is_email: true}
		},
    	errorElement : 'span',
		errorPlacement: function(error, element) {
			error.appendTo(element.closest('.item-content'));
		},
		submitHandler: function(form, e) {
			e.preventDefault();
			if(!$(`[name="terminos"]`).is(":checked")) return $(`<span class="error">Por favor acepte los terminos y condiciones</span>`).appendTo($(`input[name="terminos"]`).closest('.item-content'));
			let data = $(form).serialize();

			MAIN.POST(`${API_URL}registro/crear`, data, function(res){
				if(res.status != "success") return MAIN.showMessage("error", res.message);
				localStorage.setItem("uuid", res.data.uuid);

				MAIN.event("Salio pantalla informacion personal", "salio_informacion_personal");
				if(window.option == "continuar_ine") MAIN.showView("credencial_frente");
				else MAIN.showView("informacion_personal_full");
			});
		}
	});
});

myApp.onPageInit('credencial-frente', function(page) {
	MAIN.event("Ingreso pantalla credencial frente", "ingreso_credencial_frente");

	//Si ya existe la imagen: mostrarla
	let base64 = localStorage.getItem("base64_frente");
	if(base64){
		$("img.credencial").attr("src", base64);
		$(".continuar").removeAttr("disabled");
	}

	$(".page[data-page=credencial-frente] .button-file").click(function(){
		MAIN.event("Click en botón cargar credencial", "cargar_credencial_frente");
		$(`[name="credencial_frente"]`).click();
	});

	$(`.page[data-page=credencial-frente] [name="credencial_frente"]`).on("change", function(){
		let file = $(`[name="credencial_frente"]`)[0].files[0] || null;

		if(file)
			MAIN.getBase64(file, function(err, base64) {
				if(err) return MAIN.showMessage("error", "Error al obtener imagen");
				localStorage.setItem("base64_frente", base64);
				$("img.credencial").attr("src", base64);
				$(".continuar").removeAttr("disabled");
			});
	});

	$(".page[data-page=credencial-frente] .continuar").on("click", function(){
		MAIN.event("Salio pantalla credencial frente", "salio_credencial_frente");
		MAIN.showView("credencial_frente_validar");
	});
});

myApp.onPageInit('credencial-frente-validar', function(page) {
	MAIN.event("Ingreso pantalla credencial frente validar", "ingreso_credencial_frente_validar");

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
			if(res.status != "success") return MAIN.showMessage("error", res.message);
			MAIN.showView("credencial_reverso");
		});
	});
});


myApp.onPageInit('credencial-reverso', function(page) {
	MAIN.event("Ingreso a pantalla credencial reverso", "ingreso_credencial_reverso");

	//Si ya existe la imagen: mostrarla
	let base64 = localStorage.getItem("base64_reverso");
	if(base64){
		$("img.credencial").attr("src", base64);
		$(".continuar").removeAttr("disabled");
	}

	$(".page[data-page=credencial-reverso] .button-file").click(function(){
		MAIN.event("Click en botón cargar credencial", "cargar_credencial_reverso");
		$(`[name="credencial_reverso"]`).click();
	});

	$(`.page[data-page=credencial-reverso] [name="credencial_reverso"]`).on("change", function(){
		let file = $(`[name="credencial_reverso"]`)?.[0]?.files?.[0] || null;

		if(file)
			MAIN.getBase64(file, function(err, base64) {
				if(err) return MAIN.showMessage("error", "Error al obtener imagen");
				localStorage.setItem("base64_reverso", base64);
				$("img.credencial").attr("src", base64);
				$(".continuar").removeAttr("disabled");
			});
	});

	$(".page[data-page=credencial-reverso] .continuar").on("click", function(){
		MAIN.event("Salio pantalla credencial reverso", "salio_credencial_reverso");
		MAIN.showView("credencial_reverso_validar");
	});
});

myApp.onPageInit('credencial-reverso-validar', function(page) {
	MAIN.event("Ingreso pantalla credencial reverso validar", "ingreso_credencial_reverso_validar");

	let base64 = localStorage.getItem("base64_reverso");
	if(base64) $("img.credencial").attr("src", base64);

	$(`.page[data-page=credencial-reverso-validar] input[type="checkbox"]`).on("change", function(){
		let total_checkbox = $(`input[type="checkbox"]`).length,
			checked = $(`input[type="checkbox"]:checked`).length;

		if(total_checkbox == checked) $(".confirmar").removeAttr('disabled');
		else $(".confirmar").attr('disabled', 'true');
	});

	$(".page[data-page=credencial-reverso-validar] .confirmar").on("click", function(){
		MAIN.POST(`${API_URL}registro/ocr_reverso`, {base64}, function(res){
			if(res.status != "success") return MAIN.showMessage("error", res.message);
			MAIN.showView("informacion_personal_full");
		});
	});
});

myApp.onPageInit('informacion-personal-full', function(page) {
	MAIN.event("Ingreso pantalla informacion personal full", "ingreso_informacion_personal_full");

	MAIN.getStatus( (user) => {
		let json = {};
		try{ json = JSON.parse(user.json_ocr_frente); }catch(ex){}

		$(`[name="nombre"]`).val(user.nombre || json?.ocr?.nombre);
		$(`[name="apellido_paterno"]`).val(user.apellido_paterno || json?.ocr?.apellido_paterno);
		$(`[name="apellido_materno"]`).val(user.apellido_materno || json?.ocr?.apellido_materno);
		$(`[name="lugar_de_nacimiento"]`).val(user.lugar_de_nacimiento);
		$("#picker-sexo").val(user.sexo || json?.ocr?.sexo == "HOMBRE" ? "H" : null || json?.ocr?.sexo == "MUJER" ? "M" : null );
	});
	
	var calendarCustomDateFormat = window.myApp.calendar({
    	dateFormat: 'dd/mm/yyyy',
		input: '.page[data-page=informacion-personal-full] #calendar'
	});

	window.myApp.picker({
		toolbarCloseText: "Aceptar",
		input: '.page[data-page=informacion-personal-full] #picker-sexo',
		cols: [{
  			textAlign: 'center',
  			values: ['H', 'M'],
       		displayValues: ['Hombre', 'Mujer']
		}]
	});

	window.myApp.picker({
		toolbarCloseText: "Aceptar",
		input: '.page[data-page=informacion-personal-full] #picker-estado',
		cols: [{
  			textAlign: 'center',
  			values: ['AS', 'BC', 'BS', 'CC', 'CL', 'CM', 'CS', 'CH', 'DF', 'DG', 'GT', 'GR', 'HG', 'JC', 'MC', 'MN', 'MS', 'NT', 'NL', 'OC', 'PL', 'QT', 'QR', 'SP', 'SL', 'SR', 'TC', 'TS', 'TL', 'VZ', 'YN', 'ZS'],
       		displayValues: ['Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Coahuila de Zaragoza', 'Colima', 'Chiapas', 'Chihuahua', 'Distrito Federal', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'México', 'Michoacán de Ocampo', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz de Ignacio de la Llave', 'Yucatán', 'Zacatecas']
		}]
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
				if(res.status != "success") return MAIN.showMessage("error", res.message);
				MAIN.showView("validar_datos");
			});
		}
	});
});


myApp.onPageInit('validar-datos', function(page) {
	MAIN.event("Ingreso pantalla validar datos", "ingreso_validar_datos");

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
				if(res.status != "success") return MAIN.showMessage("error", res.message);
				MAIN.event("Salio pantalla validar datos", "salio_validar_datos");
				MAIN.showView("domicilio");
			});
		}
	});
});

myApp.onPageInit('domicilio', function(page) {
	MAIN.event("Ingreso pantalla domicilio", "ingreso_domicilio");

	MAIN.getStatus( (user) => {
		let ocr = {};
		try{ ocr = JSON.parse(user.json_ocr_frente); }catch(ex){}

		$(`[name="calle"]`).val(user.calle || ocr?.ocr?.calle_numero);
		$(`[name="codigo_postal"]`).val(user.codigo_postal || ocr?.ocr?.codigo_postal);
	});

	window.myApp.picker({
		toolbarCloseText: "Aceptar",
		input: '.page[data-page=domicilio] #picker-colonia',
		cols: [{
  			textAlign: 'center',
  			values: ['Colonia 1', 'Colonia 2', 'Colonia 3', 'Colonia 4']
		}]
	});

	window.myApp.picker({
		toolbarCloseText: "Aceptar",
		input: '.page[data-page=domicilio] #picker-estado',
		cols: [{
  			textAlign: 'center',
  			values: ['Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas']
		}]
	});

	window.myApp.picker({
		toolbarCloseText: "Aceptar",
		input: '.page[data-page=domicilio] #picker-municipio',
		cols: [{
  			textAlign: 'center',
  			values: ['Municipio 1', 'Municipio 2', 'Municipio 3', 'Municipio 4']
		}]
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
				if(res.status != "success") return MAIN.showMessage("error", res.message);
				MAIN.event("Salio pantalla domicilio", "salio_domicilio");
				MAIN.showView("autorizacion");
			});
		}
	});
});


myApp.onPageInit('autorizacion', function(page) {
	MAIN.event("Ingreso pantalla autorización", "ingreso_autorizacion");

	MAIN.getStatus( (user) => {
		$(`.phone-number`).html(`+52 ${user.numero}`);
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
				if(res.status != "success") return MAIN.showMessage("error", res.message);
				MAIN.event("Salio pantalla autorización", "salio_autorizacion");
				MAIN.showView("autorizacion_validacion");
			});
		}
	});
});


myApp.onPageInit('autorizacion-validacion', function(page) {
	MAIN.event("Ingreso pantalla autorización validación", "ingreso_autorizacion_validacion");

	MAIN.getStatus( (user) => {
		$(`.phone-number`).html(`+52 ${user.numero}`);
	});

	$(".page[data-page=autorizacion-validacion] #form").validate({
		rules: {
			nip: { required: true}
		},
    	errorElement : 'span',
		errorPlacement: function(error, element) {
			error.appendTo(element.closest('.item-content'));
		},
		submitHandler: function(form) {
			let data = $(form).serialize();
			
			MAIN.POST(`${API_URL}registro/validar_otp`, data, function(res){
				if(res.status != "success") return MAIN.showMessage("error", res.message);
				MAIN.event("Salio pantalla autorización validación", "salio_autorizacion_validacion");
				MAIN.showView("usuario_registrado");
			});
		}
	});
});

myApp.onPageInit('usuario-registrado', function(page) {
	myApp.swiper('.page[data-page=usuario-registrado] .slider-hero .swiper-container', {
		autoplay: 10000,
		loop: true,
		pagination: '.swiper-pagination',
		paginationClickable: true
	});
});
