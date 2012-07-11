function create(arr){
	var toReturn = ""
	for(var i = 0; i < arr.length; i++){
		toReturn += interpreter(arr[i]) + "\n"
	}
	return toReturn;
}

var program1 = [];
var program2 = [];
var program3 = [];
var program4 = [];
var program5 = [];
var program6 = [];
var program7 = [];

var str1 = new ExprString();
str1.value = "test1";
var num1 = new ExprNumber();
num1.value = 1;
var bool1 = new ExprBoolean(true);
program1.push(str1);
program1.push(num1);
program1.push(bool1);
var func1 = new ExprApp("+", [num1, new ExprApp("string-length", [str1])]);
program1.push(func1);
console.log("Program 1")
console.log(create(program1));
var def1 = new ExprDefineFunc();
def1.argumentNames = ["width", "height", "numPoints", "leprechauns", "color"];
def1.contract.funcName = "createCircleinAStarwithLeprechauns";
def1.contract.argumentTypes = ["Numbers", "Numbers", "Numbers", "Numbers", "Strings"];
def1.contract.outputType = "Images";
def1.expr = func1;
program2.push(def1);
console.log("Program 2");
console.log(create(program2));