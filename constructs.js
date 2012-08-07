(function(){

    "use strict";
    // this function is strict...

    // If there is no window.console, we'll make one up.

    if (!window.console){
	$(document).ready(function() {
            /*       var consoleDiv = $("<div id='console'/>");
                     $(document.body).append(consoleDiv);
                     consoleDiv.css("position", "absolute");
                     consoleDiv.css("right", "10px");
                     consoleDiv.css("top", "10px");
                     consoleDiv.css("width", "300px");
                     consoleDiv.css("height", "500px");
                     consoleDiv.css("background-color", "white");
                     consoleDiv.css("border", "1px solid red");
                     consoleDiv.css("overflow", "scroll");*/
            window.console = {/* log: function() {
				 var i;
				 for (i = 0; i < arguments.length; i++) {
				 consoleDiv.append($("<span/>").text(arguments[i]));
				 consoleDiv.append($("<br/>")); 
				 }
				 }*/
            };
            
            

	});
    }





    /*====================================================================================
      ___       _          ___       __ _      _ _   _             
      |   \ __ _| |_ __ _  |   \ ___ / _(_)_ _ (_) |_(_)___ _ _  ___
      | |) / _` |  _/ _` | | |) / -_)  _| | ' \| |  _| / _ \ ' \(_-
      |___/\__,_|\__\__,_| |___/\___|_| |_|_||_|_|\__|_\___/_||_/__/
      
      =====================================================================================*/


    // Returns a string representing an ID used for an HTML element and its corresp. code object
    function makeID(){
	return String(ID++);
    }

    /* 
       Returns an array of strings representing IDs. Used for functions such that every argument
       can have an ID
    */
    function makeIDList(num){
	var toReturn = [];
	for(var i = 0; i<num; i++){
	    toReturn[i] = makeID();
	}
	return toReturn;
    }

    /*
      cloneProgram takes in an array of code objects (arr) and outputs a clone of arr
    */
    var cloneProgram = function(arr){
	var tempArr = [];
	for (var i = 0; i < arr.length; i++){
	    tempArr[i] = arr[i].clone();
	}
	return tempArr;
    };

    /**
     *flatten : object -> array
     *turns a ExprBoolAnswer into a single level array
     */
    function flatten(obj){
	var toReturn = [];
	if(obj.bool !== undefined){
	    toReturn.push(obj.bool)
	}
	if(obj.answer !== undefined){
	    toReturn.push(obj.answer)
	}
	return toReturn;
    }

    /*
      searchForIndex takes in an a string (id) and and array filled within code Objects (one of which should
      contain an object with the id). 

      @return: The object with the corresponding id.
    */
    function searchForIndex(id, array){

	var toReturn = undefined;
	for(var i = 0; i< array.length; i++){
	    if(array[i] === undefined){
		//just skip
	    }else if(array[i].id===id){
		toReturn = array[i]
	    }else if(isDefine(array[i])){
		toReturn = searchForIndex(id, [array[i].expr]);
	    }else if(array[i] instanceof ExprApp){
		toReturn = searchForIndex(id, array[i].args);
	    }else if(array[i] instanceof ExprBoolAnswer){
		toReturn = searchForIndex(id, flatten(array[i]));
	    }else if(array[i] instanceof ExprCond){
		toReturn = searchForIndex(id, array[i].listOfBooleanAnswer);
	    }
	    if(toReturn !== undefined){
		return toReturn;
	    }
	}
	return undefined;
    }

    /*
      addProgram adds a code object (obj) to the program array given the id of the parent (parentId)
      and the id of the child (childId).
      MAYBE: childID won't work and we'll need array position
    */
    function setChildInProgram(parentId, childId, obj,prog){
	var parent = searchForIndex(parentId, prog);
	if(parent === undefined){
	    throw new Error("setChildInProgram failure: parentId not found.");
	}
	if(isLiteral(parent)){
	    throw new Error("setChildInProgram failure: parent was a literal, and cannot be added to");
	}
	if(parent.hasOwnProperty("funcIDList")){
	    var index;
	    if(obj !== undefined){
		index = getAddIndex(parent, childId);
	    }
	    else{
		index = getRemoveIndex(parent, childId);
	    }
	    if(index === -1){
		throw new Error("setChildInProgram failure: childId not found");
	    }
	    else{
		if(parent instanceof ExprApp){
		    parent.args[index] = obj;
		}
		else if(isDefine(parent)){
		    parent.expr = obj;
		}
		else if(parent instanceof ExprBoolAnswer){
		    if(index === 0){
			parent.bool = obj;
		    }
		    else{
			parent.answer = obj;
		    }
		}
		else if(parent instanceof ExprCond){
		    throw new Error("setChildInProgram failure: parent was top level of cond, that doesn't work");
		}
		else{
		    throw new Error("setChildInProgram failure: parent looked like: " +interpreter(parent));
		}
	    }
	}
    }

    function getRemoveIndex(parent, childID){
	var i;
	var toReturn = -1;
	if(isDefine(parent)){
	    if(parent.expr != undefined && parent.expr.id === childID){
		toReturn = 0;
	    }
	}else if(parent instanceof ExprApp){
	    for(i=0; i<parent.args.length; i++){
		if(parent.args[i] !== undefined){
		    if(parent.args[i].id === childID){
			toReturn = i;
		    }
		}
	    }
	}else if(parent instanceof ExprBoolAnswer){
	    if(parent.bool !== undefined && parent.bool.id === childID){
		toReturn = 0;
	    }
	    if(parent.answer !== undefined && parent.answer.id === childID){
		toReturn = 1;
	    }
	}
	return toReturn;
    }
    function getAddIndex(parent, childID){
	for(var i =0; i<parent.funcIDList.length; i++){
	    if(parent.funcIDList[i] === childID){
		return i;
	    }
	}
	return -1;
    }


    /*
      Constucts the define function block given a contract, a list of arguments (a list of variables), 
      and an expression which is an expression object

      (define (add2 x) (+ x 2)) =>
      makeDefineFunc(contract1, ["x"], makeApp("+", [makeVariable("x"), 2]))

      contract1 = makeContract("add2", ["Numbers"], "Numbers")

      expr = the expr, not a list, an object
      funcIDList: first id refers to the expr block, all others refer to aruguments in order
    */
    var ExprDefineFunc = function(){

	this.contract = new ExprContract();
	this.selfType="ExprDefineFunc";
	this.argumentNames = [""];
	this.expr = undefined;
	this.id = makeID();
	this.funcIDList = makeIDList(2);
	this.clone=function(){
	    var temp=new ExprDefineFunc();
	    temp.contract=this.contract.clone();
	    temp.argumentNames=this.argumentNames.slice(0);
	    if (this.expr != undefined){
		temp.expr=this.expr.clone();
	    }
	    temp.id=this.id;
	    temp.funcIDList=this.funcIDList.slice(0);
	    return temp;
	};
    };

    var ExprContract = function(){
	this.funcName = "";
	this.selfType = "ExprContract"
	this.argumentTypes = [undefined];
	this.outputType = undefined;
	this.id = makeID();
	this.funcIDList=makeIDList(2);
	this.purpose = "";
	this.clone=function(){
	    var temp=new ExprContract();
	    temp.funcName=this.funcName;
	    temp.argumentTypes=this.argumentTypes.slice(0);
	    temp.funcIDList=this.funcIDList.slice(0);
	    temp.outputType=this.outputType;
	    temp.id=this.id;
	    temp.purpose = this.purpose;
	    return temp;
	};
    };

    /*
      Constucts the define variable block given a name (string), an expression which is an expression 
      object, and an output type

      (define x 3) =>
      ExprDefineConst("x", ExprNumber(3), "Numbers")

      (define y (+ 2 x)) =>
      ExprDefineConst("y", (ExprApp("+", [ExprNumber("2"), ExprConst("x")))
    */
    var ExprDefineConst = function(){

	this.constName = undefined;
	this.selfType="ExprDefineConst";
	this.expr = undefined;
	this.outputType = undefined; //MAKE SURE THIS WILL BE DEFINED!!!!
	this.id = makeID();
	this.funcIDList = makeIDList(1);
	this.clone=function(){
	    var temp=new ExprDefineConst();
	    temp.constName=this.constName;
	    if (this.expr != undefined){
		temp.expr=this.expr.clone();
	    }
	    temp.outputType=this.outputType;
	    temp.id=this.id;
	    temp.funcIDList=this.funcIDList.slice(0);
	    return temp;
	};
    };

    /*
      Returns true if the object is a literal or constant, false otherwise.
    */
    function isLiteral (obj){
	return (
	    obj instanceof ExprString ||
		obj instanceof ExprNumber ||
		obj instanceof ExprBoolean ||
		obj instanceof ExprConst);
    }

    /*
      Returns true if the object is a definition, false otherwise
    */
    function isDefine (obj){
	return (obj instanceof ExprDefineConst || obj instanceof ExprDefineFunc);
    }



    /*
      Constructs an application of an operator given the name, arguments, and output type. The arguments 
      is an array of expressions. Value is initially initialized to null.
      args is a list of objects (one for each argument)
    */
    var ExprApp = function(funcName){
	this.funcName = funcName;
	this.selfType="ExprApp";
	this.id = makeID();
	var allFunctions = functions.concat(userFunctions);
	this.funcIDList = makeIDList(allFunctions[containsName(allFunctions, funcName)].input.length);
	this.args = [];
	this.outputType = getOutput(funcName);
	this.clone=function(){
	    var temp=new ExprApp(this.funcName);
	    temp.id=this.id;
	    temp.funcIDList=this.funcIDList.slice(0);
	    for(var i=0;i<this.args.length;i++){
		if (this.args[i] != undefined){
		    temp.args.push(this.args[i].clone());
		} else{
		    temp.args.push(undefined);
		}
	    }
	    temp.outputType=this.outputType;
	    return temp;
	};
    };

    /*
      Constructs a string given the contents of the string (str).
      The value of the string is initialized as an empty string "". 
    */
    var ExprString= function(){
	this.value="insert string here";
	this.selfType="ExprString";
	this.outputType = "Strings";
	this.id = makeID();
	this.clone=function(){
	    var temp=new ExprString();
	    temp.value=this.value;
	    temp.outputType=this.outputType;
	    temp.id=this.id;
	    return temp;
	};
    };

    /*
      Constructs a number given a number num.
    */
    var ExprNumber = function(){
	this.value = 20;
	this.selfType="ExprNumber"
	this.outputType = "Numbers";
	this.id = makeID();
	this.clone=function(){
	    var temp=new ExprNumber();
	    temp.value=this.value;
	    temp.outputType=this.outputType;
	    temp.id=this.id;
	    return temp;
	};
    };

    /*
      NOTE: Not sure if necessary
      Constructs a variable object given a name of type string.
    */
    var ExprConst = function(constName){
	this.constName = constName;
	this.selfType="ExprConst"
	this.outputType = undefined;
	this.id = makeID();
	this.clone=function(){
	    var temp=new ExprConst(this.constName);
	    temp.outputType=this.outputType;
	    temp.id=this.id;
	    return temp;
	};

    };

    /*
      Constructs a boolean true or false (else == true)
    */
    var ExprBoolean = function(value){
	this.value=value;
	this.selfType="ExprBoolean";
	this.outputType = "Booleans";
	this.id = makeID();
	this.clone=function(){
	    var temp=new ExprBoolean(this.value);
	    temp.outputType=this.outputType;
	    temp.id=this.id;
	    return temp;
	};
    };

    /*
      Constructs a tuple of boolean and answer to use in a cond expression
    */
    var ExprBoolAnswer=function(){
	this.bool = undefined;
	this.answer = undefined;
	this.selfType="ExprBoolAnswer";
	this.outputType = undefined;
	this.id = makeID();
	this.funcIDList = makeIDList(2);
	this.clone=function(){
	    var temp=new ExprBoolAnswer();
	    if (this.bool != undefined){
		temp.bool=this.bool.clone();
	    }
	    if (this.answer != undefined){
		temp.answer=this.answer.clone();
	    }
	    temp.outputType=this.outputType;
	    temp.id=this.id;
	    temp.funcIDList=this.funcIDList.slice(0);
	    return temp;
	};
    };


    /*
      Constructs a conditional statement given a list of tuples, formatted: (expr, expr)
      The first expression has to be a boolean

      (cond
      [(true) 2]
      [(false) 1]
      ) =>
      ExprCond(list1)
      list1 = [ExprBoolAnswer(ExprBoolean(true),ExprNumber(2)).ExprBoolAnswer(ExprBoolean(False),ExprNumber(1))]
    */
    var ExprCond = function(){
	this.listOfBooleanAnswer=[new ExprBoolAnswer()];
	this.selfType="ExprCond";
	this.outputType = undefined;
	this.id = makeID();
	this.clone=function(){
	    var temp=new ExprCond();
	    for(var i=0;i<this.listOfBooleanAnswer.length;i++){
		temp.listOfBooleanAnswer[i]=this.listOfBooleanAnswer[i].clone();
	    }
	    temp.outputType=this.outputType;
	    temp.id=this.id;
	    return temp;
	};
    };


    function objectArrayToProgram(JSONArrayObject,arrayToPush){
	for(var i=0;i<JSONArrayObject.length;i++){
	    arrayToPush.push(objectToCodeObject(JSONArrayObject[i]));
	}
    }

    function objectToCodeObject(JSONObject){
	if(JSONObject==undefined){
	    return undefined;
	}
	var curType=JSONObject.selfType;
	var tempObject;
	if(curType==="ExprNumber"){
	    tempObject=new ExprNumber();
	    tempObject.value=JSONObject.value;
	}
	else if(curType==="ExprString"){
	    tempObject=new ExprString();
	    tempObject.value=JSONObject.value;
	}
	else if(curType==="ExprBoolean"){
	    tempObject=new ExprBoolean();
	    tempObject.value=JSONObject.value;
	}
	else if(curType==="ExprDefineFunc"){
	    tempObject=new ExprDefineFunc();
	    tempObject.argumentNames=JSONObject.argumentNames.slice(0);
	    tempObject.funcIDList=makeIDList(JSONObject.funcIDList.length)
	    tempObject.expr=objectToCodeObject(JSONObject.expr);
	    tempObject.contract=objectToCodeObject(JSONObject.contract);
	}
	else if(curType==="ExprContract"){
	    tempObject=new ExprContract();
	    tempObject.funcName=JSONObject.funcName;
	    tempObject.funcIDList=makeIDList(JSONObject.funcIDList.length)
	    tempObject.argumentTypes=JSONObject.argumentTypes.slice(0);
	    tempObject.outputType=JSONObject.outputType;

	}
	else if(curType==="ExprDefineConst"){
	    tempObject=new ExprDefineConst();
	    tempObject.constName=JSONObject.constName;
	    tempObject.expr=objectToCodeObject(JSONObject.expr);
	    tempObject.outputType=JSONObject.outputType;
	}
	else if(curType==="ExprApp"){
	    tempObject=new ExprApp(JSONObject.funcName);
	    for(var j=0;j<JSONObject.args.length;j++){
		tempObject.args[j]=objectToCodeObject(JSONObject.args[j]);
	    }
	}
	else if(curType==="ExprConst"){
	    tempObject=new ExprConst(JSONObject.constName);
	    tempObject.outputType=JSONObject.outputType
	}
	else if(curType==="ExprBoolAnswer"){
	    tempObject=new ExprBoolAnswer();
	    tempObject.bool=objectToCodeObject(JSONObject.bool);
	    tempObject.answer=objectToCodeObject(JSONObject.answer);
	    tempObject.outputType=JSONObject.outputType;
	}
	else if(curType==="ExprCond"){
	    tempObject=new ExprCond();
	    for(var j=0;j<JSONObject.listOfBooleanAnswer.length;j++){
		tempObject.listOfBooleanAnswer[j]=objectToCodeObject(JSONObject.listOfBooleanAnswer[j]);
	    }
	    tempObject.outputType=JSONObject.outputType;
	}
	return tempObject;
    };


    //Functions is an array of objects containing a name, tuples of type and name corresponding to their inputs and an output type
    var functions=[];
    functions[0]={};
    functions[0].name="+";
    functions[0].input=[{type:"Numbers",name:"Number"},{type:"Numbers",name:"Number"}];
    functions[0].output="Numbers";
    functions[1]={};
    functions[1].name="-";
    functions[1].input=[{type:"Numbers",name:"Number"},{type:"Numbers",name:"Number"}];
    functions[1].output="Numbers";
    functions[2]={};
    functions[2].name="*";
    functions[2].input=[{type:"Numbers",name:"Number"},{type:"Numbers",name:"Number"}];
    functions[2].output="Numbers";
    functions[3]={};
    functions[3].name="/";
    functions[3].input=[{type:"Numbers",name:"Number"},{type:"Numbers",name:"Number"}];
    functions[3].output="Numbers";
    functions[4]={};
    functions[4].name="remainder";
    functions[4].input=[{type:"Numbers",name:"Dividend"},{type:"Numbers",name:"Divisor"}];
    functions[4].output="Numbers";
    functions[5]={};
    functions[5].name="sqrt";
    functions[5].input=[{type:"Numbers",name:"Number"}];
    functions[5].output="Numbers";
    functions[6]={};
    functions[6].name="sqr";
    functions[6].input=[{type:"Numbers",name:"Number"}];
    functions[6].output="Numbers";
    functions[7]={};
    functions[7].name="expt";
    functions[7].input=[{type:"Numbers",name:"Base"},{type:"Numbers",name:"Exponent"}];
    functions[7].output="Numbers";
    functions[8]={};
    functions[8].name="=";
    functions[8].input=[{type:"Numbers",name:"Number"},{type:"Numbers",name:"Number"}];
    functions[8].output="Booleans";
    functions[9]={};
    functions[9].name=">";
    functions[9].input=[{type:"Numbers",name:"Number"},{type:"Numbers",name:"Number"}];
    functions[9].output="Booleans";
    functions[10]={};
    functions[10].name="<";
    functions[10].input=[{type:"Numbers",name:"Number"},{type:"Numbers",name:"Number"}];
    functions[10].output="Booleans";
    functions[11]={};
    functions[11].name="<=";
    functions[11].input=[{type:"Numbers",name:"Number"},{type:"Numbers",name:"Number"}];
    functions[11].output="Booleans";
    functions[12]={};
    functions[12].name=">=";
    functions[12].input=[{type:"Numbers",name:"Number"},{type:"Numbers",name:"Number"}];
    functions[12].output="Booleans";
    functions[13]={};
    functions[13].name="even?";
    functions[13].input=[{type:"Numbers",name:"Number"}];
    functions[13].output="Booleans";
    functions[14]={};
    functions[14].name="odd?";
    functions[14].input=[{type:"Numbers",name:"Number"}];
    functions[14].output="Booleans";
    functions[15]={};
    functions[15].name="string-append";
    functions[15].input=[{type:"Strings",name:"String"},{type:"Strings",name:"String"}];
    functions[15].output="Strings";
    functions[16]={};
    functions[16].name="string-length";
    functions[16].input=[{type:"Strings",name:"String"}];
    functions[16].output="Numbers";
    functions[17]={};
    functions[17].name="string=?";
    functions[17].input=[{type:"Strings",name:"String"},{type:"Strings",name:"String"}];
    functions[17].output="Booleans";
    functions[18]={};
    functions[18].name="and";
    functions[18].input=[{type:"Booleans",name:"Boolean"},{type:"Booleans",name:"Boolean"}];
    functions[18].output="Booleans";
    functions[19]={};
    functions[19].name="or";
    functions[19].input=[{type:"Booleans",name:"Boolean"},{type:"Booleans",name:"Boolean"}];
    functions[19].output="Booleans";
    functions[20]={};
    functions[20].name="not";
    functions[20].input=[{type:"Booleans",name:"Boolean"}];
    functions[20].output="Booleans";
    functions[21]={};
    functions[21].name="rectangle";
    functions[21].input=[{type:"Numbers",name:"Width"},{type:"Numbers",name:"Height"}, {type:"Strings", name:"Outline"}, {type:"Strings",name:"Color"}];
    functions[21].output="Images";
    functions[22]={};
    functions[22].name="circle";
    functions[22].input=[{type:"Numbers",name:"Radius"}, {type:"Strings", name:"Outline"}, {type:"Strings",name:"Color"}];
    functions[22].output="Images";
    functions[23]={};
    functions[23].name="triangle";
    functions[23].input=[{type:"Numbers",name:"Length"}, {type:"Strings", name:"Outline"}, {type:"Strings",name:"Color"}];
    functions[23].output="Images";
    functions[24]={};
    functions[24].name="ellipse";
    functions[24].input=[{type:"Numbers",name:"A"},{type:"Numbers",name:"B"}, {type:"Strings", name:"Outline"}, {type:"Strings",name:"Color"}];
    functions[24].output="Images";
    functions[25]={};
    functions[25].name="star";
    functions[25].input=[{type:"Numbers",name:"Side-Length"}, {type:"Strings", name:"Outline"}, {type:"Strings",name:"Color"}];
    functions[25].output="Images";
    functions[26]={};
    functions[26].name="scale";
    functions[26].input=[{type:"Numbers",name:"Multiple"},{type:"Images",name:"Image"}];
    functions[26].output="Images";
    functions[27]={};
    functions[27].name="rotate";
    functions[27].input=[{type:"Numbers",name:"Degrees"},{type:"Images",name:"Image"}];
    functions[27].output="Images";
    functions[28]={};
    functions[28].name="place-image";
    functions[28].input=[{type:"Images",name:"Image"}, {type:"Numbers",name:"x"},{type:"Numbers",name:"y"},{type:"Images",name:"Background"}];
    functions[28].output="Images";

    var initFunctions=functions.length;
    //constants is an array of user defined variables containing their name and type
    var constants=[];
    /*
      functionProgram   is an array of user defined functions in the form of ExprDefineConst and xprDefineFunc
    */
    var functionProgram   = [];
    var initConstants=constants.length;
    var userFunctions = [];

    //restricted contains a list of key words in racket that we aren't allowing the user to redefine
    var restricted=["lambda","define","list","if","else","cond","foldr","foldl","map","let","local"];

    //pre-defined and user-defined types
    var types=["Numbers","Strings","Booleans","Images"];

    //Colors is an object containing kv pairs of type to color
    var colors={};
    colors.Numbers="#33CCFF";
    colors.Strings="#FFA500";
    colors.Images="#66FF33";
    colors.Booleans="#CC33FF";
    colors.Define="#FFFFFF";
    colors.Expressions="#FFFFFF";
    colors.Constants="#FFFFFF";

    /*
      historyarr stores the program/storage state. Updated when the user changes something about the program (i.e.
      adds a block, moves a block, moves something to storage, etc.)

      historyarr is an array of objects in which the first element of the object is the program state and the second
      is the storage state
    */
    var historyarr = [];


    /*
      addToHistory takes in a program state and adds it to history while setting the future array 
      (connected to the redo button) to an empty array
    */
    var addToHistory = function(programState, storageState) {
	historyarr.push({program: programState, storage: storageState});
	$("#undoButton").removeAttr('disabled');
	future = [];
    };


    /*
      future is an array of the program states and storage states. Updated when the user undos something.
    */
    var future = [];

    /*
      program is an array of makeDefineFunc/makeDefineVar/Expressions that make up the user's program
      on the screen.
    */
    var program = [];


    /*
      storageProgram stores the state of the stroage div
    */
    var storageProgram = [];




    /*====================================================================================
      ___ _     _          _  __   __        _      _    _        
      / __| |___| |__  __ _| | \ \ / /_ _ _ _(_)__ _| |__| |___ ___
      | (_ | / _ \ '_ \/ _` | |  \ V / _` | '_| / _` | '_ \ / -_|_-<
      \___|_\___/_.__/\__,_|_| _ \_/\__,_|_| |_\__,_|_.__/_\___/__/
      / _|___  | __|  _ _ _  __| |_(_)___ _ _  ___                  
      > _|_ _| | _| || | ' \/ _|  _| / _ \ ' \(_-<                  
      \_____|  |_| \_,_|_||_\__|\__|_\___/_||_/__/                  

      =====================================================================================*/

    // These variables store what the height and width of the code div should be
    var contentHeight;
    var contentWidth;
    // Which Drawer type is currently being displayed
    var activated = [];
    // which text block in the #code div is currently being focused
    var focused=null;
    var initvalue=null;
    // ID that matches together a code object and an HTML element
    var ID =0;
    var adding=false;

    var numberofvalidations=0;
    var errorVal=false;
    var timeout;


    //resizes code div when the window is resized
    function onResize(){
	contentHeight = $(window).height() - $("#header").height();
	contentWidth = $(window).width();
	$("#content").height(contentHeight);
	$("#graybox").height($(window).height());
	$("#graybox").width($(window).width());
	$("#content").width(contentWidth);
	$("#code").height(contentHeight);
	$("#code").width(contentWidth - $("#Drawer").width());
	$("#List").height(contentHeight - 30);
	$("#List").width($("#code").width() - 55);
	$("#options").height(contentHeight - $("#storage").height());
	//    resizeStorage();
	//     resizeCode()
    }

    var resizeStorage = function() {
	$("#storagePopup").width($("#code").width()-$("#Drawers").width() - 300);
	$("#storagePopup").height($("#code").height() - 100);
    };

    var resizeCode = function() {
	$("#codePopup").width($("#code").width()-$("#Drawers").width() - 300);
	$("#codePopup").height($("#code").height() - 100);
    };

    /*
      removeFromStorageOnClick takes in a jquery selection (jQuerySelection) and adds a function to it
      such that when it's double clicked, it gets removed from storagePopup div and gets added
      to the end of the sortable #List
    */
    var removeFromStorageOnClick = function(jQuerySelection, html, codeObject){
	$(jQuerySelection).dblclick(function() {
	    addToHistory(cloneProgram(program),cloneProgram(storageProgram))
	    var index = $("#actualStorage li").index(jQuerySelection);
	    $("#List").append("<li>" + html + "</li>");
	    program.push(codeObject);
	    addDroppableFeature($("#List li:last").find(('.droppable')));
	    storageProgram.splice(index, 1);
	    $(jQuerySelection).remove();
	});
    };

    var evaluator;
    var xhr;

    $(document).ready(function(){


	//When the window is resized, the height of the width of the code div changes
	$(window).resize(onResize);


	//draws drawers when the page is loaded
	makeDrawers(functions,constants);
	onResize();
	// activated is initially set to "Numbers"
	// activated = $("#options #Numbers");
	// activated.css("visibility", "visible");
	/*
	  adds a stylesheet to <head> such that blocks can be colored according to their type
	*/
	renderTypeColors();

	addUItoStorage();

	// /*
	//   storage pops up when clicked
	// */
	// $("#storage").on('click',function() {
	//    if($("#storagePopup").css('visibility')==="visible"){
	//      $("#storagePopup").css('visibility','hidden');
	//    }
	//    else{
	//      $("#storagePopup").css('visibility','visible');
	//    }
	
	//	$("#graybox").css('visibility','visible').fadeIn('slow');;
	//});

	$("#closestorage").click(function() {
	    $("#storagePopup").css('visibility','hidden');
	    //	$("#graybox").css('visibility','hidden');
	});

	$("#closecode").click(function() {
	    $("#codePopup").css('visibility','hidden');
	    evaluator.requestBreak();
	});

	//$("#codePopup").draggable();

	$(document).keyup(function(e) {
	    if (e.keyCode == 27) { $("#storagePopup").css('visibility','hidden');
				   $("#codePopup").css('visibility','hidden');
				   evaluator.requestBreak(); }   // esc
	});

	$(document).click(function(e){
	    $(document).find(".ErrorMessage").each(
		function(){
		    if(Modernizr.touch && !adding){
			console.log("Correctly removing");
			$(this).remove();
		    }
		    adding=false
		})});

	/*
	  sets focus equal to the input that is focused. 
	*/
	$(document).on('focus',"#List input",function(e){
	    var toContinue=formValidation(e);
	    focused=$(this);
	    initvalue=focused.value;
	    tempProgram=cloneProgram(program);
	    return toContinue;
	});


	$(document).on('mousedown', function(e){
	    return formValidation(e)
	});

	//Sets undo and redo buttons to disabled on startup
	$("#undoButton").attr('disabled','disabled');
	$("#redoButton").attr('disabled','disabled');
  $("#stopButton").attr("disabled","disabled");

	/*
	  Binds undo functionality with undo button
	*/
	$("#undoButton").bind('click', function(){
	    if (historyarr.length !== 0){
		future.unshift({program: cloneProgram(program), storage: cloneProgram(storageProgram)});
		$("#redoButton").removeAttr('disabled');
		var x = historyarr.pop();
		program = x.program;
		storageProgram = x.storage;
		renderProgram(createProgramHTML(program));
		if (historyarr.length === 0){
		    $(this).attr('disabled','disabled');
		}
	    }
	});


	/*
	  Binds redo functionality with redo button
	*/
	$("#redoButton").bind('click', function(){
	    if (future.length !== 0){
		historyarr.push({program: cloneProgram(program), storage: cloneProgram(storageProgram)});
		var x = future.shift();
		program = x.program;
		storageProgram = x.storage;
		renderProgram();
		if (future.length === 0){
		    $("#redoButton").attr('disabled','disabled');
		}
	    }
	    $("#undoButton").removeAttr('disabled');
	});

	$("#saveButton").bind('click',function(){
	    if(typeof(Storage)!=="undefined"){
		var valid=true;
		var confirmed=true;
		var saveName=prompt("Please enter a name to which to save your file.");
		if(saveName==undefined){
		    return;
		}
		if(saveName===""){
		    valid=false;
		}
		else if(localStorage.getItem(saveName)!=undefined){
		    confirmed=confirm("There already exists a file with this name.  Would you like to overwrite?");
		}
		while(!valid || !confirmed){
		    if(!valid){
			saveName=prompt("You have failed to enter anything as your file name.  To cancel, please hit the cancel button.");
			valid=true;
			confirmed=true;
		    }
		    else if(!confirmed){
			saveName=prompt("Please enter a name to which to save your file.");
			valid=true;
			confirmed=true;
		    }
		    if(saveName===""){
			valid=false;
		    }
		    else if(saveName==undefined){
			return;
		    }
		    else if(localStorage.getItem(saveName)!=undefined){
			confirmed=confirm("There already exists a file with this name.  Would you like to overwrite?");
		    }
		}
		//save id, program... maybe history, future, trash
		localStorage[saveName]=JSON.stringify(cloneProgram(program))+"___"+JSON.stringify(cloneProgram(functionProgram))+"___"+JSON.stringify(cloneProgram(storageProgram));
	    }
	    else{
		alert("I am sorry but your browser does not support storage.");
	    }
	}) ;

	$("#loadButton").bind('click',function(){
	    var loadName=prompt("Please enter the name of the file you wish to load.  Your current program will be removed from screen.");
	    if(loadName==undefined){
		return;
	    }
	    else if(localStorage.getItem(loadName)==undefined){
		alert("There was no local file by that name.");
		return;
	    }
	    else{
		var programString=localStorage.getItem(loadName).split("___");
		program=[];
		functionProgram=[];
		storageProgram=[]
		objectArrayToProgram(JSON.parse(programString[0]),program);
		objectArrayToProgram(JSON.parse(programString[1]),functionProgram);
		objectArrayToProgram(JSON.parse(programString[2]),storageProgram);
		//do I change the history and trash? overwrite it?
		renderProgram();
		historyarr=[];
		future=[];
		$("#undoButton").attr('disabled','disabled');
		$("#redoButton").attr('disabled','disabled');
	    }
	});

	$("#exportButton").bind('click',function(){
	    alert("Here is the racket representation of the current program:\n\n"+parseProgram());
	});


	$(document).on('click',".addCond",function(){
	    addToHistory(cloneProgram(program), cloneProgram(storageProgram));
	    searchForIndex($(this).closest('table').attr('id'),program).listOfBooleanAnswer.push(new ExprBoolAnswer());
	    renderProgram(createProgramHTML())
	});

	$("#runButton").click(function(){
            var legal=true;
            var typeInfered;
            for(var i=0;i<program.length;i++){
		typeInfered=typeInfer(program[i])
		if(typeInfered.typeErrors.length>0 || typeInfered.blankErrors.length>0){
		    legal=false
		}
            }
            for(i=0;i<functionProgram.length;i++){
		typeInfered=typeInfer(storageProgram[i])
		if(typeInfered.typeErrors.length>0 || typeInfered.blankErrors.length>0){
		    legal=false
		}
            }
            if(!legal){
		alert("There are type errors or blank spaces in your program.  Please fix them before continuing to run");
		return;
            }
            else{
              var storageString="";
              for(var i=0;i<storageProgram.length;i++){
                storageString+=interpreter(storageProgram[i])
              }
              removeOutputs();
              evaluateBlock(0,storageString);
              }

		
    //var programString = parseProgram();
		//console.log(programString, typeof(programString));
		// $("#actualCode").empty().css("white-space", "pre")
		//     .text("Racket:\n" + programString +"\n\nResult:\n");
		// $("#codePopup").css('visibility','visible');
		// evaluator.executeProgram("",
		// 			 programString,
		// 			 function() {
		// 			 },
		// 			 function(err) {
		// 			     $("#actualCode").text("\nError:\n"+evaluator.getMessageFromExn(err)+"");
		// 			 })
	});

	$(document).on('click',".removeCond",function(){
	    var listOfTuples=searchForIndex($(this).closest('.Cond').attr('id'),program).listOfBooleanAnswer
	    if(listOfTuples.length!=1){
		addToHistory(cloneProgram(program), cloneProgram(storageProgram));
		for(var i=0;i<listOfTuples.length;i++){
		    if(listOfTuples[i].id===$(this).closest('table').attr('id')){
			listOfTuples.splice(i,1)
		    }
		}  
		renderProgram(createProgramHTML());
	    }    
	});
    });

    /*
      allows user to add argument to contract in define block
    */
    $(document).on('click',".addArgument",function(){
	addToHistory(cloneProgram(program), cloneProgram(storageProgram));
	var defineExpr=searchForIndex($(this).closest('table').attr('id'),functionProgram  )
	defineExpr.funcIDList.push(makeID())
	defineExpr.contract.funcIDList.push(makeID())
	defineExpr.argumentNames.push("");

	//makes contract dropdown
	var contractdropdown = $(makeContractDropdown(defineExpr.contract.funcIDList[defineExpr.contract.funcIDList.length - 1], defineExpr));
	$(this).closest('th').before(contractdropdown);
	
	//makes argument type-in
	var argIndex = defineExpr.funcIDList.length - 2;
	var argHTML = $("<th style=\"text-align:left;\" class=\"expr argument\"><input style=\"width:70px;\" id=\"" + defineExpr.funcIDList[defineExpr.funcIDList.length - 1] +"\" onkeyup=\"sync(" + defineExpr.id + ",$(this))\" class=\"argName\" disabled=\"disabled\" value=\"\"></th>");

	$(this).closest('table').find('tr').eq(2).find('th').eq(1 + argIndex * 2).after($(argHTML));
	$(argHTML).after("<th style=\"text-align:left;\"></th>");

	addDraggableToArgument($(argHTML), defineExpr, $(contractdropdown).find('select').attr('id'));

	//resize purpose and expression
	var purposeTH = $(this).closest('table').find('.contractPurpose').closest('th');
	purposeTH.attr('colspan', parseInt(purposeTH.attr('colspan')) + 3);
	var exprTH = $(this).closest('table').find('.functionExpr');
	exprTH.attr('colspan',parseInt(exprTH.attr('colspan')) + 3);

	toggleDeleteButtons(defineExpr.funcIDList, defineExpr.id, contractdropdown);
	toggleFunctionInDrawer(defineExpr);
    });

    function evaluateBlock(i,storageString){
                var blockString=storageString+"(sleep 2)"+interpreter(program[i]);
                var id=program[i].id
                console.log(blockString,id)
                var myEval=makeEvaluator(id,blockString);
                $("#stopButton").removeAttr('disabled');
                $("#stopButton").click(function(){
                  myEval.requestBreak();
                });
                i++;
                console.log("added");
                if(i<program.length){
                  evaluateBlock(i,storageString);
                }
                else{
                  $("#stopButton").attr("disabled","disabled");
                }
    }

    function makeEvaluator(id,blockString){
             var evaluator = new Evaluator({
                  write: function(thing) {
                    console.log("adding to",id);
                    $($(document.getElementById(id)).children("tbody").children("tr")[0]).append($(thing).addClass("outputMessage"))
                      //$("#actualCode").append(thing);
                  }
              });
            var xhr = new easyXDM.Rpc(
                      { remote: "http://wescheme-compiler.hashcollision.org/index.html",
                        // This lazy flag must be set to avoid a very ugly
                        // issue with Firefox 3.5.
                        lazy: true
                      },
                      { remote: { compileProgram: {} }});
            evaluator.setCompileProgram(function(name, program, success, fail) {
                      xhr.compileProgram(name, program, success, fail);
                  });
          evaluator.executeProgram("",blockString,
                    function(){},
                    function(err){
                      console.log(evaluator.getMessageFromExn(err))
                      $($(document.getElementById(id)).children("tbody").children("tr")[0]).append("<div class=\"outputMessage\" title=\""+encode(evaluator.getMessageFromExn(err))+"\">Error</div")
                      //$("#actualCode").text("\nError:\n"+evaluator.getMessageFromExn(err)+"");
                    });
          return evaluator;
    }

    function removeOutputs(){
      $(".output").remove();
    }

    /*
      toggleDeleteButtons changes the contract of a define block such that delete buttons are visible and invisible
      when appropriate

      @param funcIDList is the funcIDList that corresponds with the define block you are dealing with
      @param defineExprID is the string of the id refering to the define block which you are working with
      @param latestArg a jQuery selector representing the latest argument you've added. latestArg is only defined
      if it toggleDeleteButtons is called after adding an argument
    */
    function toggleDeleteButtons(funcIDList, defineExprID, latestArg) {
	var closebutton = $("<button class=\"deleteArg\" onclick=\"deleteArg($(this).closest('th').prev().find('select').attr('id')," + defineExprID+ ")\">x</button>");

	//    closebutton.click(deleteArg( ,defineExprID));

	if (funcIDList.length === 3 && latestArg != undefined){ //add x button to all
	    $("#"+ defineExprID + " .buttonHolder").prepend($(closebutton));	    
	}
	else if (funcIDList.length > 3 && latestArg != undefined) { //add x button to latest
	    latestArg.eq(1).prepend($(closebutton));
	}
	else if (funcIDList.length < 3) { //delete x button just from the one arg left
	    $("#" + defineExprID).find('.buttonHolder').find(".deleteArg").remove();
	}
    }

    var resizeStorage = function() {
	$("#storagePopup").width($("#code").width()-$("#Drawers").width() - 300);
	$("#storagePopup").height($("#code").height() - 100);
    };

    /*
      removeFromStorageOnClick takes in a jquery selection (jQuerySelection) and adds a function to it
      such that when it's double clicked, it gets removed from storagePopup div and gets added
      to the end of the sortable #List
    */
    var removeFromStorageOnClick = function(jQuerySelection, html, codeObject){
	$(jQuerySelection).dblclick(function() {
	    var index = $("#actualStorage li").index(jQuerySelection);
	    $("#List").append("<li>" + html + "</li>");
	    program.push(codeObject);
	    addDroppableFeature($("#List li:last").find(('.droppable')));
	    storageProgram.splice(index, 1);
	    $(jQuerySelection).remove();
	});
    };

    function formValidation(e){
	var toContinue=true;
	numberofvalidations++;
	errorVal=false;
	if(focused !==null &&  ($(e.target) !== focused)){
            var inputtext=focused.val();
            var codeObject = searchForIndex(focused.closest($("table")).attr("id"),program);
            //NUMBERS
            if(focused.closest($("table")).hasClass("NumBlock")){
		console.log("Formvalidating numbers")
		if(isNaN(Number(inputtext))){
                    toContinue=false;
                    errorVal=true
		}
		while(isNaN(Number(inputtext)) || inputtext==null){
                    inputtext=prompt("You have entered an invalid number into that number field.  Please type a valid replacement below");
		}
		focused.css("background-color", colors.Numbers);
		changeValue(inputtext)
		codeObject.value=inputtext;
            }
            //STRINGS
            else if(focused.closest($("table")).hasClass("Strings")){
		changeValue(inputtext);
            }
            //DEFINING CONSTANTS
            else if(focused.closest($("table")).hasClass("DefineVar")){
		if((initvalue !=undefined && initvalue != "") && inputtext !== ""){
                    var prevIndex=containsName(prevName,constants);
                    if(prevIndex != -1){
			constants[prevIndex].name=inputtext;
                    }
                    addToHistory(tempProgram, cloneProgram(storageProgram));
                    initvalue=null
                    tempProgram=null;
		}
		else if ((initvalue !=undefined && initvalue != "") && inputtext === ""){
                    constants.splice(containsName(prevName,1));
                    addToHistory(tempProgram, cloneProgram(storageProgram));
                    initvalue=null;
                    tempProgram=null;
		}
		else if((initvalue ==undefined || prevName == "") && inputtext !== ""){
                    addToHistory(tempProgram, cloneProgram(storageProgram));
                    initvalue=null;
                    tempProgram=null;
		}
		var scrollValue = $("#options").scrollTop();
		makeDrawers(functions.concat(userFunctions),constants);
		setActivatedVisible(scrollValue);
		focused.attr('value',inputtext);
		focused=null;
            }
            else if(focused.closest($("table")).hasClass("DefineFun")){
		if( initvalue != inputtext){
                    addToHistory(tempProgram, cloneProgram(storageProgram));
                    initvalue=null;
                    tempProgram=null;
		}
		focused=null;
            }
	}
	return toContinue;
    };

    function changeValue(inputtext){
	if( initvalue != inputtext ){
            addToHistory(tempProgram, cloneProgram(storageProgram));
            initvalue=null;
            focused.attr('value',inputtext);
            tempProgram=null;
	}
	focused=null;
    }

    /*
      adds a stylesheet to <head> such that blocks can be colored according to their type
    */
    function renderTypeColors(){
	var styleCSS = "<style type='text/css'>";
	for (var type in colors){
            if (colors.hasOwnProperty(type)) {
		styleCSS+="."+encode(type)+"{background-color:"+colors[type]+";}";
            }
	}
	styleCSS += "</style>";
	$(styleCSS).appendTo("head");
    }

    //containsName takes in an array of objects and a string and returns the index at which that string is the name property of any of the objects
    function containsName(array_of_obj,stringElement){
	var contain=-1;
	for (var i = 0; i < array_of_obj.length; i++) {
            if(array_of_obj[i].name===stringElement){
		contain=i;
		break;
            }
	}
	return contain;
    }


    /*
      functionNameRepeated checks to see if a function's name already exists

      @param defineName = a string representing the name of a ExprDefineFunc that you
      want to remove

      @return bool. true if the ExprDefineFunc represented by defineName already exists 
      in functionProgram  , false otherwise
    */
    function functionNameRepeated(defineName){
	var timesFound = 0;
	for (var i = 0; i < functionProgram  .length; i++){
	    if (functionProgram  [i].contract.funcName === defineName){
		timesFound = timesFound + 1;
	    }
	    if (timesFound > 1){
		return true;
	    }
	}
	return false;
    }

    /*
      removeFunctionFromArray removes codeObject from functionProgram  

      @param defineName - a string representing the name of a ExprDefineFunc that
      you want to remove
    */
    function removeFunctionFromArray(defineName) {
	var foundName = false;
	for (var i = 0; i < functionProgram  .length && !foundName; i++){
	    if (functionProgram  [i].contract.funcName === defineName) {
		functionProgram  .splice(i, 1);
		foundName = true;
	    }
	}
	if (foundName === false) {
	    throw new Error('removeFunctionFromArray: could not find defineName');
	}
    }


    /*====================================================================================
      ___                            ___             _   _             
      |   \ _ _ __ ___ __ _____ _ _  | __|  _ _ _  __| |_(_)___ _ _  ___
      | |) | '_/ _` \ V  V / -_) '_| | _| || | ' \/ _|  _| / _ \ ' \(_-<
      |___/|_| \__,_|\_/\_/\___|_|   |_| \_,_|_||_\__|\__|_\___/_||_/__/
      
      =====================================================================================*/

    /*
      drawerToggle allows the drawer to slide toggle
    */
    function drawerToggle() {

	$("#options .toggleHeader").click(function() {
            var toToggle = $(this).attr("class").split(" ")[1];
            var toggledDiv = $("#options #" + toToggle);
            toggledDiv.slideToggle(400, function() {
		if($(toggledDiv).is(":visible")){
                    addNonRepeatedEltToArray(activated, toToggle);
		} else{
                    removeEltFromArray(activated, toToggle);
		}
            });
	});    
    }

    /*
      addNonRepeatedEltToArray takes in an array of strings (arr) and a string (toAdd) and
      pushes toAdd to arr if it is not already within arr
    */

    var addNonRepeatedEltToArray = function(arr, toAdd) {
	var i;
	if (arr.length === 0){
            arr.push(toAdd);
	} else{
            for (i = 0; i < arr.length; i++) {
		if (arr[i] === toAdd){ 
                    break;
		}
		if(i === arr.length - 1){
                    arr.push(toAdd);
		}
            }
	}
    };

    /*
      removeEltFromArray takes in an array of strings (arr) and a string(toDelete) and removes 
      toDelte from arr by splicing it out
    */
    var removeEltFromArray = function(arr, toDelete) {
	var i;
	var initialArrLength =arr.length;
	for (i = 0; i < arr.length; i++){
            if (arr[i] === toDelete){
		arr.splice(i, 1);
		break;
            }
	}
	if (i === initialArrLength){
            throw new Error("removeEltFromArray: couldn't find toDelete");
	}
    };

    //makeTypesArray will construct an object of kv pairs such that each type's value is an array of all indices to which that type is the output or the exclusive input
    function makeTypesArray(allFunctions,allConstants){
	var types={};
	types.Booleans=["true","false"];
	types.Numbers=["Number"];
	types.Strings=["Text"];
	for(var i=0;i<allFunctions.length;i++){
            var curOutput=allFunctions[i].output;
            if(types[curOutput]!==undefined){
		types[curOutput].push(i);
            }
            else{
		types[curOutput]=[i];
            }


            var curInput=allFunctions[i].input;
            if(unique(curInput) && curInput.length>0){
		var addition=curInput[0].type;
		if( types[addition]!==undefined ){
                    if( types[addition][ types[addition].length-1 ]!==i ){
			types[addition].push(i);
                    }
		}
		else{
                    types[addition]=[i];
		}
            }
	}
	types.Constants=[];
	for(i=0;i<allConstants.length;i++){
            types.Constants.push(i);
	}
	types.Expressions=["cond"];

	return types;
    }

    //unique takes as input an array and outputs if there is only one type in the whole array
    // (arrayof input-tuple) -> boolean
    function unique(array_inputs){
	if(array_inputs.length>0){
            var first=array_inputs[0].type;
            for(var i=1;i<array_inputs.length;i++){
		if(first!==array_inputs[i].type){
                    return false;
		}
            }
	}
	return true;
    }

    /*
      setActivatedVisible sets the activated drawers to visible
    */

    var setActivatedVisible = function(scrollValue) {
	for(var i = 0; i < activated.length; i++){
            $("#options #" + activated[i]).css("display","block");
	}
	$("#options").scrollTop(scrollValue);
    };

    //makeDrawers takes in all of the functions and all of the constants and will change the HTML so that each of the types is an openable drawer and when that drawer is opened
    //all of the functions corresponding to that type are displayed
    // INJECTION ATTACK FIXME
    function makeDrawers(allFunctions,allConstants){
	var typeDrawers = makeTypesArray(allFunctions,allConstants);
	var Drawers="<div id=\"options\">\n";
	var i;
	for(var Type in typeDrawers){
            if(typeDrawers.hasOwnProperty(Type)){
		Drawers+="<h1 class=\"toggleHeader " + encode(Type) + "\">"+encode(Type)+"</h1>";
		Drawers += "<div id=\""+encode(Type)+"\">";
		if(Type==="Constants"){
                    for(i=0;i<typeDrawers[Type].length;i++){
			Drawers+=" <span class=\"draggable "+encode(Type)+"\">"+encode(allConstants[typeDrawers[Type][i]].name)+"</span>";
		    }
		}
		
		else if(Type==="Define"){
		    for(i=0;i<typeDrawers[Type].length;i++){
			Drawers+=" <span class=\"draggable "+encode(Type)+"\">"+encode(typeDrawers[Type][i])+"</span>";
		    }
		}
		else if(Type==="Expressions"){
		    for(i=0;i<typeDrawers[Type].length;i++){
			Drawers+=" <span class=\"draggable "+encode(Type)+"\">"+encode(typeDrawers[Type][i])+"</span>";
		    }
		}
		else{
		    for(i=0;i<typeDrawers[Type].length;i++){
			if(typeDrawers[Type][i]==="true"){
			    Drawers+=" <span class=\"Booleans draggable\">true</span>";
			}
			else if(typeDrawers[Type][i]==="false"){
			    Drawers+=" <span class=\"Booleans draggable\">false</span>";
			}
			else if(typeDrawers[Type][i]==="Text"){
			    Drawers+=" <span class=\"Strings draggable\">Text</span>";
			}
			else if(typeDrawers[Type][i]==="Number"){
			    Drawers+=" <span class=\"Numbers draggable\">Number</span>";
			}
			else{
			    Drawers+=" <span class=\"draggable "+encode(allFunctions[typeDrawers[Type][i]].output)+"\">"+encode(allFunctions[typeDrawers[Type][i]].name)+"</span>";
			}
		    }
		}
		
		Drawers+="</div>";
	    }
	}

	Drawers+="<h1 class=\"definition DefineFunction\" id=\"functionButton\">Define Function</h1>";
	Drawers+="<h1 class=\"definition DefineConstant\" id=\"constantButton\">Define Constant</h1>";
	Drawers+="</div>"

	//MAKE STORAGE
	Drawers+="/<div id=\"storage\">Storage</div>";

	$("#Drawer").html(Drawers);
	$("#storage").click(function(){
            if($("#storagePopup").css('visibility')==="visible"){
		$("#storagePopup").css('visibility','hidden');
            }
            else{
		$("#storagePopup").css('visibility','visible');
            }
	});

	/*
	  functionButton brings up a popup of a 'define' window 
	*/
	$("#functionButton").click(function() {
	    console.log('click');
	    var codeObject = new ExprDefineFunc;
	    functionProgram  .push(codeObject);
	    var $popupHTML = $(makeDefinePopup(codeObject));
	    $('body').append($($popupHTML));
	    $($popupHTML).css('position','absolute');
	    $($popupHTML).css('top','50px');
	    $($popupHTML).css('left','220px');
	    $($popupHTML).draggable();

	    //adds droppable to expression
	    addDroppableToDefineExpr($popupHTML.find('.functionExpr'));

	    //adds draggable to first argument
	    addDraggableToArgument($popupHTML.find('.argument'), codeObject, $popupHTML.find('select').eq(0).attr('id'));

	    /*
	      closes the corresponding 'define' window
	    */
	    $(".closeFunctionButton").bind('click', function() {
		var confirmClose = true;
		var defineName = codeObject.contract.funcName;
		if(defineName === ""){
		    removeFunctionFromArray(codeObject.contract.funcName);
		}
		else if(functionNameRepeated(defineName)){
		    confirmClose = false;
		    alert('rename your function')
		}
		if (confirmClose) {
		    $(this).closest('.definePopup').css('visibility','hidden');
		}
	    });
	});
	drawerToggle();
	makeDrawersDraggable();
	setActivatedVisible($("#options").scrollTop());
    }


    /*====================================================================================
      ___                                ___             _         _           
      | _ \_ _ ___  __ _ _ _ __ _ _ __   | _ \___ _ _  __| |___ _ _(_)_ _  __ _ 
      |  _/ '_/ _ \/ _` | '_/ _` | '  \  |   / -_) ' \/ _` / -_) '_| | ' \/ _` |
      |_| |_| \___/\__, |_| \__,_|_|_|_| |_|_\___|_||_\__,_\___|_| |_|_||_\__, |
      |___/                                                  |___/ 
      =====================================================================================*/


    /*
      Adds a block to the end of the list given the HTML of the block.
    */
    // function renderBlocktoProgram(block){
    //              document.getElementById("List").appendChild(block);
    // }




 
    // functionButton brings up a popup of a 'define' window 

    // $(document).on("click","#functionButton",function() {
    //     var codeObject = new ExprDefineFunc;
    //     functionProgram  .push(codeObject);
    //     var $popupHTML = $(makeDefinePopup(codeObject));
    //     $('body').append($($popupHTML));
    //     $($popupHTML).css('position','absolute');
    //     $($popupHTML).css('top','50px');
    //     $($popupHTML).css('left','220px');
    //     $($popupHTML).draggable();

    //     //adds droppable to expression
    //     addDroppableToDefineExpr($popupHTML.find('.functionExpr'));

    //     //adds draggable to first argument
    //     addDraggableToArgument($popupHTML.find('.argument'), codeObject, $popupHTML.find('select').eq(0).attr('id'));

    //     /*
    //       closes the corresponding 'define' window
    //     */
    //     $(".closeFunctionButton").bind('click', function() {
    // 	var confirmClose = true;
    // 	var defineName = codeObject.contract.funcName;
    // 	if(defineName === ""){
    // 	    removeFunctionFromArray(codeObject.contract.funcName);
    // 	}
    // 	else if(functionNameRepeated(defineName)){
    // 	    confirmClose = false;
    // 	    alert('rename your function')
    // 	}
    // 	if (confirmClose) {
    // 	    $(this).closest('.definePopup').css('visibility','hidden');
    // 	}
    //     });
    // });

    /*
      makeContractDropdown creates a new selection and plus button for the contract part of define
    */
    function makeContractDropdown(funcIDListID, defineExpr) {
	return "<th style=\"text-align:left;\">" + generateTypeDrop(funcIDListID, defineExpr)  + "</th><th style=\"text-align:left;\" class=\"buttonHolder\"></th>";
    }
    /*
      makeDefinePopup creates a new ExprDefine
    */
    function makeDefinePopup(codeObject) {
	var i;
	var popupHTML = "<div class=\"definePopup\"><table class=\"DefineFun Define\" id=\"" + codeObject.id+ "\"><tr><button class=\"closeFunctionButton\"></tr>"

	//CONTRACT name
	popupHTML += "<tr><th><input class=\"contractName\" onkeyup=\"sync("+codeObject.id+",$(this))\" ";
	if(codeObject.contract.funcName!=undefined){
            popupHTML += "value=\""+encode(codeObject.contract.funcName)+"\"";
	}
	popupHTML += " /></th><th> : </th>";

	//CONTRACT args
	var typeDrop;
	for(i=0; i<codeObject.argumentNames.length; i++){
	    typeDrop = generateTypeDrop(codeObject.contract.funcIDList[i+1],codeObject);
	    if (codeObject.contract.argumentTypes[i+1] != undefined){
		$(typeDrop).val(codeObject.contract.argumentTypes[i+1])
	    }
            popupHTML += " <th style=\"text-align:left;\">"+typeDrop+"</th><th style=\"text-align:left;\" class=\"buttonHolder\"></th>";
	}
	popupHTML += "<th style=\"text-align:left;\"> <button class=\"addArgument\">+</button> </th>";

	//CONTRACT output
	var outputDrop = generateTypeDrop(codeObject.contract.funcIDList[0],codeObject);
	var outputType = codeObject.contract.outputType;
	if (outputType != undefined){
	    $(outputDrop).val(outputType);
	}
	popupHTML += " <th style=\"text-align:left;\"> -> </th><th style=\"text-align:left;\">"+outputDrop+"</th></tr>";

	//DEFINE BLOCK NAME
	popupHTML+="<tr><th>define</th>";
	popupHTML += "<th class=\"expr\"> <input class=\"definitionName\" onkeyup=\"sync("+codeObject.id+",$(this))\" ";
	if(codeObject.contract.funcName!=undefined){
            popupHTML += "value=\""+encode(codeObject.contract.funcName)+"\"";
	}
	popupHTML += " /></th>";
	//DEFINE BLOCK ARGUMENTS
	for(i=0;i<codeObject.argumentNames.length;i++){
            popupHTML += "<th width=\"10px\" class=\"expr argument\"";
            if(codeObject.contract.argumentTypes[i]!=undefined){
		popupHTML+=" style=\"background:"+colors[codeObject.contract.argumentTypes[i]]+"\" ";
            }
            popupHTML+="><input style=\"width:70px;\" id=\""+codeObject.funcIDList[i+1]+"\" onkeyup=\"sync("+codeObject.id+",$(this))\"  disabled=\"disabled\" class=\"argName\" ";
            if(codeObject.argumentNames[i]!=undefined){
		popupHTML+="value=\""+encode(codeObject.argumentNames[i])+"\"";
            }
            popupHTML+=" /></th>";
	}
	popupHTML+="<th></th>";

	//PURPOSE
	var tableWidth = 4 +( (codeObject.funcIDList.length - 1) * 3);
	popupHTML += "<tr><th style=\"text-align:left;\">purpose:</th><th colspan=\""+ tableWidth +"\"> <input style=\"width:100%\" class=\"contractPurpose\" value=\"\" onkeyup=\"sync("+codeObject.id + ",$(this))\"></th></tr>";

	//DEFINE EXPRESSION
	popupHTML+="<tr><th ";
	if(codeObject.contract.outputType!=undefined){
            popupHTML += " style=\"background:"+colors[codeObject.contract.outputType]+"\" ";
	}
	if(codeObject.expr != undefined){
            popupHTML+="class=\"functionExpr noborder droppable expr\" name=\"Expr\" id="+codeObject.funcIDList[0]+">";
            popupHTML+=createBlock(codeObject.expr,constantEnvironment.concat(createNewConstants(codeObject)),functionEnvironment);
            popupHTML+="</th>";
	}
	else{
            popupHTML+="name=\"Expr\" class=\"functionExpr droppable expr\" id="+codeObject.funcIDList[0]+" colspan=\""+ tableWidth + "\">Expr</th>";
	}


	popupHTML += "</th></tr></table></div>"
	return popupHTML; 

    };

    /*
      createProgramHTML takes the program array and translates it into HTML
    */
    var createProgramHTML = function(){
	var pageHTML = "";
	for (var i = 0; i < program.length; i++){
            pageHTML += "<li>" + createBlock(program[i],constants,functions.concat(userFunctions)) + "</li>";
            if(program[i] instanceof ExprDefineConst){
		//constants.push({name:program[i].name;type:program[i].outputType})
            }
            else if(program[i] instanceof ExprDefineFunc){
		//ADD
            }
	}
	//makeDrawers();
	//drawerButton(activated);
	return pageHTML;
    };

    /*
      createStorageHTML takes the storageProgram array and converts the codeObjects into HTML.
      storageProgram is a global variable so it does not need to be passed in as a function.
      createBlock is used as a helper to generate HTML.
    */
    var createStorageHTML = function(){
	var storageHTML = "";
	for (var i = 0; i < storageProgram.length; i++){
	    storageHTML += "<li>" + createBlock(storageProgram[i], constants, functions.concat(userFunctions)) + "</li>";
	}
	return storageHTML;
    };

    /*
      renderProgram changes contents of #List to the current program and the contents of #storage
      to the current storageProgram
    */
    var renderProgram = function(){
	$("#actualStorage").html(createStorageHTML());
	$("#List").html(createProgramHTML());
	addDroppableFeature($("#List .droppable"));

	// $("#List table").children().each(function(){
	//         addDraggingFeature($(this).find("table"));
	// });
	setLiWidth($("#List li"));
	setLiWidth($("#storagePopup li"));
	typeCheck(program);
	makeDrawers(functions.concat(userFunctions), constants);
	$("#storage").text('Storage (' + storageProgram.length + ')');
	addUItoStorage();
    };

    /*
      encode takes in a string and encodes it such that bugs resulting from &, ", #, etc are eliminated"
      decode does something similar for the same purpose
    */
    function encode(string){
	return String(string)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
    function decode(string){
	return String(string)
            .replace('&amp;', '&')
            .replace('&quot;','\"')
            .replace('&#39;','\'')
            .replace('&lt;',"<")
            .replace('&gt;',">");
    }

    /*
      changeName changes the name of a define block

      @param defineExpr - the ExprDefineFunc you want to change
      @param newName - (string) the name you want to give to defineExpr
      @return void. changes a ExprDefineFunc
    */
    function changeName(defineExpr, newName, prevName){
	defineExpr.contract.funcName = newName;
    }

    /*
      changeArgName changes the name of an argument in a define block

      @param defineExpr - the ExprDefinFunc you want to change
      @param newName - (string) the name you want to give to defineExpr
      @param argIndex - (int) the index of the argument in relation to the other arguments
      @return void. changes a ExprDefineFunc
    */
    function changeArgName(defineExpr, newName, argIndex){
	defineExpr.argumentNames[argIndex] = newName;
    }

    /*
      contains determines whether or not an element already exists within an array

      @param elm - an element
      @param arr - an array of the type of element
      @return - boolean. true if it's repeated, false otherwise
    */
    function contains(elm, arr) {
	for (var i = 0; i < arr.length; i++){
	    if (arr[i] === elm){
		return true;
	    }
	}
	return false;
    }

    /*
      gets called on keyup of input
    */
    function sync(objectID, $input){
	var block=searchForIndex(objectID+"",program);
	if (block == undefined){
	    block = searchForIndex(objectID+"", functionProgram  );
	} 
	var DOMBlock=$("#" + objectID);
	if(block instanceof ExprNumber || block instanceof ExprString){
            block.value=decode(DOMBlock.find(".input").attr('value'));
            DOMBlock.find(".input").attr('value',DOMBlock.find(".input").attr('value'));
	}
	else if(block instanceof ExprDefineConst){
            block.constName=decode(DOMBlock.find('.constName').attr('value'));
            DOMBlock.find('.constName').attr('value',DOMBlock.find('.constName').attr('value'));
	}
	else if(block instanceof ExprDefineFunc){

	    window.clearTimeout(timeout);

	    //updateGUI
	    var newInput = $input.attr('value') + "";
	    var defInput = $("#" + objectID).find('.definitionName').first();
	    var contractInput = $("#" + objectID).find('.contractName').first();
	    if ($input.hasClass('contractName') || $input.hasClass('definitionName')){
		
		if($input.hasClass('contractName')){
		    defInput.attr('value',(newInput));
		} 
		else if ($input.hasClass('definitionName')){
		    contractInput.attr('value',(newInput));
		}
		
		timeout = setTimeout(function() {
		    if (newInput === "" || !legalFunctionName(newInput)){
			defInput.css('background-color','red');
			contractInput.css('background-color','red');
			$(document).click(function(){
			    var prevName = $input.attr('prevName');
			    defInput.attr('value', prevName);
			    contractInput.attr('value',prevName);
			    defInput.css('background-color','');
			    contractInput.css('background-color', '');
			});
		    } else {
			changeName(block, newInput);
			defInput.css('background-color','');
			contractInput.css('background-color', '');

			// add/remove from drawers
			toggleFunctionInDrawer(block, $input.attr('prevName'));
			if (contractCompleted(block.contract)){
			    defInput.attr('prevName', newInput);
			    contractInput.attr('prevName', newInput);
			}
		    }
		}, 500);
	    }
	    
	    else if ($input.hasClass('argName')) {
		if (/*$input.val() !== "" && */contains($input.val(), block.argumentNames)){
		    $input.css('background-color','red');
		} else {
		    $input.css('background-color','');
		}
		changeArgName(block, newInput, getElmIndexInArray($input.attr('id'), block.funcIDList) - 1);
		toggleFunctionInDrawer(block, defInput.attr('prevName'));
	    }
	    else if ($input.hasClass('contractPurpose')){
		block.contract.purpose = newInput;
	    }
	    
	}
    }


    /*
      changeAppOutput changes the output type of an ExprApp

      @param appExpr - ExprApp whose output you want to change
      @param newOutputType - the new output type 
      @return void - alters ExprApp
    */
    function changeAppOutput(appExpr, newOutputType){
	appExpr.outputType = newOutputType;
    }

    /*
      toggleFunctionInDrawer removes and adds functions to drawers
      @param defineExpr - (ExprDefineFunc) the block which you might add/remove to/from the drawer
      @param prevName - (string) the name the defineExpr used to have
    */
    function toggleFunctionInDrawer(defineExpr, prevName) {
	if (contractCompleted(defineExpr.contract)){
	    console.log(prevName, defineExpr, program);
	    changeProgramFunctions(prevName, defineExpr, program);
	    changeProgramFunctions(prevName, defineExpr, storageProgram);
	    addFunctionToDrawers(defineExpr);
	}
    }

    /*
      changeProgramFunctions changes the outputType, args, and funcName attributes of ExprApps in the prog

      @param prevName - (string) the funcName of all ExprApps you want to change
      @param defineExpr - (ExprDefineFunc) the define block being changed
      @param prog - the program you will parse through
    */
    function changeProgramFunctions(prevName, defineExpr, prog){
	var i;
	for (i = 0; i < prog.length; i++){
	    if (prog[i] instanceof ExprApp){
		changeExprApp(prog[i], prevName, defineExpr);
	    }
	}
    }

    /*
      changeExprApp changes the outputType and funcName attributes of appExpr

      @param appExpr - (ExprApp) you want to change
      @param prevName - (string) the funcName of all ExprApps you want to change
      @param defineExpr - (ExprDefineFunc) the define block being changed
    */
    function changeExprApp(appExpr, prevName, defineExpr){
	console.log('here');
	console.log(appExpr.funcName);
	console.log(prevName);
	if (appExpr.funcName === defineExpr.contract.funcName || appExpr.funcName === prevName){
	    appExpr.name = defineExpr.contract.funcName;
	    appExpr.outputType = defineExpr.contract.outputType;
	    var newFuncIDList = [];
	    for (var j = 0; j < defineExpr.contract.argumentTypes.length; j++){
		newFuncIDList.push(makeID());
	    }
	    console.log(newFuncIDList);
	    appExpr.funcIDList = newFuncIDList;
	} 
	else {
	    for (var i = 0; i < appExpr.args.length; i++){
		if (appExpr.args[i] != undefined){
		    changeExprApp(appExpr.arg[i], prevName, newName, newOutputType);
		}
	    }
	}
    }

    /*
      removeFunctionFromDrawers removes the given function from the drawers and from the userFunctions array
    */
    function removeFunctionFromDrawers(defineExpr) {
	var func = getFunction(defineExpr.id)
	if(func != undefined){
	    userFunctions.splice(userFunctions.indexOf(func), 1);
	}
	buildFuncConstructs();
	renderProgram();
    }

    /*
      addFunctionToDrawers adds the given function to the drawers and to the funcion array

      @defineExpr - an ExprDefineFunc that you are thinking of adding
    */
    function addFunctionToDrawers(defineExpr){
	var func = getFunction(defineExpr.id)
	var isNew = false;
	if (func === undefined){
	    isNew = true;
	}

	//create new function
	func = createFunction(defineExpr, func)
	
	//update functions
	if (isNew) {
	    userFunctions.push(func);
	}

	buildFuncConstructs();

	//update drawer GUI
	renderProgram();
    }

    /*
      getFunction returns the function associated with the ID, else returns undefined
    */

    function getFunction(functionID) {

	for(var i = 0; i < userFunctions.length; i++) {
	    if (userFunctions[i].id === functionID) {
		return userFunctions[i];
	    }
	}
	return undefined;

    }

    /*
      createFunction creates a new function for a given define block or it edits a currently 
      existing function

      @param defineExpr - (ExprDefineFunc) the block you are trying to make a function for
      @return an object that can be pushed onto the fucntions array
    */
    function createFunction(defineExpr, newFunc) {
	if (newFunc === undefined){
	    newFunc = {};
	} 
	newFunc.name = defineExpr.contract.funcName;
	newFunc.output = defineExpr.contract.outputType;
	var newInput = [];
	for (var i = 0; i < defineExpr.contract.argumentTypes.length; i++){
	    var newName = defineExpr.argumentNames[i];
	    console.log(newName);
	    if (newName === "") {
		newName = "Expr" 
	    } 
	    newInput.push({type: defineExpr.contract.argumentTypes[i], name: newName});
	}
	newFunc.input = newInput;
	newFunc.id = defineExpr.id
	return newFunc;
    }

    /*
      legalFunctionName checks to see whether a name is a valid fucntion name

      @param name - (string) the name of your function
      @return boolean - true if the name is valid, false otherwise
    */
    function legalFunctionName(name){
	//lambda, map, etc.
	for(var i = 0; i < restricted.length; i++){
            if(name === restricted[i])
		return false;
	}
	//already defined functions
	var allFunctions = functions.concat(userFunctions);
	for(var i = 0; i < allFunctions.length; i++){
	    if (name === allFunctions.name){
		return false;
	    }
	}
	//illegal characters
	if(name.indexOf(" ") !== -1 ||
	   name.indexOf("\"") !== -1 ||
	   name.indexOf("(") !== -1 ||
	   name.indexOf(")") !== -1 ||
	   name.indexOf("[") !== -1 ||
	   name.indexOf("]") !== -1 ||
	   name.indexOf("{") !== -1 ||
	   name.indexOf("}") !== -1 ||
	   name.indexOf(",") !== -1 ||
	   name.indexOf("'") !== -1 ||
	   name.indexOf("`") !== -1 ||
	   name.indexOf(";") !== -1 ||
	   name.indexOf("|") !== -1 ||
	   name.indexOf("\\") !== -1 ||
	   (!isNaN(name))){
    	    return false;
	}
	return true;
    }

    /*
      contractCompleted determines whether or not the given contract is completed

      @param contractExpr - (ExprContract) the contract block you are checking
      @return boolean. True if the contractExpr's contract is completed, false otherwise
    */
    function contractCompleted(contractExpr) {
	if (contractExpr.funcName !== "" && contractExpr.outputType !== undefined && contractExpr.argumentTypes.length === contractExpr.funcIDList.length - 1){
	    return !contains(undefined, contractExpr.argumentTypes);
	} else {
	    return false;
	}
    }

    /*
      Gets the output type of a function
    */
    function getOutput(funcname){
	var allFunctions = functions.concat(userFunctions);
	var index=containsName(allFunctions,funcname);
	if(index!==-1){
            return allFunctions[index].output;
	}
    }

    /*
      Given the text within the options span, returns the code object associated with it.
    */
    function makeCodeFromOptions(optionsText){
	var i;
	if(optionsText === "define-function"){
            return new ExprDefineFunc();
	} else if (optionsText === "define-constant"){
            return new ExprDefineConst();
	} else if (optionsText === "cond"){
            return new ExprCond([new ExprBoolAnswer()]);
	} 
	else if(optionsText==="true" || optionsText==="false"){
            return new ExprBoolean(optionsText);
	}
	else if(optionsText==="Text"){
            return new ExprString();
	}
	else if(optionsText==="Number"){
            return new ExprNumber();
	}
	else if(optionsText==="define-struct"){
            //todo
            return;
	}
	else{
	    var allFunctions = functions.concat(userFunctions);
            for(i = 0; i < allFunctions.length; i++){
		if (allFunctions[i].name === optionsText){
                    return new ExprApp(optionsText);
		}
            }
            for(i=0;i<constants.length;i++){
		if (constants[i].name === optionsText){
                    return new ExprConst(optionsText);
		}
            }
            throw new Error("makeCodeFromOptions: internal error");
	}
    }

    /*
      createBlock takes in a code object and outputs the corresponding DOMElement block to that function
      createBlock: code object -> element
    */
    function createBlock(codeObject,constantEnvironment,functionEnvironment){
	var i;
	/* if(codeObject instanceof ExprDefineFunc){
	   var newConstantEnvironment=constantEnvironment.concat(createNewConstants(codeObject));
	   return createDefineBlock(codeObject,newConstantEnvironment,functionEnvironment);
	   } else if (codeObject instanceof ExprDefineConst){
	   return createDefineVarBlock(codeObject,constantEnvironment,functionEnvironment);
	   }/* else if (codeObject instanceof ExprDefineStruct){
	   return stringToElement(createDefineStructBlock());
	   }
	   else*/ if (codeObject instanceof ExprCond){
	       return createCondBlock(codeObject,constantEnvironment,functionEnvironment);
	   } else if (codeObject instanceof ExprConst){
	       for(i = 0; i < constantEnvironment.length; i++){
		   if (encode(constantEnvironment[i].name) === encode(codeObject.constName)){
		       return createConstantBlock(codeObject,constantEnvironment,functionEnvironment);
		   }
	       }
	       throw new Error("createBlock: internal error with constants", codeObject);
	   } else if (codeObject instanceof ExprApp){
	       for(i = 0; i < functionEnvironment.length; i++){
		   if (encode(functionEnvironment[i].name) === encode(codeObject.funcName)){
		       return createFunctionBlock(functionEnvironment[i], codeObject,constantEnvironment,functionEnvironment);
		   }
	       }
	       throw new Error("createBlock: internal error with apps", codeObject);
	   } else if (codeObject instanceof ExprNumber){
	       return createNumBlock(codeObject,constantEnvironment,functionEnvironment);
	   } else if (codeObject instanceof ExprString){
	       return createStringBlock(codeObject,constantEnvironment,functionEnvironment);
	   } else if (codeObject instanceof ExprBoolean){
	       return createBooleanBlock(codeObject,constantEnvironment,functionEnvironment);
	   }
	
    }

    function createNewConstants(codeObject){

	var newConstants=[];
	for(var i=1;i<codeObject.argumentNames.length;i++){
            newConstants.push({name:codeObject.argumentNames[i],type:codeObject.contract.argumentTypes[i - 1]});
	}
	return newConstants;
    }


    /*  createFunctionBlock takes as input a functionIndex and will output an HTML element corresponding to 
	that function with name, color, and spaces for input blocks
	createFunctionBlock: number -> string
    */
    function createFunctionBlock(functionInfo, codeObject, constantEnvironment,functionEnvironment){
	var block = "<table class=\"expr " + functionInfo.output  +"\"" + " id=\""+codeObject.id+"\" border>";
	block += "<tr><th colspan=\"" + functionInfo.input.length  + "\">" + encode(functionInfo.name) + "</th></tr><tr>";
	var i;
	for(i = 0; i < functionInfo.input.length; i++){
            if (codeObject.args[i] != undefined){
		block += "<th name=\""+functionInfo.input[i].name+"\" class=\"" + encode(functionInfo.input[i].type) +" noborder droppable\" id=\""+codeObject.funcIDList[i]+"\">" + createBlock(codeObject.args[i],constantEnvironment,functionEnvironment);
            }
            else{
		block+= "<th name=\""+functionInfo.input[i].name+"\" class=\"" + encode(functionInfo.input[i].type) +" droppable\" id=\""+codeObject.funcIDList[i]+"\">" + functionInfo.input[i].name;
            }
            block+="</th>";
	}

	return block + "</tr></table>";
    }
    /*

    //createDefineVarBlock outputs the block corresponding to creating a variable
    function createDefineVarBlock(codeObject,constantEnvironment,functionEnvironment){

    var block = "<table class=\"DefineVar Define\" " + "id=\""+codeObject.id+"\"><tr><th>define</th>";
    block+="<th class=\"expr\"><input onkeyup=\"sync("+codeObject.id+")\" class=\"constName\"";
    if(codeObject.constName != undefined){
    block+=" value=\""+encode(codeObject.constName)+"\"";
    }
    block+="><th  id=\"" + codeObject.funcIDList[0] + "\" name=\"Expression\" class=\"expr droppable";
    if (codeObject.expr == undefined){
    block+= "\"> Expression";
    } else{
    block += " noborder\">" + createBlock(codeObject.expr,constantEnvironment,functionEnvironment);
    }
    return block + "</th></tr></table>";
    }

    */
    //createCondBlock outputs the block corresponding to creating a conditional
    //add stuff to make empty work and have new rows append to ExprCond
    function createCondBlock(codeObject,constantEnvironment,functionEnvironment){

	var block =  "<table class=\"Cond expr Expressions\" " + "id=\""+codeObject.id+"\"><tr><th style=\"float:left\">cond</th></tr>";
	for(var i=0;i<codeObject.listOfBooleanAnswer.length;i++){
            block+="<tr class=\"BoolAnswer\"><th><table class=\"noDrag\" id=\"" + codeObject.listOfBooleanAnswer[i].id + "\"></th>";
            if(codeObject.listOfBooleanAnswer.length!==1){
		block+="<th><button class=\"removeCond\">x</button></th>";
            }      
            if(codeObject.listOfBooleanAnswer[i].bool!=undefined){
		block+="<th id=\"" + codeObject.listOfBooleanAnswer[i].funcIDList[0] + "\" class=\"noborder droppable Booleans expr\" name=\"Boolean\">";
		block+=createBlock(codeObject.listOfBooleanAnswer[i].bool,constantEnvironment,functionEnvironment);
		block+="</th>";
            }
            else{
		block+="<th id=\"" + codeObject.listOfBooleanAnswer[i].funcIDList[0] + "\" class=\"droppable Booleans expr\"  name=\"Boolean\">Boolean</th>";
            }
            if(codeObject.listOfBooleanAnswer[i].answer!=undefined){
		block+="<th id=\"" + codeObject.listOfBooleanAnswer[i].funcIDList[1] + "\" class=\"noborder droppable expr\"  name=\"Expression\">";
		block+=createBlock(codeObject.listOfBooleanAnswer[i].answer,constantEnvironment,functionEnvironment);
            }
            else{
		block+="<th id=\"" + codeObject.listOfBooleanAnswer[i].funcIDList[1] + "\" class=\"droppable expr\"  name=\"Expression\">Expression";
            }
            block+="</table></th></tr>";
	}
	block +="<tr><th></th><th><button class=\"addCond\">+</button></th></tr>";
	return block + "</table>";
    }

    function createConstantBlock(codeObject,constantEnvironment,functionEnvironment){
	var block =  "<table class=\"expr ConstBlock " + encode(codeObject.outputType)+"\" id=\""+codeObject.id+"\"><tr><th>"+encode(codeObject.constName)+"</tr>";
	return block + "</table>";
    }

    function createBooleanBlock(codeObject,constantEnvironment,functionEnvironment){
	var block =  "<table class=\"Booleans BoolBlock expr\" " + "id=\""+codeObject.id+"\"><tr><th>"+codeObject.value+"</tr>";
	return block + "</table>";
    }

    function createNumBlock(codeObject,constantEnvironment,functionEnvironment){
	var block =  "<table class=\"Numbers expr\" " + "id=\""+codeObject.id+"\" width=\"10px\"><tr><th><input class=\"input Numbers\" onkeyup=\"sync("+codeObject.id+", $(this))\" style=\"width:50px;\"";
	block+=" value=\""+codeObject.value+"\">";
	return block + "</th></tr></table>";
    }

    function createStringBlock(codeObject,constantEnvironment,functionEnvironment){
	var block =  "<table class=\"Strings expr\" " + "id=\""+codeObject.id+"\"><tr><th>\"</th><th><input class=\"input Strings\" onkeyup=\"sync("+codeObject.id+", $(this))\" class=\"Strings\"";
	block += " value=\"" + encode(codeObject.value) + "\">";
	return block + "</th><th>\"</th></tr></table>";
    }

    function stringToElement(string){
	var wrapper= document.createElement('div');
	wrapper.innerHTML=string;
	return wrapper.firstChild;
    }

    /*
      Creates a drop menu for use in the contract in order to select types.

      @param newID is a string representing the id the funcIDList of a contract. 0 represents the output type.
      Positive integers represent arguments
      @param codeObject is the ExprDefineFunc we are working with

      @return void. manipulates HTML DOM elements.
    */
    function generateTypeDrop(newID,codeObject){

	var HTML = "<select id=\""+newID+"\" name=\"TypeDrop\" onchange=\"changeType(this.value,"+newID+","+codeObject.id+")\"><option value=\"Type\">Type</option>";
	var typeIndex=codeObject.contract.funcIDList.indexOf(newID)-1;
	for(var i=0;i<types.length;i++){
            HTML+="<option value=\""+ encode(types[i]) +"\" class=\""+ encode(types[i])+"\"";
            if(typeIndex===-1){
		if(codeObject.contract.outputType==types[i]){
                    HTML+=" selected ";
		}
            }
            else{
		if(codeObject.contract.argumentTypes[typeIndex]==types[i]){
                    HTML+=" selected ";
		}
            }
            HTML+=">"+ encode(types[i]) +"</option>";
	}
	HTML+="</select>";
	/*    HTML+= (typeIndex!==-1 && codeObject.contract.funcIDList.length !== 2) ? "<button class=\"deleteArg\" onclick=\"deleteArg("+newID+","+codeObject.id+")\">x</button>" : "";*/
	return HTML;
    }

    /*
      changeType links the contract with the arguments in the actual define block

      @param curValue - (string) the type that was selected by the user within the contract
      @param selectID - (string)the ID of the code object representing the drop-down for selecting
      types within the contract
      @param codeObjectID - (string) ID of the code object representing the define block
    */
    function changeType(curValue,selectID,defineExprID){
	selectID+="";
	$("#" + selectID + " option[value='Type']").attr('disabled','disabled');
	var defineExpr=searchForIndex(defineExprID+"",functionProgram  ); 

	var funcIDIndex = getElmIndexInArray(selectID, defineExpr.contract.funcIDList);
	var argBlockID = defineExpr.funcIDList[funcIDIndex];

	//modifiedblock refers to the GUI element whose background color will change
	var modifiedblock =  $("#" + argBlockID).closest('th');
	
	if (modifiedblock != undefined){
	    deleteTypeClass(modifiedblock);
	    if(curValue !== "Type"){
		modifiedblock.addClass(decode(curValue));
		$("#" + selectID).css('background-color','');
		if (funcIDIndex !==0){ //arg is typeable
		    $(modifiedblock).find('input').attr('disabled',false);
		}
	    }
	    else { //remove typeable from arg
		$(modifiedblock).find('input').attr('disabled', true);
	    }

	} else {
	    throw new Error('changeType: modifiedblock is not defined')
	}

	//modifying the contract (code object representation)n
	for(var i=0; i<defineExpr.contract.funcIDList.length; i++){
	    addToHistory(cloneProgram(program), cloneProgram(storageProgram));
            if(selectID===defineExpr.contract.funcIDList[i] && i!==0){
		if (curValue === "Type"){
		    defineExpr.contract.argumentTypes[i-1] = undefined;
		} else { 
		    defineExpr.contract.argumentTypes[i-1]= curValue;
		}
            }
            else if(selectID===defineExpr.contract.funcIDList[i] && i===0){
		if (curValue === "Type"){
		    defineExpr.contract.outputType= undefined;
		} else {
		    defineExpr.contract.outputType = curValue;
		}
            }
	}
	toggleFunctionInDrawer(defineExpr, $("#" +defineExprID).find('.definitionName').attr('prevName'));
    }

    //adds draggable within define expressions
    function addDraggableToDefineExpr($table) {
	$table.draggable({
	    helper:'clone',
	    start:function(event, ui){
		draggedClone = $(this);
		programCarrying = searchForIndex($(this).attr("id"), functionProgram  );
		carrying = getHTML($(this));
		ui.helper.addClass("wired");
		setChildInProgram($(this).closest($("th")).closest($("table")).attr("id"), $(this).attr("id"), undefined,functionProgram  );
	    },
	    stop:function(event, ui){
		if (programCarrying != null && carrying != null){
		    console.log('here');
		    setChildInProgram($(this).closest($("th")).closest($("table")).attr("id"), $(this).closest('th').attr("id"), programCarrying, functionProgram  );
		    programCarrying = null;
		    carrying = null;
		}
	    }
	});
    }

    //adds droppable to define expressions
    function addDroppableToDefineExpr(defineExpr) {
	$(defineExpr).droppable({
	    tolerance:'pointer',
	    greedy:true,
            hoverClass:"highlighted",
	    drop:function(event, ui) {
		var outputSelect = $(this).closest('.DefineFun').find('tr').eq(1).find('th').last().find('select');
		if (carrying != null && programCarrying != null && $(this).children().length === 0 && outputSelect.val() !== 'Type'){
		    $(this).html(carrying);
		    var defineCode = searchForIndex($(this).closest('.DefineFun').attr('id'), functionProgram  );
		    defineCode.expr = programCarrying;

		    //make things within droppable
		    $(this).find('.droppable').each(function () {
			addDroppableWithinDefineExpr($(this));
		    });

		    //make things within draggable
		    $(this).find('table').each(function(){
			addDraggableToDefineExpr($(this));
		    });

		    carrying = null;
		    programCarrying = null;

		} else if (outputSelect.val() === 'Type'){
		    if(outputSelect.val() === 'Type'){
			outputSelect.css('background-color','red');
		    }
		    $(ui.helper).remove();

		    carrying = null;
		    programCarrying = null;
		}
	    }
	});
    }

    //adds droppable to things within define expressions
    function addDroppableWithinDefineExpr(jQuerySelection){
	$(jQuerySelection).mousedown(function(e) {
	    if (e.which === 1){
		addClickableLiteralBox($(this), $(this).closest($("table")).attr("id"),$(this).attr("id"), functionProgram  );
	    }
	});

	$(jQuerySelection).droppable({
	    tolerance:'pointer',
	    greedy:true,
            hoverClass:"highlighted",
	    drop:function(event, ui){
		if (carrying != null && programCarrying != null && $(this).children().length === 0){
		    $(this).html(carrying);
		    setChildInProgram($(this).closest($("table")).attr("id"),$(this).attr("id"),programCarrying,functionProgram  );
		    $(this).css('border','none');
		    $(this).find('.droppable').each(function() {
			addDroppableWithinDefineExpr($(this));
		    });
		    $(this).find('table').each(function() {
			addDraggableToDefineExpr($(this));
		    });
		    if (ui.draggable.parentsUntil('.definePopup').parent().first().hasClass('definePopup') && !ui.draggable.hasClass('argument')){

			eliminateBorder($(ui.draggable).closest('th'));
		    }
		    programCarrying = null;
		    carrying = null;
		}
	    }
	});
    }


    /*
      getElmIndexInArray gets the index of elm within the array arr

      @param elm - an element within arr
      @param arr - an array of the type of elm
      @return int - (integer) the index of the elm within the array
    */
    function getElmIndexInArray(elm, arr) {
	for (var i = 0; i < arr.length; i++){
	    if (arr[i] === elm){
 		return i;
	    }
	}
	return -1;
    }

    /*
      deleteTypeClass deletes classes that correspond to a type

      @param jQueryElm - a jQuery selector that contains the classes you want to edit
      @return void. changes jQuery selector
    */
    function deleteTypeClass(jQueryElm) {
	for (var type in colors) {
	    if (jQueryElm.hasClass(type)){
		jQueryElm.removeClass(type);
	    }
	}
    }


    /*
      deleteArg deletes arguments from the contract part of the define block

      @param selectID - a string that is the ID of the selection box
      @param codeObjectID - a string that is the ID of the define block that selectID is contained within
    */
    function deleteArg(selectID,codeObjectID) {
	selectID+="";
	var codeObject=searchForIndex(codeObjectID+"",functionProgram);

	//updateGUI
	var selectIndex = getElmIndexInArray(selectID, codeObject.contract.funcIDList);
	var argBlockID = codeObject.funcIDList[selectIndex];
	var toDeleteBlock = $("#" + argBlockID).closest('th');
	var toDeleteTh = toDeleteBlock.next('th');
	toDeleteBlock.remove();
	toDeleteTh.remove();


	//update contractGUI
	var buttons = $("#" + selectID).closest('th').next();
	buttons.remove();
	$("#" + selectID).closest('th').remove();

	//resize purpose and expression
	var purposeTH = $("#" + codeObjectID).find('.contractPurpose').closest('th');
	purposeTH.attr('colspan', parseInt(purposeTH.attr('colspan')) - 3);
	var exprTH = $('#' + codeObjectID).find('.functionExpr');
	exprTH.attr('colspan',parseInt(exprTH.attr('colspan')) - 3);

	//update codeObject
	if(codeObject.contract.funcIDList.length>2){
            for(var i=0;i<codeObject.contract.funcIDList.length;i++){
		if(selectID===codeObject.contract.funcIDList[i] && i!==0){
                    addToHistory(cloneProgram(program), cloneProgram(storageProgram));
                    codeObject.argumentNames.splice(i-1,1);
                    codeObject.funcIDList.splice(i,1);
                    codeObject.contract.argumentTypes.splice(i-1,1);
                    codeObject.contract.funcIDList.splice(i,1);
		}
            }      
	}

	toggleDeleteButtons(codeObject.funcIDList, codeObject.id, undefined);
	toggleFunctionInDrawer(codeObject);
    }


    /*====================================================================================
      ___     _                        _           
      |_ _|_ _| |_ ___ _ _ _ __ _ _ ___| |_ ___ _ _ 
      | || ' \  _/ -_) '_| '_ \ '_/ -_)  _/ -_) '_|
      |___|_||_\__\___|_| | .__/_| \___|\__\___|_|  
      |_|                       
      =====================================================================================*/

    /*
      parseProgram takes in the entire program array and runs it through the interpreter
    */
    function parseProgram(){
	var racketCode="";
	for(i=0;i<functionProgram.length;i++){
	    racketCode+=interpreter(functionProgram[i])+"\n";
	}
	for(var i=0;i<program.length;i++){
            racketCode+=interpreter(program[i])+"\n";
	}
	return racketCode;
    }

    /*
      The interpreter translates our representation of the program array to Racket code
    */
    function interpreter(obj){
	var toReturn = [];
	var i;
	if(obj == undefined){
            toReturn.push("**UNDEFINED**");
	}else if(obj instanceof ExprDefineConst){
            toReturn.push("(define ", obj.constName, " \n", interpreter(obj.expr), ")");
	}else if(obj instanceof ExprDefineFunc){
            toReturn.push(";", obj.contract.funcName, ":");
            for(i = 0; i < obj.contract.argumentTypes.length; i++){
		toReturn.push(" ", obj.contract.argumentTypes[i]);
            }
            toReturn.push(" -> ", obj.contract.outputType, "\n");
            toReturn.push("(define (", obj.contract.funcName);
            for(i = 0; i < obj.argumentNames.length; i++){
		toReturn.push(" ", obj.argumentNames[i]);
            }
            toReturn.push(")\n", interpreter(obj.expr), ")");
	}else if(obj instanceof ExprApp){
            toReturn.push("(", decode(obj.funcName));
            for(i=0; i < obj.args.length; i++){    
		toReturn.push(" ", interpreter(obj.args[i]));
            }
            toReturn.push(")");
	}else if(obj instanceof ExprNumber || obj instanceof ExprBoolean){
            toReturn.push(obj.value);
	}else if(obj instanceof ExprString){
            toReturn.push("\"", decode(obj.value), "\"");
	}else if(obj instanceof ExprConst){
            toReturn.push(decode(obj.constName));
	}else if(obj instanceof ExprCond){
            toReturn.push("(cond");
            for(i = 0; i < obj.listOfBooleanAnswer.length; i++){
		toReturn.push("\n[", interpreter(obj.listOfBooleanAnswer[i].bool), " ", interpreter(obj.listOfBooleanAnswer[i].answer), "]");
            }
            toReturn.push(")");
	}
	return toReturn.join('');
    }


    /*====================================================================================
      ___                  __       ___               
      |   \ _ _ __ _ __ _  / _|___  |   \ _ _ ___ _ __ 
      | |) | '_/ _` / _` | > _|_ _| | |) | '_/ _ \ '_ \
      |___/|_| \__,_\__, | \_____|  |___/|_| \___/ .__/
      |___/                        |_|
      =====================================================================================*/

    //What is currently being carried. Type: DOM
    var carrying = undefined;

    //Similar to the variable carrying, except that is stores the corresponding program object
    var programCarrying = undefined;

    /*
      droppedInDroppableFromList is true if an object is dropped in a droppable from #List, false otherwise. Depending on whether or not an an object is
      droppedInDroppableFromList, the stop function in #List's sortable will behave differently. This is important for updating
      our model of the user's code.
    */
    var droppedInDroppableFromList = false;

    /*
      Stores the current state of the program that will later be added to historyarr
    */
    var tempProgram = undefined;

    /*
      Stores the current state of the storage that will later be added to historyaarr
    */
    var tempStorageProgram = undefined;

    /*
      Adds draggable to blocks that are inserted within blocks such as the inner blocks can be moved out of
      the outer block and into the sortable list
    */
    var draggedClone = undefined;

    // .draggable is referring to the options within the drawers
    // .sortable is referring to the list containing the blocks within the program
    // .droppable is referring to things within the table that need to be filled and are yet to be actual expressions <e.g. (+ exp1 exp2)>

    $(function() {


	//implements sortability for the program block
	$("#List").sortable({
            placeholder:'placeholder',
            tolerance:'pointer',
            scroll:true,
	    appendTo:'body',
	    helper:'clone',
            start: function(event, ui){
              removeOutputs();
		if (ui.item === null){
                    throw new Error("sortable start: ui.item is undefined");
		} else {
                    if (ui.item.is('li')){
			if(!errorVal){
                            tempProgram = cloneProgram(program);
                            carrying = ui.item.html();
                            var index = ui.item.index();
                            ui.helper.addClass("wired");
                            ui.helper=$(carrying).clone().addClass("wired");
                            ui.helper.addClass("ui-sortable-helper");
                            programCarrying = program[index];
                            program.splice(index, 1);
                            return ui.helper
			}
			else{
                            event.stopPropagation();
                            event.stopImmediatePropagation();
                            event.preventDefault();
                            $("#List li").each(function(){
				$(this).sortable('cancel');
				$(this).draggable('cancel');
                            });
                            return false;
			}
                    } 
		}
            },
            // helper: function(event,ui){
            //             if (ui.item === null){
            //         throw new Error("sortable start: ui.item is undefined");
            // } else {
            //         $(carrying).addClass("wired")
            //         return $(carrying);
            // }},
            stop: function(event, ui) {
		if (carrying != undefined && programCarrying !=undefined){
                    var replacement = $('<li>').append(carrying);
                    addDroppableFeature(replacement.find(('.droppable')));
                    ui.item.replaceWith(replacement);
                    setLiWidth($("#List li"));
		    if (!droppedInDroppableFromList){
			program.splice(replacement.index(), 0, programCarrying);
                    }
		    addToHistory(tempProgram, cloneProgram(storageProgram));
                    droppedInDroppableFromList = false;
                    programCarrying = null;
                    carrying = null;

		} else {
		    $(ui.item).remove();
		}
		typeCheck(program);
            },
            receive:function(event,ui){
		if(ui.item === null){
                    throw new Error ("sortable receive");
		}else{
		    if ( ui.sender.attr('id') === "actualStorage"){
			var replacement = $('<li>').append(carrying);
			addDroppableFeature(replacement.find(('.droppable')));
			ui.item.replaceWith(replacement);
			$(replacement).find('input').attr('readonly', false);
			setLiWidth($("#List li"));
			program.splice($("#List li").index(replacement), 0, programCarrying);
			$("#storage").html('Storage (' + storageProgram.length + ')');
			addToHistory(tempProgram, tempStorageProgram);
			programCarrying = null;
			carrying = null;
         	    }
                    else if (!ui.item.is('span.draggable')){
			eliminateBorder(ui.sender.parent().parent());
                    }
		}
            }
	});



	$('.definePopup').draggable();
    });

    function addUItoStorage() {
	addSortableToStorage();
	addDraggableToStorage();
	addDroppableToStorage();
    }

    function addSortableToStorage() {

	$("#actualStorage").sortable({
	    //containment:'parent',
	    connectWith: '#List',
	    appendTo:'body',
	    helper:'clone',
	    start:function(event, ui) {
        removeOutputs();
		tempStorageProgram = cloneProgram(storageProgram);
		carrying = ui.item.html();
		ui.helper.addClass("wired");
		programCarrying = storageProgram[$("#actualStorage li").index(ui.item)];
		storageProgram.splice($("#actualStorage li").index(ui.item), 1);
		tempProgram = cloneProgram(program);
	    },
	    stop: function(event, ui){
		if (carrying != null && programCarrying != null){
		    if ($(ui.item).closest('div').attr('id') === 'actualStorage'){
			storageProgram.splice($("#actualStorage li").index(ui.item), 0, programCarrying);
		    }
		    carrying = null;
		    programCarrying = null;
		}
		else{
		    ui.item.remove();
		}
	    },
	    receive:function(event, ui){
		addToHistory(tempProgram, cloneProgram(storageProgram));
		storageProgram.splice($(ui.item).index(), 0, programCarrying);
		carrying = null;
		programCarrying = null;
	    }
	});
    }

    function addDraggableToStorage(){
	$("#storagePopup").draggable({
            start:function(event,ui){
		tempProgram=cloneProgram(program);
		tempStorageProgram=cloneProgram(storageProgram);
            }
	});
    }

    function addDroppableToStorage() {

	$("#storage").droppable({
	    tolerance:'pointer',
	    drop:function(event, ui) {
		if (!$(ui.draggable).is('.draggable')){
      typeCheck(program);
		    var replacement = "<li>" + carrying + "</li>";
		    addToHistory(tempProgram,cloneProgram(storage));
		    $("#actualStorage").append(replacement);
		    removeFromStorageOnClick($("#actualStorage li:last"), carrying, programCarrying);
		    storageProgram.push(programCarrying);
		    if (draggedClone != undefined){
			eliminateBorder(draggedClone.closest($("th")));
			draggedClone = undefined;
		    }
		    $(ui.draggable).remove();
		    setLiWidth($("#actualStorage li"));
		    $("#storage").html("Storage (" + storageProgram.length + ")");
		    carrying = null;
		    programCarrying = null;
		}
	    }
	});
    }



    /*var shrink  = function(jQuerySelection) {
      console.log($(jQuerySelection.width()));
      if ($(jQuerySelection).width() > 190){
      var percentage = 190/$(jQuerySelection).width();
      $(jQuerySelection).find("*").each(function(){
      $(this).css("font-size", (parseInt($(this).css("font-size")) * percentage) + "px");
      $(this).width($(this).width() * percentage);
      });
      $(jQuerySelection).width(190);
      $(jQuerySelection).find('table').each(function(){
      $(this).width($(this).width() * percentage);
      console.log($(this).width());
      $(this).find('input').each(function(){
      $(this).width($(this).width() * percentage);
      });
      });
      }
      console.log(jQuerySelection);
      return jQuerySelection;
      };*/

    var makeDrawersDraggable = function(){

	//Exprs things draggable from the drawer to the code
	$('.draggable').draggable({
            start: function(event, ui) {
              removeOutputs();
		if(!errorVal){
                    tempProgram = cloneProgram(program);
		}
		else{
                    event.stopPropagation();
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    return false;
		}
            },
            stop: function(event,ui){
		typeCheck(program);
            },
            helper: function(event, ui){
		programCarrying = makeCodeFromOptions($(this).text());
		carrying = createBlock(programCarrying,constants,functions.concat(userFunctions));
		var carryingClass=$(createBlock(programCarrying,constants,functions.concat(userFunctions))).addClass("wired")
		return carryingClass;
            },
            connectToSortable: "#List",
	    zIndex:999
	});
    };

    /*
      Adds draggable feature to a single argument (jQuerySelection) in defines blocks

      @param jQuerySelection - a $ of what you want to drag
      @param functionCodeObject is the function from which the argument originates
      @param dropDownID - (string) ID of the dropdown connected to the argument
    */
    var addDraggableToArgument=function(jQuerySelection,functionCodeObject, dropDownID){
	if (jQuerySelection != null){
	    $(jQuerySelection).draggable({
		containment: $("#" + functionCodeObject.id),
		connectToSortable:'#options',
		appendTo:'body',
		start: function(event, ui) {
		    if(!errorVal){
			tempProgram = cloneProgram(program);
			ui.helper.addClass("wired");
                    }
                    else{
			event.stopPropagation();
			event.preventDefault();
			event.stopImmediatePropagation();
			return false;
                    }
		},
		helper: function(event, ui){
		    programCarrying= new ExprConst($(this).find('input').val());
                    programCarrying.outputType=$("#" + dropDownID).val();
		    carrying = createBlock(programCarrying, constants.concat(createNewConstants(functionCodeObject)), functions.concat(userFunctions));
		    return carrying;
		}
	    });
	} else {
	    throw new Error("addDraggableToArgument: jQuerySelection is null");
	}
    };

    /*
      Adds dragging feature to jQuerySelection. This is applied to blocks within blocks.
    */
    var addDraggingFeature = function(jQuerySelection) {
	if (jQuerySelection !== null){
            if(!jQuerySelection.hasClass('noDrag')){
		jQuerySelection.draggable({
		    connectToSortable: "#List",
		    appendTo:'body',
                    helper:'clone',
                    start:function(event, ui){
                      removeOutputs();
			if ($(this) === undefined){
                            throw new Error ("addDraggingFeature start: $(this) is undefined");
			} else {
                            if(!errorVal){
				tempProgram = cloneProgram(program);
				draggedClone = $(this);
				programCarrying = searchForIndex($(this).attr("id"), program);
				carrying = getHTML($(this));
				ui.helper.addClass("wired");
				setChildInProgram($(this).closest($("th")).closest($("table")).attr("id"), $(this).attr("id"), undefined,program);
                            }
                            else{
				event.stopPropagation();
				event.preventDefault();
				event.stopImmediatePropagation();
				return false;
                            }
			}
                    },
                    stop:function(event, ui){
			if (programCarrying != undefined && carrying != undefined){
                            program = tempProgram;
                            renderProgram(createProgramHTML());
			}
                    }
		});
            }
	}
	
    };

    /*
      addDroppableFeature is a function that takes in a jQuery selector and applys droppable functionality
      to that selector. This is applied to empty blocks within blocks.
    */
    var addDroppableFeature = function(jQuerySelection) {
	if (jQuerySelection !== null){
            addDraggableToTable((jQuerySelection).find("table"));

	    //adds literal box upon click
	    jQuerySelection.mousedown(function(e) {
		if (e.which === 1){
		    addClickableLiteralBox($(this), $(this).closest($("table")).attr("id"),$(this).attr("id"), program);
		}
	    });
            jQuerySelection.droppable({
		tolerance:"pointer",
		greedy:true,
		over: function(event,ui){
		    if(programCarrying!=undefined && carrying!=undefined && $(this).children().length === 0){
			if(flattenAllFuncIDLists(programCarrying).indexOf($(this).attr("id"))===-1){
			    $(this).addClass("highlighted")
			}
		    }
		},
		out: function(event,ui){
		    $(this).removeClass("highlighted");
		},
		drop: function(event, ui){
                    if ($(this) === undefined){
			throw new Error ("addDroppableFeature drop: $(this) is undefined");
                    } 
                    else if($(this).children().length === 0){
			if($(ui.draggable).closest('div').attr('id') === 'code'){
			    droppedInDroppableFromList = true;
			}
			$(this).html(carrying);
			setChildInProgram($(this).closest($("table")).attr("id"),$(this).attr("id"),programCarrying, program);
			addDroppableFeature($(this).find('.droppable'));
			addDraggableToTable($(this).find("table"));
			$(this).css("border", "none");
			$(this).removeClass("highlighted");
			ui.draggable.detach();
			typeCheck(program);
                    }
		}
            });
	}
    };

    var addDraggableToTable = function (jQuerySelection){
	if(jQuerySelection !=undefined){
            jQuerySelection.each(function (){
		addDraggingFeature($(this));
            });
	}
    };

    function flattenAllFuncIDLists(programBlock){
	var ret=[]
	if(programBlock!=undefined && programBlock.funcIDList!=undefined){
	    ret=ret.concat(programBlock.funcIDList);
	    if(programBlock instanceof ExprApp && programBlock.args!=undefined){
		for(var i=0;i<programBlock.args.length;i++){
		    ret=ret.concat(flattenAllFuncIDLists(programBlock.args[i]))
		}
	    }
	    else if(programBlock instanceof ExprDefineFunc){
		ret=ret.concat(flattenAllFuncIDLists(programBlock.expr),programBlock.contract.funcIDList)
	    }
	    else if(programBlock instanceof ExprCond){
		for(var i=0;i<programBlock.listOfBooleanAnswer.length;i++){
		    ret=ret.concat(flattenAllFuncIDLists(programBlock.listOfBooleanAnswer[i]));
		}
	    }
	    else if(programBlock instanceof ExprBoolAnswer){
		return ret.concat(flattenAllFuncIDLists(programBlock.answer));
	    }

	}
	return ret;
    }


    /*
      constantIsArgument returns whether or not constant is an argument of $parentDefine

      @param constant - ExprConst representing the constant 
      @param $parentDefine - jQuery selection reprsenting the closest parenting Define function relative
      to constant

      @return boolean.
    */
    var constantIsArgument = function(constant, $parentDefine) {
	if (constant instanceof ExprConst && $parentDefine != undefined && constant != undefined) {
	    var parentArgs = searchForIndex($parentDefine.attr('id'),program).argumentNames;
	    for (var i = 0; i < parentArgs.length; i++){
		if (parentArgs[i] === constant.constName){
		    return true;
		}
	    }
	}
	return false;
    };

    /*
      addClickableLiteralBox creates a literal block when a blue or orange droppable is clicked
    */
    var addClickableLiteralBox = function(jQuerySelection, parent, child, prog){
	if (jQuerySelection.children().length === 0 && jQuerySelection.closest('div').attr('id') !== 'storage'){
	    if(jQuerySelection.hasClass("Numbers")){
		addClickableLiteralBoxHelper(jQuerySelection, new ExprNumber(), parent, child, prog);
	    }
	    else if (jQuerySelection.hasClass("Strings")){
		addClickableLiteralBoxHelper(jQuerySelection, new ExprString(), parent, child, prog);
	    }

	}
    };

    var addClickableLiteralBoxHelper = function(jQuerySelection, codeObject, parent, child, prog) {
	addToHistory(cloneProgram(program), cloneProgram(storageProgram));
	setChildInProgram(parent, child, codeObject, prog);
	var html = createBlock(codeObject,constants,functions.concat(userFunctions));
	$(jQuerySelection).css('border','none');
	jQuerySelection.html(html);
	var origin = jQuerySelection.closest('div');
	//console.log(origin);
	if (origin.hasClass('code')){
	    addDroppableFeature(jQuerySelection);
	}
	else if (origin.hasClass('definePopup')){
	    console.log(jQuerySelection);
	    jQuerySelection.find('table').each(function(){
		addDraggableToDefineExpr($(this));
	    });
	}
    };

    /*
      eliminateBorder takes in a jQuerySelection and returns nothing.
      It changes the jQuerySelection by adding a border and appending the word "Exp" inside the cell.
    */
    var eliminateBorder = function(jQuerySelection){
	jQuerySelection.attr('style','border:3px;'+
                             "border-style:solid;"+
                             "border-radius:10px;"+
                             "height:30px;" +
                             "width:40px;"+
                             "border-color:grey");
	jQuerySelection.children().detach();
	jQuerySelection.append(jQuerySelection.attr('name'));
	jQuerySelection.removeClass("highlighted");
    };

    /*
      Sets the width of list items such that they span only the width of its contents, rather 
      than the entire page
    */
    var setLiWidth = function(divContainer){
	$(divContainer).each(function() {
            $(this).width($(this).find("table").width() + 10);
	});
    };

    /*
      Makes the jQuerySelection into an HTMLDom element
    */
    var getHTML = function(jQuerySelection) {
	return $(jQuerySelection).wrap("<div>").parent().html();
    };

    /*
      Disable drop/drag functions on blocks within block
    */
    var disableDragDrop = function(jQuerySelection) {
	if (jQuerySelection != null){
	    $(jQuerySelection).find('.droppable').droppable("disable");
	    $(jQuerySelection).find('table').draggable('disable');
	    $(jQuerySelection).find('input').attr('readonly', true);
	} else {
	    throw new Error('disableDragDrop: jqueryselection is null');
	}
    };



    /*====================================================================================
      _____                 ___       __                         
      |_   _|  _ _ __  ___  |_ _|_ _  / _|___ _ _ ___ _ _  __ ___ 
      | || || | '_ \/ -_)  | || ' \|  _/ -_) '_/ -_) ' \/ _/ -_)
      |_| \_, | .__/\___| |___|_||_|_| \___|_| \___|_||_\__\___| 
      |__/|_|                                               
      =====================================================================================
      
      - evaluate expressions from top-down to get constraints
      - compare constraints against contracts
      - if we run into an inconsistency, we mark the id associated with that inconsistency and highlight it

    */
    var constraint = function(lhs, rhs, source){
	this.lhs = lhs;
	this.rhs = rhs;
	this.source = source;
    };
    /*
     *lhs/rhs can be elems or constructed
     *elem is an ID or a type or a makeVariable
     *Constructed(constructor, List(elem))
     */

    // new variable: string -> elem
    var variable = function(name){
	this.name = name;
    };


    /* Represents structured types in the type inference engine.
     * new construct: string (listof elem) -> elem
     *constructors:
     *             "func" -> function
     */
    var construct = function(constructor, elemList){
	this.constructor = constructor;
	this.elemList = elemList;
    };
    var elemId = function(id){
	this.id = id
    }
    var elemType = function(type){
	this.type = type;
    }
    var genType = function(){
	this.type = newGenType();
    }
    var currType = 0;
    function newGenType(){
	return currType++;
    }



    //to create errors with a handy dandy message
    var error = function(id, message){
	this.id = id;
	this.message = message;
    };
    var errorMatch = function(idArr, message){
	this.idArr = idArr;
	this.message = message;
    }


    //contains a mapping of function names to constraints
    var funcConstruct = {};
    //build funcConstraint
    function buildFuncConstructs(){
	var elemList = [];
	var allFunctions = functions.concat(userFunctions);
	for(var i=0; i<allFunctions.length; i++){
            elemList = [];
            elemList = elemList.concat([new elemType(allFunctions[i].output)]);
            for(var k = 0; k<allFunctions[i].input.length; k++){
		elemList = elemList.concat([new elemType(allFunctions[i].input[k].type)]);
            }
            funcConstruct[allFunctions[i].name] = new construct("func", elemList);
	}
    }
    //must be built every time buildConstraints is called!
    //or whenever a new function is added
    buildFuncConstructs();


    //obj - the object being inferred upon
    //          if lambdas or lets, use concat procedure to create a new array and avoid mutation which would screw everything
    //parentId is the id from the parent's funcIDList that points to the current object

    //change push to con cat
    //if concat becomes too expensive, switch to push


    //types = constraint of id to type (ignore constraints involving constructs)
    //typeErrors = matchError(array of ids, error message)
    //blankErrors = error(id, message)
    function typeInfer(obj){
	var step1 = buildConstraints(obj);
	var step2 = unify(step1.constraints, step1.literals);
	var step3 = buildTypeErrors(step2.errors, obj);
	return {types: step2.subst,
		typeErrors: step3,
		blankErrors: step1.errors};
    }

    /*removeErrorMessages will, starting at a parent selection, recursively remove all messages and highliting from itself and its children*/
    function removeErrorMessages(jQuerySelection){
	if(Modernizr.touch){
	    if(jQuerySelection.hasClass("ERROR")){
		jQuerySelection.unbind("click");
	    }
	}
	jQuerySelection.attr("title","");
	jQuerySelection.removeClass("ERROR");
    }

    function typeCheck(ArrayofBlocks){
	for(var i=0;i<ArrayofBlocks.length;i++){
            var blockTypeInfer=typeInfer(ArrayofBlocks[i])
            //NEED TO FIX THIS
            removeErrorMessages($(document.getElementById(ArrayofBlocks[i].id)));
            removeInferTypes($(document.getElementById(ArrayofBlocks[i].id)), ArrayofBlocks);
            $(document.getElementById(ArrayofBlocks[i].id)).find("table").each(function(){removeErrorMessages($(this), ArrayofBlocks)});
            $(document.getElementById(ArrayofBlocks[i].id)).find("table").each(function(){removeInferTypes($(this), ArrayofBlocks)});
            $(document.getElementById(ArrayofBlocks[i].id)).find("th").each(function(){removeInferTypes($(this), ArrayofBlocks)});
            createInferTypes(blockTypeInfer.types, ArrayofBlocks);
            createErrorMessages(blockTypeInfer.typeErrors);
            if(ArrayofBlocks[i] instanceof ExprCond && topLevelCondWithErrors(ArrayofBlocks[i])){
		removeTopLevelCondColor(ArrayofBlocks[i]);
            }
	}
    }
    function removeTopLevelCondColor(obj){
	removeInferTypes($(document.getElementById(obj.id)), program);
	for(var i= 0; i<obj.listOfBooleanAnswer.length; i++){
	    removeInferTypes($(document.getElementById(obj.listOfBooleanAnswer[i].id)), program);
	    removeInferTypes($(document.getElementById(obj.listOfBooleanAnswer[i].funcIDList[1])), program);
	    if(obj.listOfBooleanAnswer[i].answer instanceof ExprCond){
		removeTopLevelCondColor(obj.listOfBooleanAnswer[i].answer);
	    }
	}
    }
    function topLevelCondWithErrors(obj){
	for(var i= 0; i<obj.listOfBooleanAnswer.length; i++){
	    if(obj.listOfBooleanAnswer[i].answer !== undefined && $(document.getElementById(obj.listOfBooleanAnswer[i].answer.id)).hasClass("ERROR")){
		return true;
	    }else if(obj.listOfBooleanAnswer[i].answer instanceof ExprCond && topLevelCondWithErrors(obj.listOfBooleanAnswer[i].answer)){
		return true;
	    }
	}
	return false;
    }

    function removeInferTypes(jQuerySelection, ArrayofBlocks){
	for(var type in colors){
            if(colors.hasOwnProperty(type)){
		jQuerySelection.removeClass(type);
		if(jQuerySelection.hasClass("Cond")){
                    searchForIndex(jQuerySelection.attr("id"),ArrayofBlocks).outputType=undefined;
		}
            }
	}

    }

    function createInferTypes(typeMap, ArrayofBlocks){
	var id;
	var type;
	for(var i =0; i< typeMap.length; i++){
            if(typeMap[i].lhs instanceof elemId && typeMap[i].rhs instanceof elemType){
		id = typeMap[i].lhs.id;
		type = typeMap[i].rhs.type;
            }else if(typeMap[i].rhs instanceof elemId &&typeMap[i].lhs instanceof elemType){
		id = typeMap[i].rhs.id;
		type = typeMap[i].lhs.type;
            }else if(typeMap[i].lhs instanceof elemId && typeMap[i].rhs instanceof construct){
		id = typeMap[i].lhs.id;
		type = typeMap[i].rhs.elemList[0].type;
            }else if(typeMap[i].rhs instanceof elemId && typeMap[i].lhs instanceof construct){
		id = typeMap[i].rhs.id;
		type = typeMap[i].lhs.elemList[0].type;
            }
            if(isNaN(type) && !$(document.getElementById(id)).hasClass("ContractType")){

		if($(document.getElementById(id)).hasClass("Cond")){
                    searchForIndex(id,ArrayofBlocks).outputType=type;
		}
		$(document.getElementById(id)).addClass(type)
            }
	}
    }

    function returnMessage(message){
	return function(event){
	    console.log("LEFT "+JSON.stringify(event.pageX))
	    console.log("TOP "+JSON.stringify(event.pageY))
            $(document.body).append("<span class=\"ErrorMessage\" style=\"left:"+event.pageX+"px;top:"+event.pageY+"px;\">"+message+"</span>");
            adding=true;
            event.stopPropagation;
            event.stopImmediatePropagation;
	}
    }

    function createErrorMessages(typeErrors){
	for(var i=0;i<typeErrors.length;i++){
            for(var j=0;j<typeErrors[i].idArr.length;j++){
		//console.log($(document.getElementById(typeErrors[i].idArr[j])))
		//console.log(typeErrors[i].idArr[j]);//the id to which the message is added
		//console.log(typeErrors[i].message);//the message that needs to be added
		if(Modernizr.touch){
                    //GET THE EQUIVILENT OF A HOVER EVENT
                    $(document.getElementById(typeErrors[i].idArr[j])).click(returnMessage(typeErrors[i].message));
		}else{
                    if($(document.getElementById(typeErrors[i].idArr[j])).attr('title')=="" || $(document.getElementById(typeErrors[i].idArr[j])).attr('title') == undefined){
			$(document.getElementById(typeErrors[i].idArr[j])).attr('title',typeErrors[i].message);
                    }
                    else{
			$(document.getElementById(typeErrors[i].idArr[j])).attr('title', typeErrors[i].message);
                    }
		}
		$(document.getElementById(typeErrors[i].idArr[j])).addClass("ERROR");
		for(var type in colors){
                    if(colors.hasOwnProperty(type)){
			$(document.getElementById(typeErrors[i].idArr[j])).removeClass(type);
                    }
		}
            }
	}
    }

    function buildConstraints(obj, parentId){
	var lhs;
	var rhs;
	var next;
	var errors =[];
	var constraints =[];
	var i;
	var elemList =[];
  var literals = [];
	if(obj instanceof ExprDefineConst){
            constraints = constraints.concat([new constraint(new elemId(obj.id), new elemId(obj.funcIDList[0]), obj.id)]);
            if(obj.expr === undefined){
		errors = errors.concat([new error(obj.funcIDList[0], "Empty space")]);
            }else{
		next = buildConstraints(obj.expr, obj.funcIDList[0]);
		errors = errors.concat(next.errors);
		constraints = constraints.concat(next.constraints);
    literals = literals.concat(next.literals);
            }
	}else if(obj instanceof ExprContract){
            elemList =[];
            if(obj.outputType !== undefined){
		elemList = elemList.concat([new elemType(obj.outputType)]);
            }else{
		errors = errors.concat([new error(obj.funcIDList[0], "Contract output type undefined")]);
		elemList = elemList.concat([new elemId(obj.funcIDList[0])]);                    
            }
            for(i=1; i<obj.funcIDList.length; i++){
		if(obj.argumentTypes[i-1] === undefined){
                    errors = errors.concat([new error(obj.funcIDList[i], "Contract input type undefined")]);
                    elemList = elemList.concat([new elemId(obj.funcIDList[i])]);  
		}else{
                    elemList = elemList.concat([new elemType(obj.argumentTypes[i-1])]);
		}
            }
            //may change func to contract
            constraints = constraints.concat([new constraint(new elemId(parentId), new construct("func", elemList), obj.id)]);
	}else if(obj instanceof ExprDefineFunc){
            //if(obj.argumentNames.length + 1 !== obj.funcIDList.length){
	    //          throw new Error("Each argument did not have an id or vice versa")
	    //  }

            elemList = [];

            //also check for invalid names
            if(obj.contract.funcName === undefined || obj.contract.funcName === ""){
		errors = errors.concat([new error(obj.id, "No function name found")]);
            }else{
		constraints = constraints.concat([new constraint(new variable(obj.contract.funcName), new elemId(obj.id), obj.id)]);
            }
            //argument names
            elemList = elemList.concat([new elemId(obj.funcIDList[0])]);
            for(i=1; i<obj.funcIDList.length; i++){
		elemList = elemList.concat([new elemId(obj.funcIDList[i])]);
		if(obj.argumentNames[i-1] === undefined || obj.argumentNames[i-1] === ""){
                    errors = errors.concat([new error(obj.funcIDList[i], "Argument spot without a name")]);
		}else{
                    constraints = constraints.concat([new constraint(new elemId(obj.funcIDList[i]), new variable(obj.argumentNames[i-1]), obj.funcIDList[i])]);
		}
            }
            constraints = constraints.concat([new constraint(new elemId(obj.id), new construct("func", elemList), obj.id)]);

            //contracts
            if(obj.funcIDList.length !== obj.contract.funcIDList.length){
		throw new Error("This should never ever happen unless you break things. Meaning the contract's id list and the define's id list are of different length");
            }
            next = buildConstraints(obj.contract, obj.id);
            errors = errors.concat(next.errors);
            constraints = constraints.concat(next.constraints);
            literals = literals.concat(next.literals);
            //expr
            //this needs to come first, fixes problem with error pointing to define rather than the exprapp
            if(obj.expr !== undefined){
		next = buildConstraints(obj.expr, obj.funcIDList[0]);
		constraints = constraints.concat(next.constraints);
		errors = errors.concat(next.errors);
    literals = literals.concat(next.literals);
            }else{
		errors = errors.concat([new error(obj.funcIDList[0], "Empty space")]);
            }
	}else if(obj instanceof ExprApp){
        lhs = new elemId(obj.id);
        elemList = [];
        if(parentId === undefined){
	           elemList = elemList.concat([new elemType(obj.outputType)]);
        }else{
		          elemList = elemList.concat([new elemId(parentId)]);
        }
        for(i=0; i<obj.funcIDList.length; i++){
		          elemList = elemList.concat([new elemId(obj.funcIDList[i])]);
              if(obj.args[i] === undefined){
                    errors = errors.concat([new error(obj.funcIDList[i], "Empty space")]);
              }else{
                    next = buildConstraints(obj.args[i], obj.funcIDList[i]);
                    errors = errors.concat(next.errors);
                    constraints = constraints.concat(next.constraints);
                    literals = literals.concat(next.literals);
              }
        }
        rhs = new construct("func", elemList);
        constraints = constraints.concat([new constraint(lhs, rhs, obj.id), (new constraint(lhs, funcConstruct[obj.funcName], obj.id))]);
        /*for(i=0; i<obj.funcIDList.length; i++){
                        if(obj.args[i] === undefined){
                    errors = errors.concat([new error(obj.funcIDList[i], "Empty space")]);
              }else{
                    next = buildConstraints(obj.args[i], obj.funcIDList[i]);
                    errors = errors.concat(next.errors);
                    constraints = constraints.concat(next.constraints);
              }
        }*/
	}else if(obj instanceof ExprConst){
            lhs = new elemId(obj.id);
            if(parentId !== undefined){
		constraints = constraints.concat([new constraint(lhs, new elemId(parentId), obj.id)]);
            }
            if(obj.outputType !== undefined){
		constraints = constraints.concat([new constraint(lhs, new elemType(obj.outputType), obj.id)]);
            }else{
               constraints = constraints.concat([new constraint(lhs, new variable(obj.constName), obj.id)]);
            }
	}else if(isLiteral(obj)){
            lhs = new elemId(obj.id);
            if(parentId !== undefined){
		constraints = constraints.concat([new constraint(lhs, new elemId(parentId), obj.id)]);
            }
            literals = literals.concat([new constraint(lhs, new elemType(obj.outputType), obj.id)]);
            if(obj.value === undefined){
		errors = errors.concat([new error(obj.id, "Empty space")]);
            }
	}else if(obj instanceof ExprCond){
            lhs = new elemId(obj.id);
            if(parentId !== undefined){
		constraints = constraints.concat([new constraint(lhs, new elemId(parentId), obj.id)]);
            }
            for(i=0; i<obj.listOfBooleanAnswer.length; i++){
		//this ensures that boolAnswer pairs, which do not actually matter to constraints, get colored
		constraints = constraints.concat([new constraint(lhs, new elemId(obj.listOfBooleanAnswer[i].id), obj.listOfBooleanAnswer[i].id)])
		//deal with answers
		if(obj.listOfBooleanAnswer[i].answer !== undefined){
                    next = buildConstraints(obj.listOfBooleanAnswer[i].answer, obj.listOfBooleanAnswer[i].funcIDList[1]);
                    constraints = constraints.concat(next.constraints);
                    errors = errors.concat(next.errors);
                    literals = literals.concat(next.literals);
		}else{
                    errors = errors.concat([new error(obj.listOfBooleanAnswer[i].funcIDList[1], "Empty space")]);
		}
		constraints = constraints.concat([new constraint(lhs, new elemId(obj.listOfBooleanAnswer[i].funcIDList[1]), obj.listOfBooleanAnswer[i].funcIDList[1])]);
		//deal with question
		if(obj.listOfBooleanAnswer[i].bool !== undefined){
                    next = buildConstraints(obj.listOfBooleanAnswer[i].bool, obj.listOfBooleanAnswer[i].funcIDList[0]);
                    constraints = constraints.concat(next.constraints);
                    errors = errors.concat(next.errors);
                    literals = literals.concat(next.literals);
		}else{
                    errors = errors.concat([new error(obj.listOfBooleanAnswer[i].funcIDList[0], "Empty space")]);
		}
		constraints = constraints.concat([new constraint(new elemId(obj.listOfBooleanAnswer[i].funcIDList[0]), new elemType("Booleans"), obj.listOfBooleanAnswer[i].funcIDList[0])]);            
            }
	}
	return {errors: errors, 
		constraints: constraints,
    literals: literals};
    }
    //unifies constraints
    function unify(constr, literals){
	var subst = [];
	var next;
	var errors = [];
	while(constr.length > 0){
            next = constr.pop();
            if(objectEquality(next.lhs, next.rhs, ["source"])){
		// do nothing, just to short circuit
            }else if(next.lhs instanceof elemId || next.lhs instanceof variable){
            		substitute(next.rhs, next.lhs, constr);
            		substitute(next.rhs, next.lhs, subst);
                substitute(next.rhs, next.lhs, literals);
            		subst.unshift(new constraint(next.lhs, next.rhs, next.source));
            }else if(next.rhs instanceof elemId || next.rhs instanceof variable){
            		substitute(next.lhs, next.rhs, constr);
            		substitute(next.lhs, next.rhs, subst);
                substitute(next.rhs, next.lhs, literals);
            		subst.unshift(new constraint(next.rhs, next.lhs, next.source));
            }else if(next.rhs instanceof construct &&
                     next.lhs instanceof construct &&
                     (next.rhs.constructor === next.lhs.constructor) &&
                     (next.rhs.elemList.length === next.lhs.elemList.length)){
                  		for(var i = 0; i<next.rhs.elemList.length; i++){
                                      constr.unshift(new constraint(next.rhs.elemList[i], next.lhs.elemList[i], next.source));
                  		}
            }else{
		          errors.unshift(new error(next.source, "Type mismatch"));
            }
    }
    while(literals.length > 0){
      next = literals.pop();
            if(objectEquality(next.lhs, next.rhs, ["source"])){
    // do nothing, just to short circuit
            }else if(next.lhs instanceof elemId || next.lhs instanceof variable){
                substitute(next.rhs, next.lhs, subst);
                substitute(next.rhs, next.lhs, literals);
                subst.unshift(new constraint(next.lhs, next.rhs, next.source));
            }else if(next.rhs instanceof elemId || next.rhs instanceof variable){
                substitute(next.lhs, next.rhs, subst);
                substitute(next.rhs, next.lhs, literals);
                subst.unshift(new constraint(next.rhs, next.lhs, next.source));
            }else{
    errors.unshift(new error(next.source, "Type mismatch"));
            }
    }
	//adding generic types
	for(var i = 0; i < subst.length; i++){
            if(subst[i].lhs instanceof variable && (subst[i].rhs instanceof elemId)){
		substitute(new genType, subst[i].lhs, subst);
            }else if(subst[i].rhs instanceof variable && (subst[i].lhs instanceof elemId)){
		substitute(new genType, subst[i].rhs, subst);
            }
	}
	return {subst:subst, errors: errors};
    }
    //substitutes the new item for the old item in given constraint
    function substitute(newItem, oldItem, arr){
	for(var i = 0; i< arr.length; i++){
            if(!(arr[i] instanceof constraint)){
		throw new Error("Found an item in arr that was not a constraint at index " + i);
            }
            arr[i].lhs = substituteHelp(newItem, oldItem, arr[i].lhs);
            arr[i].rhs = substituteHelp(newItem, oldItem, arr[i].rhs);
	}
    }
    function substituteHelp(newItem, oldItem, replaceIn){
	if(!(newItem instanceof Object) || !(oldItem instanceof Object) || !(replaceIn instanceof Object)){
            throw new Error("One of the inputs was not an object");
	}
	if(objectEquality(oldItem, replaceIn, ["source"])){
            return newItem;
	}else if(replaceIn instanceof construct){
            for(var i = 0; i<replaceIn.elemList.length; i++){
		if(objectEquality(oldItem, replaceIn.elemList[i], ["source"])){
                    replaceIn.elemList[i] = newItem;
		}
            }
	}
	return replaceIn;
    }
    //has own property deal?
    //obj1 and obj2 are objects to compare, ignoreArr is an array of values to ignore when comparing
    function objectEquality(obj1, obj2, ignoreArr){
	var item1;
	var found = false;
	if(obj1 === obj2){
            return true;
	}
	for(item1 in obj1){
            if(obj1.hasOwnProperty(item1)){
		if(!((obj2.hasOwnProperty(item1)&& (obj1[item1] === obj2[item1] || (obj1[item1] instanceof Object && obj2[item1] instanceof Object && objectEquality(obj1[item1], obj2[item1], ignoreArr))))
                     || (ignoreArr !== undefined && ignoreArr.indexOf(item1) !== -1))){
                    return false;
		}
            }
	}
	return true;
    }
    //helpful errors is an array of tuples of an array of ids connected by the same error and a nice error message
    //add something for defined constant checks

    /*buildTypeErrors -
     * array - an array of ID's where errors were identified
     * obj - the object containing the errors
     *
     *
     */
    function buildTypeErrors(array, obj){
	var helpfulErrors =[];
	var curr;
	var k;
	var parent;
	var item;
	var condErr = [];
	for(var i = 0; i<array.length; i++){
            parent = getParent(array[i].id, [obj], undefined);
            item = searchForIndex(array[i].id, [obj]);
            curr = parent;
            if(curr === undefined){
		console.log("no parent found");
		console.log(array[i]);
		curr = item;
            }
            if(item instanceof ExprCond){
		while(curr instanceof ExprCond){
                    item = curr;
                    curr = getParent(curr.id, [obj]);

		}
		console.log(item)
		condErr = buildCondError(item.id, obj);
		for(k=0; k<condErr.length; k++){
                    helpfulErrors.push(condErr[k]);
		}
            }else if(curr instanceof ExprDefineFunc){
		if(curr.id === array[i].id){console.log("Error: define block error")};
		for(k =0; k<curr.contract.funcIDList.length; k++){
                    //if the id at index k matches the id in the contract, or the id in the define's funcIDList, or the expressions id
                    if(curr.contract.funcIDList[k] === array[i].id || curr.funcIDList[k] === array[i].id || (curr.expr !== undefined && array[i].id === curr.expr.id)){
			if(k === 0){
                            //error in output type of contract
                            if(curr.contract.outputType === undefined){console.log("ERROR! CONTRACT OUPUT TYPE UNDEFINED")};
                            if(curr.expr.outputType !== undefined){
				helpfulErrors.push(new errorMatch([curr.expr.id], "Contract output and actual expression output do not match. Contract expected output type \""
								  + curr.contract.outputType+"\" but found output type \""+ curr.expr.outputType + "\" in the expression"));
                            }else{
				helpfulErrors.push(new errorMatch([curr.expr.id], "Contract output and actual expression output do not match. Contract expected output type \""
								  + curr.contract.outputType+"\" but a block with a different output type in the expression"));
                            }
			}else{
                            //error in one of the contract positions representing an argument name
                            helpfulErrors.push(new errorMatch(getVariables(curr.argumentNames[k-1], [obj]), "The variable \"" + curr.argumentNames[k-1] + "\" was assigned type \"" + curr.contract.argumentTypes[k-1] + "\" in the contract, but at least one instance of this variable had a different type."));
			}
			break;                                }
		}
            }else if(curr instanceof ExprConst){
		//error at variable instance
		helpfulErrors.push(new errorMatch([getVariables(curr.constName, [obj])], "The variable \"" + curr.constName + "\" is not consistently the same type. Either it contradicts the contract or one or more of the highlighted uses is not being used as the same type as the others."))
            }else if(isLiteral(curr)){
		//not sure if this will happen
		console.log("This happened, not an error, just unexpected")
		helpfulErrors.push(new errorMatch([curr.id], "This block has type \"" + curr.outputType + "\", but the spot it occupies expected a different type"));
            }else if(curr instanceof ExprApp){
		if(curr.id === array[i].id){
                    //occupies incorrect spot
                    helpfulErrors.push(new errorMatch([curr.id], "This block has type \"" + curr.outputType + "\", but the spot it occupies expected a different type"));
		}else{
                    for(k=0; k<curr.funcIDList.length; k++){
			if(curr.args[k] !== undefined && (curr.funcIDList[k] === array[i].id || curr.args[k].id === array[i].id)){
                            if(curr.args[k].outputType !== undefined){
				//bad arguments
				helpfulErrors.push(new errorMatch([curr.args[k].id], "This spot should have a block of type \"" + funcConstruct[curr.funcName].elemList[k+1].type + "\" but found a block of type \"" +
								  curr.args[k].outputType+"\""));
                            }else{
				//bad argument, but argument does not have output type
				console.log("did not find argument output type");
				helpfulErrors.push(new errorMatch([curr.args[k].id], "This spot should have a block of type \"" + funcConstruct[curr.funcName].elemList[k+1].type + "\" but found a block with a different type"));
                            }
			} 
                    }
		}
            }else if(curr instanceof ExprDefineConst){
		//there shouldn't be an error here
		console.log("ExprDefineConst Failure");
		console.log(obj);
		console.log(array[i].id)
            }else if(curr instanceof ExprCond){
		var idList = [];
		var boolError = false;
		if(curr.id === array[i].id){
                    //this might happen, say if you did (+ (cond [true "a"]) 3)
                    console.log("Cond failure");
		}
		for(k=0; k<curr.listOfBooleanAnswer.length; k++){
                    if(curr.listOfBooleanAnswer[k].bool !== undefined && (curr.listOfBooleanAnswer[k].funcIDList[0] === array[i].id || curr.listOfBooleanAnswer[k].bool.id === array[i].id)){
			if(curr.listOfBooleanAnswer[k].bool.outputType !== undefined){
                            helpfulErrors.push(new errorMatch([curr.listOfBooleanAnswer[k].bool.id], "This spot should have a block of type \"Booleans\" but found something of type \"" +
                                                              curr.listOfBooleanAnswer[k].bool.outputType + "\""));
			}else{
                            console.log("did not find argument output type in Cond bool");
                            helpfulErrors.push(new errorMatch([curr.listOfBooleanAnswer[k].bool.id], "This spot should have a block of type \"Booleans\" but found a block with a different type"));
			}
			boolError = true;
			break;
                    }
                    if(curr.listOfBooleanAnswer[k].answer !== undefined){
			idList.push(curr.listOfBooleanAnswer[k].answer.id)
                    }else{
			//console.log("I'm not adding the empty positions in a cond block to this error because of reasons (like it isn't a type error)")
                    }
		}
		if(!boolError){
                    //helpfulErrors.push(new errorMatch(idList, "Not all of the results of this conditional match the expected output. First check that all the conditional answers have the same type. Then check that each of these answers matches the expected output of the conditional."))
                    while(curr instanceof ExprCond){
			item = curr;
			curr = getParent(curr.id, [obj]);

                    }
                    condErr = buildCondError(item.id, obj);
                    for(k=0; k<condErr.length; k++){
			helpfulErrors.push(condErr[k]);
                    }
		}
            }
	}
	return helpfulErrors;
    }

    function buildCondError(id, obj, type ){
	var toReturn = [];
	var i;
	if(obj instanceof ExprDefineFunc && obj.expr !== undefined){
	    //console.log("buildCondError: define function");
            return buildCondError(id, obj.expr, obj.contract.outputType);
	}else if(obj instanceof ExprDefineConst && obj.expr !== undefined){
	    //console.log("buildCondError: define constant");
            return buildCondError(id, obj.expr, undefined);
	}else if(obj instanceof ExprApp){
	    //console.log("buildCondError: expr app");
            for(i = 0; i<obj.args.length; i++){
		console.log(funcConstruct[obj.funcName])
		toReturn = buildCondError(id, obj.args[i], funcConstruct[obj.funcName].elemList[i+1].type);
		if(toReturn.length !== 0){
                    return toReturn;
		}
            }
            return [];
	}else if(obj instanceof ExprCond){
	    //console.log("buildCondError: cond");
            var errorList = [];
            var idList = [];
            var depthError;
            if(obj.id === id){
		for(i=0; i<obj.listOfBooleanAnswer.length; i++){
                    if(obj.listOfBooleanAnswer[i].answer !== undefined){
			if(obj.listOfBooleanAnswer[i].answer instanceof ExprCond){
			    var depthError = buildCondError(obj.listOfBooleanAnswer[i].answer.id, obj.listOfBooleanAnswer[i].answer, type);
			    for(var k =0; k<depthError.length; k++){
				errorList.push(depthError[k]);
			    }
			}else if(type !== undefined){
                            if(obj.listOfBooleanAnswer[i].answer.outputType !== undefined && obj.listOfBooleanAnswer[i].answer.outputType !== type){
				errorList.push(new errorMatch([obj.listOfBooleanAnswer[i].answer.id], "The cond block containing this answer was expected to return type \"" + type + "\" but this block has type \"" + obj.listOfBooleanAnswer[i].answer.outputType + "\""));
                            }
			}else{
                            idList.push(obj.listOfBooleanAnswer[i].answer.id);
			}
                    }
		}
		if(idList.length !== 0){
                    errorList.push(new errorMatch(idList, "The output type of this cond is not consistent, there are answers that return different types."));
		}
		return errorList;
            }else{
		for(i=0; i<obj.listOfBooleanAnswer.length; i++){
                    toReturn = buildCondError(id, obj.listOfBooleanAnswer[i].answer, type);
                    if(toReturn !== undefined && toReturn.length > 0){
			return toReturn;
                    }else{
			toReturn = buildCondError(id, obj.listOfBooleanAnswer[i].bool, "Booleans");
			if(toReturn !== undefined && toReturn.length > 0){
			    return toReturn;
			}
                    }
		}
		return [];
            }
            
	}else if(obj instanceof ExprConst){
	    //console.log("buildCondError: constant");
            return [];
	}else if(isLiteral(obj)){
	    //console.log("buildCondError: literal");
            return [];
	}else{
	    //console.log("buildCondError: no object");
            return [];
	}
    }

    function getParent(id, array, parent){
	var toReturn = undefined;
	for(var i = 0; i< array.length; i++){
            if(array[i] === undefined){
		//just skip
            }else if(array[i] === id || array[i].id===id){
		//the first part of the or statement handles funcIDLists
		toReturn = parent;
            }else if(isDefine(array[i])){
		toReturn = getParent(id, [array[i].expr], array[i]);
            }else if(array[i] instanceof ExprApp){
		toReturn = getParent(id, array[i].args, array[i]);
            }else if(array[i] instanceof ExprBoolAnswer){
		toReturn = getParent(id, flatten(array[i]), parent);
            }else if(array[i] instanceof ExprCond){
		toReturn = getParent(id, array[i].listOfBooleanAnswer, array[i]);
            }
            if(toReturn === undefined && array[i] !== undefined && array[i].hasOwnProperty("funcIDList")){
		toReturn = getParent(id, array[i].funcIDList, array[i]);
            }
            if(toReturn !== undefined){
		return toReturn;
            }
	}
	return undefined;
    }
    //returns the ids of the given variable in the objects in the objArr
    function getVariables(name, objArr){
	var idArr=[]
	var curr;
	var i;
	while(objArr.length>0){
            curr = objArr.pop();
            if(curr === undefined){
		//do nothing
            }else if(curr instanceof ExprConst && curr.constName === name){
		idArr.push(curr.id);
            }else if(curr instanceof ExprDefineFunc){
		for(i=0; i<curr.argumentNames.length; i++){
                    if(curr.argumentNames[i] === name){
			idArr.push(curr.contract.funcIDList[i+1]);
			idArr.push(curr.funcIDList[i+1]);
                    }
		}
		objArr.push(curr.expr);
            }
            else if(curr instanceof ExprConst){
		objArr.push(curr.expr);
            }else if(curr instanceof ExprApp){
		for(i = 0; i< curr.args.length; i++){
                    objArr.push(curr.args[i]);
		}
            }else if(objArr[i] instanceof ExprCond){
		for(i=0; i<curr.listOfBooleanAnswer.length; i++){
                    objArr.push(curr.listOfBooleanAnswer[i].answer);
                    objArr.push(curr.listOfBooleanAnswer[i].bool);
		}
            }
	}
	return idArr;
    }


    window.sync = sync;
    window.changeType=changeType;
    window.deleteArg = deleteArg;
    //window.removeFunctionFromDrawers=removeFunctionFromDrawers;

    //FOR TESTING PURPOSES
    window.typeInfer = typeInfer;
    window.typeCheck=typeCheck;
    window.parseProgram=parseProgram;
    window.program=function(){return program};
    window.storageProgram=function(){return storageProgram};
    window.functionProgram=function(){return functionProgram};
    window.historyarr=function(){return historyarr};
    window.future=function(){return future};
    window.buildConstraints=buildConstraints;


}());
