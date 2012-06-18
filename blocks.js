

function foo(x) { return x * x; }
var clicked=null
var listclick=null
var elements=null

$(document.body).bind('mousemove', 
		      function(e) {
		      	if(clicked!=null){
			  		clicked.style.left = e.pageX +"px";
			  		clicked.style.top = e.pageY +"px";
				}
				else if(listclick!=null){
 					listclick.style.top= e.pageY + "px"
				}
		      });

$(document.body).bind('mouseup',
					function(){
						clicked=null;
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
		      });


$(".MoveableList").bind('mousedown',
				function() {
					elements=this.getElementsByTagName("li");
				});