package com.example.polyscrabbleclient.game.viewmodels

import androidx.lifecycle.ViewModel
import com.example.polyscrabbleclient.game.domain.TileCreator
import com.example.polyscrabbleclient.game.model.TileModel
import com.example.polyscrabbleclient.game.sources.GameRepository
import com.example.polyscrabbleclient.game.view.draganddrop.DraggableContent
import com.example.polyscrabbleclient.game.view.draganddrop.DraggableContentType

class LetterRackViewModel: ViewModel() {
    private val game = GameRepository.game

    private val user = game.user
    // TODO : ENSURE LETTER RACK VIEW
    val tiles = user.value?.letters ?: mutableListOf(TileCreator.createTileFromLetter('X'))

    fun removeTile(draggableContent: DraggableContent?) {
        if (draggableContent == null || draggableContent.type !== DraggableContentType.TileModel) {
            return
        }
        tiles.remove(draggableContent as TileModel)
    }
}
