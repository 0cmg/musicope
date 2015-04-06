﻿module Musicope.Game.PlayerFns {

    function sendBackToDevice(kind, noteId, velocity) {
        if (kind < 242 && (kind < 127 || kind > 160)) {
            webMidi.out(kind, noteId, velocity);
        }
    }

    function execNoteOnFuncs(noteOnFuncs: any[], noteId: number) {
        for (var i = 0; i < noteOnFuncs.length; i++) {
            noteOnFuncs[i](noteId);
        }
    }

    export class FromDevice {

        private noteOnFuncs = [];

        private oldTimeStamp = -1;
        private oldVelocity = -1;
        private oldId = -1;

        constructor(private scene: Scene, private notes: Parsers.INote[][]) {
            var o = this;
            webMidi.outOpen();
            webMidi.out(0x80, 0, 0);
            webMidi.inOpen(o.deviceIn);
        }

        onNoteOn = (func: (noteId: number) => void) => {
            var o = this;
            o.noteOnFuncs.push(func);
        }

        private deviceIn = (timeStamp, kind, noteId, velocity) => {
            var o = this;
            sendBackToDevice(kind, noteId, velocity);
            var isNoteOn = kind === 144 && velocity > 0;
            var isNoteOff = kind === 128 || (kind === 144 && velocity == 0);
            if (isNoteOn && !o.isDoubleNote(timeStamp, isNoteOn, noteId, velocity)) {
                console.log(timeStamp + " " + kind + " " + noteId + " " + velocity);
                o.scene.setActiveId(noteId);
                execNoteOnFuncs(o.noteOnFuncs, noteId);
            } else if (isNoteOff) {
                o.scene.unsetActiveId(noteId);
            }
        }

        private isDoubleNote = (timeStamp: number, isNoteOn: boolean, noteId: number, velocity: number) => {
            var o = this;
            var isSimilarTime = Math.abs(timeStamp - o.oldTimeStamp) < 3;
            var idMaches = Math.abs(noteId - o.oldId) == 12 || Math.abs(noteId - o.oldId) == 24;
            var isDoubleNote = isSimilarTime && idMaches && velocity == o.oldVelocity;
            o.oldTimeStamp = timeStamp;
            o.oldVelocity = velocity;
            o.oldId = noteId;
            return isDoubleNote;
        }

        

    }

} 