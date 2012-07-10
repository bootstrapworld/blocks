var makeConstraint = function(lhs, rhs){
	this.lhs = lhs;
	this.rhs = rhs;
};
/*
*lhs/rhs can be elems or constructed
*elem is an ID or a type or a makeVariable
*Constructed(constructor, List(elem))
*/

// new makeVariable: string -> elem
makeVariable = function(name){
	this.name = name;
};


// Represents structured types in the type inference engine.
// new makeConstruct: string (listof elem) -> elem
makeConstruct = function(name, elemList){
	this.name = name;
	this.elemList = elemList;
};

error = function(id, message){
	this.id = id;
	this.message = message;
};



// TODO: eliminate global variables here: make buildConstrains consume these as
// arguments instead.
var errors = [];
var constraints = [];




function buildConstraints(obj){
	var lhs;
	var rhs;
	var elemList;
	var curr;
	if(obj instanceof makeDefineConst){
        if(obj.expr == null){
        	errors.push(error(obj.funcIDList[0]), "Empty space");
        }else{
        	lhs = obj.id;
        	rhs = obj.expr.id;
        	constraints.push(makeConstraint(lhs, rhs))
        	buildConstraints(obj.expr);
        }
    }else if(obj instanceof makeDefineFunc){

    }else if(obj instanceof makeApp){
    	lhs = obj.id;
    	for(var i = 0, i < obj.args.length, i++){
    		if(obj.args[i] == null){
    			errors.push(error(obj.funcIDList[i]), "Empty space");
    			elemList.push(obj.funcIDList[i]);
    		}else{
    			elemList.push(obj.args[i].id);
    			buildConstraints(obj.args[i]);
    		}
    	}
    	elemList.push(obj.id);
    	rhs = makeConstruct(obj.funcName, elemList);
    	constraints.push(makeConstraint(lhs, rhs));
    	elemList = [];
    	for(a in functions[(containsName(functions, obj.funcName))].input){
    		elemList.push(a.type);
    	}
    	elemList.push(obj.outputType);
    	constraints.push(lhs, makeConstruct(obj.funcName, elemList));
    }else if(obj instanceof makeNumber
    		|| obj instanceof makeBoolean 
    		|| obj instanceof makeString){
    	constraints.push(obj.id, obj.outputType)
    }else if(obj instanceof makeConst){
    	constraints.push(obj.id, makeVariable(obj.constName));
    }else if(obj instanceof makeCond){
    	for(var i, i < obj.listOfBooleanAnswer.length, i++){
    		curr = listofBooleanAnswer[i];
    		//NEED RECURSIVE CONSTRAINTS? I.E.: [cond] = [ans1] = [ans2]
    		//or is it fine to have [cond] = [ans1] and [cond]=[ans2]
    		if(curr.answer == null){
    			errors.push(error(curr.id), "Empty Space")
    		}else{
    		constraints.push(makeConstraint(obj.id, curr.id))
    		buildConstraints(curr.answer)
    		}
    		if(curr.bool == null){
    			errors.push(error(curr.boolid), "Empty Space")
    		}else{
    		constraints.push(makeConstraint(curr.boolid, "Booleans"))
    		buildConstraints(curr.bool)
    		}
    	}

    }
    elemList = [];
}