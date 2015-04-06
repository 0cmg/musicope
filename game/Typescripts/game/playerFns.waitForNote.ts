﻿module Musicope.Game.PlayerFns {

    export class WaitForNote {

        private ids: number[];
        private notesPressedTime: number[][];

        constructor(
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
                var isWait = config.p_userHands[trackId] && config.p_waits[trackId];
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
            for (var i = 0; i < config.p_userHands.length; i++) {
                if (config.p_userHands[i]) {
                    var id = o.ids[i];
                    while (o.isIdBelowCurrentTimePlusRadius(i, id)) {
                        var note = o.notes[i][id];
                        if (note.on && !o.notesPressedTime[i][id] && note.id === noteId) {
                            var radius = Math.abs(o.notes[i][id].time - config.p_elapsedTime) - 50;
                            if (radius < config.p_radiuses[i]) {
                                o.notesPressedTime[i][id] = config.p_elapsedTime;
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
                o.notes[trackId][noteId].time < config.p_elapsedTime + config.p_radiuses[trackId];
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
                o.notes[trackId][noteId].time < config.p_elapsedTime - config.p_radiuses[trackId];
        }

        private isNoteUnpressed = (trackId: number, noteId: number) => {
            var o = this;
            var note = o.notes[trackId][noteId];
            var wasPlayedByUser = o.notesPressedTime[trackId][noteId];
            var waitForOutOfReach = true;
            if (!config.p_waitForOutOfReachNotes) {
                var isNoteAboveMin = note.id >= config.p_minNote;
                var isNoteBelowMax = note.id <= config.p_maxNote;
                waitForOutOfReach = isNoteAboveMin && isNoteBelowMax;
            }
            return note.on && !wasPlayedByUser && waitForOutOfReach;
        }

    }

} 