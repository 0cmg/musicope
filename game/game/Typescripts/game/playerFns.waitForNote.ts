﻿module Musicope.Game.PlayerFns {

    export class WaitForNote {

        private ids: number[];
        private notesPressedTime: number[][];

        constructor(private device: Devices.IDevice,
            private params: Params,
            private notes: Parsers.INote[][],
            private onNoteOn: (func: (noteId: number) => void) => void) {
            var o = this;
            o.assignIds();
            o.assignNotesPressedTime();
            onNoteOn(o.addNoteOnToKnownNotes);
        }

        isFreeze = () => {
            var o = this;
            var freeze = false;
            for (var trackId = 0; trackId < o.notes.length; trackId++) {
                var isWait = o.params.readOnly.p_userHands[trackId] && o.params.readOnly.p_waits[trackId];
                if (isWait) {
                    while (!freeze && o.isIdBelowCurrentTimeMinusRadius(trackId, o.ids[trackId])) {
                        freeze = o.isNoteUnpressed(trackId, o.ids[trackId]);
                        if (!freeze) { o.ids[trackId]++ };
                    }
                }
            }
            return freeze;
        }

        reset = (idsBelowCurrentTime: number[]) => {
            var o = this;
            o.resetNotesPressedTime(idsBelowCurrentTime);
            idsBelowCurrentTime.forEach(o.setId);
        }


        private assignIds = () => {
            var o = this;
            o.ids = o.notes.map(() => { return 0; });
        }

        private assignNotesPressedTime = () => {
            var o = this;
            o.notesPressedTime = o.notes.map((notesi) => {
                var arr = [];
                arr[notesi.length - 1] = undefined;
                return arr;
            });
        }

        private addNoteOnToKnownNotes = (noteId: number) => {
            var o = this;
            for (var i = 0; i < o.params.readOnly.p_userHands.length; i++) {
                if (o.params.readOnly.p_userHands[i]) {
                    var id = o.ids[i];
                    while (o.isIdBelowCurrentTimePlusRadius(i, id)) {
                        var note = o.notes[i][id];
                        if (note.on && !o.notesPressedTime[i][id] && note.id === noteId) {
                            var radius = Math.abs(o.notes[i][id].time - o.params.readOnly.p_elapsedTime) - 50;
                            if (radius < o.params.readOnly.p_radiuses[i]) {
                                o.notesPressedTime[i][id] = o.params.readOnly.p_elapsedTime;
                                return;
                            }
                        }
                        id++;
                    }
                }
            }
        }

        private isIdBelowCurrentTimePlusRadius = (trackId: number, noteId: number) => {
            var o = this;
            return o.notes[trackId][noteId] &&
                o.notes[trackId][noteId].time < o.params.readOnly.p_elapsedTime + o.params.readOnly.p_radiuses[trackId];
        }

        private resetNotesPressedTime = (idsBelowCurrentTime: number[]) => {
            var o = this;
            for (var i = 0; i < idsBelowCurrentTime.length; i++) {
                for (var j = idsBelowCurrentTime[i] + 1; j < o.notesPressedTime[i].length; j++) {
                    if (o.notesPressedTime[i][j]) {
                        o.notesPressedTime[i][j] = undefined;
                    }
                }
            }
        }

        private setId = (id, i) => {
            var o = this;
            o.ids[i] = id + 1;
        }

        private isIdBelowCurrentTimeMinusRadius = (trackId: number, noteId: number) => {
            var o = this;
            return o.notes[trackId][noteId] &&
                o.notes[trackId][noteId].time < o.params.readOnly.p_elapsedTime - o.params.readOnly.p_radiuses[trackId];
        }

        private isNoteUnpressed = (trackId: number, noteId: number) => {
            var o = this;
            var note = o.notes[trackId][noteId];
            var wasPlayedByUser = o.notesPressedTime[trackId][noteId];
            var waitForOutOfReach = true;
            if (!o.params.readOnly.p_waitForOutOfReachNotes) {
                var isNoteAboveMin = note.id >= o.params.readOnly.p_minNote;
                var isNoteBelowMax = note.id <= o.params.readOnly.p_maxNote;
                waitForOutOfReach = isNoteAboveMin && isNoteBelowMax;
            }
            return note.on && !wasPlayedByUser && waitForOutOfReach;
        }

    }

} 