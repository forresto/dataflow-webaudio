( function(Dataflow) {

  var Base = Dataflow.node("base");
  var AudioBase = Dataflow.node("audio-base");

  var setupTunaModules = function(){

    // Make Tuna effect modules
    var tuna = new Tuna(Dataflow.audioContext);

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

  };

  Dataflow.on("audioContextReady", setupTunaModules);


}(Dataflow) );
