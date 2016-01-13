(function(window,document){
    var currentViewId = "-main-view",
        viewPool = {},
    app = {
       init:function(th){
           document.addEventListener('DOMContentLoaded',function(){
               app.initViewPool();
               app.bindTapEvent();
               app.bindHashEvent();
           },false);
       }(),
       forward:function(pageId,direction){
           direction = direction || 'left';

           var currentViewStart = "translateX(0%)",
               applyViewStart = "translateX(100%)",
               currentViewEnd = "translateX(-100%)",
               applyViewEnd = "translateX(0%)";
           if (direction == "right") {
               currentViewStart = "translateX(0%)";
               applyViewStart = "translateX(-100%)";
               currentViewEnd = "translateX(100%)";
               applyViewEnd = "translateX(0%)"
           }

           var currentView = viewPool[currentViewId];
           var applyView = viewPool[pageId];

           applyView.style.webkitTransform = applyViewStart;
           currentView.style.webkitTransform = currentViewStart;
           applyView.style.display = "";

           setTimeout(function(){
               applyView.style.webkitTransform = applyViewEnd;
               currentView.style.webkitTransform = currentViewEnd;
           },200);
           setTimeout(function(){
               currentView.style.display = "none";
           },500);

           currentViewId = pageId;

           if (direction === 'left'){
               window.location.hash = currentViewId.substring(1);
           }
       },
       initViewPool:function(){
           var views = document.querySelectorAll(".pageview");
           Array.prototype.forEach.call(views,function(item){
               viewPool[item.id] = item;
           });
       },
       bindTapEvent:function(){
           var isMove;
           var that = this;
           document.addEventListener("touchstart",function(){
               isMove = false;
           },false);
           document.addEventListener("touchmove",function(){
               isMove = true;
           },false);
           document.addEventListener("touchend",function(){
               if (!isMove){
                   var target = event.target;
                   if (target.className === "button"){
                       target.title?
                       that.forward(target.title)
                       :history.back();
                   }
               }
           },false);
       },
       bindHashEvent:function(){
           var that = this;
           window.addEventListener("hashchange", function () {
               var id = window.location.hash.replace("#", "-");
               if (currentViewId != "-main-view" && id != currentViewId) {
                   id = id || "-main-view";
                   that.forward(id, "right");
               }
           }, false);
       }
    }
})(window,document);
