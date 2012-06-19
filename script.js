var functions=[];
functions[0]={};
functions[0].name="+";
functions[0].input=new Array("Numbers","Numbers");
functions[0].output="Numbers";
functions[1]={};
functions[1].name="-";
functions[1].input=new Array("Numbers","Numbers");
functions[1].output="Numbers";
functions[2]={};
functions[2].name="*";
functions[2].input=new Array("Numbers","Numbers");
functions[2].output="Numbers";
functions[3]={};
functions[3].name="/";
functions[3].input=new Array("Numbers","Numbers");
functions[3].output="Numbers";
functions[4]={};
functions[4].name="remainder";
functions[4].input=new Array("Numbers","Numbers");
functions[4].output="Numbers";
functions[5]={};
functions[5].name="sqrt";
functions[5].input=new Array("Numbers");
functions[5].output="Numbers";
functions[6]={};
functions[6].name="sqr";
functions[6].input=new Array("Numbers");
functions[6].output="Numbers";
functions[7]={};
functions[7].name="expt";
functions[7].input=new Array("Numbers","Numbers");
functions[7].output="Numbers";
functions[8]={};
functions[8].name="=";
functions[8].input=new Array("Numbers","Numbers");
functions[8].output="Booleans";
functions[9]={};
functions[9].name=">";
functions[9].input=new Array("Numbers","Numbers");
functions[9].output="Booleans";
functions[10]={};
functions[10].name="<";
functions[10].input=new Array("Numbers","Numbers");
functions[10].output="Booleans";
functions[11]={};
functions[11].name="<=";
functions[11].input=new Array("Numbers","Numbers");
functions[11].output="Booleans";
functions[12]={};
functions[12].name=">=";
functions[12].input=new Array("Numbers","Numbers");
functions[12].output="Booleans";
functions[13]={};
functions[13].name="even?";
functions[13].input=new Array("Numbers");
functions[13].output="Booleans";
functions[14]={};
functions[14].name="odd?";
functions[14].input=new Array("Numbers");
functions[14].output="Booleans";
functions[15]={};
functions[15].name="string-append";
functions[15].input=new Array("Strings","Strings");
functions[15].output="Strings";
functions[16]={};
functions[16].name="string-length";
functions[16].input=new Array("Strings");
functions[16].output="Numbers";
functions[17]={};
functions[17].name="string=?";
functions[17].input=new Array("Strings","Strings");
functions[17].output="Booleans";
functions[18]={};
functions[18].name="true";
functions[18].input=new Array();
functions[18].output="Booleans";
functions[19]={};
functions[19].name="false";
functions[19].input=new Array();
functions[19].output="Booleans";
functions[20]={};
functions[20].name="and";
functions[20].input=new Array("Booleans", "Booleans");
functions[20].output="Booleans";
functions[21]={};
functions[21].name="or";
functions[21].input=new Array("Booleans", "Booleans");
functions[21].output="Booleans";
functions[22]={};
functions[22].name="not";
functions[22].input=new Array("Booleans");
functions[22].output="Booleans";
functions[23]={};
functions[23].name="(define variable)";
functions[23].input=new Array("Any");
functions[23].output="Any";
functions[24]={};
functions[24].name="(define function)";
functions[24].input=new Array("Any");
functions[24].output="Any";
functions[25]={};
functions[25].name="define-struct";
functions[25].input=new Array("Any");
functions[25].output="Any";
functions[26]={};
functions[26].name="cond";
functions[26].input=new Array("Any");
functions[26].output="Any";
functions[27]={};
functions[27].name="rectangle";
functions[27].input=new Array("Numbers", "Numbers", "Strings", "Strings");
functions[27].output="Images";
functions[28]={};
functions[28].name="circle";
functions[28].input=new Array("Numbers", "Strings", "Strings");
functions[28].output="Images";
functions[29]={};
functions[29].name="triangle";
functions[29].input=new Array("Numbers", "Strings", "Strings");
functions[29].output="Images";
functions[30]={};
functions[30].name="ellipse";
functions[30].input=new Array("Numbers", "Numbers", "Strings", "Strings");
functions[30].output="Images";
functions[31]={};
functions[31].name="star";
functions[31].input=new Array("Numbers", "Strings", "Strings");
functions[31].output="Images";
functions[32]={};
functions[32].name="scale";
functions[32].input=new Array("Numbers","Images");
functions[32].output="Images";
functions[33]={};
functions[33].name="rotate";
functions[33].input=new Array("Numbers", "Images");
functions[33].output="Images";
functions[34]={};
functions[34].name="place-image";
functions[34].input=new Array("Images", "Numbers", "Numbers", "Images");
functions[34].output="Images";



var colors=new Array()
colors[0]={}
colors[0].name="Numbers"
colors[0].color="#33CCFF"
colors[1]={}
colors[1].name="Strings"
colors[1].color="orange"
colors[2]={}
colors[2].name="Images"
colors[2].color="#66FF33"
colors[3]={}
colors[3].name="Booleans"
colors[3].color="#CC33FF"
colors[4]={}
colors[4].name="Any"
colors[4].color="white"


function makeTypesArray(allFunctions){
	var types=[]
	for(func in allFunctions){
		var curOutput=func.output
		if(types.contains(curOutput)){

		}
		else{

		}
		var curInput=func.input
		if(curOutput!="Images"){

		}
	}



	return types
}

//var types = new Array();
//types[0]={}()
//types[0].section="Numbers"
//types[0].functions=new Array("+","-", "*", "/", "remainder", "sqrt", "sqr", "expt", "=", ">",)



/*
* Sets the panels with function names to visible and invisible when hidden
*
*/
var activated = null;
var currID = null;
$(".bottomNav").bind('click', function(){
	if ($(this).attr('id') == currID) {
		activated.css("visibility","hidden");
		activated = null;
		currID = null;
		$("#options").css("visibility", "hidden");
	}else if (currID === null){
		activated = $("#options #" + $(this).attr('id'))
		currID = $(this).attr('id')
		activated.css("visibility", "visible");
		$("#options").css("visibility", "visible");
	} else {
		activated.css("visibility","hidden");
		activated = $("#options #" + $(this).attr('id'))
		activated.css("visibility", "visible");
		currID = $(this).attr('id');
		$("#options").css("visibility", "visible");
	}
})