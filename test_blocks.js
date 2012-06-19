
var clicked=null
var listclick=null
var elements=null
var starting_Yposition=null
var bottom=null

$(document.body).bind('mousemove', 
		      function(e) {
		      	if(clicked!=null){
			  		clicked.style.left = e.pageX +"px";
			  		clicked.style.top = e.pageY +"px";
				}
				else if(listclick!=null){
 					if(!withinlist(e.pageY,elements)){
 					    listclick.style.top= e.pageY + "px"
 					    starting_Yposition=rubberband(e.pageY,elements,starting_Yposition)
 				    }
				}
		      });

$(document.body).bind('mouseup',
					function(){
						clicked=null;
						if(listclick!=null){listclick.style.top=starting_Yposition+"px"}
						listclick=null;
						elements=null
					});

$(".anElement").bind('mousedown', 
		      function() {
		      	clicked=this;
		      });


$(".MoveableItem").bind('mousedown', 
		      function() {
		      	listclick=this;
		      	starting_Yposition=getOffset(this).top-16
		      });


$(".MoveableList").bind('mousedown',
				function() {
					elements=this.getElementsByTagName("li");
					bottom=0;
					for (i=0 ; i<elements.length ; i++){
						var pos_top=getOffset(elements[i]).top;
							if(pos_top > bottom){
								bottom=pos_top-16;
							}
						}					
				});

function withinlist(position , loe){
	var min=Number.POSITIVE_INFINITY;
	for (i=0 ; i<loe.length ; i++){
		var pos_top=getOffset(loe[i]).top;
			if(pos_top < min){
				min=pos_top-16;
			}
		}
	return (position < min || position > bottom)
}

function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.parentNode;
    }
    return { top: _y, left: _x };
}

function rubberband(position, loe, ypos){
	for(i=0 ; i<loe.length ; i++){
		if( Math.abs(position - getOffset(loe[i]).top) < 8){
			var temp=ypos
			ypos=getOffset(loe[i])
			loe[i].style.top=temp+"px"
		}
	}
	return ypos
}