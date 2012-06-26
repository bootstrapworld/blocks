/*
* Sets the panels with function names to visible and invisible when hidden
*
*/
"use strict";

//DrawerButton takes in an element and either activates (shows) or deactivates (hides) the current element to show the new one
var activated = null;
var currID = null;
function drawerButton(elt){
	if (elt.attr('id') == currID) {
		activated.css("visibility","hidden");
		activated = null;
		currID = null;
		$("#options").css("visibility", "hidden");
	}else if (currID === null){
		activated = $("#options #" + elt.attr('id'))
		currID = elt.attr('id')
		activated.css("visibility", "visible");
		$("#options").css("visibility", "visible");
	} else {
		activated.css("visibility","hidden");
		activated = $("#options #" + elt.attr('id'))
		activated.css("visibility", "visible");
		currID = elt.attr('id');
		$("#options").css("visibility", "visible");
	}

}

//Upon loading the webpage, the drawers are formed
$(".document").ready(function(){makeDrawers(functions,constants);});

//During the course of the whole session, buttons on the drawer can be clicked in order to add them to the program (the draggable list)
$("#options span").live('click',function(){
	var old=document.getElementById("List").innerHTML;
	document.getElementById("List").innerHTML=old+"<li>"+block($(this).html())+"</li>";
});


//During the course of the whole session, drawers can be opened and closed to reveal all of the buttons (functions) that they contain
$(".bottomNav").live('click', function(e){
		drawerButton($(this));
});

//Functions is an array of objects containing a name, tuples of type and name corresponding to their inputs and an output type
var functions=[];
functions[0]={};
functions[0].name="+";
functions[0].input=new Array({type:"Numbers",name:"Exp1"},{type:"Numbers",name:"Exp2"});
functions[0].output="Numbers";
functions[1]={};
functions[1].name="-";
functions[1].input=new Array({type:"Numbers",name:"Exp1"},{type:"Numbers",name:"Exp2"});
functions[1].output="Numbers";
functions[2]={};
functions[2].name="*";
functions[2].input=new Array({type:"Numbers",name:"Exp1"},{type:"Numbers",name:"Exp2"});
functions[2].output="Numbers";
functions[3]={};
functions[3].name="/";
functions[3].input=new Array({type:"Numbers",name:"Exp1"},{type:"Numbers",name:"Exp2"});
functions[3].output="Numbers";
functions[4]={};
functions[4].name="remainder";
functions[4].input=new Array({type:"Numbers",name:"Exp1"},{type:"Numbers",name:"Exp2"});
functions[4].output="Numbers";
functions[5]={};
functions[5].name="sqrt";
functions[5].input=new Array({type:"Numbers",name:"Exp1"});
functions[5].output="Numbers";
functions[6]={};
functions[6].name="sqr";
functions[6].input=new Array({type:"Numbers",name:"Exp1"});
functions[6].output="Numbers";
functions[7]={};
functions[7].name="expt";
functions[7].input=new Array({type:"Numbers",name:"Exp1"},{type:"Numbers",name:"Exp2"});
functions[7].output="Numbers";
functions[8]={};
functions[8].name="=";
functions[8].input=new Array({type:"Numbers",name:"Exp1"},{type:"Numbers",name:"Exp2"});
functions[8].output="Booleans";
functions[9]={};
functions[9].name=">";
functions[9].input=new Array({type:"Numbers",name:"Exp1"},{type:"Numbers",name:"Exp2"});
functions[9].output="Booleans";
functions[10]={};
functions[10].name="<";
functions[10].input=new Array({type:"Numbers",name:"Exp1"},{type:"Numbers",name:"Exp2"});
functions[10].output="Booleans";
functions[11]={};
functions[11].name="<=";
functions[11].input=new Array({type:"Numbers",name:"Exp1"},{type:"Numbers",name:"Exp2"});
functions[11].output="Booleans";
functions[12]={};
functions[12].name=">=";
functions[12].input=new Array({type:"Numbers",name:"Exp1"},{type:"Numbers",name:"Exp2"});
functions[12].output="Booleans";
functions[13]={};
functions[13].name="even?";
functions[13].input=new Array({type:"Numbers",name:"Exp1"});
functions[13].output="Booleans";
functions[14]={};
functions[14].name="odd?";
functions[14].input=new Array({type:"Numbers",name:"Exp1"});
functions[14].output="Booleans";
functions[15]={};
functions[15].name="string-append";
functions[15].input=new Array({type:"Strings",name:"String1"},{type:"Strings",name:"String2"});
functions[15].output="Strings";
functions[16]={};
functions[16].name="string-length";
functions[16].input=new Array({type:"Strings",name:"String1"})
functions[16].output="Numbers";
functions[17]={};
functions[17].name="string=?";
functions[17].input=new Array({type:"Strings",name:"String1"},{type:"Strings",name:"String2"});
functions[17].output="Booleans";
functions[18]={};
functions[18].name="true";
functions[18].input=new Array();
functions[18].output="Booleans";
functions[19]={};
functions[19].name="false";
functions[19].input=new Array();
functions[19].output="Booleans";
functions[20]={};
functions[20].name="and";
functions[20].input=new Array({type:"Booleans",name:"Boolean Exp1"},{type:"Booleans",name:"Boolean Exp2"});
functions[20].output="Booleans";
functions[21]={};
functions[21].name="or";
functions[21].input=new Array({type:"Booleans",name:"Boolean Exp1"},{type:"Booleans",name:"Boolean Exp2"});
functions[21].output="Booleans";
functions[22]={};
functions[22].name="not";
functions[22].input=new Array({type:"Booleans",name:"Boolean Exp1"});
functions[22].output="Booleans";
functions[23]={}
functions[23].name="rectangle";
functions[23].input=new Array({type:"Numbers",name:"Width"},{type:"Numbers",name:"Height"}, {type:"Strings", name:"Outline"}, {type:"Strings",name:"Color"});
functions[23].output="Images";
functions[24]={};
functions[24].name="circle";
functions[24].input=new Array({type:"Numbers",name:"Radius"}, {type:"Strings", name:"Outline"}, {type:"Strings",name:"Color"});
functions[24].output="Images";
functions[25]={};
functions[25].name="triangle";
functions[25].input=new Array({type:"Numbers",name:"Length"}, {type:"Strings", name:"Outline"}, {type:"Strings",name:"Color"});
functions[25].output="Images";
functions[26]={};
functions[26].name="ellipse";
functions[26].input=new Array({type:"Numbers",name:"A"},{type:"Numbers",name:"B"}, {type:"Strings", name:"Outline"}, {type:"Strings",name:"Color"});
functions[26].output="Images";
functions[27]={};
functions[27].name="star";
functions[27].input=new Array({type:"Numbers",name:"Side-Length"}, {type:"Strings", name:"Outline"}, {type:"Strings",name:"Color"});
functions[27].output="Images";
functions[28]={};
functions[28].name="scale";
functions[28].input=new Array({type:"Numbers",name:"Multiple"},{type:"Images",name:"Image"});
functions[28].output="Images";
functions[29]={};
functions[29].name="rotate";
functions[29].input=new Array({type:"Numbers",name:"Degrees"},{type:"Images",name:"Image"});
functions[29].output="Images";
functions[30]={};
functions[30].name="place-image";
functions[30].input=new Array({type:"Images",name:"To Place"}, {type:"Numbers",name:"x"},{type:"Numbers",name:"y"},{type:"Images",name:"Background"});
functions[30].output="Images";

//restricted contains a list of key words in racket that we aren't allowing the user to redefine
var restricted=["lambda","define","list","if","else","cond","foldr","foldl","map","let","local"]

//Colors is an object containing kv pairs of type to color
var colors={}
 colors.Numbers="#33CCFF"
 colors.Strings="#FFA500"
 colors.Images="#66FF33"
 colors.Booleans="#CC33FF"
 colors.Define="#FFFFFF"
 colors.Expressions="#FFFFFF"
 colors.Constants="#FFFFFF"

//constants is an array of user defined variables containing their name and type
var constants=[]

//isDuplicate takes in a name of a function/constant/struct and checks if that name already exists or is restricted
function isDuplicate(name){
	return (colors[name]!=undefined || containsName(constants,name)!=-1 || containsName(functions,name)!=-1 || restricted.contains(name)!=-1)
}

//addConstant will first check if the name is already taken and if not, adds it to the constants array and remakes the drawers
function addConstant(name_of_v,type_of_v){
	if(isDuplicate(name_of_v)){
		alert("I am sorry but that type already exists as either another struct, function, constant or a reserved word")
		return;
	}
	constants[constants.length]={
		name:name_of_v,
		type:type_of_v,
	}
	makeDrawers(functions,constants)
}

//deleteConstant will remove teh given constant if it exists and remake the drawers
function deleteConstant(name_of_v){
	var index=containsName(constants,name_of_v)
	if(index!=-1){
		constants.splice(index,1)
		makeDrawers(functions,constants)
	}

}

//addStruct will add the new type,color pair, the constructor function and the accessor functions to the functions array if it doesn't already exist.  Also, the drawers will be remade
function addStruct(name, colorValue, array_of_names, array_of_types){
	if(isDuplicate(name)){
		alert("I am sorry but that type already exists as either another struct, function, constant or a reserved word")
		return;
	}
	addType(name,colorValue)
	addFunction("make-"+name,array_of_types,array_of_names,name)
	for(var i=0;i<array_of_names.length;i++){
		addFunction(name+"-"+array_of_names[i],[name],[name],array_of_types[i])
	}
	makeDrawers(functions,constants)
}

//deleteStruct will remove the constructor, type and the accessor functions from their respective arrays if they exist and the drawers will be remade
function deleteStruct(name_of_s){
	var index=containsName(functions,"make-"+name_of_s)
	if(index!=-1){
		functions.splice(index,functions[index].input.length+1)
		deleteType (name_of_s)
		makeDrawers(functions,constants)
	}

}

//spliceTypeName takes in an array of types and names and stitches them together.
function spliceTypeName(array_of_types,array_of_names){
	var spliced=[]
	for(var i=0;i<array_of_names.length;i++){
		spliced[spliced.length]={type:array_of_types[i],name:array_of_names[i]}
	}
	return spliced
}

//addType will add the new name,color pair only if both are unique
function addType(name, colorValue){
	if(isDuplicate(name)){
		alert("I am sorry but that type already exists as either another struct, function, constant or a reserved word")
		return;
	}
	for(var type in colors){
		if (colors[type]==colorValue){
			alert("I am sorry but that color already exists")
			return;
		}
	}
	colors[name]=colorValue
}

//deleteType will remove the kv pair from the colors object
function deleteType(name){
	delete colors[name]
}

//addFunction will add the given function to the functions array if it doesn't already exist and the drawers will be remade
function addFunction(name_of_function,inputs,inputsnames,output_type){
	if(isDuplicate(name_of_function)){
		alert("I am sorry but that type already exists as either another struct, function, constant or a reserved word")
		return;
	}
	functions[functions.length]={name:name_of_function, input:spliceTypeName(inputs,inputsnames), output:output_type}
	makeDrawers(functions,constants)
}

//deleteFunction will remove the given function if it exists and the drawers will be remade
function deleteFunction(name_of_f){
	var index=containsName(functions,name_of_f)
	if(index!=-1){
		functions.splice(index,1)
		makeDrawers(functions,constants)
	}
	
}

//makeTypesArray will construct an object of kv pairs such that each type's value is an array of all indices to which that type is the output or the exclusive input
function makeTypesArray(allFunctions,allConstants){
	var types={}
	for(var i=0;i<allFunctions.length;i++){
		var curOutput=allFunctions[i].output
		if(types[curOutput]!=undefined){
			types[curOutput][types[curOutput].length]=i
		}
		else{
			types[curOutput]=[i]
		}


		var curInput=allFunctions[i].input
		if(unique(curInput) && curInput.length>0){
			var addition=curInput[0].type
			if( types[addition]!=undefined ){
				if( types[addition][ types[addition].length-1 ]!=i ){
					types[addition][ types[addition].length ]=i
				}
			}
			else{
				 types[addition]=[i]
			}
		}
	}
	types.Constants=[]
	for(i=0;i<allConstants.length;i++){
		types.Constants[types.Constants.length]=i
	}

	types.Define=new Array("define-constant","define-function","define-struct")
	types.Expressions=new Array("cond")

	return types
}

//unique takes as input an array and outputs if there is only one type in the whole array
function unique(array_inputs){
	if(array_inputs.length>0){
		var first=array_inputs[0].type;
		for(var i=1;i<array_inputs.length;i++){
			if(first!=array_inputs[i].type){
				return false
			}
		}
	}
	return true
}

//containsName takes in an array of objects and a string and returns the index at which that string is the name property of any of the objects
function containsName(array_of_obj,stringElement){
	var contain=-1
	for (var i = 0; i < array_of_obj.length; i++) {
		if(array_of_obj[i].name==stringElement){
			contain=i;
			 break;
		}
	}
	return contain
}

//contains takes in a string and returns if any object of the array is equal to the given string
Array.prototype.contains=function(stringElement){
	var contain=-1
	for (var i = 0; i <this.length; i++) {
		if(this[i]==stringElement){
			contain=i;
			 break;
		}
	}
	return contain
}

//makeDrawers takes in all of the functions and all of the constants and will change the HTML so that each of the types is an openable drawer and when that drawer is opened
//all of the functions corresponding to that type are displayed
function makeDrawers(allFunctions,allConstants){
	var typeDrawers=makeTypesArray(allFunctions,allConstants)
	var Drawers="<div id=\"options\">\n"
	var Selector="<div id=\"selectors\">\n"

	for(var Type in typeDrawers){
		Drawers+="<div class=\""+Type+"\" id=\""+Type+"\">\n"
		if(Type=="Constants"){
			for(var i=0;i<typeDrawers[Type].length;i++){
				Drawers+="<span class="+Type+" style=\"background: "+colors[allConstants[typeDrawers[Type][i]].type]+"\">"+allConstants[typeDrawers[Type][i]].name+"</span>\n"
			}
		}
		else if(Type=="Define"){
			for(var i=0;i<typeDrawers[Type].length;i++){
				Drawers+="<span class="+Type+" style=\"background: "+colors[Type]+"\">"+typeDrawers[Type][i]+"</span>\n"
			}
		}
		else if(Type=="Expressions"){
			for(var i=0;i<typeDrawers[Type].length;i++){
				Drawers+="<span class="+Type+" style=\"background: "+colors[Type]+"\">"+typeDrawers[Type][i]+"</span>\n"
			}
		}
		else{
			for(var i=0;i<typeDrawers[Type].length;i++){
				Drawers+="<span class="+allFunctions[typeDrawers[Type][i]].output+" style=\"background: "+colors[allFunctions[typeDrawers[Type][i]].output]+"\">"+allFunctions[typeDrawers[Type][i]].name+"</span>\n"
			}
		}

		Drawers+="</div>\n"
		Selector+="<div class=\""+Type+" bottomNav\" id=\""+Type+"\" style=\"background: "+colors[Type]+"\">"+Type+"</div>\n"
	}

	Drawers+="</div>"
	Selector+="</div>"
	document.getElementById("Drawer").innerHTML=Drawers+"\n"+Selector
}

//createFunctionBlock takes as input a functionIndex and will output an HTML element corresponding to that function with name, color, and spaces for input blocks
 function createFunctionBlock(functionIndex){
 	var func = functions[functionIndex]
 	var block = "<table style=\"background: " + colors[func.output] +";\">"
 	block += "<tr><th class=\"operator\">" + func.name
 	for(var i = 0; i < func.input.length; i++){
 		block += "<th style=\"background: " + colors[func.input[i].type] +";\">" + func.input[i].name
 	}
 	return block + "</tr></table>"
 }

//block takes in a string and outputs the corresponding block to that function
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

//createDefineBlock outputs the block corresponding to defining a function
function createDefineBlock(){
	var block ="<table style=\"background: " + colors.Define +";\"><tr><th class=\"operator\">define";
	block+="<th style=\"background: " + colors.Define +"; \"> name <th style=\"background: " + colors.Define +";\">args <th style=\"background: " + colors.Define +";\">expr";
	return block + "</tr></table>";
}

//createDefineVarBlock outputs the block corresponding to creating a variable
function createDefineVarBlock(){
	var block = "<table style=\"background: " +colors.Define +"; b\"><tr><th class=\"operator\">define";
	block+="<th style=\"background: " + colors.Define +";\"> name  <th style=\"background: " + colors.Define +";\">expr";
	return block + "</tr></table>";
}

//createDefineStructBlock outputs the block corresponding to creating a structure
function createDefineStructBlock(){
	var block ="<table style=\"background: " + colors.Define +"; \"><tr><th class=\"operator\">define-struct";
	block+="<th style=\"background: " + colors.Define +"; \"> name <th style=\"background: " + colors.Define +"; \">properties";
	return block + "</tr></table>";
}

//createCondBlock outputs the block corresponding to creating a conditional
function createCondBlock(){
	var block =  "<table style=\"background: " + colors.Expressions +";\"><tr><th class=\"operator\">cond</tr>";
	block+="<tr><th><th style=\"background: " + colors.Booleans +"\">boolean <th style=\"background: " + colors.Expressions +"\">expr</tr>";
	block+="<tr><th><th style=\"background: " + colors.Expressions +"\">add</th></tr>"
	return block + "</table>";
}

//decode takes in a string and outputs the html decoded equivilent
function decode(mystring){
	return mystring.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}