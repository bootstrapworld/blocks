'use strict'


var constraint = function(lhs, rhs){
	this.lhs = lhs;
	this.rhs = rhs;
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
function isElem(obj){
    return(obj instanceof elemId || obj instanceof elemType)
}



//to create errors with a handy dandy message
var error = function(id, message){
	this.id = id;
	this.message = message;
};



//contains a mapping of function names to constraints
var funcConstruct = {};
//build funcConstraint
function buildFuncConstructs(){
    var elemList = [];
    for(var i=0; i<functions.length; i++){
        elemList = [];
        elemList.push(new elemType(functions[i].output));
        for(var k; k<functions[i].input.length){
            elemList.push(new elemType(functions[i].input[k].type))
        }
        funcConstraint[functions[i].name] = new construct("func", elemList);
    }
}


//obj - the object being inferred upon
//          if lambdas or lets, use concat procedure to create a new array and avoid mutation which would screw everything
//parentId is the id from the parent's funcIDList that points to the current object

//change push to concat
function buildConstraints(obj, parentId){
    var lhs;
    var rhs;
    var next;
    var errors =[];
    var constraints =[];
    var i;
    var elemList;
    if(obj instanceof ExprDefineConst){
        if(obj.expr === undefined){
            errors.push(new error(obj.funcIDList[0], "Empty space");
        }else{
            lhs = new elemId(obj.id);
            rhs = new elemId(obj.funcIDList[0]);
            next = buildConstraints(obj.expr, obj.funcIDList[0]);
            errors = next.errors;
            constraints = next.constraints;
            constraints.push(new constraint(lhs,rhs));
        }
    }else if(obj instanceof ExprDefineFunc){
        for(i = 0; i<obj.funcIDList.length){
            elemList.push(new elemId(obj.funcIDList[i]))
        }
        lhs = new variable(obj.contract.funcName)
        constraints.push(new constraint(lhs, new construct("func", elemList)));
        if(obj.expr !== undefined){
            next = buildConstraints(obj.expr, obj.funcIDList[0])
            constraints = constraints.concat(next.constraints);
            errors = errors.concat(next.errors);
        }else{
            errors.push(new error(obj.funcIDList[0], "Empty space");
        }
    }else if(obj instanceof ExprApp){
        lhs = elemId(obj.id);
        elemList = [];
        if(parentId === undefined){
            elemList.push(new elemType(obj.outputType));
        }else{
          elemList.push(new elemId(parentId))
        }
        for(i=0; i<obj.funcIDList.length){
            elemList.push(new elemId(obj.funcIDList[i]));
            if(obj.args[i] === undefined){
                errors.push(new error(obj.funcIDList[i]), "Empty space")
            }else{
                next = buildConstraints(obj.args[i], obj.funcIDList[i])
                errors = errors.concat(next.errors);
                constraints = constraints.concat(next.constraints);
            }
        }
        rhs = new construct("func", elemList);
        constraints.push(new constraint(lhs, rhs));
        elemList = []
        constraints.push(new constraint(rhs, funcConstruct[obj.funcName]));
    }else if(obj instanceof ExprConst){
        lhs = new elemId(obj.id);
        rhs = new variable(obj.constName);
        constraints.push(new constraint(lhs, rhs));
        if(parentId !== undefined){
            constraints.push(new constraint(lhs, new elemId(parentId)));
        }
        if(containsName(constants, obj.constName) === -1 && containsName(functions, obj.constName)===-1){
            errors.push(new error(obj.id, "The variable or constant " + obj.constName + " does not exist."));
        }
    }else if(isLiteral(obj)){
        lhs = new elemId(obj.id);
        if(parentId !== undefined){
            rhs = new elemId(parentId);
            constraints.push(new constraint(lhs, rhs));
        }
        rhs = obj.outputType;
        constraints.push(new constraint(lhs, rhs));
        if(obj.value === undefined){
            errors.push(new error(obj.id, "Empty space"));
        }
    }else if(obj instanceof ExprCond){
        lhs = new elemId(obj.id);
        if(parentId !== undefined){
            constraints.push(new constraint(lhs, new elemId(parentId)));
        }
        for(i=0; i<obj.listOfBooleanAnswer.length){
        //deal with answers
            if(obj.listOfBooleanAnswer[i].answer !== undefined){
                next = buildConstraints(obj.listOfBooleanAnswer[i].answer, obj.listOfBooleanAnswer[i].funcIDList[1])
                constraints = constraints.concat(next.constraints);
                errors = errors.concat(next.errors);
            }else{
                errors.push(new error(obj.listOfBooleanAnswer[i].funcIDList[1], "Empty space"));
            }
            constraints.push(new constraint(lhs, new elemId(obj.listOfBooleanAnswer[i].funcIDList[1])))
        //deal with question
            if(obj.listOfBooleanAnswer[i].bool !== undefined){
                next = buildConstraints(obj.listOfBooleanAnswer[i].bool, obj.listOfBooleanAnswer[i].funcIDList[0])
                constraints = constraints.concat(next.constraints);
                errors = errors.concat(next.errors);
            }else{
                errors.push(new error(obj.listOfBooleanAnswer[i].funcIDList[0], "Empty space"));
            }
            constraints.push(new elemId(obj.listOfBooleanAnswer[i].funcIDList[1]), new elemType("Booleans"))            
        }
    }
    return {errors: errors, 
            constraints: constraints};
}
// function legalName(name){
//     for(var i = 0; i < restricted.length; i++){
//         if(name === restricted[i])
//             return false
//     }

//     if(name.indexOf(" ") !== -1 ||
//         name.indexOf("\"") !== -1 ||
//         name.indexOf("(") !== -1 ||
//         name.indexOf(")") !== -1 ||
//         name.indexOf("[") !== -1 ||
//         name.indexOf("]") !== -1 ||
//         name.indexOf("{") !== -1 ||
//         name.indexOf("}") !== -1 ||
//         name.indexOf(",") !== -1 ||
//         name.indexOf("'") !== -1 ||
//         name.indexOf("`") !== -1 ||
//         name.indexOf(";") !== -1 ||
//         name.indexOf("|") !== -1 ||
//         name.indexOf("\\") !== -1 ||
//         name.isNaN)
// }





//TEST CASES:
var s1 = new ExprString();
s1.value = "test"
var f1 = new ExprApp("+");
var n1 = new ExprNumber();
errorCheck(buildConstraints(s1).constraints, [new constraint(new elemId(s1.id), new elemType("Strings"))]);
errorCheck(buildConstraints(s1).errors, []);
errorCheck(buildConstraints(n1).constraints, [new constraint(new elemId(s1.id), new elemType("Numbers"))]);
errorCheck(buildConstraints(n1).errors, [new error(n1.id, "Empty space")]);
errorCheck(buildConstraints(f1).constraints, [new constraint(new elemId(f1.id), new construct("func", [new elemId(f1.funcIDList[0]), new elemId(f1.funcIDList[1])])),
                                new constraint(new elemId(f1.id), new construct("func", [new elemType("Numbers"), new elemType("Numbers")]))]);
errorCheck(buildConstraints(f1).errors, [new error(f1.funcIDList[0], "Empty space"), new error(f1.funcIDList[1], "Empty space")]);
f1.args[0] = s1;
errorCheck(buildConstraints(f1).constraints, [
                                new constraint(new elemId(f1.id), new construct("func", [new elemType("Numbers"), new elemId(f1.funcIDList[0]), new elemId(f1.funcIDList[1])])),
                                new constraint(new elemId(f1.id), new construct("func", [new elemType("Numbers"), new elemType("Numbers"), new elemType("Numbers")])),
                                new constraint(new elemId(s1.id), new elemId(f1.funcIDList[0])),
                                new constraint(new elemId(s1.id), new elemType("Strings"))]);
errorCheck(buildConstraints(f1).errors, [new error(f1.funcIDList[1], "Empty space")]);
f1.args[1] = n1;
errorCheck(buildConstraints(f1).constraints, [
                                new constraint(new elemId(f1.id), new construct("func", [new elemType("Numbers"), new elemId(f1.funcIDList[0]), new elemId(f1.funcIDList[1])])),
                                new constraint(new elemId(f1.id), new construct("func", [new elemType("Numbers"), new elemType("Numbers"), new elemType("Numbers")])),
                                new constraint(new elemId(s1.id), new elemId(f1.funcIDList[0])),
                                new constraint(new elemId(s1.id), new elemType("Strings")),
                                new constraint(new elemId(n1.id), new elemType("Numbers"))]);
errorCheck(buildConstraints(f1).errors, [new error(n1.id, "Empty space")]);
n1.value = 19;
errorCheck(buildConstraints(f1).constraints, [
                                new constraint(new elemId(f1.id), new construct("func", [new elemType("Numbers"), new elemId(f1.funcIDList[0]), new elemId(f1.funcIDList[1])])),
                                new constraint(new elemId(f1.id), new construct("func", [new elemType("Numbers"), new elemType("Numbers"), new elemType("Numbers")])),
                                new constraint(new elemId(s1.id), new elemId(f1.funcIDList[0])),
                                new constraint(new elemId(s1.id), new elemType("Strings")),
                                new constraint(new elemId(n1.id), new elemType("Numbers"))]);
errorCheck(buildConstraints(f1).errors, []);
var d1 = new ExprDefineConst();
errorCheck(buildConstraints(d1).constraints, [new constraint(new elemId(d1.id), new elemId(d1.funcIDList[0]))]);
errorCheck(buildConstraints(d1).errors, [new error(d1.funcIDList[0], "Empty space")]);
var f2 = new ExprApp("place-image");
errorCheck(buildConstraints(f2).constraints, [
                                new constraint(new elemId(f1.id), new construct("func", [new elemType("Images"), new elemId(f1.funcIDList[0]), new elemId(f1.funcIDList[1]), new elemId(f1.funcIDList[2]), new elemId(f1.funcIDList[3])])),
                                new constraint(new elemId(f1.id), new construct("func", [new elemType("Images"), new elemType("Images"), new elemType("Numbers"), new elemType("Numbers"), new elemType("Images")]))]);
errorCheck(buildConstraints(f2).errors, [
                                new error(f1.funcIDList[0], "Empty space"),
                                new error(f1.funcIDList[1], "Empty space"),
                                new error(f1.funcIDList[2], "Empty space"),
                                new error(f1.funcIDList[3], "Empty space")]);
var d2 = new ExprDefineFunc();
errorCheck(buildConstraints(d2).constraints, [new constraint(new elemId(d2.id), new elemId(d2.funcIDList[0]))]);
errorCheck(buildConstraints(d2).errors, [new error(d1.funcIDList[0], "Empty space"), new error(d1.id, "No arguments")]);
d2.args[0] = ["x"];
d2.funcIDList.push(makeID());
errorCheck(buildConstraints(d2).constraints, [new constraint(new elemId(d2.id), new elemId(d2.funcIDList[0])),
                                              new constraint(new variable("x"), new elemId(d2.funcIDList[1]))]);
errorCheck(buildConstraints(d2).errors, [new error(d1.funcIDList[0], "Empty space")]);
var f3 = new ExprApp("/");
f3.args[0] = new ExprConst("x");
f3.args[1] = new ExprNumber();
f3.args[1].value = 3;
d2.expr = f3;
errorCheck(buildConstraints(d2).constraints, [new constraint(new elemId(d2.id), new elemId(d2.funcIDList[0])),
                                              new constraint(new variable("x"), new elemId(d2.funcIDList[1])),
                                              new constraint(new elemId(f3.id), new construct("func", [new elemId(d2.funcIDList[0]),
                                                                    new elemId(f3.funcIDList[0]), new elemId(f3.funcIDList[1])]))
                                              new constraint(new elemId(f3.id), new construct("func", [new elemType("Numbers"),
                                                                    new elemType("Numbers"), new elemType("Numbers")]))
                                              new constraint(new elemId(f3.args[0].id), new elemId(f3.funcIDList[0]))
                                              new constraint(new elemId(f3.args[0].id), new variable("x"))
                                              new constraint(new elemId(f3.args[1].id), new elemId(f3.funcIDList[1]))
                                              new constraint(new elemId(f3.args[1].id), new elemType("Strings"))]);
errorCheck(buildConstraints(d2).errors, []);
var c1 = new ExprCond();
c1.listOfBooleanAnswer[1] = new ExprBoolAnswer();
c1.listOfBooleanAnswer[0].bool = new ExprBoolean(false);
c1.listOfBooleanAnswer[1].bool = new ExprBoolean(true);
c1.listOfBooleanAnswer[0].answer = new ExprBoolean(false);
c1.listOfBooleanAnswer[1].answer = new ExprNumber();
c1.listOfBooleanAnswer[1].answer.value = 19;
errorCheck(buildConstraints(c1).constraints, [new constraint(new elemId(c1.id), c1.listOfBooleanAnswer[0].funcIDList[1])
                                              new constraint(new elemId(c1.id), c1.listOfBooleanAnswer[1].funcIDList[1])
                                              new constraint(new elemId(c1.listOfBooleanAnswer[0].funcIDList[0]), new elemType("Booleans"))
                                              new constraint(new elemId(c1.listOfBooleanAnswer[1].funcIDList[0]), new elemType("Booleans"))
                                              new constraint(new elemId(c1.listOfBooleanAnswer[0].bool.id), new elemId(c1.listOfBooleanAnswer[0].funcIDList[0])
                                              new constraint(new elemId(c1.listOfBooleanAnswer[1].bool.id), new elemId(c1.listOfBooleanAnswer[1].funcIDList[0])
                                              new constraint(new elemId(c1.listOfBooleanAnswer[0].bool.id), new elemType("Booleans"))
                                              new constraint(new elemId(c1.listOfBooleanAnswer[1].bool.id), new elemType("Booleans"))
                                              new constraint(new elemId(c1.listOfBooleanAnswer[0].answer.id), new elemId(c1.listOfBooleanAnswer[0].funcIDList[1])
                                              new constraint(new elemId(c1.listOfBooleanAnswer[1].answer.id), new elemId(c1.listOfBooleanAnswer[1].funcIDList[1])
                                              new constraint(new elemId(c1.listOfBooleanAnswer[0].answer.id), new elemType("Booleans"))
                                              new constraint(new elemId(c1.listOfBooleanAnswer[1].answer.id), new elemType("Strings"))
                                              ]);
errorCheck(buildConstraints(c1).errors, []);