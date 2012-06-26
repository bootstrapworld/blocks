 function createFunctionBlock(functionIndex){
 	var func = functions[functionIndex]
 	var block = "<table style=\"background: " + colors[func.output] +";\">"
 	block += "<tr><th class=\"operator\">" + func.name
 	for(var i = 0; i < func.input.length; i++){
 		block += "<th style=\"background: " + colors[func.input[i].type] +";\">" + func.input[i].name
 	}
 	return block + "</tr></table>"
 }

function block(str){
 	if(str === "define-function"){
 		return createDefineBlock();
 	} else if (str === "define-constant"){
 		return createDefineVarBlock();
 	} else if (str === "define-struct"){
 		return createDefineStructBlock();
 	}
 	 else if (str === "cond"){
 		return createCondBlock();
 	}
 	else{
	 	for(var i = 0; i < functions.length; i++){
	 		if (decode(functions[i].name) === str){
	 			return createFunctionBlock(i);
	 		}
	 	}
 	}
 	
 }

function createDefineBlock(){
	var block ="<table style=\"background: " + colors.Define +";\"><tr><th class=\"operator\">define";
	block+="<th style=\"background: " + colors.Define +"; \"> name <th style=\"background: " + colors.Define +";\">args <th style=\"background: " + colors.Define +";\">expr";
	return block + "</tr></table>";
}

function createDefineVarBlock(){
	var block = "<table style=\"background: " +colors.Define +"; b\"><tr><th class=\"operator\">define";
	block+="<th style=\"background: " + colors.Define +";\"> name  <th style=\"background: " + colors.Define +";\">expr";
	return block + "</tr></table>";
}

function createDefineStructBlock(){
	var block ="<table style=\"background: " + colors.Define +"; \"><tr><th class=\"operator\">define-struct";
	block+="<th style=\"background: " + colors.Define +"; \"> name <th style=\"background: " + colors.Define +"; \">properties";
	return block + "</tr></table>";
}

function createCondBlock(){
	var block =  "<table style=\"background: " + colors.Expressions +";\"><tr><th class=\"operator\">cond</tr>";
	block+="<tr><th><th style=\"background: " + colors.Expressions +"; border: gray;\">boolean <th style=\"background: " + colors.Define +"; border: gray;\">expr</tr>";
	block+="<tr><th><th style=\"background: " + colors.Expressions +"; border: gray;\">add</th></tr>"
	return block + "</table>";
}





table{
	 border-style: outset; 
	 border-radius: 10px;
}
th{
	border: gray; 
	border-style: outset; 
	border-radius: 10px;
}
.operator{
	border:none;
}