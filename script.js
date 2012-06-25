/*
* Sets the panels with function names to visible and invisible when hidden
*
*/
"use strict";
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
$(".bottomNav").live('click', function(){
		drawerButton($(this));
});

$(".document").ready(function(){makeDrawers(functions,constants);});

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

var restricted=["lambda","define","list","if","else","cond","foldr","foldl","map","let","local"]

var colors={}
 colors.Numbers="#33CCFF"
 colors.Strings="orange"
 colors.Images="#66FF33"
 colors.Booleans="#CC33FF"
 colors.Define="white"
 colors.Expressions="white"
 colors.Constants="white"

var constants=[]


function addConstant(name_of_v,type_of_v){
	if(colors[name_of_v]!=undefined || containsName(constants,name_of_v)!=-1 || containsName(functions,name_of_v)!=-1 || contains(restricted,name_of_v)!=-1){
		alert("I am sorry but that type already exists as either another struct, function, constant or a reserved word")
		return;
	}
	constants[constants.length]={
		name:name_of_v,
		type:type_of_v,
	}
	makeDrawers(functions,constants)
}

function deleteConstant(name_of_v){
	var index=containsName(constants,name_of_v)
	if(index!=-1){
		constants.splice(index,1)
		makeDrawers(functions,constants)
	}

}

/*Function to make a struct should both add a type and automatically create functions to access that struct*/
function addStruct(name, colorValue, array_of_names, array_of_types){
	if(colors[name]!=undefined || containsName(constants,name)!=-1 || containsName(functions,name)!=-1 || contains(restricted,name)!=-1){
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

function deleteStruct(name_of_s){
	var index=containsName(functions,"make-"+name_of_s)
	if(index!=-1){
		functions.splice(index,functions[index].input.length+1)
		deleteType (name_of_s)
		makeDrawers(functions,constants)
	}

}

function spliceTypeName(array_of_types,array_of_names){
	var spliced=[]
	for(var i=0;i<array_of_names.length;i++){
		spliced[spliced.length]={type:array_of_types[i],name:array_of_names[i]}
	}
	return spliced
}

function addType(name, colorValue){
	if(colors[name]!=undefined || containsName(constants,name)!=-1 || containsName(functions,name)!=-1 || contains(restricted,name)!=-1){
		alert("I am sorry but that type already exists as either another struct, function, constant or a reserved word")
		return;
	}
	for(var type in colors){
		if (colors[type]==colorValue){
			alert("I am sorry but that color already exists")
		}
	}
	colors[name]=colorValue
}

function deleteType(name){
	delete colors[name]
}


function addFunction(name_of_function,inputs,inputsnames,output_type){
	if(colors[name_of_function]!=undefined || containsName(constants,name_of_function)!=-1 || containsName(functions,name_of_function)!=-1 || contains(restricted,name_of_function)!=-1){
		alert("I am sorry but that type already exists as either another struct, function, constant or a reserved word")
		return;
	}
	functions[functions.length]={name:name_of_function, input:spliceTypeName(inputs,inputsnames), output:output_type}
	makeDrawers(functions,constants)
}

function deleteFunction(name_of_f){
	var index=containsName(functions,name_of_f)
	if(index!=-1){
		functions.splice(index,1)
		makeDrawers(functions,constants)
	}
	
}


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

	types.Define=new Array("define-var","define-function","define-struct")
	types.Expressions=new Array("cond")

	return types
}

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

function contains(array,stringElement){
	var contain=-1
	for (var i = 0; i < array.length; i++) {
		if(array[i]==stringElement){
			contain=i;
			 break;
		}
	}
	return contain
}


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