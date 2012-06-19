
var activated = null;
var currID = null;
$(".bottomNav").bind('click', function(){
	if ($(this).attr('id') == currID) {
		activated.css("visibility","hidden");
		activated = null;
		currID = null;
	}else if (currID === null){
		activated = $("#options #" + $(this).attr('id'))
		currID = $(this).attr('id')
		activated.css("visibility", "visible");
	} else {
		activated.css("visibility","hidden");
		activated = $("#options #" + $(this).attr('id'))
		activated.css("visibility", "visible");
		currID = $(this).attr('id')
	}
		
	//alert('The fuck is this')
})