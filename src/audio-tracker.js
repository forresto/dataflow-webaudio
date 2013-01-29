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
  AudioTracker.View = AudioBase.View.extend({});

}(Dataflow) );
