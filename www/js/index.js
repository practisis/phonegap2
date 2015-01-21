/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        //aqui codigo de ondevide ready para empezar a hacer cosas.
    },
    escanear: function(){
        resultDiv = document.querySelector("#results");
	resultDiv.innerHTML='';
        cordova.plugins.barcodeScanner.scan(
		function (result) {
                        ajax("http://104.131.65.202/ticket/validacionmovil.php?id="+result.text);
		}, 
		function (error) {
			alert("Error de Scan: " + error);
		}
	);
        
    }
};

function ajax(cadena){var xmlhttp=false;
/*@cc_on @*/
/*@if (@_jscript_version >= 5)
try { xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");} catch (e) {try {xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");} 

catch (E) { xmlhttp = false;}}
@end @*/
//console.log(cadena);
if (!xmlhttp && typeof XMLHttpRequest!='undefined') { try {xmlhttp = new XMLHttpRequest(); } catch (e) { xmlhttp=false;}}
if (!xmlhttp && window.createRequest) {	try { xmlhttp = window.createRequest();} catch (e) { xmlhttp=false;}}
xmlhttp.open("GET",cadena,true);
xmlhttp.onreadystatechange=function() {
if (xmlhttp.readyState==4){
	if(xmlhttp.status==200){
        resultDiv = document.querySelector("#results");
	resultDiv.innerHTML=xmlhttp.responseText;	
}}} 
xmlhttp.send(null);
}