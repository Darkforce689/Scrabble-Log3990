package com.example.polyscrabbleclient.game.domain

import com.example.polyscrabbleclient.game.model.RowChar

enum class MultiplierType { Word, Letter }
enum class MultiplierValue(val value: Int) { Double(2), Triple(3) }


data class Multiplier(
    val column: Int,
    val row: RowChar,
    val value: MultiplierValue,
    val type: MultiplierType
)

val Multipliers = listOf(
    Multiplier(
        column = 1,
        row = RowChar.A,
        value = MultiplierValue.Triple,
        type = MultiplierType.Word
    ),
    Multiplier(
        column = 8,
        row = RowChar.A,
        value = MultiplierValue.Triple,
        type = MultiplierType.Word
    ),
    Multiplier(
        column = 15,
        row = RowChar.A,
        value = MultiplierValue.Triple,
        type = MultiplierType.Word
    ),
    Multiplier(
        column = 2,
        row = RowChar.B,
        value = MultiplierValue.Double,
        type = MultiplierType.Word
    ),
    Multiplier(
        column = 14,
        row = RowChar.B,
        value = MultiplierValue.Double,
        type = MultiplierType.Word
    ),
    Multiplier(
        column = 3,
        row = RowChar.C,
        value = MultiplierValue.Double,
        type = MultiplierType.Word
    ),
    Multiplier(
        column = 13,
        row = RowChar.C,
        value = MultiplierValue.Double,
        type = MultiplierType.Word
    ),
    Multiplier(
        column = 4,
        row = RowChar.D,
        value = MultiplierValue.Double,
        type = MultiplierType.Word
    ),
    Multiplier(
        column = 12,
        row = RowChar.D,
        value = MultiplierValue.Double,
        type = MultiplierType.Word
    ),
    Multiplier(
        column = 5,
        row = RowChar.E,
        value = MultiplierValue.Double,
        type = MultiplierType.Word
    ),
    Multiplier(
        column = 11,
        row = RowChar.E,
        value = MultiplierValue.Double,
        type = MultiplierType.Word
    ),
    Multiplier(
        column = 1,
        row = RowChar.H,
        value = MultiplierValue.Triple,
        type = MultiplierType.Word
    ),
    Multiplier(
        column = 8,
        row = RowChar.H,
        value = MultiplierValue.Double,
        type = MultiplierType.Word
    ),
    Multiplier(
        column = 15,
        row = RowChar.H,
        value = MultiplierValue.Triple,
        type = MultiplierType.Word
    ),
    Multiplier(
        column = 5,
        row = RowChar.K,
        value = MultiplierValue.Double,
        type = MultiplierType.Word
    ),
    Multiplier(
        column = 11,
        row = RowChar.K,
        value = MultiplierValue.Double,
        type = MultiplierType.Word
    ),
    Multiplier(
        column = 4,
        row = RowChar.L,
        value = MultiplierValue.Double,
        type = MultiplierType.Word
    ),
    Multiplier(
        column = 12,
        row = RowChar.L,
        value = MultiplierValue.Double,
        type = MultiplierType.Word
    ),
    Multiplier(
        column = 3,
        row = RowChar.M,
        value = MultiplierValue.Double,
        type = MultiplierType.Word
    ),
    Multiplier(
        column = 13,
        row = RowChar.M,
        value = MultiplierValue.Double,
        type = MultiplierType.Word
    ),
    Multiplier(
        column = 2,
        row = RowChar.N,
        value = MultiplierValue.Double,
        type = MultiplierType.Word
    ),
    Multiplier(
        column = 14,
        row = RowChar.N,
        value = MultiplierValue.Double,
        type = MultiplierType.Word
    ),
    Multiplier(
        column = 1,
        row = RowChar.O,
        value = MultiplierValue.Triple,
        type = MultiplierType.Word
    ),
    Multiplier(
        column = 8,
        row = RowChar.O,
        value = MultiplierValue.Triple,
        type = MultiplierType.Word
    ),
    Multiplier(
        column = 15,
        row = RowChar.O,
        value = MultiplierValue.Triple,
        type = MultiplierType.Word
    ),
    Multiplier(
        column = 4,
        row = RowChar.A,
        value = MultiplierValue.Double,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 12,
        row = RowChar.A,
        value = MultiplierValue.Double,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 6,
        row = RowChar.B,
        value = MultiplierValue.Triple,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 10,
        row = RowChar.B,
        value = MultiplierValue.Triple,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 7,
        row = RowChar.C,
        value = MultiplierValue.Double,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 9,
        row = RowChar.C,
        value = MultiplierValue.Double,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 1,
        row = RowChar.D,
        value = MultiplierValue.Double,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 8,
        row = RowChar.D,
        value = MultiplierValue.Double,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 15,
        row = RowChar.D,
        value = MultiplierValue.Double,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 2,
        row = RowChar.F,
        value = MultiplierValue.Triple,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 6,
        row = RowChar.F,
        value = MultiplierValue.Triple,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 10,
        row = RowChar.F,
        value = MultiplierValue.Triple,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 14,
        row = RowChar.F,
        value = MultiplierValue.Triple,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 3,
        row = RowChar.G,
        value = MultiplierValue.Double,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 7,
        row = RowChar.G,
        value = MultiplierValue.Double,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 9,
        row = RowChar.G,
        value = MultiplierValue.Double,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 13,
        row = RowChar.G,
        value = MultiplierValue.Double,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 4,
        row = RowChar.H,
        value = MultiplierValue.Double,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 12,
        row = RowChar.H,
        value = MultiplierValue.Double,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 3,
        row = RowChar.I,
        value = MultiplierValue.Double,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 7,
        row = RowChar.I,
        value = MultiplierValue.Double,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 9,
        row = RowChar.I,
        value = MultiplierValue.Double,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 13,
        row = RowChar.I,
        value = MultiplierValue.Double,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 2,
        row = RowChar.J,
        value = MultiplierValue.Triple,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 6,
        row = RowChar.J,
        value = MultiplierValue.Triple,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 10,
        row = RowChar.J,
        value = MultiplierValue.Triple,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 14,
        row = RowChar.J,
        value = MultiplierValue.Triple,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 1,
        row = RowChar.L,
        value = MultiplierValue.Double,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 8,
        row = RowChar.L,
        value = MultiplierValue.Double,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 15,
        row = RowChar.L,
        value = MultiplierValue.Double,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 7,
        row = RowChar.M,
        value = MultiplierValue.Double,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 9,
        row = RowChar.M,
        value = MultiplierValue.Double,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 6,
        row = RowChar.N,
        value = MultiplierValue.Triple,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 10,
        row = RowChar.N,
        value = MultiplierValue.Triple,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 4,
        row = RowChar.O,
        value = MultiplierValue.Double,
        type = MultiplierType.Letter
    ),
    Multiplier(
        column = 12,
        row = RowChar.O,
        value = MultiplierValue.Double,
        type = MultiplierType.Letter
    ),
)
