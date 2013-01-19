/*global AudioContext:true, webkitAudioContext:true*/

$(function($) {

  var dataflowWebAudio = window.dataflowWebAudio = {};

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
  dataflowWebAudio.context = context;

  // Make base audio modules

  var Base = Dataflow.node("base");
  var AudioBase = Dataflow.node("audio-base");

  AudioBase.Model = Base.Model.extend({
  });
  AudioBase.View = Base.View.extend({
    initialize: function(){
      Base.View.prototype.initialize.call(this);
      this.$(".inner").text("audio node!");
    }
  });

  // Make basic audio modules

  var BufferSource = Dataflow.node("audio-buffersource");
  BufferSource.Model = AudioBase.Model.extend({
    defaults: {
      label: "",
      type: "audio-buffersource",
      x: 200,
      y: 100,
      state: {}
    },
    inputs:[
      {
        id: "url",
        type: "string"
      },
      {
        id: "start",
        type: "bang"
      },
      {
        id: "stop",
        type: "bang"
      }
    ],
    outputs:[
      {
        id: "out",
        type: "audio"
      }
    ]
  });
  BufferSource.View = AudioBase.View.extend({});

  var Oscillator = Dataflow.node("audio-oscillator");
  Oscillator.Model = AudioBase.Model.extend({
    defaults: {
      label: "",
      type: "audio-oscillator",
      x: 200,
      y: 100,
      state: {}
    },
    initialize: function(){
      AudioBase.Model.prototype.initialize.call(this);

      var oscNode = this.audioOutput = window.dataflowWebAudio.context.createOscillator();
      oscNode.frequency.value = 440;
      oscNode.detune.value = 0;
      oscNode.type = "sine";
      // e.audioNode = oscNode;
      // if (e.outputConnections) {
      //   e.outputConnections.forEach(function(connection){  
      //       oscNode.connect( connection.destination.audioNode ); });
      // }
      oscNode.noteOn(0);
    },
    inputs:[
      {
        id: "type",
        type: "string",
        options: ["sine", "square", "sawtooth", "triangle", "custom"]
      },
      {
        id: "frequency",
        value: 440,
        type: "float"
      },
      {
        id: "detune",
        value: 0,
        type: "float"
      },
      {
        id: "start",
        type: "bang"
      },
      {
        id: "stop",
        type: "bang"
      }
    ],
    outputs:[
      {
        id: "out",
        type: "audio"
      }
    ]
  });
  Oscillator.View = AudioBase.View.extend({
    initialize: function(){
      AudioBase.View.prototype.initialize.call(this);
      this.$(".inner").text("start / stop");
    }

  });

  var Destination = Dataflow.node("audio-destination");
  Destination.Model = AudioBase.Model.extend({
    defaults: {
      label: "",
      type: "audio-destination",
      x: 200,
      y: 100,
      state: {}
    },
    initialize: function(){
      AudioBase.Model.prototype.initialize.call(this);
      this.audioInput = window.dataflowWebAudio.context.destination;
    },
    inputs:[
      {
        id: "in",
        type: "audio"
      }
    ],
    outputs:[]
  });
  Destination.View = AudioBase.View.extend({});

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

  var modelExtender = {
    initialize: function(){
      AudioBase.Model.prototype.initialize.call(this);
    }
  };

  var viewExtender = {
    initialize: function(){
      AudioBase.View.prototype.initialize.call(this);
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
    var tunaNode = new tuna[mod]();
    var audioInput = tunaNode.input;
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
      ],
      audioOutput: tunaNode,
      audioInput: audioInput
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
    var Model = tunaModules[mod].node.Model = AudioBase.Model.extend(extender);
    var View = tunaModules[mod].node.View = AudioBase.View.extend(viewExtender);
  }

  // Refresh library
  Dataflow.plugins.library.update({exclude:["test", "base", "base-resizable", "audio-base", "dataflow-input", "dataflow-output", "dataflow-subgraph"]});


  // Dis/connect events

  Dataflow.on("edge:add", function(graph, edge){
    // Connect
    if (edge.source.get("type") === "audio" && edge.target.get("type") === "audio") {
      if (edge.source.parentNode.audioOutput && edge.target.parentNode.audioInput) {
        edge.source.parentNode.audioOutput.connect(edge.target.parentNode.audioInput);
      }
    }
    // console.log(edge.source.parentNode.audioOutput, edge.target.parentNode.audioInput);
  });

  Dataflow.on("edge:remove", function(graph, edge){
    // Disconnect
    if (edge.source.get("type") === "audio" && edge.target.get("type") === "audio") {
      if (edge.source.parentNode.audioOutput && edge.target.parentNode.audioInput) {
        edge.source.parentNode.audioOutput.disconnect(edge.target.parentNode.audioInput);
      }
    }
  });


  // Load test graph
  var g = Dataflow.loadGraph(
    {"nodes":[{"id":4,"label":"audio-oscillator","type":"audio-oscillator","x":353,"y":225,"state":{}},{"id":10,"label":"tuna-compressor","type":"tuna-compressor","x":352,"y":461,"state":{"threshold":-20,"release":250,"makeupGain":1,"attack":1,"ratio":4,"knee":5,"automakeup":false,"bypass":true}},{"id":1,"label":"audio-buffersource","type":"audio-buffersource","x":355,"y":20,"state":{}},{"id":13,"label":"tuna-cabinet","type":"tuna-cabinet","x":579,"y":496,"state":{"makeupGain":1,"bypass":false}},{"id":15,"label":"tuna-overdrive","type":"tuna-overdrive","x":580,"y":672,"state":{"drive":1,"outputGain":1,"curveAmount":0.725,"algorithmIndex":0}},{"id":6,"label":"tuna-chorus","type":"tuna-chorus","x":580,"y":236,"state":{"feedback":0.4,"delay":0.0045,"depth":0.7,"rate":1.5,"bypass":true}},{"id":8,"label":"tuna-tremolo","type":"tuna-tremolo","x":579,"y":25,"state":{"intensity":0.3,"stereoPhase":0,"rate":5}},{"id":7,"label":"tuna-phaser","type":"tuna-phaser","x":807,"y":24,"state":{"rate":0.1,"depth":0.6,"feedback":0.7,"stereoPhase":40,"baseModulationFrequency":700}},{"id":11,"label":"tuna-convolver","type":"tuna-convolver","x":807,"y":561,"state":{"highCut":22050,"lowCut":20,"dryLevel":1,"wetLevel":1,"level":1}},{"id":3,"label":"tuna-delay","type":"tuna-delay","x":808,"y":306,"state":{"delayTime":100,"feedback":0.45,"cutoff":20000,"wetLevel":0.5,"dryLevel":1}},{"id":9,"label":"tuna-wahwah","type":"tuna-wahwah","x":1034,"y":20,"state":{"automode":true,"baseFrequency":0.5,"excursionOctaves":2,"sweep":0.2,"resonance":10,"sensitivity":0.5}},{"id":2,"label":"audio-destination","type":"audio-destination","x":1035,"y":571,"state":{}},{"id":14,"label":"tuna-filter","type":"tuna-filter","x":1035,"y":307,"state":{"frequency":800,"Q":1,"gain":0,"bypass":true,"filterType":1}}],"edges":[]}
  );

});
