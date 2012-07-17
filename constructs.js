//(function(){

"use strict";
  // this function is strict...

// If there is no window.console, we'll make one up.
if (!window.console){
        $(document).ready(function() {
                var consoleDiv = $("<div id='console'/>");
                $(document.body).append(consoleDiv);
                consoleDiv.css("position", "absolute");
                consoleDiv.css("right", "10px");
                consoleDiv.css("top", "10px");
                consoleDiv.css("width", "300px");
                consoleDiv.css("height", "500px");
                consoleDiv.css("background-color", "white");
                consoleDiv.css("border", "1px solid red");
                consoleDiv.css("overflow", "scroll");
                window.console = { log: function() {
                                            var i;
                                            for (i = 0; i < arguments.length; i++) {
                                                consoleDiv.append($("<span/>").text(arguments[i]));
                                                consoleDiv.append($("<br/>")); 
                                             }
                                        }
                                 };
                
                 

        });
} 





/*====================================================================================
 ___       _          ___       __ _      _ _   _             
|   \ __ _| |_ __ _  |   \ ___ / _(_)_ _ (_) |_(_)___ _ _  ___
| |) / _` |  _/ _` | | |) / -_)  _| | ' \| |  _| / _ \ ' \(_-<
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
*/
var ExprDefineFunc = function(){
        this.contract = new ExprContract();
        this.argumentNames = undefined;
        this.expr = undefined;
        this.id = makeID();
        this.funcIDList = makeIDList(1);
        this.clone=function(){
                var temp=new ExprDefineFunc();
                temp.contract=this.contract.clone();
               if (this.argumentNames != undefined){
                        temp.argumentTypes=this.argumentNames.slice(0);
                }
                if (this.expr != undefined){
                        temp.expr=this.expr.clone();
                }
                temp.id=this.id;
                temp.funcIDList=this.funcIDList.slice(0);
                return temp;
        };
};

var ExprContract = function(){
        this.funcName = undefined;
        this.argumentTypes = undefined;
        this.outputType = undefined;
        this.id = makeID();
        this.clone=function(){
                var temp=new ExprContract();
                temp.funcName=this.funcName;
                if (this.argumentTypes != undefined){
                        temp.argumentTypes=this.argumentTypes.slice(0);
                }
                temp.outputType=this.outputType;
                temp.id=this.id;
                return temp;
        };
};

/*
Constucts the define variable block given a name (string), an expression which is an expression 
object, and an output type

(define x 3) =>
ExprDefinevar("x", ExprNum(3), "Numbers")

(define y (+ 2 x)) =>
ExprDefineVar("y", (ExprApp("+", [ExprNum("2"), ExprVar("x")))
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
        this.value = "";
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
        this.value = undefined;
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
list1 = [ExprBoolAnswer(ExprBoolean(true),ExprNum(2)).ExprBoolAnswer(ExprBoolean(False),ExprNum(1))]
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
                temp.id=this.id;
                return temp;
        };
};



//Functions is an array of objects containing a name, tuples of type and name corresponding to their inputs and an output type
var functions=[];
functions[0]={};
functions[0].name="+";
functions[0].input=[{type:"Numbers",name:"Exp1"},{type:"Numbers",name:"Exp2"}];
functions[0].output="Numbers";
functions[1]={};
functions[1].name="-";
functions[1].input=[{type:"Numbers",name:"Exp1"},{type:"Numbers",name:"Exp2"}];
functions[1].output="Numbers";
functions[2]={};
functions[2].name="*";
functions[2].input=[{type:"Numbers",name:"Exp1"},{type:"Numbers",name:"Exp2"}];
functions[2].output="Numbers";
functions[3]={};
functions[3].name="/";
functions[3].input=[{type:"Numbers",name:"Exp1"},{type:"Numbers",name:"Exp2"}];
functions[3].output="Numbers";
functions[4]={};
functions[4].name="remainder";
functions[4].input=[{type:"Numbers",name:"Exp1"},{type:"Numbers",name:"Exp2"}];
functions[4].output="Numbers";
functions[5]={};
functions[5].name="sqrt";
functions[5].input=[{type:"Numbers",name:"Exp1"}];
functions[5].output="Numbers";
functions[6]={};
functions[6].name="sqr";
functions[6].input=[{type:"Numbers",name:"Exp1"}];
functions[6].output="Numbers";
functions[7]={};
functions[7].name="expt";
functions[7].input=[{type:"Numbers",name:"Exp1"},{type:"Numbers",name:"Exp2"}];
functions[7].output="Numbers";
functions[8]={};
functions[8].name="=";
functions[8].input=[{type:"Numbers",name:"Exp1"},{type:"Numbers",name:"Exp2"}];
functions[8].output="Booleans";
functions[9]={};
functions[9].name=">";
functions[9].input=[{type:"Numbers",name:"Exp1"},{type:"Numbers",name:"Exp2"}];
functions[9].output="Booleans";
functions[10]={};
functions[10].name="<";
functions[10].input=[{type:"Numbers",name:"Exp1"},{type:"Numbers",name:"Exp2"}];
functions[10].output="Booleans";
functions[11]={};
functions[11].name="<=";
functions[11].input=[{type:"Numbers",name:"Exp1"},{type:"Numbers",name:"Exp2"}];
functions[11].output="Booleans";
functions[12]={};
functions[12].name=">=";
functions[12].input=[{type:"Numbers",name:"Exp1"},{type:"Numbers",name:"Exp2"}];
functions[12].output="Booleans";
functions[13]={};
functions[13].name="even?";
functions[13].input=[{type:"Numbers",name:"Exp1"}];
functions[13].output="Booleans";
functions[14]={};
functions[14].name="odd?";
functions[14].input=[{type:"Numbers",name:"Exp1"}];
functions[14].output="Booleans";
functions[15]={};
functions[15].name="string-append";
functions[15].input=[{type:"Strings",name:"String1"},{type:"Strings",name:"String2"}];
functions[15].output="Strings";
functions[16]={};
functions[16].name="string-length";
functions[16].input=[{type:"Strings",name:"String1"}];
functions[16].output="Numbers";
functions[17]={};
functions[17].name="string=?";
functions[17].input=[{type:"Strings",name:"String1"},{type:"Strings",name:"String2"}];
functions[17].output="Booleans";
functions[18]={};
functions[18].name="and";
functions[18].input=[{type:"Booleans",name:"Boolean Exp1"},{type:"Booleans",name:"Boolean Exp2"}];
functions[18].output="Booleans";
functions[19]={};
functions[19].name="or";
functions[19].input=[{type:"Booleans",name:"Boolean Exp1"},{type:"Booleans",name:"Boolean Exp2"}];
functions[19].output="Booleans";
functions[20]={};
functions[20].name="not";
functions[20].input=[{type:"Booleans",name:"Boolean Exp1"}];
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

//constants is an array of user defined variables containing their name and type
var constants=[];

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
var codeHeight;
var codeWidth;
// Which Drawer type is currently being displayed
var activated;
// which text block in the #code div is currently being focused
var focused=null;
// ID that matches together a code object and an HTML element
var ID =0;


//resizes code div when the window is resized
function onResize(){
        codeHeight = $(window).height() - $("#header").height() - $("#Drawer").height();
        codeWidth = $(window).width();
        $("#code").height(codeHeight);
        $("#code").width(codeWidth);
        $("#List").height(codeHeight - 150);
        $("#List").width(codeWidth - 150);
}


$(document).ready(function(){
        //When the window is resized, the height of the width of the code div changes
        $(window).resize(onResize);
        onResize();

        //draws drawers when the page is loaded
        makeDrawers(functions,constants);

        // activated is initially set to "Numbers"
        activated = $("#options #Numbers");
        activated.css("visibility", "visible");

        /*
        adds a stylesheet to <head> such that blocks can be colored according to their type
        */
        renderTypeColors();
    
        /*
        sets focus equal to the input that is focused. 
        */
        $("#List input").live('focus',function(){
            focused=$(this);
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
                                        codeObject.value = inputtext;

                                                focused.css("background-color", colors.Numbers);
                                        focused=null;
                                }
                        }

                        //STRINGS
                        else if(focused.closest($("table")).attr("class")==="Strings"){
                                codeObject.value = inputtext;
                                        focused=null;
                        }
                        //TODO saving values
                    }
                };
        $(document.body).live('click', formValidation);

        /*
        Binds undo functionality with undo button
        */
        $("#undoButton").bind('click', function(){
                if (historyarr.length !== 0){
                        future.unshift(cloneProgram(program));
                        program = historyarr.pop();
                        renderProgram(createProgramHTML());
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
                }
        });
});

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

//During the course of the whole session, drawers can be opened and closed to reveal all of the buttons (functions) that they contain
$(".bottomNav").live('click', function(e){
    drawerButton($(this));
});

//DrawerButton takes in an element and either activates (shows) or deactivates (hides) the current element to show the new one
function drawerButton(elt){
                activated.css("visibility","hidden");
                activated = $("#options #" + elt.attr('id'));
                activated.css("visibility", "visible");
}

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

//makeDrawers takes in all of the functions and all of the constants and will change the HTML so that each of the types is an openable drawer and when that drawer is opened
//all of the functions corresponding to that type are displayed
// INJECTION ATTACK FIXME
function makeDrawers(allFunctions,allConstants){
        var typeDrawers=makeTypesArray(allFunctions,allConstants);
        var Drawers="<div id=\"options\">\n";
        var Selector="<div id=\"selectors\">\n";
        var i;
        for(var Type in typeDrawers){
                if(typeDrawers.hasOwnProperty(Type)){
                Drawers+="<div id=\""+Type+"\">\n";
                if(Type==="Constants"){
                        for(i=0;i<typeDrawers[Type].length;i++){
                                Drawers+="<span class=\"draggable "+Type+"\">"+allConstants[typeDrawers[Type][i]].name+"</span>\n";
                        }
                }
                else if(Type==="Define"){
                        for(i=0;i<typeDrawers[Type].length;i++){
                                Drawers+="<span class=\"draggable "+Type+"\">"+typeDrawers[Type][i]+"</span>\n";
                        }
                }
                else if(Type==="Expressions"){
                        for(i=0;i<typeDrawers[Type].length;i++){
                                Drawers+="<span class=\"draggable "+Type+"\">"+typeDrawers[Type][i]+"</span>\n";
                        }
                }
                else{
                        for(i=0;i<typeDrawers[Type].length;i++){
                                if(typeDrawers[Type][i]==="true"){
                                        Drawers+="<span class=\"Booleans draggable\">true</span>\n";
                                }
                                else if(typeDrawers[Type][i]==="false"){
                                        Drawers+="<span class=\"Booleans draggable\">false</span>\n";
                                }
                                else if(typeDrawers[Type][i]==="Text"){
                                        Drawers+="<span class=\"Strings draggable\">Text</span>\n";
                                }
                                else if(typeDrawers[Type][i]==="Number"){
                                        Drawers+="<span class=\"Numbers draggable\">Number</span>\n";
                                }
                                else{
                                Drawers+="<span class=\"draggable "+allFunctions[typeDrawers[Type][i]].output+"\">"+allFunctions[typeDrawers[Type][i]].name+"</span>\n";
                        }
                        }
                }

                Drawers+="</div>\n";
                Selector+="<div class=\""+Type+" bottomNav\" id=\""+Type+"\">"+Type+"</div>\n";
        }
        }

        Drawers+="</div>";
        Selector+="</div>";
        document.getElementById("Drawer").innerHTML=Drawers+"\n"+Selector;
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
        for (var i = 0; i < program.length; i++){
                pageHTML += "<li>" + createBlock(program[i]) + "</li>";
        }
        return pageHTML;
};

/*
renderProgram takes in a string (programHTML) and changes the contents of #List to 
programHTML
*/
var renderProgram = function(programHTML){
        $("#List").html(programHTML);
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
createFunctionBlock takes as input a functionIndex and will output an HTML element corresponding to 
that function with name, color, and spaces for input blocks
 createFunctionBlock: number -> string
 */
 function createFunctionBlock(functionIndex, codeObject){
        var func = functions[functionIndex];
        var block = "<table class=\"expr " + func.output  +"\"" + " id=\""+codeObject.id+"\">";
        block += "<tr><th>" + encode(func.name) + "</th>";
        var i;
        for(i = 0; i < func.input.length; i++){
                if (codeObject.args[i] != undefined){
                         block += "<th class=\"" + encode(func.input[i].type) +" noborder droppable\" id=\""+codeObject.funcIDList[i]+"\">" + createBlock(codeObject.args[i]);
                }
                else{
                        block+= "<th class=\"" + encode(func.input[i].type) +" droppable\" id=\""+codeObject.funcIDList[i]+"\">" + func.input[i].name;
                }
                block+="</th>";
        }

        return block + "</tr></table>";
 }

//createDefineBlock outputs the block corresponding to defining a function
function createDefineBlock(codeObject){
        var block ="<table class=\"Define\" style=\"background: " + colors.Define +";\"" + " id=\""+codeObject.id+"\">";
        //contract
        block+="<tr><th><input id=\"name\"></th><th> : </th><th>"+generateTypeDrop()+"</th><th> <button class=\"buttonPlus\">+</button> </th><th> -> </th><th>"+generateTypeDrop()+"</th></th></tr>";
        //define block
        block+="<tr><th>define</th>";
        block+="<th class=\"expr\"> <input type=\"Name\" id=\"Name\" name=\"Name\"/><th class=\"expr\">args <th  class=\"expr\">expr";
        return block + "</tr></table>";
}

//createDefineVarBlock outputs the block corresponding to creating a variable
function createDefineVarBlock(codeObject){
        var block = "<table class=\"Define\" " + "id=\""+codeObject.id+"\"><tr><th>define</th>";
        block+="<th class=\"expr\"> <input/> <th  id=\"" + codeObject.funcIDList[0] + "\" class=\"expr droppable";
        if (codeObject.expr == undefined){
                block+= "\"> Exp";
        } else{
                block += " noborder\">" + createBlock(codeObject.expr);
        }
        return block + "</th></tr></table>";
}

//createDefineStructBlock outputs the block corresponding to creating a structure
function createDefineStructBlock(codeObject){
        var block ="<table class=\"Define\" " + "id=\""+codeObject.id+"\"><tr><th>define-struct</th>";
        block+="<th class=\"expr\"><input type=\"Name\" id=\"Name\" name=\"Name\"/><th class=\"expr\">properties";
        return block + "</tr></table>";
}

//createCondBlock outputs the block corresponding to creating a conditional
function createCondBlock(codeObject){
        var block =  "<table class=\"expr Expressions\" " + "id=\""+codeObject.id+"\"><tr><th>cond</tr>";
        block+="<tr id=\"" + codeObject.id + "\"><th><th id=\"" + codeObject.funcIDList[0] + "\" class=\"Booleans expr\">boolean <th id=\"" + codeObject.funcIDList[1] + "\" class=\"expr\">expr</tr>";
        block+="<tr><th><th><button class=\"buttonCond\">+</button></th></tr>";
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
        var block =  "<table class=\"Numbers expr\" " + "id=\""+codeObject.id+"\" width=\"10px\"><tr><th><input style=\"width:50px;\"></tr>";
        return block + "</table>";
}
function createStringBlock(codeObject){
        var block =  "<table class=\"Strings expr\" " + "id=\""+codeObject.id+"\"><tr><th>\"<input class=\"Strings\">\"</tr>";
        return block + "</table>";
}

function stringToElement(string){
        var wrapper= document.createElement('div');
        wrapper.innerHTML=string;
        return wrapper.firstChild;
}

/*
Creates a drop down menu for use in the contract in order to select types.
*/
function generateTypeDrop(){
        var HTML = "<select name=\"TypeDrop\"><option value=\"select\">select</option>";
        for(var i=0;i<types.length;i++){
                HTML+="<option value=\""+ types[i] +"\" class=\""+ types[i]+"\">"+ types[i] +"</option>";
        }
        return HTML+"<option value=\"delete\">delete</option></select>";
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
dropped is true if an object is dropped, false otherwise. Depending on whether or not an an object is
dropped, the stop function in #List's sortable will behave differently. This is important for updating
our model of the user's code.
*/
var dropped = false;

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
                connectWith: "#trash, .droppable",
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
                        if (carrying === null || ui.item === null){
                                throw new Error("sortable stop: carrying is undefined");
                        } else{
                                var replacement = $('<li>').append(carrying);
                                addDroppableFeature(replacement.find(('.droppable')));
                                ui.item.replaceWith(replacement);
                                setLiWidth();
                                if (programCarrying == undefined){
                                        throw new Error ("sortable stop: programCarrying is undefined/null");
                                }else if (!dropped){
                                        program.splice(replacement.index(), 0, programCarrying);
                                }
                                historyarr.push(tempProgram);
                                future = [];
                                dropped = false;
                                programCarrying = null;
                                carrying = null;
                        }
                },
                remove: function(event, ui){
                        $(ui.item).detach();
                },
                receive:function(event,ui){
                        if(ui.item === null){
                                throw new Error ("sortable receive");
                        }else{
                                if (!ui.item.is('span.draggable')){
                                        eliminateBorder(ui.sender.parent().parent());
                                }
                        }
                },
                tolerance:'pointer',
                cursor:'pointer',
                scroll:false
        });


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
                connectToSortable: "#List, #trash"
        });

        //allows for deletion
        $("#trash").droppable({
                tolerance:'touch',
                drop: function(event, ui){
                        dropped = true;
                        if (draggedClone != undefined){
                                eliminateBorder(draggedClone.closest($("th")));
                                draggedClone = undefined;
                        }
                        $(ui.draggable).remove();
                        historyarr.push(tempProgram);
                        future = [];
                }
        });
});

/*
Adds dragging feature to jQuerySelection. This is applied to blocks within blocks.
*/
var addDraggingFeature = function(jQuerySelection) {
        if (jQuerySelection !== null){
                jQuerySelection.draggable({
                        connectToSortable: "#List, trash",
                        helper:'clone',
                        start:function(event, ui){
                                if ($(this) === undefined){
                                        throw new Error ("addDraggingFeature start: $(this) is undefined");
                                } else {
                                        tempProgram = cloneProgram(program);
                                        draggedClone = $(this);
                                        programCarrying = searchForIndex($(this).attr("id"), program);
                                        carrying = getHTML($(this));
                                        console.log($(this).closest($("th")).closest($("table")).attr("id"), $(this).attr("id"));
                                        setChildInProgram($(this).closest($("th")).closest($("table")).attr("id"), $(this).attr("id"), undefined);
                                }
                        }

                });
        }
};

/*
addDroppableFeature is a function that takes in a jQuery selector and applys droppable functionality
to that selector. This is applied to empty blocks within blocks.
*/
var addDroppableFeature = function(jQuerySelection) {
        if (jQuerySelection !== null){
                addDraggingFeature((jQuerySelection).find("table"));
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
                                        addDraggingFeature($(this).find("table"));
                                        $(this).css("border", "none");
                                        ui.draggable.detach();
                                        dropped = true;
                                        future = [];
                                }
                        }
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
        jQuerySelection.append("Exp")
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

7/22-27
- Type checking
- run, stop
- save program
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

//}());
