package com.example.polyscrabbleclient

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Message
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.platform.SoftwareKeyboardController
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
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
import com.example.polyscrabbleclient.invitations.components.NewInvitationView
import com.example.polyscrabbleclient.invitations.utils.GameInviteBroker
import com.example.polyscrabbleclient.lobby.view.WaitingForOtherPlayersView
import com.example.polyscrabbleclient.lobby.view.WaitingRoomView
import com.example.polyscrabbleclient.message.components.ChatBox
import com.example.polyscrabbleclient.message.viewModel.ChatBoxViewModel
import com.example.polyscrabbleclient.page.headerbar.view.HeaderBar
import com.example.polyscrabbleclient.page.headerbar.viewmodels.DisconnectViewModel
import com.example.polyscrabbleclient.page.headerbar.viewmodels.ThemeSelectorViewModel
import com.example.polyscrabbleclient.utils.Background
import com.example.polyscrabbleclient.utils.PageSurface
import com.example.polyscrabbleclient.utils.PhysicalButtons
import com.example.polyscrabbleclient.utils.viewmodels.SnackBarViewModel
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

enum class NavPage(val label: String) {
    RegistrationRoute("registration"),
    Login("loginPage"),
    SignUp("signUpPage"),
    MainPage("mainPage"),
    GamePage("gamePage"),
    WaitingRoom("waitingRoom"),
    Room("messageList"),
    Account("account"),
    WaitingRoute("waitingRoute"),
    NewGame("newGame"),
}

@Composable
fun NavGraph(startPage: NavPage, themeSelectorViewModel: ThemeSelectorViewModel) {
    val navController = rememberNavController()

    NavHost(navController, startDestination = startPage.label) {

        composable(NavPage.MainPage.label) {
            PageWithHeaderAndChat(
                navController,
                themeSelectorViewModel,
                DisconnectViewModel(),
                Background.Home,
                canReceiveInvite = true
            ) {
                StartView(navController, StartViewModel())
            }
        }

        loginGraph(navController)
        composable(NavPage.GamePage.label) {
            PageWithChat {
                PageSurface(Background.Game) {
                    GameScreen(navController)
                }
            }
        }

        waitingRoom(navController)
        composable(NavPage.Account.label) {
            PageWithChat {
                AccountView(AccountViewmodel(), navController)
                NewInvitationView(navController)
            }
        }
    }
}

fun navigateTo(page: NavPage, navController: NavController) {
    CoroutineScope(Dispatchers.IO).launch {
        launch(Dispatchers.Main) {
            navController.navigate(page.label) {
                launchSingleTop = true
            }
        }
    }
}

@Composable
fun PageWithHeaderAndChat(
    navController: NavController,
    themeSelectorViewModel: ThemeSelectorViewModel,
    disconnectViewModel: DisconnectViewModel,
    background: Background? = Background.Page,
    canReceiveInvite: Boolean = false,
    pageContent: @Composable () -> Unit
) {
    PageWithChat(background) {
        HeaderBar(navController, themeSelectorViewModel, disconnectViewModel)
        pageContent()
        if (canReceiveInvite) {
            NewInvitationView(navController)
        }
    }
}

@OptIn(ExperimentalComposeUiApi::class)
@Composable
fun PageWithChat(
    background: Background? = Background.Page,
    pageContent: @Composable () -> Unit
) {
    val drawerState = rememberDrawerState(DrawerValue.Closed)
    val scope = rememberCoroutineScope()

    var keyboard: SoftwareKeyboardController? = LocalSoftwareKeyboardController.current
    var focus = LocalFocusManager.current
    val viewModel: ChatPageViewModel = viewModel()

    LaunchedEffect(drawerState.currentValue) {
        if (drawerState.isClosed) {
            keyboard?.hide()
            focus.clearFocus()
            viewModel.onCloseChat()
        } else {
            PhysicalButtons.pushBackPress {
                scope.launch {
                    drawerState.close()
                    viewModel.onBackPressed()
                }
            }
        }
    }

    val scaffoldState: ScaffoldState = rememberScaffoldState()
    val snackBarViewModel: SnackBarViewModel = viewModel()
    val coroutineScope: CoroutineScope = rememberCoroutineScope()

    GameInviteBroker.onInvite {
        coroutineScope.launch {
            drawerState.close()
        }
    }

    snackBarViewModel.setOpenCallback {
        coroutineScope.launch {
            scaffoldState.snackbarHostState.showSnackbar(
                message = it.message,
                actionLabel = it.action,
                duration = it.duration
            )
        }
    }

    CompositionLocalProvider(LocalLayoutDirection.provides(LayoutDirection.Rtl)) {
        ModalDrawer(
            drawerState = drawerState,
            drawerContent = {
                CompositionLocalProvider(
                    LocalLayoutDirection.provides(LayoutDirection.Ltr)
                ) {
                    ChatBox(ChatBoxViewModel())
                }
            },
        ) {
            CompositionLocalProvider(
                LocalLayoutDirection.provides(LayoutDirection.Ltr)
            ) {
                Scaffold(
                    scaffoldState = scaffoldState,
                    floatingActionButton = {
                        FloatingActionButton(
                            backgroundColor = MaterialTheme.colors.primary,
                            onClick = {
                                scope.launch {
                                    drawerState.open()
                                }
                            }
                        ) {
                            Icon(Icons.Default.Message, null)
                        }
                    },
                    snackbarHost = {
                        CustomSnackBarHost(state = it)
                    }
                ) {
                    PageSurface(background) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            pageContent()
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CustomSnackBarHost(
    state: SnackbarHostState
) {
    SnackbarHost(
        hostState = state,
        snackbar = {
            Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                Snackbar(
                    modifier = Modifier.fillMaxWidth(0.4f),
                    action = {
                        if (it.actionLabel == null) {
                            return@Snackbar
                        }
                        Box(
                            Modifier
                                .fillMaxWidth()
                                .padding(end = 10.dp)
                                .clickable { it.performAction() },
                            contentAlignment = Alignment.BottomEnd
                        ) {
                            Text(text = it.actionLabel!!)
                        }
                    },
                    content = {
                        Text(
                            text = it.message,
                            modifier = Modifier
                                .padding(8.dp)
                                .fillMaxWidth()
                        )
                    }
                )
            }
        }
    )
}

fun NavGraphBuilder.waitingRoom(
    navController: NavController,
) {
    navigation(startDestination = NavPage.WaitingRoom.label, route = NavPage.WaitingRoute.label) {
        composable(NavPage.WaitingRoom.label) {
            PageWithChat(
                Background.Page
            ) {
                WaitingRoomView(navController = navController)
                NewInvitationView(navController = navController)
            }
        }
    }
}

fun NavGraphBuilder.loginGraph(navController: NavController) {
    navigation(startDestination = NavPage.Login.label, route = NavPage.RegistrationRoute.label) {
        composable(NavPage.Login.label) {
            PageSurface(Background.Home) {
                LogInScreen(navController, AuthenticationViewModel())
            }
        }
        composable(NavPage.SignUp.label) {
            PageSurface(Background.Home) {
                SignUpScreen(navController, SignUpViewModel())
            }
        }
    }
}
