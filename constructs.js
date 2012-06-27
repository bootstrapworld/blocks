
"use strict";


/*====================================================================================
 ___       _          ___       __ _      _ _   _             
|   \ __ _| |_ __ _  |   \ ___ / _(_)_ _ (_) |_(_)___ _ _  ___
| |) / _` |  _/ _` | | |) / -_)  _| | ' \| |  _| / _ \ ' \(_-<
|___/\__,_|\__\__,_| |___/\___|_| |_|_||_|_|\__|_\___/_||_/__/
                                                               
=====================================================================================*/

/*
program is an array of makeDefineFucn/makeDefineVar/Expressions that make up the user's program
on the screen.
*/
var program = []

/*
Constucts the define function block given a contract, a list of arguments (a list of variables), 
and an expression which is an expression object

(define (add2 x) (+ x 2)) =>
makeDefineFunc(contract1, ["x"], makeApp("+", [makeVariable("x"), 2]))

contract1 = makeContract("add2", ["Numbers"], "Numbers")
*/
var makeDefineFunc = function(){
	this.contract = makeContract();
	this.argumentNames;
	this.expr;
	this.id = makeID();
}

var makeContract = function(){
	this.funcName;
	this.argumentTypes;
	this.outputType;
	this.id = makeID();
}

/*
Constucts the define variable block given a name (string), an expression which is an expression 
object, and an output type

(define x 3) =>
makeDefinevar("x", makeNum(3), "Numbers")

(define y (+ 2 x)) =>
makeDefineVar("y", (makeApp("+", [makeNum("2"), makeVar("x")))
*/
var makeDefineConst = function(){
	this.constName;
	this.expr;
	this.outputType; //MAKE SURE THIS WILL BE DEFINED!!!!
	this.id = makeID();
}

/*
Constructs the expression object
*/
function isExpression (obj){
	return (obj instanceof makeApp ||
	obj instanceof makeString ||
	obj instanceof makeNumber ||
	obj instanceof makeConst)
};

/*
Constructs an application of an operator given the name, arguments, and output type. The arguments 
is an array of expressions. Value is initially initialized to null.
*/
var makeApp = function(funcName, expr){
	this.funcName = funcName;
	this.expr = expr;
	this.outputType = getOutput(funcName);
	this.id = makeID();
}

/*
Constructs a string given the contents of the string (str).
*/
var makeString= function(){
	this.value;
	this.outputType = "Strings";
	this.id = makeID();
}

/*
Constructs a number given a number num.
*/
var makeNumber = function(){
	this.value;
	this.outputType = "Numbers";
	this.id = makeID();
}

/*
NOTE: Not sure if necessary
Constructs a variable object given a name of type string.
*/
var makeConst = function(constName){
	this.constName = constName;
	//this.outputType = getConstantType(constName);
	this.id = makeID();
}

/*
Constructs a boolean true or false (else == true)
*/
var makeBoolean = function(value){
	this.value=value;
	this.outputType = "Booleans";
	this.id = makeID();
}

/*
Constructs a tuple of boolean and answer to use in a cond expression
*/
var makeBoolAnswer=function(){
	this.bool;
	this.answer;
	this.outputType;
	this.id = makeID();
}


/*
Constructs a conditional statement given a list of tuples, formatted: (expr, expr)
The first expression has to be a boolean

(cond
	[(true) 2]
	[(false) 1]
) =>
makeCond(list1)
list1 = [makeBoolAnswer(makeBoolean(true),makeNum(2)).makeBoolAnswer(makeBoolean(False),makeNum(1))]
*/
var makeCond = function(){
	this.listOfBooleanAnswer=new makeBoolAnswer();
	this.outputType;
	this.id = makeID();
}



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
functions[18].name="and";
functions[18].input=new Array({type:"Booleans",name:"Boolean Exp1"},{type:"Booleans",name:"Boolean Exp2"});
functions[18].output="Booleans";
functions[19]={};
functions[19].name="or";
functions[19].input=new Array({type:"Booleans",name:"Boolean Exp1"},{type:"Booleans",name:"Boolean Exp2"});
functions[19].output="Booleans";
functions[20]={};
functions[20].name="not";
functions[20].input=new Array({type:"Booleans",name:"Boolean Exp1"});
functions[20].output="Booleans";
functions[21]={}
functions[21].name="rectangle";
functions[21].input=new Array({type:"Numbers",name:"Width"},{type:"Numbers",name:"Height"}, {type:"Strings", name:"Outline"}, {type:"Strings",name:"Color"});
functions[21].output="Images";
functions[22]={};
functions[22].name="circle";
functions[22].input=new Array({type:"Numbers",name:"Radius"}, {type:"Strings", name:"Outline"}, {type:"Strings",name:"Color"});
functions[22].output="Images";
functions[23]={};
functions[23].name="triangle";
functions[23].input=new Array({type:"Numbers",name:"Length"}, {type:"Strings", name:"Outline"}, {type:"Strings",name:"Color"});
functions[23].output="Images";
functions[24]={};
functions[24].name="ellipse";
functions[24].input=new Array({type:"Numbers",name:"A"},{type:"Numbers",name:"B"}, {type:"Strings", name:"Outline"}, {type:"Strings",name:"Color"});
functions[24].output="Images";
functions[25]={};
functions[25].name="star";
functions[25].input=new Array({type:"Numbers",name:"Side-Length"}, {type:"Strings", name:"Outline"}, {type:"Strings",name:"Color"});
functions[25].output="Images";
functions[26]={};
functions[26].name="scale";
functions[26].input=new Array({type:"Numbers",name:"Multiple"},{type:"Images",name:"Image"});
functions[26].output="Images";
functions[27]={};
functions[27].name="rotate";
functions[27].input=new Array({type:"Numbers",name:"Degrees"},{type:"Images",name:"Image"});
functions[27].output="Images";
functions[28]={};
functions[28].name="place-image";
functions[28].input=new Array({type:"Images",name:"Image"}, {type:"Numbers",name:"x"},{type:"Numbers",name:"y"},{type:"Images",name:"Background"});
functions[28].output="Images";

//constants is an array of user defined variables containing their name and type
var constants=[]

//restricted contains a list of key words in racket that we aren't allowing the user to redefine
var restricted=["lambda","define","list","if","else","cond","foldr","foldl","map","let","local"];

//Colors is an object containing kv pairs of type to color
var colors={};
 colors.Numbers="#33CCFF";
 colors.Strings="#FFA500";
 colors.Images="#66FF33";
 colors.Booleans="#CC33FF";
 colors.Define="#FFFFFF";
 colors.Expressions="#FFFFFF";
 colors.Constants="#FFFFFF";

/*====================================================================================
   ___ _     _          _  __   __        _      _    _        
  / __| |___| |__  __ _| | \ \ / /_ _ _ _(_)__ _| |__| |___ ___
 | (_ | / _ \ '_ \/ _` | |  \ V / _` | '_| / _` | '_ \ / -_|_-<
  \___|_\___/_.__/\__,_|_| _ \_/\__,_|_| |_\__,_|_.__/_\___/__/
 / _|___  | __|  _ _ _  __| |_(_)___ _ _  ___                  
 > _|_ _| | _| || | ' \/ _|  _| / _ \ ' \(_-<                  
 \_____|  |_| \_,_|_||_\__|\__|_\___/_||_/__/                  
                                                                
=====================================================================================*/
//These variables store what the height and width of the code div should be
var codeHeight;
var codeWidth;
var carrying=null;
var activated;
var focused=null;
var ID =0

$(document).ready(function(){
	//When the window is resized, the height of the width of the code div changes
	$(window).resize(onResize);
	onResize();
	makeDrawers(functions,constants);
	activated = $("#options #Numbers")
	activated.css("visibility", "visible");

    //During the course of the whole session, drawers can be opened and closed to reveal all of the buttons (functions) that they contain
    $(".bottomNav").live('click', function(e){
        drawerButton($(this));
    });


    
    //Prevents highlighting
    $("#List table").live('click',function(){
    	$(this).find($("input")).focus();
    	focused=$(this)
    });

	$(document.body).live('click',function(e){
		e.preventDefault();
	    if(focused !=null){
	    	var inputtext=focused.find($("input")).val()
	    	if(focused.find($("input")).attr("name")==="Number"){
	    		if(isNaN(Number(inputtext))){
	    			alert("Please only enter a number into this text field");
	    			return;
	    		} else{
	    			console.log(focused);
	    			var codeObject = getCodeObject(focused.attr("id"));
	    			codeObject.value = inputtext;
	    		}
	    	}
	    	focused.blur();
	    	//TODO saving values
	    }
    	focused=null;
	});

	$(document.body).live('mousedown',function(e){e.preventDefault();});

});

function getCodeObject(id){
	for(var i = 0; i < program.length ; i++){
		if (program[i].id === id){
			return program[i];
		}
	}
	throw new Error("Can't find code object");
}

function makeID(){
	return ID++;
}

//resizes code div when the window is resized
function onResize(){
	codeHeight = $(document).height() - $("#header").height() - $("#Drawer").height();
	codeWidth = $(document).width();
	$("#code").height(codeHeight);
	$("#code").width(codeWidth);
};

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

/*====================================================================================
  ___                            ___             _   _             
 |   \ _ _ __ ___ __ _____ _ _  | __|  _ _ _  __| |_(_)___ _ _  ___
 | |) | '_/ _` \ V  V / -_) '_| | _| || | ' \/ _|  _| / _ \ ' \(_-<
 |___/|_| \__,_|\_/\_/\___|_|   |_| \_,_|_||_\__|\__|_\___/_||_/__/
                       
=====================================================================================*/

//DrawerButton takes in an element and either activates (shows) or deactivates (hides) the current element to show the new one
function drawerButton(elt){
		activated.css("visibility","hidden");
		activated = $("#options #" + elt.attr('id'))
		activated.css("visibility", "visible");
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

	types.Define=new Array("define-constant","define-function","define-struct");
	types.Expressions=new Array("cond");
	types.Booleans.unshift("true","false");
	types.Numbers.unshift("Number");
	types.Strings.unshift("Text");

	return types
}

//unique takes as input an array and outputs if there is only one type in the whole array
// (arrayof input-tuple) -> boolean
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

//makeDrawers takes in all of the functions and all of the constants and will change the HTML so that each of the types is an openable drawer and when that drawer is opened
//all of the functions corresponding to that type are displayed
// INJECTION ATTACK FIXME
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
				if(typeDrawers[Type][i]==="true"){
					Drawers+="<span class=\"Booleans\" style=\"background: "+colors.Booleans+"\">true</span>\n"
				}
				else if(typeDrawers[Type][i]==="false"){
					Drawers+="<span class=\"Booleans\" style=\"background: "+colors.Booleans+"\">false</span>\n"
				}
				else if(typeDrawers[Type][i]==="Text"){
					Drawers+="<span class=\"Strings\" style=\"background: "+colors.Strings+"\">Text</span>\n"
				}
				else if(typeDrawers[Type][i]==="Number"){
					Drawers+="<span class=\"Numbers\" style=\"background: "+colors.Numbers+"\">Number</span>\n"
				}
				else{
				Drawers+="<span class="+allFunctions[typeDrawers[Type][i]].output+" style=\"background: "+colors[allFunctions[typeDrawers[Type][i]].output]+"\">"+allFunctions[typeDrawers[Type][i]].name+"</span>\n"
			}
			}
		}

		Drawers+="</div>\n"
		Selector+="<div class=\""+Type+" bottomNav\" id=\""+Type+"\" style=\"background: "+colors[Type]+"\">"+Type+"</div>\n"
	}

	Drawers+="</div>"
	Selector+="</div>"
	document.getElementById("Drawer").innerHTML=Drawers+"\n"+Selector
}


/*====================================================================================
  ___                                ___             _         _           
 | _ \_ _ ___  __ _ _ _ __ _ _ __   | _ \___ _ _  __| |___ _ _(_)_ _  __ _ 
 |  _/ '_/ _ \/ _` | '_/ _` | '  \  |   / -_) ' \/ _` / -_) '_| | ' \/ _` |
 |_| |_| \___/\__, |_| \__,_|_|_|_| |_|_\___|_||_\__,_\___|_| |_|_||_\__, |
              |___/                                                  |___/ 
=====================================================================================*/


    //changes the program array when a draggable element is clicked
	$("#options span").live('click',function(){
		program[program.length] = makeCodeFromOptions($(this).text());
		renderBlocktoProgram(createBlock(program[program.length-1]));
	});

function renderBlocktoProgram(block){
		document.getElementById("List").appendChild(block);
}

function getOutput(funcname){
	var index=containsName(functions,funcname);
	if(index!=-1){
		return functions[index].output;
	}
}

function makeCodeFromOptions(optionsText){
	if(optionsText === "define-function"){
	 		return new makeDefineFunc();
	 	} else if (optionsText === "define-constant"){
	 		return new makeDefineConst();
	 	} else if (optionsText === "cond"){
	 		return new makeCond([makeBoolAnswer()]);
	 	} 
	 	else if(optionsText==="true" || optionsText==="false"){
	 		return new makeBoolean(optionsText)
	 	}
	 	else if(optionsText==="Text"){
	 		return new makeString()
	 	}
	 	else if(optionsText==="Number"){
	 		return new makeNumber()
	 	}
	 	else if(optionsText==="define-struct"){
	 		//todo
	 		return;
	 	}
	 	else{
		 	for(var i = 0; i < functions.length; i++){
		 		if (functions[i].name === optionsText){
		 			return new makeApp(optionsText, new Array(functions[i].input.length));
		 		}
		 	}
		 	for(var i=0;i<constants.length;i++){
		 		if (constants[i].name === optionsText){
		 			return new makeConst(optionsText);
		 		}
		 	}
		 	throw new Error("createBlock: internal error");
		}
	}




//createFunctionBlock takes as input a functionIndex and will output an HTML element corresponding to that function with name, color, and spaces for input blocks
 // createFunctionBlock: number -> string
 function createFunctionBlock(functionIndex){
 	var func = functions[functionIndex];
 	var block = "<table style=\"background: " + colors[func.output] +";\">"
 	block += "<tr><th>" + func.name
 	for(var i = 0; i < func.input.length; i++){
 		block += "<th class=\"expr\" style=\"background: " + colors[func.input[i].type] +";\">" + func.input[i].name
 	}
 	return block + "</tr></table>"
 }

//block takes in a string and outputs the corresponding block to that function

// createBlock: string -> element
function createBlock(codeObject){
 	if(codeObject instanceof makeDefineFunc){
 		return stringToElement(createDefineBlock());
 	} else if (codeObject instanceof makeDefineConst){
 		return stringToElement(createDefineVarBlock());
 	}/* else if (codeObject instanceof makeDefineStruct){
 		return stringToElement(createDefineStructBlock());
 	}*/ else if (codeObject instanceof makeCond){
 		return stringToElement(createCondBlock());
 	} else if (codeObject instanceof makeConst){
 		for(var i = 0; i < constants.length; i++){
	 		if (constants[i].name === codeObject.constName){
	 			return stringToElement(createConstantBlock(constants[i]));
	 		}
	 	}
	 	throw new Error("createBlock: internal error");
 	} else if (codeObject instanceof makeApp){
	 	for(var i = 0; i < functions.length; i++){
	 		if (functions[i].name === codeObject.funcName){
	 			return stringToElement(createFunctionBlock(i));
	 		}
	 	}
	 	throw new Error("createBlock: internal error");
 	} else if (codeObject instanceof makeNumber){
 		return stringToElement(createNumBlock(codeObject));
 	} else if (codeObject instanceof makeString){
 		return stringToElement(createStringBlock());
 	} else if (codeObject instanceof makeBoolean){
 		return stringToElement(createBooleanBlock(codeObject.value));
 	}
 	
 }

//createDefineBlock outputs the block corresponding to defining a function
function createDefineBlock(){
	var block ="<table style=\"background: " + colors.Define +";\"><tr><th>define";
	block+="<th style=\"background: " + colors.Define +"; \"> <input type=\"Name\" id=\"Name\" name=\"Name\"/><th  class=\"expr\" style=\"background: " + colors.Define +";\">args <th  class=\"expr\" style=\"background: " + colors.Define +";\">expr";
	return block + "</tr></table>";
}

//createDefineVarBlock outputs the block corresponding to creating a variable
function createDefineVarBlock(){
	var block = "<table style=\"background: " +colors.Define +"; b\"><tr><th>define";
	block+="<th style=\"background: " + colors.Define +";\"> <input type=\"Name\" id=\"Name\" name=\"Name\"/> <th  class=\"expr\" style=\"background: " + colors.Define +";\">expr";
	return block + "</tr></table>";
}

//createDefineStructBlock outputs the block corresponding to creating a structure
function createDefineStructBlock(){
	var block ="<table style=\"background: " + colors.Define +"; \"><tr><th>define-struct";
	block+="<th style=\"background: " + colors.Define +"; \"><input type=\"Name\" id=\"Name\" name=\"Name\"/><th class=\"expr\"  style=\"background: " + colors.Define +"; \">properties";
	return block + "</tr></table>";
}

//createCondBlock outputs the block corresponding to creating a conditional
function createCondBlock(){
	var block =  "<table style=\"background: " + colors.Expressions +";\"><tr><th>cond</tr>";
	block+="<tr><th><th  class=\"expr\" style=\"background: " + colors.Booleans +"\">boolean <th class=\"expr\"  style=\"background: " + colors.Expressions +"\">expr</tr>";
	block+="<tr><th><th  class=\"expr\" style=\"background: " + colors.Expressions +"\">add</th></tr>"
	return block + "</table>";
}

function createConstantBlock(constantelement){
	var block =  "<table style=\"background: " + colors[constantelement.type] +";\"><tr><th>"+constantelement.name+"</tr>";
	return block + "</table>";
}

function createBooleanBlock(value){
	var block =  "<table style=\"background: " + colors.Booleans +";\"><tr><th>"+value+"</tr>";
	return block + "</table>";
}
function createNumBlock(codeObject){
	var block =  "<table style=\"background: " + colors.Numbers +";\"" + "id=\""+codeObject.id+"\"><tr><th><input type=\"Name\" id=\"Name\" name=\"Number\"/></tr>";
	return block + "</table>";
}
function createStringBlock(){
	var block =  "<table style=\"background: " + colors.Strings +";\"><tr><th>\"<input type=\"Name\" id=\"Name\" name=\"String\"/>\"</tr>";
	return block + "</table>";
}

function stringToElement(string){
	var wrapper= document.createElement('div');
	wrapper.innerHTML="<li>"+string+"</li>";
	return wrapper.firstChild;
}