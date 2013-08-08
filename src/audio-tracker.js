( function(Dataflow) {

  var AudioBase = Dataflow.node("audio-base");
  var AudioTracker = Dataflow.node("audio-tracker");

  AudioTracker.Model = AudioBase.Model.extend({
    defaults: {
      label: "",
      type: "audio-tracker",
      x: 200,
      y: 100,
      state: {}
    },
    // initialize: function(){
    //   AudioBase.Model.prototype.initialize.call(this);
    // },
    inputstart: function(){
    },
    inputstop: function(){
    },
    inputs:[
      {
        id: "composition",
        type: "object"
      },
      {
        id: "bpm",
        min: 0,
        value: 120,
        type: "float"
      },
      {
        id: "play",
        type: "bang"
      },
      {
        id: "pause",
        type: "bang"
      }
    ],
    outputs:[
      {
        id: "track0",
        description: "control signal for track 0",
        type: "control"
      },
      {
        id: "track1",
        description: "control signal for track 1",
        type: "control"
      },
      {
        id: "track2",
        description: "control signal for track 2",
        type: "control"
      },
      {
        id: "track3",
        description: "control signal for track 3",
        type: "control"
      },
      {
        id: "track4",
        description: "control signal for track 4",
        type: "control"
      },
      {
        id: "track5",
        description: "control signal for track 5",
        type: "control"
      },
      {
        id: "track6",
        description: "control signal for track 6",
        type: "control"
      },
      {
        id: "track7",
        description: "control signal for track 7",
        type: "control"
      }
    ]
  });
  AudioTracker.View = AudioBase.View.extend({});

}(Dataflow.prototype) );
