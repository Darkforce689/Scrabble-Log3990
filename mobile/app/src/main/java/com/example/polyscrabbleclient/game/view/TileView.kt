package com.example.polyscrabbleclient.game.view

import android.annotation.SuppressLint
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.selection.selectable
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Surface
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.BaselineShift
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.*
import com.example.polyscrabbleclient.game.model.TileModel
import com.example.polyscrabbleclient.ui.theme.PolyScrabbleClientTheme
import com.example.polyscrabbleclient.ui.theme.grayedOutTileBackground
import com.example.polyscrabbleclient.ui.theme.tileBackground

@Composable
fun TileView(
    tileModel: TileModel,
    displayPoint: Boolean = true,
    size: Dp = 60.dp,
    fontSize: TextUnit = 18.sp,
    select: () -> Unit,
) {
    val targetColor by animateColorAsState(
        targetValue =
        if (tileModel.isSelected.value)
            MaterialTheme.colors.secondary
        else
            Color.Gray,
        animationSpec = tween(durationMillis = 200)
    )

    Surface(
        color =
        if (tileModel.isUsedOnBoard.value) {
            MaterialTheme.colors.grayedOutTileBackground
        } else {
            MaterialTheme.colors.tileBackground
        },
        modifier = Modifier
            .selectable(
                selected = tileModel.isSelected.value,
                onClick = select
            )
            .size(size)
            .border(width = if(tileModel.isSelected.value) 3.dp else 1.dp, targetColor),
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {

            Text(
                style = TextStyle(
                    textAlign = TextAlign.Center,
                    fontSize = fontSize,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colors.onSurface
                ),
                text = tileInternalContent(tileModel, displayPoint, size)
            )
        }
    }
}

@OptIn(ExperimentalUnitApi::class)
@Composable
private fun tileInternalContent(
    tileModel: TileModel,
    displayPoint: Boolean,
    size: Dp,
) = buildAnnotatedString {
    val subscript = SpanStyle(
        baselineShift = BaselineShift.Subscript,
        fontSize = TextUnit((size.value / 4), TextUnitType.Sp),
    )
    append(tileModel.letter.uppercaseChar())
    if (displayPoint) {
        withStyle(subscript) {
            append(tileModel.points.toString())
        }
    }
}

@Preview(showBackground = true)
@Composable
fun NormalTilePreview() {
    val tileModel = TileModel('I', 1)
    TileView(
        tileModel,
        select = { tileModel.isSelected.value = !tileModel.isSelected.value }
    )
}

@Preview(showBackground = true)
@Composable
fun SelectedTilePreview() {
    val tileModel = TileModel('B', 2)
    tileModel.isSelected.value = true
    TileView(
        tileModel,
        select = { tileModel.isSelected.value = !tileModel.isSelected.value }
    )
}

@Preview(showBackground = true)
@Composable
fun OnBoardTilePreview() {
    val tileModel = TileModel('C', 10)
    tileModel.isUsedOnBoard.value = true
    TileView(
        tileModel,
        select = { tileModel.isSelected.value = !tileModel.isSelected.value }
    )
}

@Preview(showBackground = true)
@Composable
fun TilePreviewWithoutPoints() {
    val tileModel = TileModel('D', 0)
    TileView(
        tileModel,
        select = { tileModel.isSelected.value = !tileModel.isSelected.value },
        displayPoint = false
    )
}

@SuppressLint("UnrememberedMutableState")
@Preview(showBackground = true)
@Composable
fun DarkTilePreview() {
    val tileModel = TileModel('E', 6)
    PolyScrabbleClientTheme(mutableStateOf(true)) {
        TileView(
            tileModel,
            select = { tileModel.isSelected.value = !tileModel.isSelected.value },
        )
    }
}
