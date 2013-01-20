(function($) {  

  $.widget("ui.scrubber", {  
    options: {  
      color: "#fff",  
      backgroundColor: "#000"  
    },  
    _create: function() {  
      var self = this,  
          o = self.options,  
          el = self.element;
      var offset = el.offset();
      var wrap = $('<span></span>')
        .addClass("ui-widget ui-scrubber")
        .css({
          display: "block",
          width: el.width()+10,
          position: "absolute",
          top: offset.top-20,
          left: offset.left,
          backgroundColor: o.backgroundColor,  
          borderRadius: 2,
          zIndex: 9999
        }); 
      var scrub = $("<span></span>")
        .text("◄ ◆ ►")
        .css({
          backgroundColor: o.backgroundColor,  
          color: o.color,  
          borderRadius: 5,
          width: el.width()+10,
          textAlign: "center",
          display: "block"
        })
        .draggable({
          axis: "x",
          helper: function(){
            var offset = $(this).offset();
            var el = $("<span></span>")
              .text("◄ ◆ ►")
              .css({
                backgroundColor: o.backgroundColor,
                color: o.color,
                borderRadius: 5,
                position: "absolute",
                top: offset.top,
                left: offset.left,
                zIndex: 9999
              });
            $("body").append(el)
            return el;
          },
          start: function(e, ui) {
            $(this).data("ui-scrubber-startval", parseFloat(el.val()));
          },
          drag: function(e, ui) {
            var delta = ui.position.left - ui.originalPosition.left;
            var startVal = $(this).data("ui-scrubber-startval");
            var oldVal = parseFloat(el.val(), 10);
            var newVal = oldVal;
            if (el.prop("step") === "1") {
              // int
              // Up
              if (50 < delta && delta <= 150) {
                newVal = startVal + 1;
              } else if (150 < delta && delta <= 250) {
                newVal = startVal + 2;
              } else if (250 < delta && delta <= 350) {
                newVal = startVal + 3;
              } else if (350 < delta && delta <= 450) {
                newVal = startVal + 5;
              } else if (450 < delta && delta <= 550) {
                newVal = startVal + 5;
              } else if (550 < delta) {
                newVal = startVal + 6;
              }
              // Down
              else if (-50 > delta && delta >= -150) {
                newVal = startVal - 1;
              } else if (-150 > delta && delta >= -250) {
                newVal = startVal - 2;
              } else if (-250 > delta && delta >= -350) {
                newVal = startVal - 3;
              } else if (-350 > delta && delta >= -450) {
                newVal = startVal - 4;
              } else if (-450 > delta && delta >= -550) {
                newVal = startVal - 5;
              } else if (-550 > delta) {
                newVal = startVal - 6;
              }
              // Reset
              else {
                newVal = startVal;
              }
            } else {
              // float
              // Up
              if (50 < delta && delta <= 150) {
                newVal += .001;
              } else if (150 < delta && delta <= 250) {
                newVal += .01;
              } else if (250 < delta && delta <= 350) {
                newVal += .1;
              } else if (350 < delta && delta <= 450) {
                newVal += 1;
              } else if (450 < delta && delta <= 550) {
                newVal += 10;
              } else if (550 < delta) {
                newVal += 100;
              }
              // Down
              else if (-50 > delta && delta >= -150) {
                newVal -= .001;
              } else if (-150 > delta && delta >= -250) {
                newVal -= .01;
              } else if (-250 > delta && delta >= -350) {
                newVal -= .1;
              } else if (-350 > delta && delta >= -450) {
                newVal -= 1;
              } else if (-450 > delta && delta >= -550) {
                newVal -= 10;
              } else if (-550 > delta) {
                newVal -= 100;
              }
            }

            // Apply
            if (oldVal !== newVal) {
              el.val(newVal);
              el.trigger("change");
            }
          },
          stop: function(e, ui) {
            wrap.hide();
          }
        });
      wrap.append(scrub);
      $("body").append(wrap); 

      wrap.hide();
      el.mouseover(function(){
        $(".ui-scrubber").hide();
        wrap.show();
      }); 
    },  
  });  

})(jQuery);  