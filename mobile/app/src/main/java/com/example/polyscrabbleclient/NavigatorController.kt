package com.example.polyscrabbleclient

import androidx.compose.runtime.Composable
import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navigation
import com.example.polyscrabbleclient.account.components.AccountView
import com.example.polyscrabbleclient.account.viewmodel.AccountViewmodel
import com.example.polyscrabbleclient.auth.components.LogInScreen
import com.example.polyscrabbleclient.auth.components.SignUpScreen
import com.example.polyscrabbleclient.auth.viewmodel.AuthenticationViewModel
import com.example.polyscrabbleclient.auth.viewmodel.SignUpViewModel
import com.example.polyscrabbleclient.game.view.GameScreen
import com.example.polyscrabbleclient.lobby.view.JoinGameView
import com.example.polyscrabbleclient.lobby.view.NewGameScreen
import com.example.polyscrabbleclient.lobby.viewmodels.CreateGameViewModel
import com.example.polyscrabbleclient.message.components.ChatRoomScreen
import com.example.polyscrabbleclient.message.viewModel.ChatBoxViewModel

enum class NavPage(val label: String) {
    RegistrationRoute("registration"),
    Login("loginPage"),
    SignUp("signUpPage"),
    MainPage("mainPage"),
    GamePage("gamePage"),
    JoinGamePage("joinGamePage"),
    Prototype("prototype"),
    Room("messageList"),
    Account("account"),
    NewGameRoute("newGameRoute"),
    NewGame("newGame"),
}

@Composable
fun NavGraph(startPage: NavPage) {
    val navController = rememberNavController()

    NavHost(navController, startDestination = startPage.label) {

        composable(NavPage.MainPage.label) {
            StartView(navController, StartViewModel())
        }
        composable(NavPage.Room.label) {
            val chatBoxViewModel = ChatBoxViewModel()
            // Todo : place in other function somewhere else with room id
            chatBoxViewModel.joinRoom(NavPage.Prototype.label)
            ChatRoomScreen(navController, chatBoxViewModel)
        }
        loginGraph(navController)
        composable(NavPage.GamePage.label) {
            GameScreen(navController)
        }
        newGame(navController)
        composable(NavPage.Account.label) {
            AccountView(AccountViewmodel(), navController)
        }
    }
}

fun NavGraphBuilder.newGame(navController: NavController) {
    navigation(startDestination = NavPage.NewGame.label, route = NavPage.NewGameRoute.label) {
        composable(NavPage.NewGame.label) {
            NewGameScreen(navController, CreateGameViewModel())
        }
    }
}

fun NavGraphBuilder.loginGraph(navController: NavController) {
    navigation(startDestination = NavPage.Login.label, route = NavPage.RegistrationRoute.label) {
        composable(NavPage.Login.label) {
            LogInScreen(navController, AuthenticationViewModel())
        }
        composable(NavPage.SignUp.label) {
            SignUpScreen(navController, SignUpViewModel())
        }
    }
}


