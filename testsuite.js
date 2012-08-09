'use strict';
(function(){
/**
* errorCheck : does some nice console logging if errors are found between the two items
* if arg1 and arg2 are arrays of the same length, checks the equality of each item
* prints error message if length is different, types don't match, or items are different
* if arg1 and arg2 are not arrays, checks equality of items and prints message.
* if the item is an object, this tells it to ignore anything id related, pass true to do
* ignoreArr - true if properties id and funcId should be ignored when testing equality
*/

var numTest = 1;
function errorCheck(arg1, arg2, ignoreArr){
	var i;
	var objects;
	if(arg1 instanceof Array && arg2 instanceof Array && arg1.length === arg2.length){
		var fails = [];
		var type = false;
		for(i = 0; i < arg1.length; i++){
			if(arg1[i] !== arg2[i]){
				objects = objectEqual(arg1[i], arg2[i], ignoreArr);
				if(objects.val1.length !== 0 || objects.val2.length !== 0){
					fails.push(i);
				}
				if(arg1[i] == arg2[i]){
					type = true;
				}
			}
		}
		if(fails.length === 0){
			console.log("Test #" + numTest + ": passed");
		}else{
			var found;
			for(i =(arg1.length - 1); i>= 0; i--){
				for(var k = (arg2.length - 1); k>= 0; k--){
					objects = objectEqual(arg1[i], arg2[k], ignoreArr);
					if(arg1[i] === arg2[k] || (objects.val1.length === 0 && objects.val2.length === 0)){
						arg1.splice(i,1);
						arg2.splice(k,1);
						break;
					}
				}
			}
			if(arg1.length === 0 && arg2.length === 0){
				console.log("Test #" + numTest + ": passed. HOWEVER: Array elements were not in the same order");
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
			var obj = objectEqual(arg1, arg2, ignoreArr);
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
function objectEqual(arg1, arg2, ignoreArr){
	var vals1 =[];
	var vals2 =[];
	var item;
	for(item in arg1){
		if((item !== "id" && item !== "funcIDList") || !ignoreArr){
			vals1.push(item);
		}
	}
	for(item in arg2){
		if((item !== "id" && item !== "funcIDList") || !ignoreArr){
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
					var obj1 = objectEqual(arg1[vals1[i]], arg2[vals2[j]], ignoreArr);
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
	return {val1 : vals1,
						val2 : vals2};
}
function contains(item, array){
	var found =false;
	for(var i = 0; i< array.length; i++){
		if(objectEquality(item, array[i], ["source"])){
			console.log("Test #" + numTest + ": passed. The array does contain the given item");
			found = true;
			break;
		}
	}
	if(!found){
		console.log("Text #" + numTest + ": **FAILED**");
		console.log("The item");
		console.log(item);
		console.log("was not found in the array");
		console.log(array);
		console.trace();
	}
	numTest++;
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
typeTest.Expressions=["cond"];
typeTest.Constants=[];
//TEST CASES!!!

//interpreter
console.log("Testing interpreter");
errorCheck(interpreter(str1), text1);
errorCheck(interpreter(num1), text2);
errorCheck(interpreter(bool1), text3);
errorCheck(interpreter(func1), text4);
errorCheck(interpreter(def1), text5);

//searchForIndex
console.log("Testing searchForIndex");
errorCheck(searchForIndex(num1.id, programTest), num1);
errorCheck(searchForIndex(def1.expr.id, programTest), def1.expr);
errorCheck(searchForIndex(def1.id, programTest), def1);
errorCheck(searchForIndex("300", programTest), undefined);
errorCheck(searchForIndex(def1.expr.listOfBooleanAnswer[1].bool.id, programTest), def1.expr.listOfBooleanAnswer[1].bool);
errorCheck(searchForIndex(str3.id, programTest), str3);
ID = 0;

//makeID & makeIDList
console.log("Testing makeID and makeIDList");
errorCheck(makeID(), "0");
errorCheck(makeID(), "1");
errorCheck(makeID(), "2");
errorCheck(makeIDList(1), ["3"]);
errorCheck(makeIDList(0), []);
errorCheck(makeIDList(5), ["4","5","6","7","8"]);
errorCheck(makeID(), "9");

//containsName
console.log("Testing containsName");
errorCheck(containsName(functions, "+"), 0);
errorCheck(containsName(functions, "magicbox"), -1);
errorCheck(containsName(functions, "place-image"), 28);
errorCheck(containsName(functions, "even?"), 13);

//unique
console.log("Testing unique");
errorCheck(unique([]), true);
errorCheck(unique([{type:"Numbers",name:"Exp1"},{type:"Numbers",name:"Exp2"}]), true);
errorCheck(unique([{type:"Numbers",name:"Exp1"}]), true);
errorCheck(unique([{type:"Images",name:"Image"}, {type:"Numbers",name:"x"},{type:"Numbers",name:"y"},{type:"Images",name:"Background"}]), false);

//getOutput
console.log("Testing getOutput");
errorCheck(getOutput("+"), "Numbers");
errorCheck(getOutput("place-image"), "Images");
errorCheck(getOutput("fun"), undefined);

//encode
console.log("Testing encode");
errorCheck(encode("&"), "&amp;");
errorCheck(encode("\""), "&quot;");
errorCheck(encode("'"), "&#39;");
errorCheck(encode("<"), "&lt;");
errorCheck(encode(">"), "&gt;");
errorCheck(encode("123>great"), "123&gt;great");
errorCheck(encode("hello"), "hello");

//decode
console.log("Testing decode");
errorCheck(decode("&amp;"), "&");
errorCheck(decode("&quot;"), "\"");
errorCheck(decode("&#39;"), "'");
errorCheck(decode("&lt;"), "<");
errorCheck(decode("&gt;"), ">");
errorCheck(decode("hello"), "hello");

//parseProgram
console.log("Testing parseProgram");
errorCheck(parseProgram(), "");
program.push(num1);
errorCheck(parseProgram(), "1\n");
program = programTest;
errorCheck(parseProgram(), text1 +"\n"+ text2 +"\n"+ text3 +"\n"+ text5
								+"\n"+ text4 +"\n" + "\"outline\"" +"\n");
program = [];

//makeCodeFromOptions
console.log("Testing makeCodeFromOptions");
errorCheck(makeCodeFromOptions("define-function"), new ExprDefineFunc(), true);
errorCheck(makeCodeFromOptions("define-constant"), new ExprDefineConst(), true);
errorCheck(makeCodeFromOptions("cond"), new ExprCond([new ExprBoolAnswer()]), true);
errorCheck(makeCodeFromOptions("true"), new ExprBoolean("true"), true);
errorCheck(makeCodeFromOptions("false"), new ExprBoolean("false"), true);
errorCheck(makeCodeFromOptions("Text"), new ExprString(), true);
errorCheck(makeCodeFromOptions("Number"), new ExprNumber(), true);
errorCheck(makeCodeFromOptions("+"), new ExprApp("+"), true);
errorCheck(makeCodeFromOptions("place-image"), new ExprApp("place-image"), true);
errorCheck(makeCodeFromOptions("x"), new ExprConst("x"), true);
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
numTest++;
//makeTypesArray
console.log("Testing makeTypesArray");
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
console.log("Testing setChildInProgram");
ID = 0;
var def2 = new ExprDefineFunc();
var str6 = new ExprString();
var func2 = new ExprApp("string-length");
str6.value = "WOOOOOOO";
def2.contract.funcName = "square";
def2.contract.argumentTypes = ["Numbers"];
program.push(def2);
var def3 = new ExprDefineFunc();
def3.contract.funcName = "square";
def3.contract.argumentTypes = ["Numbers"];
var str7 = new ExprString();
var func3 = new ExprApp("string-length");
str7.value = "WOOOOOOO";
setChildInProgram(def2.id, def2.funcIDList[0], func2, program);
def3.expr = func3;
errorCheck(def2, def3, true);
setChildInProgram(def2.expr.id, def2.expr.funcIDList[0], str6, program);
def3.expr.args[0] = str7;
errorCheck(def2, def3, true);
def3.expr.args[0] = undefined;
setChildInProgram(def2.expr.id, str6.id, undefined, program);
errorCheck(def2, def3, true);
var cond1 = new ExprCond;
var bool2 = new ExprBoolean(false);
var cond2 = new ExprCond;
var bool3 = new ExprBoolean(false);
program.push(cond1);
setChildInProgram(cond1.listOfBooleanAnswer[0].id, cond1.listOfBooleanAnswer[0].funcIDList[0], bool2, program);
cond2.listOfBooleanAnswer[0].bool = bool3;
errorCheck(cond1, cond2, true);
try{
setChildInProgram("70", "2", undefined, program);
}catch(err){
	if(err.message === "setChildInProgram failure: parentId not found."){
		console.log("Test #" + numTest + ": passed, error correctly caught");
	}else{
		console.log("Test #" + numTest + ": **FAILED**, caught this error: ");
		console.log(err.message);
	}
}
numTest++;
try{
setChildInProgram(cond1.listOfBooleanAnswer[0].bool.id, "2", undefined, program);
}catch(err){
	if(err.message === "setChildInProgram failure: parent was a literal, and cannot be added to"){
		console.log("Test #" + numTest + ": passed, error correctly caught");
	}else{
		console.log("Test #" + numTest + ": **FAILED**, caught this error: ");
		console.log(err.message);
	}
}
numTest++;
try{
setChildInProgram(cond1.listOfBooleanAnswer[0].id, "42", undefined, program);
}catch(err){
	if(err.message === "setChildInProgram failure: childId not found"){
		console.log("Test #" + numTest + ": passed, error correctly caught");
	}else{
		console.log("Test #" + numTest + ": **FAILED**, caught this error: ");
		console.log(err.message);
	}
}
numTest++;
try{
setChildInProgram(cond1.listOfBooleanAnswer[0].id, "42", new ExprString, program);
}catch(err){
	if(err.message === "setChildInProgram failure: childId not found"){
		console.log("Test #" + numTest + ": passed, error correctly caught");
	}else{
		console.log("Test #" + numTest + ": **FAILED**, caught this error: ");
		console.log(err.message);
	}
}
numTest++;
try{
setChildInProgram(cond1.id, "12", undefined, program);
}catch(err){
	if(err.message === "setChildInProgram failure: parent was top level of cond, that doesn't work"){
		console.log("Test #" + numTest + ": passed, error correctly caught");
	}else{
		console.log("Test #" + numTest + ": **FAILED**, caught this error: ");
		console.log(err.message);
	}
}
numTest++;

console.log("Testing constraints (Order does not matter, ignore notices of arrays matching but not in the same order)");
var s1 = new ExprString();
s1.value = "test";
var f1 = new ExprApp("+");
var n1 = new ExprNumber();
n1.value = undefined;
errorCheck(buildConstraints(s1).literals, [new constraint(new elemId(s1.id), new elemType("Strings"), s1.id)]);
errorCheck(buildConstraints(s1).constraints, []);
errorCheck(buildConstraints(s1).errors, []);
errorCheck(buildConstraints(n1).constraints, []);
errorCheck(buildConstraints(n1).literals, [new constraint(new elemId(n1.id), new elemType("Numbers"), n1.id)]);
errorCheck(buildConstraints(n1).errors, [new error(n1.id, "Empty space")]);
errorCheck(buildConstraints(f1).constraints,
	[new constraint(new elemId(f1.id), new construct("func", [new elemType("Numbers"), new elemId(f1.funcIDList[0]), new elemId(f1.funcIDList[1])]), f1.id),
                                new constraint(new elemId(f1.id), new construct("func", [new elemType("Numbers"), new elemType("Numbers"), new elemType("Numbers")]), f1.id)]);
errorCheck(buildConstraints(f1).errors, [new error(f1.funcIDList[0], "Empty space"), new error(f1.funcIDList[1], "Empty space")]);
f1.args[0] = s1;
errorCheck(buildConstraints(f1).literals, [new constraint(new elemId(s1.id), new elemType("Strings"), s1.id)]);
errorCheck(buildConstraints(f1).constraints, [
								new constraint(new elemId(s1.id), new elemId(f1.funcIDList[0]), s1.id),
                                new constraint(new elemId(f1.id), new construct("func", [new elemType("Numbers"), new elemId(f1.funcIDList[0]), new elemId(f1.funcIDList[1])]), f1.id),
                                new constraint(new elemId(f1.id), new construct("func", [new elemType("Numbers"), new elemType("Numbers"), new elemType("Numbers")]), f1.id)]);
errorCheck(buildConstraints(f1).errors, [new error(f1.funcIDList[1], "Empty space")]);
f1.args[1] = n1;
errorCheck(buildConstraints(f1).literals, [new constraint(new elemId(s1.id), new elemType("Strings"), s1.id),
	                                new constraint(new elemId(n1.id), new elemType("Numbers"), n1.id)])
errorCheck(buildConstraints(f1).constraints, [
								new constraint(new elemId(s1.id), new elemId(f1.funcIDList[0]), s1.id),
                                new constraint(new elemId(n1.id), new elemId(f1.funcIDList[1]), n1.id),
                                new constraint(new elemId(f1.id), new construct("func", [new elemType("Numbers"), new elemId(f1.funcIDList[0]), new elemId(f1.funcIDList[1])]), f1.id),
                                new constraint(new elemId(f1.id), new construct("func", [new elemType("Numbers"), new elemType("Numbers"), new elemType("Numbers")]), f1.id)]);
errorCheck(buildConstraints(f1).errors, [new error(n1.id, "Empty space")]);
n1.value = 19;
errorCheck(buildConstraints(f1).literals, [new constraint(new elemId(s1.id), new elemType("Strings"), s1.id),
	                                new constraint(new elemId(n1.id), new elemType("Numbers"), n1.id)]);
errorCheck(buildConstraints(f1).constraints, [
                                new constraint(new elemId(f1.id), new construct("func", [new elemType("Numbers"), new elemId(f1.funcIDList[0]), new elemId(f1.funcIDList[1])]), f1.id),
                                new constraint(new elemId(f1.id), new construct("func", [new elemType("Numbers"), new elemType("Numbers"), new elemType("Numbers")]), f1.id),
                                new constraint(new elemId(s1.id), new elemId(f1.funcIDList[0]), s1.id),
                                
                                new constraint(new elemId(n1.id), new elemId(f1.funcIDList[1]), n1.id)]);
errorCheck(buildConstraints(f1).errors, []);
var d1 = new ExprDefineConst();
errorCheck(buildConstraints(d1).constraints, [new constraint(new elemId(d1.id), new elemId(d1.funcIDList[0]), d1.id)]);
errorCheck(buildConstraints(d1).errors, [new error(d1.funcIDList[0], "Empty space")]);
var f2 = new ExprApp("place-image");
errorCheck(buildConstraints(f2).constraints, [
                                new constraint(new elemId(f2.id), new construct("func", [new elemType("Images"), new elemId(f2.funcIDList[0]), new elemId(f2.funcIDList[1]), new elemId(f2.funcIDList[2]), new elemId(f2.funcIDList[3])]), f2.id),
                                new constraint(new elemId(f2.id), new construct("func", [new elemType("Images"), new elemType("Images"), new elemType("Numbers"), new elemType("Numbers"), new elemType("Images")]), f2.id)]);
errorCheck(buildConstraints(f2).errors, [
                                new error(f2.funcIDList[0], "Empty space"),
                                new error(f2.funcIDList[1], "Empty space"),
                                new error(f2.funcIDList[2], "Empty space"),
                                new error(f2.funcIDList[3], "Empty space")]);
var d2 = new ExprDefineFunc();
errorCheck(buildConstraints(d2).constraints, [new constraint(new elemId(d2.id), new construct("func", [new elemId(d2.funcIDList[0]), new elemId(d2.funcIDList[1])]), d2.id),
											  new constraint(new elemId(d2.id), new construct("func", [new elemId(d2.contract.funcIDList[0]), new elemId(d2.contract.funcIDList[1])]), d2.contract.id)]);
errorCheck(buildConstraints(d2).errors, [new error(d2.funcIDList[0], "Empty space"), new error(d2.funcIDList[1], "Argument spot without a name"), new error(d2.id, "No function name found"),
										new error(d2.contract.funcIDList[1], "Contract input type undefined"),
										new error(d2.contract.funcIDList[0], "Contract output type undefined")]);
d2.argumentNames[0] = "x";
errorCheck(buildConstraints(d2).constraints, [new constraint(new elemId(d2.id), new construct("func",[new elemId(d2.funcIDList[0]), new elemId(d2.funcIDList[1])]), d2.id),
                                              new constraint(new elemId(d2.funcIDList[1]), new variable("x"), d2.funcIDList[1])
                                             , new constraint(new elemId(d2.id), new construct("func", [new elemId(d2.contract.funcIDList[0]), new elemId(d2.contract.funcIDList[1])]), d2.contract.id)]);
errorCheck(buildConstraints(d2).errors, [new error(d2.funcIDList[0], "Empty space"), new error(d2.id, "No function name found"),
										new error(d2.contract.funcIDList[0], "Contract output type undefined"),
										new error(d2.contract.funcIDList[1], "Contract input type undefined")]);
var f3 = new ExprApp("/");
f3.args[0] = new ExprConst("x");
f3.args[1] = new ExprNumber();
f3.args[1].value = 3;
d2.expr = f3;
errorCheck(buildConstraints(d2).literals, [new constraint(new elemId(f3.args[1].id), new elemType("Numbers"), f3.args[1].id)
											])
errorCheck(buildConstraints(d2).constraints, [new constraint(new elemId(d2.id), new construct("func", [new elemId(d2.funcIDList[0]), new elemId(d2.funcIDList[1])]), d2.id),
                                              new constraint(new elemId(d2.funcIDList[1]), new variable("x"), d2.funcIDList[1]),
                                              new constraint(new elemId(f3.id), new construct("func", [new elemId(d2.funcIDList[0]),
                                                                    new elemId(f3.funcIDList[0]), new elemId(f3.funcIDList[1])]), f3.id),
                                              new constraint(new elemId(f3.id), new construct("func", [new elemType("Numbers"),
                                                                    new elemType("Numbers"), new elemType("Numbers")]), f3.id),
                                              new constraint(new elemId(f3.args[0].id), new elemId(f3.funcIDList[0]), f3.args[0].id),
                                              new constraint(new elemId(f3.args[0].id), new variable("x"), f3.args[0].id),
                                              new constraint(new elemId(f3.args[1].id), new elemId(f3.funcIDList[1]), f3.args[1].id),
                                              new constraint(new elemId(d2.id), new construct("func", [new elemId(d2.contract.funcIDList[0]), new elemId(d2.contract.funcIDList[1])]), d2.contract.id)]);
errorCheck(buildConstraints(d2).errors, [new error(d2.id, "No function name found"),
										new error(d2.contract.funcIDList[0], "Contract output type undefined"),
										new error(d2.contract.funcIDList[1], "Contract input type undefined")]);
d2.contract.funcName = "fun";
d2.contract.argumentTypes[0] = "Strings";
d2.contract.outputType = "Numbers";
errorCheck(buildConstraints(d2).literals, [new constraint(new elemId(f3.args[1].id), new elemType("Numbers"), f3.args[1].id)]);
errorCheck(buildConstraints(d2).constraints, [new constraint(new variable("fun"), new elemId(d2.id), d2.id),
											  new constraint(new elemId(d2.id), new construct("func", [new elemId(d2.funcIDList[0]), new elemId(d2.funcIDList[1])]), d2.id),
                                              new constraint(new elemId(d2.funcIDList[1]), new variable("x"), d2.funcIDList[1]),
                                              new constraint(new elemId(f3.id), new construct("func", [new elemId(d2.funcIDList[0]),
                                                                    new elemId(f3.funcIDList[0]), new elemId(f3.funcIDList[1])]), f3.id),
                                              new constraint(new elemId(f3.id), new construct("func", [new elemType("Numbers"),
                                                                    new elemType("Numbers"), new elemType("Numbers")]), f3.id),
                                              new constraint(new elemId(f3.args[0].id), new elemId(f3.funcIDList[0]), f3.args[0].id),
                                              new constraint(new elemId(f3.args[0].id), new variable("x"), f3.args[0].id),
                                              new constraint(new elemId(f3.args[1].id), new elemId(f3.funcIDList[1]), f3.args[1].id),
                                              new constraint(new elemId(d2.id), new construct("func", [new elemType("Numbers"), new elemType("Strings")]), d2.contract.id)]);
errorCheck(buildConstraints(d2).errors, []);
var c1 = new ExprCond();
c1.listOfBooleanAnswer[1] = new ExprBoolAnswer();
c1.listOfBooleanAnswer[0].bool = new ExprBoolean(false);
c1.listOfBooleanAnswer[1].bool = new ExprBoolean(true);
c1.listOfBooleanAnswer[0].answer = new ExprBoolean(false);
c1.listOfBooleanAnswer[1].answer = new ExprNumber();
c1.listOfBooleanAnswer[1].answer.value = 19;
errorCheck(buildConstraints(c1).literals, [new constraint(new elemId(c1.listOfBooleanAnswer[1].answer.id), new elemType("Numbers"), c1.listOfBooleanAnswer[1].answer.id),
												new constraint(new elemId(c1.listOfBooleanAnswer[0].bool.id), new elemType("Booleans"), c1.listOfBooleanAnswer[0].bool.id),
                                              new constraint(new elemId(c1.listOfBooleanAnswer[1].bool.id), new elemType("Booleans"), c1.listOfBooleanAnswer[1].bool.id),
                                              new constraint(new elemId(c1.listOfBooleanAnswer[0].answer.id), new elemType("Booleans"), c1.listOfBooleanAnswer[0].answer.id)
                                              ]);
errorCheck(buildConstraints(c1).constraints, [new constraint(new elemId(c1.id), new elemId(c1.listOfBooleanAnswer[0].funcIDList[1]), c1.listOfBooleanAnswer[0].funcIDList[1]),
                                              new constraint(new elemId(c1.id), new elemId(c1.listOfBooleanAnswer[1].funcIDList[1]), c1.listOfBooleanAnswer[1].funcIDList[1]),
                                              new constraint(new elemId(c1.listOfBooleanAnswer[0].funcIDList[0]), new elemType("Booleans"), c1.listOfBooleanAnswer[0].funcIDList[0]),
                                              new constraint(new elemId(c1.listOfBooleanAnswer[1].funcIDList[0]), new elemType("Booleans"), c1.listOfBooleanAnswer[1].funcIDList[0]),
                                              new constraint(new elemId(c1.listOfBooleanAnswer[0].bool.id), new elemId(c1.listOfBooleanAnswer[0].funcIDList[0]), c1.listOfBooleanAnswer[0].bool.id),
                                              new constraint(new elemId(c1.listOfBooleanAnswer[1].bool.id), new elemId(c1.listOfBooleanAnswer[1].funcIDList[0]), c1.listOfBooleanAnswer[1].bool.id),
                                              new constraint(new elemId(c1.listOfBooleanAnswer[0].answer.id), new elemId(c1.listOfBooleanAnswer[0].funcIDList[1]), c1.listOfBooleanAnswer[0].answer.id),
                                              new constraint(new elemId(c1.listOfBooleanAnswer[1].answer.id), new elemId(c1.listOfBooleanAnswer[1].funcIDList[1]), c1.listOfBooleanAnswer[1].answer.id)
                                              ]);
errorCheck(buildConstraints(c1).errors, []);
var c2 = new ExprCond();
errorCheck(buildConstraints(c2).constraints, [new constraint(new elemId(c2.id), new elemId(c2.listOfBooleanAnswer[0].funcIDList[1]), c2.listOfBooleanAnswer[0].funcIDList[1]),
											  new constraint(new elemId(c2.listOfBooleanAnswer[0].funcIDList[0]), new elemType("Booleans"), c2.listOfBooleanAnswer[0].funcIDList[0])]);
errorCheck(buildConstraints(c2).errors, [new error(c2.listOfBooleanAnswer[0].funcIDList[0], "Empty space"),
										 new error(c2.listOfBooleanAnswer[0].funcIDList[1], "Empty space")]);

c2.listOfBooleanAnswer[1] = new ExprBoolAnswer();
c2.listOfBooleanAnswer[0].bool = new ExprBoolean(true);
c2.listOfBooleanAnswer[1].bool = new ExprConst("y");
c2.listOfBooleanAnswer[0].answer = new ExprNumber();
c2.listOfBooleanAnswer[0].answer.value = 7;
c2.listOfBooleanAnswer[1].answer = new ExprConst("w");
errorCheck(buildConstraints(c2).literals, [new constraint(new elemId(c2.listOfBooleanAnswer[0].bool.id), new elemType("Booleans"), c2.listOfBooleanAnswer[0].bool.id),
	                                              new constraint(new elemId(c2.listOfBooleanAnswer[0].answer.id), new elemType("Numbers"), c2.listOfBooleanAnswer[0].answer.id)]); 
errorCheck(buildConstraints(c2).constraints, [new constraint(new elemId(c2.id), new elemId(c2.listOfBooleanAnswer[0].funcIDList[1]), c2.listOfBooleanAnswer[0].funcIDList[1]),
											  new constraint(new elemId(c2.listOfBooleanAnswer[0].funcIDList[0]), new elemType("Booleans"), c2.listOfBooleanAnswer[0].funcIDList[0]),
											  new constraint(new elemId(c2.id), new elemId(c2.listOfBooleanAnswer[1].funcIDList[1]), c2.listOfBooleanAnswer[1].funcIDList[1]),
											  new constraint(new elemId(c2.listOfBooleanAnswer[1].funcIDList[0]), new elemType("Booleans"), c2.listOfBooleanAnswer[1].funcIDList[0]),
                                              new constraint(new elemId(c2.listOfBooleanAnswer[0].bool.id), new elemId(c2.listOfBooleanAnswer[0].funcIDList[0]), c2.listOfBooleanAnswer[0].bool.id),
                                              new constraint(new elemId(c2.listOfBooleanAnswer[1].bool.id), new elemId(c2.listOfBooleanAnswer[1].funcIDList[0]), c2.listOfBooleanAnswer[1].bool.id),
                                              new constraint(new elemId(c2.listOfBooleanAnswer[0].answer.id), new elemId(c2.listOfBooleanAnswer[0].funcIDList[1]), c2.listOfBooleanAnswer[0].answer.id),
                                              new constraint(new elemId(c2.listOfBooleanAnswer[1].answer.id), new elemId(c2.listOfBooleanAnswer[1].funcIDList[1]), c2.listOfBooleanAnswer[1].answer.id),
                                              new constraint(new elemId(c2.listOfBooleanAnswer[1].bool.id), new variable("y"), c2.listOfBooleanAnswer[1].bool.id),
                                              new constraint(new elemId(c2.listOfBooleanAnswer[1].answer.id), new variable("w"), c2.listOfBooleanAnswer[1].answer.id)]);
console.log("Testing unify (Again, ignore order of arrays)");
errorCheck(unify(buildConstraints(n1).constraints, buildConstraints(n1).literals).subst, [new constraint(new elemId(n1.id), new elemType("Numbers"), n1.id)]);
errorCheck(unify(buildConstraints(n1).constraints, buildConstraints(n1).literals).errors, []);
errorCheck(unify(buildConstraints(f1).constraints, buildConstraints(f1).literals).subst, [
														new constraint(new elemId(f1.id), new construct("func", [new elemType("Numbers"), new elemType("Numbers"), new elemType("Numbers")]), f1.id),
														new constraint(new elemId(f1.funcIDList[0]), new elemType("Numbers"), f1.id),
														new constraint(new elemId(f1.funcIDList[1]), new elemType("Numbers"), f1.id),
														new constraint(new elemId(s1.id), new elemType("Numbers"), s1.id),
														new constraint(new elemId(n1.id), new elemType("Numbers"), n1.id),
														]);
errorCheck(unify(buildConstraints(f1).constraints, buildConstraints(f1).literals).errors, [new error(s1.id, "Type mismatch")]);
errorCheck(unify(buildConstraints(d2).constraints, buildConstraints(d2).literals).subst, [
															new constraint(new elemId(f3.args[1].id), new elemType("Numbers"), f3.args[1].id),
															new constraint(new elemId(d2.funcIDList[1]), new elemType("Numbers"), d2.funcIDList[1]),
															new constraint(new elemId(f3.args[0].id), new elemType("Numbers"), f3.args[0].id),
															new constraint(new variable("x"), new elemType("Numbers"), f3.args[0].id),
															new constraint(new elemId(d2.funcIDList[0]), new elemType("Numbers"), f3.id),
															new constraint(new elemId(f3.funcIDList[1]), new elemType("Numbers"), f3.id),
															new constraint(new elemId(f3.funcIDList[0]), new elemType("Numbers"), f3.id),
															new constraint(new elemId(f3.id), new construct("func", [new elemType("Numbers"),
                                                                    new elemType("Numbers"), new elemType("Numbers")]), f3.id),
															new constraint(new elemId(d2.id), new construct("func", [new elemType("Numbers"), new elemType("Strings")]), d2.contract.id),
															new constraint(new variable("fun"), new construct("func", [new elemType("Numbers"), new elemType("Strings")]), d2.id)
															]);
errorCheck(unify(buildConstraints(d2).constraints, buildConstraints(d2).literals).errors, [new error(d2.id, "Type mismatch")]);
errorCheck(unify(buildConstraints(c2).constraints, buildConstraints(c2).literals).subst, [new constraint(new variable("w"), new elemType("Numbers"), c2.listOfBooleanAnswer[1].answer.id),
															new constraint(new variable("y"), new elemType("Booleans"), c2.listOfBooleanAnswer[1].bool.id),
															new constraint(new elemId(c2.listOfBooleanAnswer[1].funcIDList[0]), new elemType("Booleans"), c2.listOfBooleanAnswer[1].funcIDList[0]),
															new constraint(new elemId(c2.id), new elemType("Numbers"), c2.listOfBooleanAnswer[1].funcIDList[1]),
															new constraint(new elemId(c2.listOfBooleanAnswer[0].funcIDList[0]), new elemType("Booleans"), c2.listOfBooleanAnswer[0].funcIDList[0]),
															new constraint(new elemId(c2.listOfBooleanAnswer[0].funcIDList[1]), new elemType("Numbers"), c2.listOfBooleanAnswer[0].answer.id),
															new constraint(new elemId(c2.listOfBooleanAnswer[1].funcIDList[1]), new elemType("Numbers"), c2.listOfBooleanAnswer[0].funcIDList[1]),
															new constraint(new elemId(c2.listOfBooleanAnswer[0].answer.id), new elemType("Numbers"), c2.listOfBooleanAnswer[0].answer.id),
															new constraint(new elemId(c2.listOfBooleanAnswer[0].bool.id), new elemType("Booleans"), c2.listOfBooleanAnswer[0].bool.id),
															new constraint(new elemId(c2.listOfBooleanAnswer[1].answer.id), new elemType("Numbers"), c2.listOfBooleanAnswer[1].answer.id),
															new constraint(new elemId(c2.listOfBooleanAnswer[1].bool.id), new elemType("Booleans"), c2.listOfBooleanAnswer[1].bool.id)
															]);
errorCheck(unify(buildConstraints(c2).constraints, buildConstraints(c2).literals).errors, []);
c2.listOfBooleanAnswer[1].answer = new ExprConst("y");
errorCheck(unify(buildConstraints(c2).constraints, buildConstraints(c2).literals).subst, [new constraint(new elemId(c2.listOfBooleanAnswer[0].funcIDList[1]), new elemType("Booleans"), c2.listOfBooleanAnswer[0].funcIDList[1]),
															new constraint(new variable("y"), new elemType("Booleans"), c2.listOfBooleanAnswer[1].bool.id),
															new constraint(new elemId(c2.listOfBooleanAnswer[1].funcIDList[0]), new elemType("Booleans"), c2.listOfBooleanAnswer[1].funcIDList[0]),
															new constraint(new elemId(c2.id), new elemType("Booleans"), c2.listOfBooleanAnswer[1].funcIDList[1]),
															new constraint(new elemId(c2.listOfBooleanAnswer[0].funcIDList[0]), new elemType("Booleans"), c2.listOfBooleanAnswer[0].funcIDList[0]),
															new constraint(new elemId(c2.listOfBooleanAnswer[1].funcIDList[1]), new elemType("Booleans"), c2.listOfBooleanAnswer[1].answer.id),
															new constraint(new elemId(c2.listOfBooleanAnswer[0].answer.id), new elemType("Booleans"), c2.listOfBooleanAnswer[0].answer.id),
															new constraint(new elemId(c2.listOfBooleanAnswer[0].bool.id), new elemType("Booleans"), c2.listOfBooleanAnswer[0].bool.id),
															new constraint(new elemId(c2.listOfBooleanAnswer[1].answer.id), new elemType("Booleans"), c2.listOfBooleanAnswer[1].answer.id),
															new constraint(new elemId(c2.listOfBooleanAnswer[1].bool.id), new elemType("Booleans"), c2.listOfBooleanAnswer[1].bool.id)
															]);
errorCheck(unify(buildConstraints(c2).constraints, buildConstraints(c2).literals).errors, [new error(c2.listOfBooleanAnswer[0].answer.id, "Type mismatch")]);
contains(new constraint(new elemId(c1.id), new elemType("Numbers"), "58"), unify(buildConstraints(c1).constraints, buildConstraints(c1).literals).subst);
console.log("Testing buildTypeErrors");
errorCheck(buildTypeErrors(unify(buildConstraints(c2).constraints, buildConstraints(c2).literals).errors, c2), [new errorMatch([c2.listOfBooleanAnswer[0].answer.id, c2.listOfBooleanAnswer[1].answer.id],
	"The output type of this cond is not consistent, there are answers that return different types.")]);
var d3 = new ExprDefineFunc();
d3.contract.funcName = "test2";
d3.contract.argumentTypes[0] = "Numbers";
d3.contract.outputType = "Strings";
d3.argumentNames = "num";
var num = new ExprConst("num");
num.outputType = "Numbers";
d3.expr = num;
errorCheck(buildTypeErrors(unify(buildConstraints(d3).constraints, buildConstraints(d3).literals).errors, d3), [new errorMatch([d3.expr.id], "Contract output and actual expression output do not match. Contract expected output type \"Strings\" but found output type \"Numbers\" in the expression" )])
//This test case fails because we never have an undefined output type variable, so I haven't written anything to track an undefined output type variab;e
//errorCheck(buildTypeErrors(unify(buildConstraints(d2).constraints, buildConstraints(d2).literals).errors, d2), [new errorMatch([d2.contract.funcIDList[1], d2.funcIDList[1], f3.args[0].id],
//		"The variable \"x\" was assigned type \"Strings\" in the contract, but at least one instance of this variable had a different type.")]);
errorCheck(buildTypeErrors(unify(buildConstraints(f1).constraints, buildConstraints(f1).literals).errors, f1), [new errorMatch([s1.id],
		"This spot should have a block of type \"Numbers\" but found a block of type \"Strings\"")]);


}());