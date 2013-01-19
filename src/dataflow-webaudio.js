/*global AudioContext:true, webkitAudioContext:true*/

$(function($) {

  // Setup context

  var context;
  if (typeof AudioContext !== "undefined") {
    context = new AudioContext();
  } else if (typeof webkitAudioContext !== "undefined") {
    /*jshint newcap:false*/
    context = new webkitAudioContext();
  } else {
    throw new Error('AudioContext not supported. :(');
  }

  // Make base audio modules

  var Base = Dataflow.node("base");
  var TunaBase = Dataflow.node("tuna-base");

  TunaBase.Model = Base.Model.extend({
  });
  TunaBase.View = Base.View.extend({
    initialize: function(){
      Base.View.prototype.initialize.call(this);
      this.$(".inner").text("audio node!");
    }
  });

  // Make Tuna effect modules

  var tuna = new Tuna(context);

  var tunaModules = {
    Overdrive: {},
    Filter: {},
    Cabinet: {},
    Delay: {},
    Convolver: {},
    Compressor: {},
    WahWah: {},
    Tremolo: {},
    Phaser: {},
    Chorus: {}
  };
  for (var mod in tunaModules) {
    var name = "tuna-"+mod.toLowerCase();
    var node = tunaModules[mod].node = Dataflow.node(name);
    var extendwith = {
      defaults: {
        label: "",
        type: name,
        x: 200,
        y: 100,
        w: 200,
        h: 200
      },
      inputs:[
        {
          id: "in",
          type: "audio"
        }
      ],
      outputs:[
        {
          id: "out",
          type: "audio"
        }
      ]
    };
    for (var prop in tuna[mod].prototype) {
      var input = {};
      input.id = prop;
      input.type = tuna[mod].prototype.defaults[prop].type;
      extendwith.inputs.push(input);
    }
    var Model = tunaModules[mod].node.Model = TunaBase.Model.extend(extendwith);
    var View = tunaModules[mod].node.View = TunaBase.View.extend({});
  }

  // Refresh library
  Dataflow.plugins.library.update({exclude:["test", "base", "base-resizable", "tuna-base"]});

});
