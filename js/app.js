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

           var t1 = setTimeout(function(){
               applyView.style.webkitTransform = applyViewEnd;
               currentView.style.webkitTransform = currentViewEnd;
           },200);
           var t2 = setTimeout(function(){
               currentView.style.display = "none";

               currentViewId = pageId;

               if (direction === 'left'){
                   window.location.hash = currentViewId.substring(1);
               }

               window.clearTimeout(t1);
               window.clearTimeout(t2);
           },600);


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
                   if (target.className === "right-arrow"){
                       that.forward(target.title);
                   }
                   if (target.className === "left-arrow"){
                           history.back();
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
