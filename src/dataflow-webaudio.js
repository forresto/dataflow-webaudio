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

  var viewExtender = {
    initialize: function(){
      TunaBase.View.prototype.initialize.call(this);
      // this.$(".inner").text("...");

      // $(this.inputs.el).children(".int, .float").each(function(num, el){
      //   var input = $('<input type="number" style="width:2em;"></input>');
      //   $(el).children(".label").prepend(input);
      // });
    }
  };

  for (var mod in tunaModules) {
    var name = "tuna-"+mod.toLowerCase();
    var node = tunaModules[mod].node = Dataflow.node(name);
    var extender = {
      defaults: {
        label: "",
        type: name,
        x: 200,
        y: 100,
        state: {}
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
    for (var prop in tuna[mod].prototype.defaults) {
      var tunaInput = tuna[mod].prototype.defaults[prop];
      var input = {};
      input.id = prop;
      input.type = tunaInput.type;
      if (tunaInput.value !== undefined) {
        input.value = tunaInput.value;
        extender.defaults.state[prop] = input.value;
      }
      if (tunaInput.min !== undefined) {
        input.min = tunaInput.min;
      }
      if (tunaInput.max !== undefined) {
        input.max = tunaInput.max;
      }
      if (tunaInput.automatable !== undefined) {
        input.automatable = tunaInput.automatable;
      }
      extender.inputs.push(input);
    }
    // console.log(extender.inputs);
    var Model = tunaModules[mod].node.Model = TunaBase.Model.extend(extender);
    var View = tunaModules[mod].node.View = TunaBase.View.extend(viewExtender);
  }

  // Refresh library
  Dataflow.plugins.library.update({exclude:["test", "base", "base-resizable", "tuna-base", "dataflow-input", "dataflow-output", "dataflow-subgraph"]});

  // Load test graph
  var g = Dataflow.loadGraph({"nodes":[{"id":6,"label":"tuna-chorus","type":"tuna-chorus","x":580,"y":238},{"id":7,"label":"tuna-phaser","type":"tuna-phaser","x":807,"y":24},{"id":8,"label":"tuna-tremolo","type":"tuna-tremolo","x":587,"y":26},{"id":9,"label":"tuna-wahwah","type":"tuna-wahwah","x":1034,"y":20},{"id":10,"label":"tuna-compressor","type":"tuna-compressor","x":356,"y":257},{"id":11,"label":"tuna-convolver","type":"tuna-convolver","x":807,"y":561},{"id":13,"label":"tuna-cabinet","type":"tuna-cabinet","x":579,"y":496},{"id":14,"label":"tuna-filter","type":"tuna-filter","x":1035,"y":307},{"id":15,"label":"tuna-overdrive","type":"tuna-overdrive","x":358,"y":25},{"id":3,"label":"tuna-delay","type":"tuna-delay","x":808,"y":306}],"edges":[]});

});
