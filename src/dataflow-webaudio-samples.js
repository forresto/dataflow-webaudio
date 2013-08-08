( function(Dataflow) {

  var Examples = Dataflow.plugin("examples");

  Examples.initialize = function(dataflow){
    
    var $container = $('<div class="dataflow-plugin-overflow">');
    var $examples = $('<ul class="dataflow-plugin-webaudio-samples" style="margin:15px 0;"></ul>');
    $container.append($examples);

    var graphs = {
      "blank": '{"nodes":[{"id":99,"label":"audio-destination","type":"audio-destination","x":933,"y":570,"state":{}}],"edges":[]}',
      "simple": '{"nodes":[{"id":4,"label":"audio-oscillator","type":"audio-oscillator","x":235,"y":107,"state":{"type":0,"frequency":8,"detune":0}},{"id":5,"label":"audio-gain","type":"audio-gain","x":345,"y":341,"state":{"gain":30}},{"id":3,"label":"audio-oscillator","type":"audio-oscillator","x":512,"y":107,"state":{"type":0,"frequency":400,"detune":0}},{"id":2,"label":"audio-destination","type":"audio-destination","x":778,"y":311,"state":{}},{"id":1,"label":"audio-gain","type":"audio-gain","x":791,"y":96,"state":{"gain":0.5}}],"edges":[{"source":{"node":1,"port":"out"},"target":{"node":2,"port":"in"}},{"source":{"node":3,"port":"out"},"target":{"node":1,"port":"in"}},{"source":{"node":4,"port":"out"},"target":{"node":5,"port":"in"}},{"source":{"node":5,"port":"out"},"target":{"node":3,"port":"frequency"}}]}',
      "getUserMedia mic": '{"nodes":[{"id":1,"label":"audio-mic","type":"audio-mic","x":223,"y":85,"state":{}},{"id":2,"label":"tuna-chorus","type":"tuna-chorus","x":503,"y":109,"state":{"feedback":0.4,"delay":0.0045,"depth":0.7,"rate":1.5,"bypass":true}},{"id":3,"label":"audio-destination","type":"audio-destination","x":773,"y":113,"state":{}}],"edges":[{"source":{"node":1,"port":"out"},"target":{"node":2,"port":"in"}},{"source":{"node":2,"port":"out"},"target":{"node":3,"port":"in"}}]}',
      "all nodes": '{"nodes":[{"id":10,"label":"tuna-compressor","type":"tuna-compressor","x":284,"y":457,"state":{"threshold":-20,"release":250,"makeupGain":1,"attack":1,"ratio":4,"knee":5,"automakeup":false,"bypass":true}},{"id":4,"label":"audio-oscillator","type":"audio-oscillator","x":285,"y":221,"state":{"type":0,"frequency":440,"detune":0}},{"id":1,"label":"audio-mic","type":"audio-mic","x":289,"y":53,"state":{}},{"id":13,"label":"tuna-cabinet","type":"tuna-cabinet","x":511,"y":492,"state":{"makeupGain":1,"bypass":false}},{"id":8,"label":"tuna-tremolo","type":"tuna-tremolo","x":511,"y":21,"state":{"intensity":0.3,"stereoPhase":0,"rate":5}},{"id":15,"label":"tuna-overdrive","type":"tuna-overdrive","x":512,"y":668,"state":{"drive":1,"outputGain":1,"curveAmount":0.725,"algorithmIndex":0}},{"id":6,"label":"tuna-chorus","type":"tuna-chorus","x":512,"y":232,"state":{"feedback":0.4,"delay":0.0045,"depth":0.7,"rate":1.5,"bypass":true}},{"id":7,"label":"tuna-phaser","type":"tuna-phaser","x":739,"y":20,"state":{"rate":0.1,"depth":0.6,"feedback":0.7,"stereoPhase":40,"baseModulationFrequency":700}},{"id":11,"label":"tuna-convolver","type":"tuna-convolver","x":739,"y":557,"state":{"highCut":22050,"lowCut":20,"dryLevel":1,"wetLevel":1,"level":1}},{"id":3,"label":"tuna-delay","type":"tuna-delay","x":740,"y":302,"state":{"delayTime":100,"feedback":0.45,"cutoff":20000,"wetLevel":0.5,"dryLevel":1}},{"id":9,"label":"tuna-wahwah","type":"tuna-wahwah","x":966,"y":16,"state":{"automode":true,"baseFrequency":0.5,"excursionOctaves":2,"sweep":0.2,"resonance":10,"sensitivity":0.5}},{"id":14,"label":"tuna-filter","type":"tuna-filter","x":966,"y":335,"state":{"frequency":800,"Q":1,"gain":0,"bypass":true,"filterType":1}},{"id":5,"label":"audio-gain","type":"audio-gain","x":968,"y":595,"state":{"gain":1}},{"id":2,"label":"audio-destination","type":"audio-destination","x":970,"y":746,"state":{}}],"edges":[]}',
      "fm synth": '{"nodes":[{"id":1,"label":"LFO osc","type":"audio-oscillator","x":287,"y":39,"state":{"type":2,"frequency":-0.5,"detune":0}},{"id":5,"label":"audio-gain","type":"audio-gain","x":300,"y":292,"state":{"gain":1}},{"id":7,"label":"audio-oscillator","type":"audio-oscillator","x":312,"y":449,"state":{"type":3,"frequency":10,"detune":0}},{"id":3,"label":"LFO gain","type":"audio-gain","x":533,"y":46,"state":{"gain":100}},{"id":6,"label":"tuna-overdrive","type":"tuna-overdrive","x":591,"y":373,"state":{"drive":1,"outputGain":0.5,"curveAmount":0.725,"algorithmIndex":0}},{"id":4,"label":"audio-oscillator","type":"audio-oscillator","x":765,"y":98,"state":{"type":0,"detune":0,"frequency":200}},{"id":2,"label":"audio-destination","type":"audio-destination","x":861,"y":400,"state":{}}],"edges":[{"source":{"node":1,"port":"out"},"target":{"node":3,"port":"in"}},{"source":{"node":3,"port":"out"},"target":{"node":4,"port":"frequency"}},{"source":{"node":4,"port":"out"},"target":{"node":5,"port":"in"}},{"source":{"node":5,"port":"out"},"target":{"node":6,"port":"in"}},{"source":{"node":6,"port":"out"},"target":{"node":2,"port":"in"}},{"source":{"node":7,"port":"out"},"target":{"node":6,"port":"drive"}}]}'
    };

    dataflow.addPlugin({
      id: "examples", 
      name: "", 
      menu: $container, 
      icon: "volume-up"
    });

    var loadExample = function(e) {
      var g = $(e.target).data("dataflow-plugin-webaudio-samples-graph");
      g = JSON.parse(g);
      g = dataflow.loadGraph(g);
      g.trigger("change");
      return false;
    };

    for (var name in graphs) {
      var li = $("<li>");
      var link = $('<a href="#">')
        .text(name)
        .data("dataflow-plugin-webaudio-samples-graph", graphs[name])
        .click(loadExample);
      li.append(link);
      $examples.append(li);
    }

  }

}(Dataflow.prototype) );
