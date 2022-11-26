package com.example.polyscrabbleclient.lobby.viewmodels

import androidx.lifecycle.ViewModel
import androidx.navigation.NavController
import com.example.polyscrabbleclient.NavPage
import com.example.polyscrabbleclient.lobby.sources.LobbyRepository
import com.example.polyscrabbleclient.navigateTo

class WaitingRoomViewModel : ViewModel() {
    private val lobby = LobbyRepository

    private fun isAcceptedPlayer(): Boolean {
        return lobby.model.isAcceptedPlayer.value
            && lobby.model.hasJustConfirmedJoin.value == true
    }

    fun isPlayerInLobby(): Boolean {
        return lobby.model.isPendingGameHost.value || isAcceptedPlayer()
    }

    fun leaveLobbyGame(navController: NavController) {
        LobbyRepository.leaveLobbyGame()
        // TODO
        // this.messageService.leaveGameConversation();
        navigateTo(NavPage.MainPage, navController)
    }
}
