//These variables store what the height and width of the code div should be
var codeHeight = $(document).height() - $("#header").height() - $("#Drawer").height()
var codeWidth = $(document).width()

//Sets the width and height of the code div
function sizeCodeDiv(){
	$("#code").height(codeHeight);
	$("#code").width(codeWidth);
}

//When the window is resized, the height of the width of the code div changes
$(window).resize(function(){
	codeHeight = $(document).height() - $("#header").height() - $("#Drawer").height();
	codeWidth = $(document).width();
	sizeCodeDiv();
});

//DrawerButton takes in an element and either activates (shows) or deactivates (hides) the current element to show the new one
var activated = null;
function drawerButton(elt){
		activated.css("visibility","hidden");
		activated = $("#options #" + elt.attr('id'))
		activated.css("visibility", "visible");
}

//Upon loading the webpage, the drawers are formed
$(document).ready(function(){
	makeDrawers(functions,constants);
	sizeCodeDiv();
	activated = $("#options #Numbers")
	activated.css("visibility", "visible");
});

//During the course of the whole session, buttons on the drawer can be clicked in order to add them to the program (the draggable list)
$("#options span").live('click',function(){
	var old=document.getElementById("List").innerHTML;
	document.getElementById("List").innerHTML=old+"<li>"+block($(this).html())+"</li>";
});


//During the course of the whole session, drawers can be opened and closed to reveal all of the buttons (functions) that they contain
$(".bottomNav").live('click', function(e){
		drawerButton($(this));
});