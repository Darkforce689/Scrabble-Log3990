package com.example.polyscrabbleclient.game.sources

import androidx.annotation.Nullable

data class Tile (
    val letterMultiplicator: Int,
    val wordMultiplicator: Int,
    val letterObject: Letter
)

data class Letter (
    val char: String,
    val value: Int
)

data class LightPlayer (
    val name: String,
    val points: Int,
    val letterRack: ArrayList<Letter>,
)

// TODO : REMOVE (ONLY TEMPORARY WHILE WAITING FOR !54)
data class UserAuth (
    val playerName: String,
    val gameToken: String
)

// Warning : Events Data Classes have to match the backend corresponding interfaces

// TODO
typealias RemainingTime = Nullable

// TODO
typealias StartTime = Nullable

data class GameState (
    val players: ArrayList<LightPlayer>,
    val activePlayerIndex: Int,
    val grid: ArrayList<ArrayList<Tile>>,
    val lettersRemaining: Int,
    val isEndOfGame: Boolean,
    val winnerIndex: ArrayList<Int>,
)

// TODO
typealias TransitionGameState =Nullable

// TODO : UPDATE (ONLY TEMPORARY WHILE WAITING FOR !54)
typealias JoinGame = UserAuth

// TODO
typealias NextAction = Nullable

// TODO
typealias Disconnect = Nullable