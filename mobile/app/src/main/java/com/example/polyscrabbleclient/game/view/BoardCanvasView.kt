package com.example.polyscrabbleclient.game.view

import android.graphics.Typeface
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.MaterialTheme
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.input.pointer.consumeAllChanges
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.tooling.preview.Devices
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.example.polyscrabbleclient.game.model.BoardDimension
import com.example.polyscrabbleclient.game.model.BoardRange
import com.example.polyscrabbleclient.game.model.GridTileModel
import com.example.polyscrabbleclient.game.model.RowChar
import com.example.polyscrabbleclient.game.sources.GameRepository
import com.example.polyscrabbleclient.game.view.draganddrop.DragState
import com.example.polyscrabbleclient.game.viewmodels.BoardViewModel
import com.example.polyscrabbleclient.game.viewmodels.TileCoordinates
import com.example.polyscrabbleclient.ui.theme.*
import kotlin.properties.Delegates

const val ThickDividerWidth = Stroke.DefaultMiter
const val GridDimension = BoardDimension + 1
const val SoftBackgroundAlpha = 0.7f
const val HardBackgroundAlpha = 1f
val BoardSize = 550.dp
val BoardPadding = 10.dp
val GridSize = BoardSize - BoardPadding.times(2)
val GridDivisionSize = GridSize / GridDimension
val HeaderRange = (BoardRange.first + 1)..(BoardRange.last + 1)
val HeaderTextSize = BoardSize.div(GridDimension).div(1.8f)
val DivisionCenterOffset = GridDivisionSize.times(0.3f)
const val DoubleMultiplierLabel = "x2"
const val TripleMultiplierLabel = "x3"
const val LetterMultiplierLabel = "Lettre"
const val WordMultiplierLabel = "Mot"

@Composable
fun BoardCanvasView(dragState: DragState, viewModel: BoardViewModel) {
    val thickDividerIndexes = listOf(0, 1, GridDimension)
    val surfaceColor = Color.White
    val onSurfaceColor = BoardBorderColor
    val rowChars = RowChar.values()
    val rowCharsColor = BoardBorderColor

    val tileTextColor = MaterialTheme.colors.onBackground
    val tileBackground = MaterialTheme.colors.tileBackground
    val errorTileHighlight = MaterialTheme.colors.error
    val acceptedTileHighlight = MaterialTheme.colors.accepted
    val transientTileBackground = MaterialTheme.colors.transientTileBackground

    fun DrawScope.drawColumnDivider(
        currentDivisionOffset: Float,
        strokeWidth: Float
    ) {
        drawLine(
            color = onSurfaceColor,
            start = Offset(currentDivisionOffset, 0f),
            end = Offset(currentDivisionOffset, GridSize.toPx()),
            strokeWidth = strokeWidth
        )
    }

    fun DrawScope.drawRowDivider(
        currentDivisionOffset: Float,
        strokeWidth: Float
    ) {
        drawLine(
            color = onSurfaceColor,
            start = Offset(0f, currentDivisionOffset),
            end = Offset(GridSize.toPx(), currentDivisionOffset),
            strokeWidth = strokeWidth
        )
    }

    fun DrawScope.drawColumnHeader(
        gridDivisionIndex: Int,
        currentDivisionOffset: Float,
        headerTextPaint: NativePaint,
    ) {
        val horizontalTextOffset =
            currentDivisionOffset +
                DivisionCenterOffset.toPx() -
                // WARNING -> TWEAK
                (gridDivisionIndex / 10) * (HeaderTextSize.toPx() / 3)
        drawIntoCanvas {
            it.nativeCanvas.drawText(
                gridDivisionIndex.toString(),
                horizontalTextOffset,
                // WARNING -> TWEAK
                2.4f * DivisionCenterOffset.toPx(),
                headerTextPaint
            )
        }
    }

    fun DrawScope.drawRowHeader(
        gridDivisionIndex: Int,
        currentDivisionOffset: Float,
        headerTextPaint: NativePaint,
    ) {
        val rowCharIndex = gridDivisionIndex - 2
        val rowHeaderChar = rowChars[rowCharIndex].toString()
        drawIntoCanvas {
            it.nativeCanvas.drawText(
                rowHeaderChar,
                DivisionCenterOffset.toPx(),
                currentDivisionOffset - DivisionCenterOffset.toPx(),
                headerTextPaint
            )
        }
    }

    fun DrawScope.drawGridBackground() {
        drawRect(
            color = surfaceColor,
            topLeft = Offset(0f, 0f),
            size = Size(GridSize.toPx(), GridSize.toPx()),
            alpha = 0.9f
        )
    }

    fun DrawScope.drawGridLayout() {
        val headerTextPaint = Paint().asFrameworkPaint().apply {
            isAntiAlias = true
            textSize = HeaderTextSize.toPx()
            color = rowCharsColor.toArgb()
            typeface = Typeface.create(Typeface.MONOSPACE, Typeface.BOLD)
        }

        for (gridDivisionIndex in 0..GridDimension) {
            val strokeWidth =
                if (gridDivisionIndex in thickDividerIndexes)
                    ThickDividerWidth
                else
                    Stroke.HairlineWidth
            val currentDivisionOffset = gridDivisionIndex * GridDivisionSize.toPx()

            drawColumnDivider(currentDivisionOffset, strokeWidth)
            drawRowDivider(currentDivisionOffset, strokeWidth)
            if (gridDivisionIndex in BoardRange) {
                drawColumnHeader(gridDivisionIndex, currentDivisionOffset, headerTextPaint)
            }
            if (gridDivisionIndex in HeaderRange) {
                drawRowHeader(gridDivisionIndex, currentDivisionOffset, headerTextPaint)
            }
        }
    }

    fun DrawScope.drawTileBackground(
        color: Color,
        column: Int,
        row: Int,
        alpha: Float = 1f
    ) {
        val rowOffset = row * GridDivisionSize.toPx()
        val columnOffset = column * GridDivisionSize.toPx()
        drawRect(
            color = color,
            topLeft = Offset(columnOffset, rowOffset),
            size = Size(GridDivisionSize.toPx(), GridDivisionSize.toPx()),
            alpha = alpha
        )
    }

    fun DrawScope.drawTileContent(
        tile: GridTileModel,
        columnIndex: Int,
        rowIndex: Int,
    ) {
        if (tile.content.value === null) {
            return
        }

        val lettersPaint = Paint().asFrameworkPaint().apply {
            isAntiAlias = true
            textSize = HeaderTextSize.toPx()
            color = tileTextColor.toArgb()
            typeface = Typeface.create(Typeface.MONOSPACE, Typeface.BOLD)
        }

        val pointsPaint = Paint().asFrameworkPaint().apply {
            isAntiAlias = true
            textSize = HeaderTextSize.toPx() * 0.5f
            color = tileTextColor.toArgb()
            typeface = Typeface.create(Typeface.MONOSPACE, Typeface.BOLD)
        }

        val column = columnIndex + 1
        val row = rowIndex + 1

        val tileBackgroundColor =
            if (viewModel.areCoordinatesTransient(TileCoordinates(row, column))) {
                transientTileBackground
            } else {
                tileBackground
            }
        drawTileBackground(tileBackgroundColor, column, row)
        val horizontalOffset = column * GridDivisionSize.toPx()
        val verticalOffset = (row + 1) * GridDivisionSize.toPx()

        drawIntoCanvas {
            it.nativeCanvas.drawText(
                tile.content.value?.displayedLetter?.uppercaseChar().toString(),
                horizontalOffset + DivisionCenterOffset.toPx(),
                verticalOffset - DivisionCenterOffset.toPx(),
                lettersPaint
            )
        }
        drawIntoCanvas {
            it.nativeCanvas.drawText(
                tile.content.value?.points.toString(),
                // WARNING -> TWEAK
                horizontalOffset + 2.2f * DivisionCenterOffset.toPx(),
                verticalOffset - 0.5f * DivisionCenterOffset.toPx(),
                pointsPaint
            )
        }
    }

    fun DrawScope.drawTileHighlight(
        tile: GridTileModel,
        columnIndex: Int,
        rowIndex: Int,
    ) {
        if (!tile.isHighlighted.value) {
            return
        }
        val column = columnIndex + 1
        val row = rowIndex + 1
        val color =
            if (viewModel.canPlaceTile(TileCoordinates(row, column))) {
                acceptedTileHighlight
            } else {
                errorTileHighlight
            }
        drawTileBackground(color, column, row, HardBackgroundAlpha)
    }

    fun DrawScope.drawTiles() {
        viewModel.board.tileGrid.forEachIndexed { rowIndex, row ->
            row.forEachIndexed { columnIndex, tile ->
                drawTileContent(tile, columnIndex, rowIndex)
                drawTileHighlight(tile, columnIndex, rowIndex)
            }
        }
        viewModel.getActiveTiles().forEach { tile ->
            drawTileBackground(tileBackground, tile.x + 1, tile.y + 1)
        }
    }

    fun DrawScope.drawTileMultiplierIndicator(
        column: Int,
        row: Int,
        isLetterMultiplier: Boolean,
        isDoubleMultiplier: Boolean
    ) {
        val horizontalOffset = column * GridDivisionSize.toPx()
        val verticalOffset = (row + 1) * GridDivisionSize.toPx()

        val multiplierPaint = Paint().asFrameworkPaint().apply {
            isAntiAlias = true
            textSize = HeaderTextSize.toPx() * 0.55f
            color = Color.White.toArgb()
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        }

        val typeLabel =
            if (isLetterMultiplier) LetterMultiplierLabel else WordMultiplierLabel
        val valueLabel =
            if (isDoubleMultiplier) DoubleMultiplierLabel else TripleMultiplierLabel
        val offset = if (isLetterMultiplier) 0.24f else 0.30f
        drawIntoCanvas {
            it.nativeCanvas.drawText(
                typeLabel,
                // WARNING -> TWEAK
                horizontalOffset + (1.75f - offset * typeLabel.length) * DivisionCenterOffset.toPx(),
                verticalOffset - 1.8f * DivisionCenterOffset.toPx(),
                multiplierPaint
            )
        }
        drawIntoCanvas {
            it.nativeCanvas.drawText(
                valueLabel,
                // WARNING -> TWEAK
                horizontalOffset + 1.2f * DivisionCenterOffset.toPx(),
                verticalOffset - 0.7f * DivisionCenterOffset.toPx(),
                multiplierPaint
            )
        }
    }

    fun DrawScope.drawMultipliers() {
        viewModel.board.tileGrid.forEachIndexed { rowIndex, row ->
            row.forEachIndexed { columnIndex, tile ->
                if (tile.letterMultiplier != tile.wordMultiplier) {
                    val isLetterMultiplier = tile.letterMultiplier > tile.wordMultiplier
                    val isDoubleMultiplier =
                        if (isLetterMultiplier) {
                            tile.letterMultiplier == 2
                        } else {
                            tile.wordMultiplier == 2
                        }

                    val color = if (isLetterMultiplier) {
                        if (isDoubleMultiplier) DoubleBonusLetter else TripleBonusLetter
                    } else {
                        if (isDoubleMultiplier) DoubleBonusWord else TripleBonusWord
                    }

                    drawTileBackground(color, columnIndex + 1, rowIndex + 1)
                    drawTileMultiplierIndicator(
                        columnIndex + 1,
                        rowIndex + 1,
                        isLetterMultiplier,
                        isDoubleMultiplier
                    )
                }
            }
        }
    }

    var gridDivisionSize by Delegates.notNull<Float>()
    var boardPadding by Delegates.notNull<Float>()

    var currentPosition by remember { mutableStateOf(Offset.Zero) }

    Canvas(
        modifier = Modifier
            .size(BoardSize)
            .padding(BoardPadding)
            .onGloballyPositioned {
                currentPosition = it.localToWindow(Offset.Zero)
            }
            .pointerInput(Unit) {
                detectDragGestures(
                    onDragStart = {
                        viewModel.longPressBoard(
                            gridDivisionSize,
                            it,
                            currentPosition,
                            dragState
                        )
                    },
                    onDrag = { change, dragAmount ->
                        change.consumeAllChanges()
                        dragState.onDrag(dragAmount)
                    },
                    onDragEnd = { dragState.onDragEnd() },
                    onDragCancel = { dragState.onDragCancel() },
                )
            }
            .pointerInput(Unit) {
                detectTapGestures(
                    onTap = { tapOffset ->
                        viewModel.tapBoard(gridDivisionSize, tapOffset)
                    }
                )
            }
    ) {
        gridDivisionSize = GridDivisionSize.toPx()
        boardPadding = BoardPadding.toPx()

        drawGridBackground()
        drawMultipliers()
        drawTiles()
        drawGridLayout()

        val boardHoverOffset = boardPadding
        viewModel.hoverBoard(
            gridDivisionSize,
            dragState.currentLocalPosition.minus(
                Offset(boardHoverOffset, boardHoverOffset)
            )
        )
    }
}

@Preview(showBackground = true, device = Devices.PIXEL_C)
@Composable
fun BoardPreview() {
    val v: BoardViewModel = BoardViewModel(GameRepository.model.board)
    val d = DragState
    BoardCanvasView(d, v)
}
