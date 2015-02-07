﻿module Musicope.Game {

    export class Controller implements IDisposable {

        private device: Devices.IDevice;
        private input: IInput;
        private metronome: Metronome;
        private song: Song;
        private player: Player;
        private scene: Scene;

        constructor() {
            var o = this;

            $('#listView').hide();
            $('#gameView').show();
            if (!params.c_songUrl) { throw "c_songUrl does not exist!"; }
            else {
                o.device = new Devices[params.c_device]();
                o.device.ready.done(() => {
                    o.getSong().done((arr: Uint8Array) => {
                        o.init(arr);
                    });
                });
            }
        }

        dispose = () => {
            var o = this;
            o.device.dispose();
            o.metronome.dispose();
            o.song.dispose();
        }

        private getSong() {
            var o = this;
            var out = $.Deferred();
            dropbox.readFile(params.c_songUrl, { arrayBuffer: true }, function (error, data) {
                var arr = new Uint8Array(data);
                if (error || arr.length == 0) {
                    throw "error loading midi file";
                }
                out.resolve(arr);
            });
            return out.promise();
        }

        private init(arr: Uint8Array): void {
            var o = this;
            o.song = new Song(arr);
            o.scene = new Scene(o.song);
            o.metronome = new Metronome(o.song.timePerBeat, o.song.timePerBar / o.song.timePerBeat, o.device);
            o.player = new Player(o.device, o.song, o.metronome, o.scene);
            for (var prop in Inputs) {
                if ((<string>prop).indexOf("Fns") < 0) {
                    new (<IInputNew> (<any>Inputs)[prop])(o.song);
                }
            }
            o.step();
        }

        private step() {
            var o = this;
            function _step() {
                if ($('.canvas').is(':visible')) {
                    o.requestAnimationFrame.call(window, _step);
                    o.player.step();
                }
            }
            _step();
        }

        private requestAnimationFrame: (fn: () => void) => void =
        window["requestAnimationFrame"] || window["webkitRequestAnimationFrame"] ||
        window["mozRequestAnimationFrame"] || window["oRequestAnimationFrame"] ||
        window["msRequestAnimationFrame"] || function (callback) { window.setTimeout(callback, 1000 / 60); };

    }

} 