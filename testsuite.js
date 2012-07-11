'use strict'

function create(arr){
	var toReturn = ""
	for(var i = 0; i < arr.length; i++){
		toReturn += interpreter(arr[i]) + "\n"
	}
	return toReturn;
}
/**
* errorCheck : does some nice console logging if errors are found between the two items
* 
*
* 
* if arg1 and arg2 are arrays of the same length, checks the equality of each item
* prints error message if length is different, types don't match, or items are different
* if arg1 and arg2 are not arrays, checks equality of items and pritns message.
*/
var numTest = 1;
function errorCheck(arg1, arg2){
	if(arg1 instanceof Array && arg2 instanceof Array && arg1.length === arg2.length){
		var fails = []
		var type = false;
		for(var i = 0; i < arg1.length; i++){
			if(arg1[i] !== arg2[i]){
				fails.push(i)
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
			console.log("Mismatchs found at indices:")
			console.log(fails)
			console.trace();
		}
	}else if (arg1 instanceof Array || arg2 instanceof Array){
		if(arg1 instanceof Array && arg2 instanceof Array){
			console.log("Test #" + numTest + ": **FAILED** Arrays of different length.")
		}else{
		console.log("Test #" + numTest + ": **FAILED** One argument was an array and the other was not.")
		}
		console.log("First argument had value:");
		console.log(arg1);
		console.log("Second argument had value:");
		console.log(arg2);
		console.trace();
	}else{
		if(arg1 === arg2){
			console.log("Test #" + numTest + ": passed");
		}else if(arg1 == arg2) {console.log("Test #" + numTest + ": PASSED, but TYPE MISMATCH");
								console.log("First argument had value:");
								console.log(arg1);
								console.log("Second argument had value:");
								console.log(arg2);
								console.trace();
		}else{
			console.log("Test #" + numTest + ": **FAILED**")
			console.log("First argument had value:");
			console.log(arg1);
			console.log("Second argument had value:");
			console.log(arg2);

			console.trace();
		}
	}
		numTest++;
}
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
//TEST CASES!!!

errorCheck(interpreter(str1), "\"test1\"");
errorCheck(interpreter(num1), "1");
errorCheck(interpreter(bool1), "true");
errorCheck(interpreter(func1), "(+ 1 (string-length \"test1\"))");
errorCheck(interpreter(def1), ";createCircleinAStarwithLeprechauns: Numbers Numbers Numbers Numbers Strings -> Images\n" +
								"(define (createCircleinAStarwithLeprechauns width height numPoints leprechauns color)\n" +
								"(cond\n[(> leprechauns numPoints) (place-image (star height \"outline\" color) leprechauns leprechauns "+
								"(triangle width \"outline\" color))]\n" +
								"[true (rectangle width height \"outline\" color)]))");
errorCheck(searchForIndex("1", programTest), num1);
errorCheck(searchForIndex("12", programTest), def1.expr);
errorCheck(searchForIndex("10", programTest), def1);
errorCheck(searchForIndex("100", programTest), undefined);
ID = 0;
errorCheck(makeID(), "0");
errorCheck(makeID(), "1");
errorCheck(makeID(), "2");
errorCheck(makeIDList(1), ["3"]);
errorCheck(makeIDList(0), []);
errorCheck(makeIDList(5), ["4","5","6","7","8"]);