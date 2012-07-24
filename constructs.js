
//(function(){

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
function setChildInProgram(parentId, childId, obj){
        var parent = searchForIndex(parentId, program);
        if(parent === undefined){
                throw new Error("setChildInProgram failure: parentId not found");
        }
        if(isLiteral(parent)){
                throw new Error("setChildInProgram failure: parent was a literal, and cannot be added to");
        }
        if(parent.hasOwnProperty("funcIDList")){
                var index;
                if(obj !== undefined){
                        index = getAddIndex(parent, childId);
                }else{
                        index = getRemoveIndex(parent, childId);
                }
                if(index === -1){
                        throw new Error("setChildInProgram failure: childId not found");
                }else{
                        if(parent instanceof ExprApp){
                                parent.args[index] = obj;
                        }else if(isDefine(parent)){
                                parent.expr = obj;
                        }else if(parent instanceof ExprBoolAnswer){
                                if(index === 0){
                                        parent.bool = obj;
                                }else{
                                        parent.answer = obj;
                                }
                        }
                }
        }else if(parent instanceof ExprCond){
                console.log(parentId,childId)
                throw new Error("setChildInProgram failure: parent was top level of cond, that doesn't work");
        }else{
                throw new Error("setChildInProgram failure: parent looked like: " +interpreter(parent));
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
                        return i
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
        this.argumentTypes = [];
        this.outputType = undefined;
        this.id = makeID();
        this.funcIDList=makeIDList(2)
        this.clone=function(){
                var temp=new ExprContract();
                temp.funcName=this.funcName;
                temp.argumentTypes=this.argumentTypes.slice(0);
                temp.funcIDList=this.funcIDList.slice(0);
                temp.outputType=this.outputType;
                temp.id=this.id;
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
        this.id = makeID();
        this.funcIDList = makeIDList(functions[containsName(functions, funcName)].input.length);
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
The value of the string is initialized as an empty string "". <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
*/
var ExprString= function(){
    this.value="insert string here";
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
    this.value = 0;
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
        //this.outputType = getConstantType(constName);
        this.id = makeID();
        this.clone=function(){
                var temp=new ExprConst(this.constName);
                temp.id=this.id;
                return temp;
        };
};

/*
Constructs a boolean true or false (else == true)
*/
var ExprBoolean = function(value){
        this.value=value;
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

var initConstants=constants.length

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
historyarr of the program state. Updated when the user changes something about the program (i.e.
adds a block, moves a block, deletes something, etc.)
*/
var historyarr = [];


/*
  addToHistory takes in a program state and adds it to history while setting the future array 
  (connected to the redo button) to an empty array
*/
var addToHistory = function(programState) {
    historyarr.push(programState);
    $("#undoButton").removeAttr('disabled');
    future = [];
};


/*
future is an array of the program states. Updated when the user undos something.
*/
var future = [];

/*
program is an array of makeDefineFunc/makeDefineVar/Expressions that make up the user's program
on the screen.
*/
var program = [];

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


//resizes code div when the window is resized
function onResize(){
    contentHeight = $(window).height() - $("#header").height();
    contentWidth = $(window).width();
    $("#content").height(contentHeight);
    $("#content").width(contentWidth);
    $("#code").height(contentHeight);
    $("#code").width(contentWidth-$("#Drawers").width());
    $("#List").height(contentHeight);
    $("#List").width($("#code").width()-150);
}


$(document).ready(function(){
        //When the window is resized, the height of the width of the code div changes
        $(window).resize(onResize);
        onResize();

        //draws drawers when the page is loaded
        makeDrawers(functions,constants);

        // activated is initially set to "Numbers"
        // activated = $("#options #Numbers");
        // activated.css("visibility", "visible");

        /*
        adds a stylesheet to <head> such that blocks can be colored according to their type
        */
        renderTypeColors();
        /*
        sets focus equal to the input that is focused. 
        */
        $("#List input").live('focus',function(){
            focused=$(this)
            initvalue=focused.value;
            tempProgram=cloneProgram(program);
        });

        var formValidation = function(e){
                        //e.preventDefault();
                        //if focused is not null and if you are clicking something else besides the focused object
                    if(focused !==null && $(e.target).attr("id") !== focused.attr("id")){
                        var inputtext=focused.val();
                        var codeObject = searchForIndex(focused.closest($("table")).attr("id"),program);
                        //NUMBERS
                        if(focused.closest($("table")).hasClass("Numbers")){
                                if(isNaN(Number(inputtext))){
                                        focused.css("background-color", colors.Expressions);
                                        e.stopPropagation();
                                        alert("Please only enter a number into this text field");
                                        focused.focus();
                                        return;
                                } 
                                else{
                                        focused.css("background-color", colors.Numbers);
                                        changeValue(inputtext);
                                }
                        }

                        //STRINGS
                        else if(focused.closest($("table")).hasClass("Strings")){
                                changeValue(inputtext);
                        }
                        //DEFINING CONSTANTS
                        else if(focused.closest($("table")).hasClass("DefineVar")){
                                if((initvalue !=undefined && initvalue != "") && inputtext !== ""){
                                        console.log("case prev is defined, input is defined");
                                        console.log("prevName is",prevName)
                                        var prevIndex=containsName(prevName,constants);
                                        if(prevIndex != -1){
                                                constants[prevIndex].name=inputtext;
                                        }
                                        addToHistory(tempProgram);
                                        initvalue=null
                                        tempProgram=null;
                                }
                                else if ((initvalue !=undefined && initvalue != "") && inputtext === ""){
                                        console.log("case prev is defined, input is undefined");
                                        constants.splice(containsName(prevName,1));
                                        addToHistory(tempProgram);
                                        initvalue=null;
                                        tempProgram=null;
                                }
                                else if((initvalue ==undefined || prevName == "") && inputtext !== ""){
                                        console.log("case prev is undefined, input is defined");
                                        addToHistory(tempProgram);
                                        initvalue=null;
                                        tempProgram=null;
                                }
			    var scrollValue = $("#options").scrollTop();
                                makeDrawers(functions,constants);
                                setActivatedVisible(scrollValue);
                                focused.attr('value',inputtext);
                                focused=null;
                        }
                        else if(focused.closest($("table")).hasClass("DefineFun")){
                                if( initvalue != inputtext){
                                        addToHistory(tempProgram);
                                        initvalue=null;
                                        tempProgram=null;
                                }
                                focused=null;
                        }
                    }
                };
        $(document.body).live('click', formValidation);

    //Sets undo and redo buttons to disabled on startup
    $("#undoButton").attr('disabled','disabled');
    $("#redoButton").attr('disabled','disabled');

    /*
      Binds undo functionality with undo button
    */
    $("#undoButton").bind('click', function(){
        if (historyarr.length !== 0){
            future.unshift(cloneProgram(program));
	    $("#redoButton").removeAttr('disabled');
            program = historyarr.pop();
            renderProgram(createProgramHTML());
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
            historyarr.push(cloneProgram(program));
            program = future.shift();
            renderProgram(createProgramHTML());
	    if (future.length === 0){
		$("#redoButton").attr('disabled','disabled');
	    }
        }
	$("#undoButton").removeAttr('disabled');
    }); 


        $(".addCond").live('click',function(){
                addToHistory(cloneProgram(program));
                searchForIndex($(this).closest('table').attr('id'),program).listOfBooleanAnswer.push(new ExprBoolAnswer());
                renderProgram(createProgramHTML())
        })

        $(".removeCond").live('click',function(){
                var listOfTuples=searchForIndex($(this).closest('.Cond').attr('id'),program).listOfBooleanAnswer
                if(listOfTuples.length!=1){
                     addToHistory(cloneProgram(program));
                     for(var i=0;i<listOfTuples.length;i++){
                        if(listOfTuples[i].id===$(this).closest('table').attr('id')){
                                listOfTuples.splice(i,1)
                        }
                     }  
                     renderProgram(createProgramHTML());
                }    
        })

        $(".addArgument").live('click',function(){
                addToHistory(cloneProgram(program));
                var block=searchForIndex($(this).closest('table').attr('id'),program)
                block.funcIDList.push(makeID())
                block.contract.funcIDList.push(makeID())
                block.argumentNames.push("");
                renderProgram(createProgramHTML());
        })


});

function changeValue(inputtext){
        if( initvalue != inputtext ){
                addToHistory(tempProgram);
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
	toggledDiv.slideToggle("slow", function() {
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
	arr.push(toAdd)
    } else{
	for (i = 0; i < arr.length; i++) {
	    if (arr[i] === toAdd) break;
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
    for (i = 0; i < arr.length; i++){
	if (arr[i] === toDelete){
	    arr.splice(i, 1);
	}
    }
    if (i === arr.length){
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

        types.Define=["define-constant","define-function","define-struct"];
        types.Expressions=["cond"];

        return types;

        $("")
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
                            Drawers+="<span class=\"draggable "+encode(Type)+"\">"+encode(allConstants[typeDrawers[Type][i]].name)+"</span><br>";
			}
		    }
		    
else if(Type==="Define"){
			for(i=0;i<typeDrawers[Type].length;i++){
			    Drawers+="<span class=\"draggable "+encode(Type)+"\">"+encode(typeDrawers[Type][i])+"</span><br>";
			}
		    }
		    else if(Type==="Expressions"){
			for(i=0;i<typeDrawers[Type].length;i++){
			    Drawers+="<span class=\"draggable "+encode(Type)+"\">"+encode(typeDrawers[Type][i])+"</span><br>";
			}
		    }
		    else{
			for(i=0;i<typeDrawers[Type].length;i++){
			    if(typeDrawers[Type][i]==="true"){
				Drawers+="<span class=\"Booleans draggable\">true</span><br>";
			    }
			    else if(typeDrawers[Type][i]==="false"){
				Drawers+="<span class=\"Booleans draggable\">false</span><br>";
			    }
			    else if(typeDrawers[Type][i]==="Text"){
				Drawers+="<span class=\"Strings draggable\">Text</span><br>";
			    }
			    else if(typeDrawers[Type][i]==="Number"){
				Drawers+="<span class=\"Numbers draggable\">Number</span><br>";
			    }
			    else{
				Drawers+="<span class=\"draggable "+encode(allFunctions[typeDrawers[Type][i]].output)+"\">"+encode(allFunctions[typeDrawers[Type][i]].name)+"</span><br>";
			    }
			}
		    }
		    
		    Drawers+="</div>";
		}
	}

    Drawers+="</div>";
    $("#Drawer").html(Drawers);
    drawerToggle();
    makeDrawersDraggable();
/*    if (activated == undefined){
	activated = "Numbers";
    }*/
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

/*
Gets the output type of a function
*/
function getOutput(funcname){
        var index=containsName(functions,funcname);
        if(index!==-1){
                return functions[index].output;
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
                        for(i = 0; i < functions.length; i++){
                                if (functions[i].name === optionsText){
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
function createBlock(codeObject){
        var i;
        if(codeObject instanceof ExprDefineFunc){
                return createDefineBlock(codeObject);
        } else if (codeObject instanceof ExprDefineConst){
                return createDefineVarBlock(codeObject);
        }/* else if (codeObject instanceof ExprDefineStruct){
                return stringToElement(createDefineStructBlock());
        }*/ else if (codeObject instanceof ExprCond){
                return createCondBlock(codeObject);
        } else if (codeObject instanceof ExprConst){
                for(i = 0; i < constants.length; i++){
                        if (encode(constants[i].name) === encode(codeObject.constName)){
                                return createConstantBlock(constants[i], codeObject);
                        }
                }
                throw new Error("createBlock: internal error");
        } else if (codeObject instanceof ExprApp){
                for(i = 0; i < functions.length; i++){
                        if (encode(functions[i].name) === encode(codeObject.funcName)){
                                return createFunctionBlock(i, codeObject);
                        }
                }
                throw new Error("createBlock: internal error");
        } else if (codeObject instanceof ExprNumber){
                return createNumBlock(codeObject);
        } else if (codeObject instanceof ExprString){
                return createStringBlock(codeObject);
        } else if (codeObject instanceof ExprBoolean){
                return createBooleanBlock(codeObject);
        }
        
 }


/*
createProgramHTML takes the program array and translates it into HTML
*/
var createProgramHTML = function(){
        var pageHTML = "";
        functions.splice(initFunctions,functions.length-initFunctions);
        constants.splice(initConstants,constants.length-initConstants);
        for (var i = 0; i < program.length; i++){
                pageHTML += "<li>" + createBlock(program[i]) + "</li>";
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
renderProgram takes in a string (programHTML) and changes the contents of #List to 
programHTML
*/
var renderProgram = function(programHTML){
        $("#List").html(programHTML);
        addDroppableFeature($("#List .droppable"));
        // $("#List table").children().each(function(){
        //         addDraggingFeature($(this).find("table"));
        // });
        setLiWidth();
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


function sync(objectID){
        var block=searchForIndex(objectID+"",program);
        var DOMBlock=$(document.getElementById(objectID));
        if(block instanceof ExprNumber || block instanceof ExprString){
                block.value=decode(DOMBlock.find(".input").attr('value'));
        }
        else if(block instanceof ExprDefineConst){
                block.constName=decode(DOMBlock.find('.constName').attr('value'));
        }
        else if(block instanceof ExprDefineFunc){
                var prevName=block.contract.funcName;
                if(!(prevName===DOMBlock.find('.contractName').attr('value') && prevName===DOMBlock.find('.definitionName').attr('value'))){
                        if(DOMBlock.find('.contractName').attr('value')===prevName){
                                block.contract.funcName=decode(DOMBlock.find('.definitionName').attr('value'));
                                DOMBlock.find('.contractName').attr('value',DOMBlock.find('.definitionName').attr('value'));
                        }
                        else if(DOMBlock.find('.definitionName').attr('value')===prevName){
                                block.contract.funcName=decode(DOMBlock.find('.contractName').attr('value'));
                                DOMBlock.find('.definitionName').attr('value',DOMBlock.find('.contractName').attr('value'));
                        }
                }
                var i=0;
                DOMBlock.find('.argName').each(function(){
                          block.argumentNames[i]=$(this).attr('value');
                          i++;
                });
        }
        else{
                throw new Error("block type not found");
        }
}

/*
createFunctionBlock takes as input a functionIndex and will output an HTML element corresponding to 
that function with name, color, and spaces for input blocks
 createFunctionBlock: number -> string
 */
 function createFunctionBlock(functionIndex, codeObject){
        var func = functions[functionIndex];
        var block = "<table class=\"expr " + func.output  +"\"" + " id=\""+codeObject.id+"\" border>";
        block += "<tr><th colspan=\"" + func.input.length  + "\">" + encode(func.name) + "</th></tr><tr>";
        var i;
        for(i = 0; i < func.input.length; i++){
                if (codeObject.args[i] != undefined){
                         block += "<th name=\""+func.input[i].name+"\" class=\"" + encode(func.input[i].type) +" noborder droppable\" id=\""+codeObject.funcIDList[i]+"\">" + createBlock(codeObject.args[i]);
                }
                else{
                        block+= "<th name=\""+func.input[i].name+"\" class=\"" + encode(func.input[i].type) +" droppable\" id=\""+codeObject.funcIDList[i]+"\">" + func.input[i].name;
                }
                block+="</th>";
        }

        return block + "</tr></table>";
 }

//createDefineBlock outputs the block corresponding to defining a function
function createDefineBlock(codeObject){
        var block ="<table class=\"DefineFun Define\" style=\"background: " + colors.Define +";\"" + " id=\""+codeObject.id+"\">";
        //contract
        block+="<tr><th><input class=\"contractName\" onkeyup=\"sync("+codeObject.id+")\" ";
        if(codeObject.contract.funcName!=undefined){
                block+="value=\""+encode(codeObject.contract.funcName)+"\"";
        }
        block+=" />"

        block+="</th><th> : </th>";

        // if(codeObject.argumentNames.length===0){
        //         block+=" <th>"+generateTypeDrop()+"</th>";
        // }
        for(var i=0;i<codeObject.argumentNames.length;i++){
                block+=" <th>"+generateTypeDrop(codeObject.contract.funcIDList[i+1],codeObject)+"</th>";
        }
        block+="<th> <button class=\"addArgument\">+</button> </th><th> -> </th><th>"+generateTypeDrop(codeObject.contract.funcIDList[0],codeObject)+"</th></tr>";
        
        //define block
        block+="<tr><th>define</th>";
        
        block+="<th class=\"expr\"> <input class=\"definitionName\" onkeyup=\"sync("+codeObject.id+")\" ";
        if(codeObject.contract.funcName!=undefined){
                block+="value=\""+encode(codeObject.contract.funcName)+"\"";
        }
        block+=" /></th>";

        // if(codeObject.argumentNames.length===0){
        //         block+="<th width=\"10px\" class=\"expr\"><input onkeyup=\"sync("+codeObject.id+")\" class=\"argName\"/>";
        // }
        for(var i=0;i<codeObject.argumentNames.length;i++){
                block+="<th width=\"10px\" class=\"expr\"";
                if(codeObject.contract.argumentTypes[i]!=undefined){
                        block+=" style=\"background:"+colors[codeObject.contract.argumentTypes[i]]+"\" ";
                }
                block+="><input id=\""+codeObject.funcIDList[i+1]+"\" onkeyup=\"sync("+codeObject.id+")\" class=\"argName\" ";
                if(codeObject.argumentNames[i]!=undefined){
                        block+="value=\""+encode(codeObject.argumentNames[i])+"\"";
                }
                block+=" />"
        }
        block+="<th></th><th></th>"

        block+="<th ";
        if(codeObject.contract.outputType!=undefined){
                block+=" style=\"background:"+colors[codeObject.contract.outputType]+"\" ";
        }
        if(codeObject.expr != undefined){
                block+="class=\"noborder droppable expr\" id="+codeObject.funcIDList[0]+">";
                block+=createBlock(codeObject.expr);
                block+="</th>";
        }
        else{
                block+="class=\"droppable expr\" id="+codeObject.funcIDList[0]+">expr</th>";
        }
        return block + "</tr></table>";
}

//createDefineVarBlock outputs the block corresponding to creating a variable
function createDefineVarBlock(codeObject){
        var block = "<table class=\"DefineVar Define\" " + "id=\""+codeObject.id+"\"><tr><th>define</th>";
        block+="<th class=\"expr\"><input onkeyup=\"sync("+codeObject.id+")\" class=\"constName\""
        if(codeObject.constName != undefined){
                block+=" value=\""+encode(codeObject.constName)+"\"";
        }
        block+="><th  id=\"" + codeObject.funcIDList[0] + "\" class=\"expr droppable";
        if (codeObject.expr == undefined){
                block+= "\"> Exp";
        } else{
                block += " noborder\">" + createBlock(codeObject.expr);
        }
        return block + "</th></tr></table>";
}

//createDefineStructBlock outputs the block corresponding to creating a structure
function createDefineStructBlock(codeObject){
        var block ="<table class=\"DefineStruct Define\" " + "id=\""+codeObject.id+"\"><tr><th>define-struct</th>";
        block+="<th class=\"expr\"><input type=\"Name\" id=\"Name\" name=\"Name\"/><th class=\"expr\">properties";
        return block + "</tr></table>";
}

//createCondBlock outputs the block corresponding to creating a conditional
//add stuff to make empty work and have new rows append to ExprCond
function createCondBlock(codeObject){
        var block =  "<table class=\"Cond expr Expressions\" " + "id=\""+codeObject.id+"\"><tr><th style=\"float:left\">cond</th></tr>";
        for(var i=0;i<codeObject.listOfBooleanAnswer.length;i++){
                if(i===codeObject.listOfBooleanAnswer.length-1){
                        block+="<tr class=\"BoolAnswer empty\"><th><table class=\"noDrag\" id=\"" + codeObject.listOfBooleanAnswer[i].id + "\"></th>"
                }
                else{
                        block+="<tr><th><table id=\"" + codeObject.listOfBooleanAnswer[i].id + "\"></th>"
                }       
                if(codeObject.listOfBooleanAnswer[i].bool!=undefined){
                        block+="<th id=\"" + codeObject.listOfBooleanAnswer[i].funcIDList[0] + "\" class=\"noborder droppable Booleans expr\">";
                        block+=createBlock(codeObject.listOfBooleanAnswer[i].bool);
                        block+="</th>";
                }
                else{
                        block+="<th id=\"" + codeObject.listOfBooleanAnswer[i].funcIDList[0] + "\" class=\"droppable Booleans expr\">boolean</th>"
                }
                if(codeObject.listOfBooleanAnswer[i].answer!=undefined){
                        block+="<th id=\"" + codeObject.listOfBooleanAnswer[i].funcIDList[1] + "\" class=\"noborder droppable expr\">";
                        block+=createBlock(codeObject.listOfBooleanAnswer[i].answer);
                }
                else{
                        block+="<th id=\"" + codeObject.listOfBooleanAnswer[i].funcIDList[1] + "\" class=\"droppable expr\">expr";
                }
                if(codeObject.listOfBooleanAnswer.length!==1){
                        block+="<th><button class=\"removeCond\">x</button></th>";
                }
                block+="</table></th></tr>"
        }
        block +="<tr><th></th><th><button class=\"addCond\">+</button></th></tr>"
        return block + "</table>";
}

function createConstantBlock(constantelement, codeObject){
        var block =  "<table class=\"expr " + encode(constantelement.type)+"\" " + "id=\""+codeObject.id+"\"><tr><th>"+encode(constantelement.name)+"</tr>";
        return block + "</table>";
}

function createBooleanBlock(codeObject){
        var block =  "<table class=\"Booleans expr\" " + "id=\""+codeObject.id+"\"><tr><th>"+codeObject.value+"</tr>";
        return block + "</table>";
}

function createNumBlock(codeObject){
    var block =  "<table class=\"Numbers expr\" " + "id=\""+codeObject.id+"\" width=\"10px\"><tr><th><input class=\"input\" onkeyup=\"sync("+codeObject.id+")\" style=\"width:50px;\""
    block+=" value=\""+codeObject.value+"\">";
    return block + "</th></tr></table>";
}

function createStringBlock(codeObject){
    var block =  "<table class=\"Strings expr\" " + "id=\""+codeObject.id+"\"><tr><th>\"</th><th><input class=\"input\" onkeyup=\"sync("+codeObject.id+")\" class=\"Strings\"";
    block += " value=\"" + encode(codeObject.value) + "\">";
    return block + "</th><th>\"</th></tr></table>";
}

function stringToElement(string){
        var wrapper= document.createElement('div');
        wrapper.innerHTML=string;
        return wrapper.firstChild;
}

/*
Creates a drop down menu for use in the contract in order to select types.
*/
function generateTypeDrop(newID,codeObject){
        var HTML = "<select id=\""+newID+"\" name=\"TypeDrop\" onchange=\"changeType(this.value,"+newID+","+codeObject.id+")\"><option value=\"Type\">Type</option>";
        var typeIndex=codeObject.contract.funcIDList.indexOf(newID)-1;
        for(var i=0;i<types.length;i++){
                HTML+="<option value=\""+ encode(types[i]) +"\" class=\""+ encode(types[i])+"\"";
                if(typeIndex===-1){
                        if(codeObject.contract.outputType===types[i]){
                                HTML+=" selected ";
                        }
                }
                else{
                        if(codeObject.contract.argumentTypes[typeIndex]===types[i]){
                                HTML+=" selected ";
                        }
                }
                HTML+=">"+ encode(types[i]) +"</option>";
        }
        HTML+="</select>";
        HTML+= (typeIndex!==-1 && codeObject.contract.funcIDList.length !== 2) ? "<button onclick=\"deleteArg("+newID+","+codeObject.id+")\">x</button>" : "";
        return HTML
}

function changeType(curValue,selectID,codeObjectID){
        selectID+="";
        var codeObject=searchForIndex(codeObjectID+"",program);
        for(var i=0;i<codeObject.contract.funcIDList.length;i++){
                if(selectID===codeObject.contract.funcIDList[i] && i!==0){
                        addToHistory(cloneProgram(program));
                        codeObject.contract.argumentTypes[i-1]= (curValue==="Type") ? undefined : decode(curValue);
                }
                else if(selectID===codeObject.contract.funcIDList[i] && i===0){
                        addToHistory(cloneProgram(program));
                        codeObject.contract.outputType= (curValue==="Type") ? undefined : decode(curValue);
                }
        }
        renderProgram(createProgramHTML(program));
}

function deleteArg(selectID,codeObjectID){
        selectID+="";
        var codeObject=searchForIndex(codeObjectID+"",program);
        if(codeObject.contract.funcIDList.length>2){
                for(var i=0;i<codeObject.contract.funcIDList.length;i++){
                        if(selectID===codeObject.contract.funcIDList[i] && i!==0){
                                addToHistory(cloneProgram(program));
                                codeObject.argumentNames.splice(i-1,1);
                                codeObject.funcIDList.splice(i,1);
                                codeObject.contract.argumentTypes.splice(i-1,1);
                                codeObject.contract.funcIDList.splice(i,1);
                                renderProgram(createProgramHTML(program));
                        }
                }      
        }
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
droppedInDroppable is true if an object is droppedInDroppable, false otherwise. Depending on whether or not an an object is
droppedInDroppable, the stop function in #List's sortable will behave differently. This is important for updating
our model of the user's code.
*/
var droppedInDroppable = false;

/*
Stores the current state of the program that will later be added to historyarr
*/
var tempProgram = undefined;

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
                connectWith: "#options, .droppable",
                placeholder:'placeholder',
                start: function(event, ui){
                        if (ui.item === null){
                                throw new Error("sortable start: ui.item is undefined");
                        } else {
                                if (ui.item.is('li')){
                                        tempProgram = cloneProgram(program);
                                        carrying = ui.item.html();
                                        var index = ui.item.index();
                                        programCarrying = program[index];
                                        program.splice(index, 1);
                                } 
                        }
                },
                stop: function(event, ui) {
                        if (carrying != undefined && programCarrying !=undefined){
                                var replacement = $('<li>').append(carrying);
                                addDroppableFeature(replacement.find(('.droppable')));
                                ui.item.replaceWith(replacement);
                                setLiWidth();
                                if (programCarrying == undefined){
                                        throw new Error ("sortable stop: programCarrying is undefined/null");
                                }else if (!droppedInDroppable){
                                        program.splice(replacement.index(), 0, programCarrying);
                                }
                                addToHistory(tempProgram);
                                droppedInDroppable = false;
                                programCarrying = null;
                                carrying = null;
                        }
                },
                // remove: function(event, ui){

                //         console.log("removed");
                //         $(ui.item).detach();
                // },
                receive:function(event,ui){
                        if(ui.item === null){
                                throw new Error ("sortable receive");
                        }else{
                                if (!ui.item.is('span.draggable')){
                                        eliminateBorder(ui.sender.parent().parent());
                                }
                                // if(ui.sender.hasClass("DefineVar")){
                                //         var constdefinition=searchForIndex(ui.sender.attr('id'),program);
                                //         if(constdefinition.value!=undefined){
                                //                 var removeIndex=containsName(constdefinition.constName,constants);
                                //                 if(removeIndex != -1){
                                //                         constants.splice(removeIndex,1);
                                //                         makeDrawers();
                                //                         drawerButton(activated);
                                //                 }
                                //                 //throw error here
                                //         }
                                // }
                        }
                },
                tolerance:'pointer',
                cursor:'pointer',
                scroll:false
        });

        

        //allows for deletion
        $("#options").droppable({
                tolerance:'pointer',
                greedy:true,
                drop: function(event, ui){
                    if(carrying!=null && programCarrying !=null){
			if(!ui.draggable.is('span')){ //if ui.draggable is not from the drawer
			    console.log(ui.draggable);
                            if (draggedClone != undefined){
				eliminateBorder(draggedClone.closest($("th")));
				draggedClone = undefined;
                            }
                            $(ui.draggable).remove();
                            addToHistory(tempProgram);
                            programCarrying=null;
                            carrying=null;
                            setLiWidth();
			}
		    }
                    else{
                        throw new Error("tried to trash null")
                    }
                }
        });
});


var makeDrawersDraggable = function(){
        //Exprs things draggable from the drawer to the code
        $('.draggable').draggable({
                start: function(event, ui) {
                        tempProgram = cloneProgram(program);
                },
                helper: function(event, ui){
                        programCarrying = makeCodeFromOptions($(this).text());
                        carrying = createBlock(programCarrying);
                        return carrying;
                },
            connectToSortable: "#List",
	    zIndex:999
        });
}


/*
Adds dragging feature to jQuerySelection. This is applied to blocks within blocks.
*/
var addDraggingFeature = function(jQuerySelection) {
        if (jQuerySelection !== null){
                if(!jQuerySelection.hasClass('noDrag')){
                        jQuerySelection.draggable({
                                connectToSortable: "#List",
                                helper:'clone',
                                start:function(event, ui){
                                        if ($(this) === undefined){
                                                throw new Error ("addDraggingFeature start: $(this) is undefined");
                                        } else {
                                                tempProgram = cloneProgram(program);
                                                draggedClone = $(this);
                                                programCarrying = searchForIndex($(this).attr("id"), program);
                                                carrying = getHTML($(this));
                                                setChildInProgram($(this).closest($("th")).closest($("table")).attr("id"), $(this).attr("id"), undefined);
                                        }
                                },
                                stop:function(event, ui){
                                        if (programCarrying != null && carrying != null){
                                                program = tempProgram;
                                                renderProgram(createProgramHTML());
                                        }
                                }

                        });
                }
        }
};
/*
addClickableLiteralBox creates a literal block when a blue or orange droppable is clicked
*/
var addClickableLiteralBox = function(jQuerySelection, parent, child){
    console.log("WHYYY");
    if (jQuerySelection.children().length === 0){
	if(jQuerySelection.hasClass("Numbers")){
	    addClickableLiteralBoxHelper(jQuerySelection, new ExprNumber(), parent, child);
	}
	else if (jQuerySelection.hasClass("Strings")){
	    addClickableLiteralBoxHelper(jQuerySelection, new ExprString(), parent, child);
	}
    }
}

var addClickableLiteralBoxHelper = function(jQuerySelection, codeObject, parent, child) {
    addToHistory(cloneProgram(program));
	setChildInProgram(parent, child, codeObject);
        var html = createBlock(codeObject);
        $(jQuerySelection).css('border','none');
	jQuerySelection.html(html);
        addDroppableFeature(jQuerySelection);
};

/*
addDroppableFeature is a function that takes in a jQuery selector and applys droppable functionality
to that selector. This is applied to empty blocks within blocks.
*/
var addDroppableFeature = function(jQuerySelection) {
        if (jQuerySelection !== null){
                addDraggableToTable((jQuerySelection).find("table"));
	        jQuerySelection.mousedown(function(e) {
		    if (e.which === 1){
			addClickableLiteralBox($(this), $(this).closest($("table")).attr("id"),$(this).attr("id"));
		    }
		});
                jQuerySelection.droppable({
                        hoverClass:"highlight",
                        tolerance:"pointer",
                        greedy:true,
                        drop: function(event, ui){
                                if ($(this) === undefined){
                                        throw new Error ("addDroppableFeature drop: $(this) is undefined");
                                } 
                                else if($(this).children().length === 0){
                                        $(this).html(carrying);
                                        setChildInProgram($(this).closest($("table")).attr("id"),$(this).attr("id"),programCarrying);
                                        addDroppableFeature($(this).find('.droppable'));
                                        addDraggableToTable($(this).find("table"));
                                        $(this).css("border", "none");
                                        ui.draggable.detach();
                                        droppedInDroppable = true;
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

/*
eliminateBorder takes in a jQuerySelection and returns nothing.
It changes the jQuerySelection by adding a border and appending the word "Exp" inside the cell.
*/
var eliminateBorder = function(jQuerySelection){
        jQuerySelection.attr('style','border:3px;'+
                                        "border-style:solid;"+
                                        "border-radius:5px;"+
                                        "height:30px;" +
                                        "width:40px;"+
                                        "border-color:grey");
        jQuerySelection.children().detach();
        jQuerySelection.append(jQuerySelection.attr('name'));
}

/*
Sets the width of list items such that they span only the width of its contents, rather 
than the entire page
*/
var setLiWidth = function() {
        $("#List li").each(function() {
                $(this).width($(this).find("table").width() + 10);
        });
};

/*
Makes the jQuerySelection into an HTMLDom element
*/
var getHTML = function(jQuerySelection) {
        return $(jQuerySelection).wrap("<div>").parent().html();
};


/*====================================================================================
 __      __       _   _                      
 \ \    / /__ _ _| |_(_)_ _  __ _   ___ _ _  
  \ \/\/ / _ \ '_| / / | ' \/ _` | / _ \ ' \ 
   \_/\_/\___/_| |_\_\_|_||_\__, | \___/_||_| trash (done)
                            |___/                       
=====================================================================================*/



/*====================================================================================
  _____           _     
 |_   _|__ ___ __| |___ 
   | |/ _ \___/ _` / _ \
   |_|\___/   \__,_\___/
                         
=====================================================================================*/

/*

ALWAYS CHECK:
cross-browser compatability 
        currently not working on Firefox

7/9-7/11
Draggable from program to trash

7/11-7/13
Draggable blocks into blocks 
Add functionality for cond

7/16-7/20
update program array with drag & drop (Monday)
undo (Monday)
- full functionality of defines
        - user defined (function, constant) appearing in new drawer. deleting defines
        - Contracts in define full functionality (design check off by Shriram).
        - make plus buttons work
-Make Cond work
-Form Validation on Strings and Numbers

7/22-27
- Type checking
- run, stop
- save program
- Make Expr placeholders better
- Add functionality for structs


OPTIONAL
        - lists
        - lists of generic type
- Clean up appearance
*/


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

var argsArray = [];

function typeInfer(expr){
}
