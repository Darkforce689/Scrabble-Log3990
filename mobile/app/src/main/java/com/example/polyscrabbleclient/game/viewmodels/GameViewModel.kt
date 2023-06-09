package com.example.polyscrabbleclient.game.viewmodels

import androidx.compose.runtime.MutableState
import androidx.lifecycle.ViewModel
import androidx.navigation.NavController
import com.example.polyscrabbleclient.NavPage
import com.example.polyscrabbleclient.game.domain.BoardCrawler
import com.example.polyscrabbleclient.game.model.TileContent
import com.example.polyscrabbleclient.game.model.TileModel
import com.example.polyscrabbleclient.game.sources.*
import com.example.polyscrabbleclient.lobby.sources.GameMode
import com.example.polyscrabbleclient.message.domain.ConversationsManager
import com.example.polyscrabbleclient.ui.theme.*
import com.example.polyscrabbleclient.utils.audio.AudioPlayer
import com.example.polyscrabbleclient.utils.constants.RACK_LETTER_COUNT

class GameViewModel : ViewModel() {
    val game = GameRepository.model
    val board = game.board
    var remainingLettersCount = game.remainingLettersCount
    var turnRemainingTime = game.turnRemainingTime
    private var turnTotalTime = game.turnTotalTime
    var gameMode = game.gameMode

    fun getRemainingTimeFraction(
        current: Int = turnRemainingTime.value,
        total: Int = turnTotalTime.value
    ): Float {
        return current.toFloat() / total
    }

    fun getOrderedPlayers(): List<Player> {
        val userIndex = game.getUserIndex()
        if (userIndex < 0) {
            return game.players
        }
        val before = game.players.subList(0, userIndex)
        val after = game.players.subList(userIndex, game.players.size)
        return after + before
    }

    private fun isActivePlayer(): Boolean {
        return game.isActivePlayer()
    }

    private fun isAtLeastOneLetterSelected(): Boolean {
        return getLetterRackTiles().count { letter -> letter.isSelected.value } > 0
    }

    private fun isExactlyOneLetterSelected(): Boolean {
        return getLetterRackTiles().count { letter -> letter.isSelected.value } == 1
    }

    private fun isAtLeastOneLetterUsedOnBoard(): Boolean {
        return getLetterRackTiles().count { letter -> letter.isUsedOnBoard.value } > 0
    }

    private fun hasSelectedPosition(): Boolean {
        return getSelectedCoordinates() != null
    }

    private fun hasNoLetterOnSelected(): Boolean {
        val tileCoordinates = getSelectedCoordinates()
        return game.board.tileGrid[tileCoordinates!!.row - 1][tileCoordinates!!.column - 1].content.value == null
    }

    private fun hasNoBonusOnSelected(): Boolean {
        val tileCoordinates = getSelectedCoordinates()
        val tileModel =
            game.board.tileGrid[tileCoordinates!!.row - 1][tileCoordinates.column - 1]
        return tileModel.letterMultiplier == 1 && tileModel.wordMultiplier == 1
    }

    private fun restoreBoard() {
        game.board.removeTransientTilesContent()
    }

    private fun restoreLetterRack() {
        getLetterRackTiles().forEach { tile ->
            tile.isUsedOnBoard.value = false
            tile.isSelected.value = false
        }
    }

    private fun getLetterRackTiles(): MutableList<TileModel> {
        return game.userLetters
    }

    private fun getSelectedCoordinates(): TileCoordinates? {
        return game.board.selectedCoordinates.value
    }

    private fun getSelectedTiles(): List<TileModel> {
        return getLetterRackTiles().filter { letter -> letter.isSelected.value }
    }

    fun canPassTurn(): Boolean {
        return isActivePlayer()
    }

    fun canPlaceLetter(): Boolean {
        return isActivePlayer() && isAtLeastOneLetterUsedOnBoard()
    }

    fun canExchangeLetter(): Boolean {
        return isActivePlayer() && isAtLeastOneLetterSelected() && !isLetterBagLow()
    }

    fun isLetterBagEmpty(): Boolean {
        return game.remainingLettersCount.value == 0
    }

    fun isLetterBagLow(): Boolean {
        return game.remainingLettersCount.value <= RACK_LETTER_COUNT
    }

    fun canCancel(): Boolean {
        return canExchangeLetter() || canPlaceLetter()
    }

    fun hasGameJustEnded(): MutableState<Boolean> {
        return game.hasGameJustEnded
    }

    fun hasGameJustDisconnected(): MutableState<Boolean> {
        return game.disconnected
    }

    fun hasGameEnded(): Boolean {
        return game.hasGameEnded()
    }

    fun getQuitLabel(): String {
        return if (hasGameEnded()) {
            leaveGameButtonFR
        } else {
            quitGameButtonFR
        }
    }

    fun navigateToMainPage(navController: NavController) {
        this.quitGame()
        navController.navigate(NavPage.MainPage.label)
    }

    fun getEndOfGameLabel(): String {
        return if (game.isUserWinner()) {
            endGameWinnerFR
        } else {
            endGameLoserFR
        }
    }

    fun getFormattedWinners(): String {
        val winnerNames = game.getWinnerNames()
        if (winnerNames.size == 1) {
            return "$winnerIsFR ${winnerNames[0]}"
        }

        val lastName = winnerNames.removeLast()
        val namesExceptLast = winnerNames.reduce { acc, current -> "$acc, $current" }
        if (winnerNames.size > 2) {
            namesExceptLast.removeRange(namesExceptLast.length - 2, namesExceptLast.length)
        }
        return "$winnersAreFR $namesExceptLast $andFR $lastName"
    }

    fun isMagicGame(): Boolean {
        return gameMode.value == GameMode.Magic
    }

    fun canUseMagicCards(): Boolean {
        return isActivePlayer() && isMagicGame();
    }

    fun canExchangeMagicCard(): Boolean {
        return canUseMagicCards() && isExactlyOneLetterSelected() && !isLetterBagEmpty()
    }

    fun canPlaceRandomBonusMagicCard(): Boolean {
        return canUseMagicCards() && hasSelectedPosition() && hasNoLetterOnSelected() && hasNoBonusOnSelected()
    }

    fun passTurn() {
        AudioPlayer.playSong(AudioPlayer.SKIP_TURN_SONG)
        GameRepository.emitNextAction(OnlineAction(OnlineActionType.Pass))
    }

    fun placeLetter() {
        val letterRack = ArrayList(
            getLetterRackTiles().map { tileModel ->
                Letter(tileModel.letter.toString(), tileModel.points)
            }
        )
        val placement = BoardCrawler.getPlacement()
        if (placement === null) {
            cancel()
            return
        }
        val (placementSetting, word) = placement
        AudioPlayer.lastActionWasAPlace = true;
        AudioPlayer.lastNumberOfLetterRemaining = remainingLettersCount.value
        GameRepository.emitNextAction(
            OnlineAction(
                OnlineActionType.Place,
                letters = word,
                letterRack = letterRack,
                placementSettings = placementSetting.adjustPlacementSetting()
            )
        )
    }

    fun exchangeLetter() {
        AudioPlayer.playSong(AudioPlayer.EXCHANGE_SONG)
        val letters = getSelectedTiles()
            .map { tileModel -> tileModel.letter.toString() }
            .reduce { lettersString, letter -> lettersString + letter }
        GameRepository.emitNextAction(OnlineAction(OnlineActionType.Exchange, letters = letters))
    }

    fun cancel() {
        restoreLetterRack()
        restoreBoard()
    }

    fun quitGame() {
        GameRepository.quitGame()
        ConversationsManager.leaveGameConversation()
    }

    fun splitPoints() {
        GameRepository.emitNextAction(OnlineAction(OnlineActionType.SplitPoints))
    }

    fun exchangeHorse() {
        GameRepository.emitNextAction(OnlineAction(OnlineActionType.ExchangeHorse))
    }

    fun exchangeHorseAll() {
        GameRepository.emitNextAction(OnlineAction(OnlineActionType.ExchangeHorseAll))
    }

    fun skipNextTurn() {
        GameRepository.emitNextAction(OnlineAction(OnlineActionType.SkipNextTurn))
    }

    fun extraTurn() {
        GameRepository.emitNextAction(OnlineAction(OnlineActionType.ExtraTurn))
    }

    fun reduceTimer() {
        GameRepository.emitNextAction(OnlineAction(OnlineActionType.ReduceTimer))
    }

    fun exchangeALetter() {
        val letters = getSelectedTiles()
            .map { tileModel -> tileModel.letter.toString() }
            .reduce { lettersString, letter -> lettersString + letter }
        GameRepository.emitNextAction(
            OnlineAction(
                OnlineActionType.ExchangeALetter,
                letters = letters
            )
        )
    }

    fun placeRandomBonus() {
        val position =
            Position(getSelectedCoordinates()!!.column - 1, getSelectedCoordinates()!!.row - 1)
        game.board.unselect()
        GameRepository.emitNextAction(
            OnlineAction(
                OnlineActionType.PlaceBonus,
                position = position
            )
        )
    }

    fun hasToChooseForJoker(): MutableState<Boolean> {
        return game.board.jokerModel.hasToChooseForJoker
    }

    fun removeJoker() {
        return game.board.jokerModel.removeJoker()
    }

    fun chooseJoker(selectedTile: TileContent) {
        return game.board.jokerModel.chooseJoker(selectedTile!!)
    }

    fun isObserver(): Boolean {
        return game.isUserAnObserver()
    }

    fun watchNextPlayer() {
        game.watchOtherPlayer(+1)
    }

    fun watchPreviousPlayer() {
        game.watchOtherPlayer(-1)
    }
}
