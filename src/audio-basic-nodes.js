( function(Dataflow) {

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
      // _.delay(function(){
      //   this.$(".input-number").scrubber();
      // }, 10);
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
        var microphone = self.audioOutput = Dataflow.audioContext.createMediaStreamSource(stream);
        self.reconnect();
      }, function(error){});
    },
    inputstop: function(){
      if (this._stream) {
        this._stream.stop();
      }
    },
    unload: function(){
      this.inputstop();
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
      var oscNode = this.audioOutput = Dataflow.audioContext.createOscillator();
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
        max: 3,
        options: {"∿ sine": 0, "⊓ square": 1, "◿ saw": 2, "△ triangle": 3}
      },
      {
        id: "frequency",
        type: "float",
        description: "frequency in hz",
        value: 440,
        automatable: true
      },
      {
        id: "detune",
        type: "float",
        description: "detune in cents",
        value: 0,
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

      var gainNode = this.audioInput = this.audioOutput = Dataflow.audioContext.createGainNode();
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
      this.audioInput = Dataflow.audioContext.destination;
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


}(Dataflow) );
