var makeConstraint = function(lhs, rhs){
	this.lhs = lhs;
	this.rhs = rhs;
}
/*
*lhs/rhs can be elems or constructed
*elem is an ID or a type or a makeConstant
*Constructed(constructor, List(elem))
*/

makeConstant = function(name){
	this.name = name;
}
makeConstruct = function(name, elemList){
	this.name = name;
	this.elemList = elemList;
}
error = function(id, message){
	this.id = id;
	this.message = message;
}
var errors = [];
var constraints = [];

Array.prototype.addArr = function(input){
	this[this.lenght] = input;
}


function buildConstraints(obj){
	var lhs;
	var rhs;
	var elemList;
	var curr;
	if(obj instanceof makeDefineConst){
        if(obj.expr == null){
        	errors.addArr(error(obj.funcIDList[0]), "Empty space");
        }else{
        	lhs = obj.id;
        	rhs = obj.expr.id;
        	constraints.addArr(makeConstraint(lhs, rhs))
        	buildConstraints(obj.expr);
        }
    }else if(obj instanceof makeDefineFunc){

    }else if(obj instanceof makeApp){
    	lhs = obj.id;
    	for(var i = 0, i < obj.args.length, i++){
    		if(obj.args[i] == null){
    			errors.addArr(error(obj.funcIDList[i]), "Empty space");
    			elemList.addArr(obj.funcIDList[i]);
    		}else{
    			elemList.addArr(obj.args[i].id);
    			buildConstraints(obj.args[i]);
    		}
    	}
    	elemList.addArr(obj.id);
    	rhs = makeConstruct(obj.funcName, elemList);
    	constraints.addArr(makeConstraint(lhs, rhs));
    	elemList = [];
    	for(a in functions[(containsName(functions, obj.funcName))].input){
    		elemList.addArr(a.type);
    	}
    	elemList.addArr(obj.outputType);
    	constraints.addArr(lhs, makeConstruct(obj.funcName, elemList));
    }else if(obj instanceof makeNumber
    		|| obj instanceof makeBoolean 
    		|| obj instanceof makeString){
    	constraints.addArr(obj.id, obj.outputType)
    }else if(obj instanceof makeConst){
    	constraints.addArr(obj.id, makeConstant(obj.constName));
    }else if(obj instanceof makeCond){
    	for(var i, i < obj.listOfBooleanAnswer.length, i++){
    		curr = listofBooleanAnswer[i];
    		//NEED RECURSIVE CONSTRAINTS? I.E.: [cond] = [ans1] = [ans2]
    		//or is it fine to have [cond] = [ans1] and [cond]=[ans2]
    		if(curr.answer == null){
    			errors.addArr(error(curr.id), "Empty Space")
    		}else{
    		constraints.addArr(makeConstraint(obj.id, curr.id))
    		buildConstraints(curr.answer)
    		}
    		if(curr.bool == null){
    			errors.addArr(error(curr.boolid), "Empty Space")
    		}else{
    		constraints.addArr(makeConstraint(curr.boolid, "Booleans"))
    		buildConstraints(curr.bool)
    		}
    	}

    }
    elemList = [];
}