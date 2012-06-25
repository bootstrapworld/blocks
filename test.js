 "use strict";

var program=[];
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
functions[30].input=new Array({type:"Images",name:"Image"}, {type:"Numbers",name:"x"},{type:"Numbers",name:"y"},{type:"Images",name:"Background"});
functions[30].output="Images";




var colors={}
 colors.Numbers="#33CCFF"
 colors.Strings="orange"
 colors.Images="#66FF33"
 colors.Booleans="#CC33FF"
 colors.Define="white"
 colors.Expressions="white"
 colors.Constants="white"

 function createFunctionBlock(functionIndex){
 	var func = functions[functionIndex]
 	var block = "<table style=\"background: " + colors[func.output] +"; border-style: outset; border-radius: 10px;\">"
 	block += "<tr><th>" + func.name
 	for(var i = 0; i < func.input.length; i++){
 		block += "<th style=\"background: " + colors[func.input[i].type] +"; border: gray; border-style: outset; border-radius: 10px;\">" + func.input[i].name
 	}
 	return block + "</tr></table>"
 }

function block(str){
 	if(str === "define-function"){
 		document.write(createDefineBlock());
 	} else if (str === "define-var"){
 		document.write(createDefineVarBlock());
 	} else if (str === "define-struct"){
 		document.write(createDefineStructBlock());
 	}
 	 else if (str === "cond"){
 		document.write(createCondBlock());
 	}
 	else{
	 	for(var i = 0; i < functions.length; i++){
	 		if (functions[i].name === str){
	 			var code = createFunctionBlock(i);
	 			document.write(code)
	 			break;
	 		}
	 	}
 	}
 	
 }

function createDefineBlock(){
	var block ="<table style=\"background: " + colors.Define +"; border-style: outset; border-radius: 10px;\"><tr><th>define";
	block+="<th style=\"background: " + colors.Define +"; border: gray; border-style: outset; border-radius: 10px;\"> name <th style=\"background: " + colors.Define +"; border: gray; border-style: outset; border-radius: 10px;\">args <th style=\"background: " + colors.Define +"; border: gray; border-style: outset; border-radius: 10px;\">expr";
	return block + "</tr></table>";
}

function createDefineVarBlock(){
	var block = "<table style=\"background: " +colors.Define +"; border-style: outset; border-radius: 10px;\"><tr><th>define";
	block+="<th style=\"background: " + colors.Define +"; border: gray; border-style: outset; border-radius: 10px;\"> name  <th style=\"background: " + colors.Define +"; border: gray; border-style: outset; border-radius: 10px;\">expr";
	return block + "</tr></table>";
}

function createDefineStructBlock(){
	var block ="<table style=\"background: " + colors.Define +"; border-style: outset; border-radius: 10px;\"><tr><th>define-struct";
	block+="<th style=\"background: " + colors.Define +"; border: gray; border-style: outset; border-radius: 10px;\"> name <th style=\"background: " + colors.Define +"; border: gray; border-style: outset; border-radius: 10px;\">properties";
	return block + "</tr></table>";
}

function createCondBlock(){
	var block =  "<table style=\"background: " + colors.Expressions +"; border-style: outset; border-radius: 10px;\"><tr><th>cond</tr>";
	block+="<tr><th><th style=\"background: " + colors.Define +"; border: gray; border-style: outset; border-radius: 10px;\">boolean <th style=\"background: " + colors.Define +"; border: gray; border-style: outset; border-radius: 10px;\">expr</tr>";
	block+="<tr><th><th style=\"background: " + colors.Define +"; border: gray; border-style: outset; border-radius: 10px;\">add</th></tr>"
	return block + "</table>";
}
function draw(){
	for(var i=0; i<functions.length; i++){
		document.write(createFunctionBlock(i))
	}
	document.write(createCondBlock())
	document.write(createDefineBlock())
	document.write(createDefineVarBlock())
	document.write(createDefineStructBlock())

}