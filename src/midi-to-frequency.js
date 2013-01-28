( function(Dataflow) {

  var Base = Dataflow.node("base");
  var MToF = Dataflow.node("midi-to-frequency");

  var table = [];
  for (var i=0; i<256; i++){
    table[i] = 440 * Math.pow(2, (i-69)/12.0 );
  }

  MToF.Model = Base.Model.extend({
    defaults: function(){
      var defaults = Base.Model.prototype.defaults.call(this);
      defaults.type = "midi-to-frequency";
      return defaults;
    },
    inputmidi: function(i){
      this.send("frequency", table[i]);
    },
    inputs: [
      {
        id: "midi",
        type: "int",
        description: "MIDI number. Middle C is 60.",
        min: 0,
        max: 255
      }
    ],
    outputs: [
      {
        id: "frequency",
        type: "float",
        description: "frequency in Hz"
      }
    ]
  });
  MToF.View = Base.View.extend({});

}(Dataflow) );
