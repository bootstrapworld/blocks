

function foo(x) { return x * x; }
var clicked=null

$(document.body).bind('mousemove', 
		      function(e) {
		      	if(clicked!=null){
			  		clicked.style.left = e.pageX +"px";
			  		clicked.style.top = e.pageY +"px";
				}
		      });

$(".anElement").bind('mousedown', 
		      function() {
		      	clicked=this
		      });

$(".anElement").bind('mouseup', 
		      function() {
		      	clicked=null
		      });

