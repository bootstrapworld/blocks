
window.assertType = function(obj, arr, type){
	var id = getId(obj, arr);
	return $(document.getElementById(id)).hasClass(type);
}
window.getId= function(obj, arr){
	 curr = obj;
	for(var i = 0; i < arr.length; i++){
		if(curr instanceof ExprApp){
			if(curr.args[arr[i]] != undefined){
				curr = curr.args[arr[i]];
			}else{
				return curr.funcIDList[arr[i]];
			}
		}else if(curr instanceof ExprCond){
			curr = curr.listOfBooleanAnswer[arr[i]];
		}else if(curr instanceof ExprBoolAnswer){
			if(arr[i] === 1){
				if(curr.answer != undefined){
					curr = curr.answer
				}else{
					return curr.funcIDList[1];
				}
			}else{
				if(curr.bool != undefined){
					curr = curr.bool
				}else{
					return curr.funcIDList[0];
				}
			}
		}else if(curr instanceof ExprDefineFunc){
			if(curr.expr != undefined){
				curr = curr.expr
			}else{
				return curr.funcIDList[0];
			}

		}else if(curr instanceof ExprDefineConst){
			if(curr.expr != undefined){
				curr = curr.expr
			}else{
				return curr.funcIDList[0];
			}
		}
	}
	return curr.id;
}