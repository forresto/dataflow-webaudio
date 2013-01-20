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
    window.alert("WebAudio isn't supported in this browser yet :-(");
    throw new Error('AudioContext not supported. :(');
  }
  dataflowWebAudio.context = context;

  // Make base audio modules

  var Base = Dataflow.node("base");
  var AudioBase = Dataflow.node("audio-base");

  AudioBase.Model = Base.Model.extend({
    reconnect: function(){
      if (Dataflow.currentGraph) {
        var self = this;
        Dataflow.currentGraph.edges.each(function(edge){
          if ((edge.source.parentNode===self || edge.target.parentNode===self) && edge.source.get("type")==="audio") {
            if (edge.source.get("type") === "audio" && edge.target.get("type") === "audio") {
              if (edge.source.parentNode.audioOutput && edge.target.parentNode.audioInput) {
                edge.source.parentNode.audioOutput.connect(edge.target.parentNode.audioInput);
              }
            } else if (edge.source.get("type") === "audio" && edge.target.get("automatable") === true) {
              // Make AudioParam and connect it
              if (edge.source.parentNode.audioOutput && edge.target.parentNode.audioOutput) {
                edge.source.parentNode.audioOutput.connect(edge.target.parentNode.audioOutput[edge.target.id]);
              }
            }
          }
        });
      }
    }
  });
  AudioBase.View = Base.View.extend({
    initialize: function(){
      Base.View.prototype.initialize.call(this);

      //HACK
      _.delay(function(){
        this.$(".input-number").scrubber();
      }, 10);
    }
  });

  // Make basic audio modules

  // var BufferSource = Dataflow.node("audio-buffersource");
  // BufferSource.Model = AudioBase.Model.extend({
  //   defaults: {
  //     label: "",
  //     type: "audio-buffersource",
  //     x: 200,
  //     y: 100,
  //     state: {}
  //   },
  //   inputs:[
  //     {
  //       id: "url",
  //       type: "string"
  //     },
  //     {
  //       id: "start",
  //       type: "bang"
  //     },
  //     {
  //       id: "stop",
  //       type: "bang"
  //     }
  //   ],
  //   outputs:[
  //     {
  //       id: "out",
  //       type: "audio"
  //     }
  //   ]
  // });
  // BufferSource.View = AudioBase.View.extend({});

  var Mic = Dataflow.node("audio-mic");
  Mic.Model = AudioBase.Model.extend({
    defaults: {
      label: "",
      type: "audio-mic",
      x: 200,
      y: 100,
      state: {}
    },
    // initialize: function(){
    //   AudioBase.Model.prototype.initialize.call(this);
    // },
    inputstart: function(){
      var self = this;
      navigator.webkitGetUserMedia({audio: true}, function(stream) {
        self._stream = stream;
        var microphone = self.audioOutput = window.dataflowWebAudio.context.createMediaStreamSource(stream);
        self.reconnect();
      }, function(error){});
    },
    inputstop: function(){
      if (this._stream) {
        this._stream.stop();
      }
    },
    inputs:[
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
  Mic.View = AudioBase.View.extend({});

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
      this.inputstart();
    },
    inputtype: function(type) {
      if (this.audioOutput) {
        this.inputstop();
        this.inputstart();
      }
    },
    inputfrequency: function(frequency) {
      if (this.audioOutput) {
        this.audioOutput.frequency.value = frequency;
      }
    },
    inputdetune: function(detune) {
      if (this.audioOutput) {
        this.audioOutput.detune.value = detune;
      }
    },
    inputstart: function(){
      if (this.audioOutput) {
        this.inputstop();
      }
      var oscNode = this.audioOutput = window.dataflowWebAudio.context.createOscillator();
      var state = this.get("state");
      oscNode.frequency.value = state.frequency !== undefined ? state.frequency : 440;
      oscNode.detune.value = state.detune !== undefined ? state.detune : 0;
      oscNode.type = state.type !== undefined ? state.type : "sine";

      this.reconnect();

      if (oscNode.start !== undefined) {
        oscNode.start(0);
      } else {
        oscNode.noteOn(0);
      }
    },
    inputstop: function(){
      if (this.audioOutput) {
        if (this.audioOutput.stop !== undefined) {
          this.audioOutput.stop(0);
        } else {
          this.audioOutput.noteOff(0);
        }
        this.audioOutput = null;
      }
    },
    inputs:[
      {
        id: "type",
        type: "int",
        description: "0:sine, 1:square, 2:sawtooth, 3:triangle",
        value: 0,
        min: 0,
        max: 3
        // options: ["sine", "square", "sawtooth", "triangle"]
      },
      {
        id: "frequency",
        description: "frequency in hz",
        value: 440,
        type: "float",
        automatable: true
      },
      {
        id: "detune",
        description: "detune in cents",
        value: 0,
        type: "float",
        automatable: true
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
    // initialize: function(){
    //   AudioBase.View.prototype.initialize.call(this);
    //   this.$(".inner").text("start / stop");
    // }
  });

  var Gain = Dataflow.node("audio-gain");
  Gain.Model = AudioBase.Model.extend({
    defaults: {
      label: "",
      type: "audio-gain",
      x: 200,
      y: 100,
      state: {}
    },
    initialize: function(){
      AudioBase.Model.prototype.initialize.call(this);

      var gainNode = this.audioInput = this.audioOutput = window.dataflowWebAudio.context.createGainNode();
      var state = this.get("state");
      gainNode.gain.value = state.gain !== undefined ? state.gain : 1.0;
    },
    inputgain: function(gain) {
      this.audioInput.gain.value = gain;
    },
    inputs:[
      {
        id: "in",
        type: "audio"
      },
      {
        id: "gain",
        type: "float",
        value: 1.0,
        min: 0,
        automatable: true
      }
    ],
    outputs:[
      {
        id: "out",
        type: "audio"
      }
    ]
  });
  Gain.View = AudioBase.View.extend({});

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

      var tunaNode = this.audioOutput = new tuna[this.tunaName](this.get('state'));
      var audioInput = this.audioInput = tunaNode.input;
    },
    setState: function(name, value){
      AudioBase.Model.prototype.setState.call(this, name, value);

      if (!this["input"+name]) {
        if (this.audioOutput[name] !== undefined) {
          if (this.audioOutput[name].value !== undefined) {
            this.audioOutput[name].value = value;
          } else {
            this.audioOutput[name] = value;
          }
        } else {
          // ?
        }
      }
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
    // var tunaNode = new tuna[mod]();
    // var audioInput = tunaNode.input;
    var extender = _.extend(
      {
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
        tunaName: mod
        // audioOutput: tunaNode,
        // audioInput: audioInput
      },
      modelExtender
    );
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
    } else if (edge.source.get("type") === "audio" && edge.target.get("automatable") === true) {
      // Connect audio to automatable AudioParam
      if (edge.source.parentNode.audioOutput && edge.target.parentNode.audioOutput) {
        edge.source.parentNode.audioOutput.connect(edge.target.parentNode.audioOutput[edge.target.id]);
      }
    }
  });

  Dataflow.on("edge:remove", function(graph, edge){
    // Disconnect
    if (edge.source.get("type") === "audio" && edge.target.get("type") === "audio") {
      if (edge.source.parentNode.audioOutput && edge.target.parentNode.audioInput) {
        edge.source.parentNode.audioOutput.disconnect(edge.target.parentNode.audioInput);
      }
    } else if (edge.source.get("type") === "audio" && edge.target.get("automatable") === true) {
      // Connect audio to automatable AudioParam
      if (edge.source.parentNode.audioOutput && edge.target.parentNode.audioOutput) {
        edge.source.parentNode.audioOutput.disconnect(edge.target.parentNode.audioOutput[edge.target.id]);
      }
    }
  });


  // Load test graph
  var testGraph = {"nodes":[{"id":4,"label":"audio-oscillator","type":"audio-oscillator","x":235,"y":107,"state":{"type":0,"frequency":8,"detune":0}},{"id":5,"label":"audio-gain","type":"audio-gain","x":345,"y":341,"state":{"gain":30}},{"id":3,"label":"audio-oscillator","type":"audio-oscillator","x":512,"y":107,"state":{"type":0,"frequency":400,"detune":0}},{"id":2,"label":"audio-destination","type":"audio-destination","x":778,"y":311,"state":{}},{"id":1,"label":"audio-gain","type":"audio-gain","x":791,"y":96,"state":{"gain":0.5}}],"edges":[{"source":{"node":1,"port":"out"},"target":{"node":2,"port":"in"}},{"source":{"node":3,"port":"out"},"target":{"node":1,"port":"in"}},{"source":{"node":4,"port":"out"},"target":{"node":5,"port":"in"}},{"source":{"node":5,"port":"out"},"target":{"node":3,"port":"frequency"}}]};
  var g = Dataflow.loadGraph(testGraph);
  g.trigger("change");

});
