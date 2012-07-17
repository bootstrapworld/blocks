'use strict';
(function(){
/**
* errorCheck : does some nice console logging if errors are found between the two items
* if arg1 and arg2 are arrays of the same length, checks the equality of each item
* prints error message if length is different, types don't match, or items are different
* if arg1 and arg2 are not arrays, checks equality of items and pritns message.
*/

var numTest = 1;
function errorCheck(arg1, arg2){
	if(arg1 instanceof Array && arg2 instanceof Array && arg1.length === arg2.length){
		var fails = [];
		var type = false;
		for(var i = 0; i < arg1.length; i++){
			if(arg1[i] !== arg2[i]){
				fails.push(i);
				if(arg1[i] == arg2[i]){
					type = true;
				}
			}
		}
		if(fails.length === 0){
			console.log("Test #" + numTest + ": passed")
		}else{
			if(type){
			console.log("Test #" + numTest + ": **FAILED** There was a type mismatch at one of the error points.")
			}else{
				console.log("Test #" + numTest + ": **FAILED**");
			}
			console.log("First argument had value:");
			console.log(arg1);
			console.log("Second argument had value:");
			console.log(arg2);
			console.log("Mismatchs found at indices:");
			console.log(fails);
			console.trace();
		}
	}else if (arg1 instanceof Array || arg2 instanceof Array){
		if(arg1 instanceof Array && arg2 instanceof Array){
			console.log("Test #" + numTest + ": **FAILED** Arrays of different length.");
		}else{
		console.log("Test #" + numTest + ": **FAILED** One argument was an array and the other was not.");
		}
		console.log("First argument had value:");
		console.log(arg1);
		console.log("Second argument had value:");
		console.log(arg2);
		console.trace();
	}else{
		if(arg1 === arg2){
			console.log("Test #" + numTest + ": passed");
		}else if(arg1 instanceof Object && arg2 instanceof Object){
			var obj = objectEqual(arg1, arg2);
			if(obj.val1.length ===0 && obj.val2.length ===0){
				console.log("Test #" + numTest + ": passed");
			}else{
				console.log("Test #" + numTest + ": **FAILED**");
				console.log("First argument had value:");
				console.log(arg1);
				console.log("Second argument had value:");
				console.log(arg2);
				console.log("First argument had unique properties:");
				console.log(obj.val1);
				console.log("Second argument had unique properties (or the same properties with different values):");
				console.log(obj.val2);
				console.trace();
			}
		}else if(arg1 == arg2) {console.log("Test #" + numTest + ": PASSED, but TYPE MISMATCH");
								console.log("First argument had value:");
								console.log(arg1);
								console.log("Second argument had value:");
								console.log(arg2);
								console.trace();
		}else{
			console.log("Test #" + numTest + ": **FAILED**");
			console.log("First argument had value:");
			console.log(arg1);
			console.log("Second argument had value:");
			console.log(arg2);

			console.trace();
		}
	}
		numTest++;
}
/**
*objectEqual : given two objects, determines if all their values are equal
* currently only single level objects
* ignores the "id" property
*
*/
function objectEqual(arg1, arg2){
	var vals1 =[];
	var vals2 =[];
	var item;
	for(item in arg1){
		if(item !== "id" && item !== "funcIDList"){
			vals1.push(item);
		}
	}
	for(item in arg2){
		if(item !== "id" && item !== "funcIDList"){
			vals2.push(item);
		}
	}
	for(var i = vals1.length-1; i >= 0; i--){
		for(var j = vals2.length-1; j >= 0; j--){
			if(vals1[i] === vals2[j]){
				if(arg1[vals1[i]] === arg2[vals2[j]]){
					vals1.splice(i,1);
					vals2.splice(j,1);
					break;
				}else if(arg1[vals1[i]] instanceof Object && arg2[vals2[j]] instanceof Object){
					var obj1 = objectEqual(arg1[vals1[i]], arg2[vals2[j]]);
					if(obj1.val1.length !== 0 || obj1.val2.length !== 0){
						vals1.push(obj1.val1);
						vals2.push(obj1.val2);
					}else{
						vals1.splice(i,1);
						vals2.splice(j,1);
					}
					break;
				}
			}
		}
	}
	var toReturn = {};
	toReturn.val1 = vals1;
	toReturn.val2 = vals2;
	return toReturn;
}


// Overriding the definition of ExprApp for test cases.  We
// define our ExprApp constructor to take in arguments.
var OldExprApp = ExprApp;
ExprApp = function(funcName, args){
	OldExprApp.call(this, funcName);
    this.args = (args != undefined) ? args : [];
};
ExprApp.prototype = OldExprApp;



//DATA USED FOR TESTING
var programTest = [];
var str1 = new ExprString();
str1.value = "test1";
var num1 = new ExprNumber();
num1.value = 1;
var bool1 = new ExprBoolean(true);
var func1 = new ExprApp("+", [num1, new ExprApp("string-length", [str1])]);
var def1 = new ExprDefineFunc();
def1.argumentNames = ["width", "height", "numPoints", "leprechauns", "color"];
def1.contract.funcName = "createCircleinAStarwithLeprechauns";
def1.contract.argumentTypes = ["Numbers", "Numbers", "Numbers", "Numbers", "Strings"];
def1.contract.outputType = "Images";
def1.expr = new ExprCond();
def1.expr.listOfBooleanAnswer[0].bool = new ExprApp(">", [new ExprConst("leprechauns"), new ExprConst("numPoints")]);
var str2 = new ExprString();
str2.value = "outline";
var str3 = new ExprString();
str3.value = "outline";
var str4 = new ExprString();
str4.value = "outline";
def1.expr.listOfBooleanAnswer[0].answer = new ExprApp("place-image", [new ExprApp("star", [new ExprConst("height"), str4, new ExprConst("color")]),
	new ExprConst("leprechauns"), new ExprConst("leprechauns"),
	new ExprApp("triangle", [new ExprConst("width"), str2, new ExprConst("color")])]);
def1.expr.listOfBooleanAnswer[1] = new ExprBoolAnswer();
def1.expr.listOfBooleanAnswer[0].outputType = "Images";
def1.expr.listOfBooleanAnswer[1].outputType = "Images";
def1.expr.listOfBooleanAnswer[1].bool = new ExprBoolean("true");
def1.expr.listOfBooleanAnswer[1].answer = new ExprApp("rectangle", [
	new ExprConst("width"), new ExprConst("height"), str3, new ExprConst("color")]);
var error1 = new ExprApp("place-image", []);
programTest.push(str1);
programTest.push(num1);
programTest.push(bool1);
programTest.push(def1);
programTest.push(func1);
programTest.push(str2);
console.log(programTest);
var text1 = "\"test1\"";
var text2 = "1";
var text3 = "true"
var text4 = "(+ 1 (string-length \"test1\"))"
var text5 = ";createCircleinAStarwithLeprechauns: Numbers Numbers Numbers Numbers Strings -> Images\n" +
			"(define (createCircleinAStarwithLeprechauns width height numPoints leprechauns color)\n" +
			"(cond\n[(> leprechauns numPoints) (place-image (star height \"outline\" color) leprechauns leprechauns "+
			"(triangle width \"outline\" color))]\n" +
			"[true (rectangle width height \"outline\" color)]))"
var x ={};
x.name = "x";
x.type = "Numbers";
constants.push(x)

var funcTest=[];
funcTest[0]={};
funcTest[0].name="+";
funcTest[0].input=[{type:"Numbers",name:"Exp1"},{type:"Numbers",name:"Exp2"}];
funcTest[0].output="Numbers";
funcTest[1]={};
funcTest[1].name="-";
funcTest[1].input=[{type:"Numbers",name:"Exp1"},{type:"Numbers",name:"Exp2"}];
funcTest[1].output="Numbers";

var typeTest = {};
typeTest.Booleans = ["true", "false"];
typeTest.Numbers = ["Number"];
typeTest.Strings = ["Text"];
typeTest.Define=["define-constant","define-function","define-struct"];
typeTest.Expressions=["cond"];
typeTest.Constants=[];
//TEST CASES!!!

//interpreter
errorCheck(interpreter(str1), text1);
errorCheck(interpreter(num1), text2);
errorCheck(interpreter(bool1), text3);
errorCheck(interpreter(func1), text4);
errorCheck(interpreter(def1), text5);

//searchForIndex
errorCheck(searchForIndex("1", programTest), num1);
errorCheck(searchForIndex("14", programTest), def1.expr);
errorCheck(searchForIndex("9", programTest), def1);
errorCheck(searchForIndex("300", programTest), undefined);
errorCheck(searchForIndex("45", programTest), def1.expr.listOfBooleanAnswer[1].bool);
errorCheck(searchForIndex("21", programTest), str3);
errorCheck(searchForIndex("12", programTest), undefined);
ID = 0;

//makeID & makeIDList
errorCheck(makeID(), "0");
errorCheck(makeID(), "1");
errorCheck(makeID(), "2");
errorCheck(makeIDList(1), ["3"]);
errorCheck(makeIDList(0), []);
errorCheck(makeIDList(5), ["4","5","6","7","8"]);
errorCheck(makeID(), "9");

//containsName
errorCheck(containsName(functions, "+"), 0);
errorCheck(containsName(functions, "magicbox"), -1);
errorCheck(containsName(functions, "place-image"), 28);
errorCheck(containsName(functions, "even?"), 13);

//unique
errorCheck(unique([]), true);
errorCheck(unique([{type:"Numbers",name:"Exp1"},{type:"Numbers",name:"Exp2"}]), true);
errorCheck(unique([{type:"Numbers",name:"Exp1"}]), true);
errorCheck(unique([{type:"Images",name:"Image"}, {type:"Numbers",name:"x"},{type:"Numbers",name:"y"},{type:"Images",name:"Background"}]), false);

//getOutput
errorCheck(getOutput("+"), "Numbers");
errorCheck(getOutput("place-image"), "Images");
errorCheck(getOutput("fun"), undefined);

//encode
errorCheck(encode("&"), "&amp;");
errorCheck(encode("\""), "&quot;");
errorCheck(encode("'"), "&#39;");
errorCheck(encode("<"), "&lt;");
errorCheck(encode(">"), "&gt;");
errorCheck(encode("123>great"), "123&gt;great");
errorCheck(encode("hello"), "hello");

//decode
errorCheck(decode("&amp;"), "&");
errorCheck(decode("&quot;"), "\"");
errorCheck(decode("&#39;"), "'");
errorCheck(decode("&lt;"), "<");
errorCheck(decode("&gt;"), ">");
errorCheck(decode("hello"), "hello");

//parseProgram
errorCheck(parseProgram(), "");
program.push(num1);
errorCheck(parseProgram(), "1\n");
program = programTest;
errorCheck(parseProgram(), text1 +"\n"+ text2 +"\n"+ text3 +"\n"+ text5
								+"\n"+ text4 +"\n" + "\"outline\"" +"\n");
program = [];

//makeCodeFromOptions
errorCheck(makeCodeFromOptions("define-function"), new ExprDefineFunc());
errorCheck(makeCodeFromOptions("define-constant"), new ExprDefineConst());
errorCheck(makeCodeFromOptions("cond"), new ExprCond([new ExprBoolAnswer()]));
errorCheck(makeCodeFromOptions("true"), new ExprBoolean("true"));
errorCheck(makeCodeFromOptions("false"), new ExprBoolean("false"));
errorCheck(makeCodeFromOptions("Text"), new ExprString());
errorCheck(makeCodeFromOptions("Number"), new ExprNumber());
errorCheck(makeCodeFromOptions("+"), new ExprApp("+"));
errorCheck(makeCodeFromOptions("place-image"), new ExprApp("place-image"));
errorCheck(makeCodeFromOptions("x"), new ExprConst("x"));
try{
makeCodeFromOptions("liessss");
}catch(err){
	if(err.message === "makeCodeFromOptions: internal error"){
		console.log("Test #" + numTest + ": passed, error correctly caught");
	}else{
		console.log("Test #" + numTest + ": **FAILED**, caught this error: ");
		console.log(err.message);
	}
}
//makeTypesArray
errorCheck(makeTypesArray([],[]), typeTest);
typeTest.Constants.push(0);
typeTest.Numbers.push(0);
typeTest.Numbers.push(1);
errorCheck(makeTypesArray(funcTest,constants), typeTest);
funcTest[2]={};
funcTest[2].name="place-image";
funcTest[2].input=[{type:"Images",name:"Image"}, {type:"Numbers",name:"x"},{type:"Numbers",name:"y"},{type:"Images",name:"Background"}];
funcTest[2].output="Images";
funcTest[3]={};
funcTest[3].name="string=?";
funcTest[3].input=[{type:"Strings",name:"String1"},{type:"Strings",name:"String2"}];
funcTest[3].output="Booleans";
typeTest.Images = [];
typeTest.Images.push(2);
typeTest.Strings.push(3);
typeTest.Booleans.push(3);
errorCheck(makeTypesArray(funcTest,constants), typeTest);


//setChildInProgram
ID = 0;
var def2 = new ExprDefineFunc();
var str6 = new ExprString();
var func2 = new ExprApp("string-length");
str6.value = "WOOOOOOO";
def2.contract.funcName = "square";
def2.argumentTypes = ["Numbers"];
program.push(def2);
var def3 = new ExprDefineFunc();
def3.contract.funcName = "square";
def3.argumentTypes = ["Numbers"];
var str7 = new ExprString();
var func3 = new ExprApp("string-length");
str7.value = "WOOOOOOO";
setChildInProgram(def2.id, def2.funcIDList[0], func2);
def3.expr = func3;
errorCheck(def2, def3);
setChildInProgram(def2.expr.id, def2.expr.funcIDList[0], str6);
def3.expr.args[0] = str7;
errorCheck(def2, def3);
def3.expr.args[0] = undefined;
setChildInProgram(def2.expr.id, str6.id);
errorCheck(def2, def3);
var cond1 = new ExprCond;
var bool2 = new ExprBoolean(false);
var cond2 = new ExprCond;
var bool3 = new ExprBoolean(false);
program.push(cond1);
setChildInProgram("12", "13", bool2);
cond2.listOfBooleanAnswer[0].bool = bool3;
errorCheck(cond1, cond2);
try{
setChildInProgram("70", "2");
}catch(err){
	if(err.message === "setChildInProgram failure: parentId not found"){
		console.log("Test #" + numTest + ": passed, error correctly caught");
	}else{
		console.log("Test #" + numTest + ": **FAILED**, caught this error: ");
		console.log(err.message);
	}
}
try{
setChildInProgram("16", "2");
}catch(err){
	if(err.message === "setChildInProgram failure: parent was a literal, and cannot be added to"){
		console.log("Test #" + numTest + ": passed, error correctly caught");
	}else{
		console.log("Test #" + numTest + ": **FAILED**, caught this error: ");
		console.log(err.message);
	}
}
try{
setChildInProgram("12", "42");
}catch(err){
	if(err.message === "setChildInProgram failure: childId not found"){
		console.log("Test #" + numTest + ": passed, error correctly caught");
	}else{
		console.log("Test #" + numTest + ": **FAILED**, caught this error: ");
		console.log(err.message);
	}
}
try{
setChildInProgram("12", "42", new ExprString);
}catch(err){
	if(err.message === "setChildInProgram failure: childId not found"){
		console.log("Test #" + numTest + ": passed, error correctly caught");
	}else{
		console.log("Test #" + numTest + ": **FAILED**, caught this error: ");
		console.log(err.message);
	}
}
try{
setChildInProgram(cond1.id, "12");
}catch(err){
	if(err.message === "setChildInProgram failure: parent was top level of cond, that doesn't work"){
		console.log("Test #" + numTest + ": passed, error correctly caught");
	}else{
		console.log("Test #" + numTest + ": **FAILED**, caught this error: ");
		console.log(err.message);
	}
}
}());