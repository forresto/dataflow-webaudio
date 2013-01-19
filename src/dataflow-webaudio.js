/*global AudioContext:true, webkitAudioContext:true*/

$(function($) {

  var context;
  if (typeof AudioContext !== "undefined") {
    context = new AudioContext();
  } else if (typeof webkitAudioContext !== "undefined") {
    /*jshint newcap:false*/
    context = new webkitAudioContext();
  } else {
    throw new Error('AudioContext not supported. :(');
  }

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
    for (var prop in tuna[mod].prototype) {
      console.log(mod, prop, tuna[mod].prototype.defaults[prop]);
    }
  }

  Dataflow.plugins.library.update({exclude:["test", "base", "base-resizable"]});

});
