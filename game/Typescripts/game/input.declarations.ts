﻿module Musicope.Game {

    export interface IInput { }

    export interface IInputNew {
        new (song: ISong): IInput;
    }

} 