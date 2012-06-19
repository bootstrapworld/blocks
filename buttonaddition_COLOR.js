var elements = new Array();



function addBox() {
     	elements[elements.length]="<li style=\"background-color:#"+getColor()+"\">Item "+ (elements.length+1) +"</li>";
	   	var text_list="";
	   	for(i=0;i<elements.length;i++){
	   		text_list+=elements[i];
    	}
      	document.getElementById("Additional").innerHTML=text_list
      };

function getColor(){
	var colors=document.Color.Color.value
	if(colors.length==6){
		colors=colors.toUpperCase()
		var pattern=new RegExp("([0-9]|[A-F])+");
		if(!pattern.test(colors)){
			colors="FFFFFF"
		}
	}
	else{
		colors="FFFFFF"
	}
	return colors
}