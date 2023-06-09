package com.example.polyscrabbleclient.page.headerbar.view

import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Logout
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.tooling.preview.Devices
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.example.polyscrabbleclient.NavPage
import com.example.polyscrabbleclient.getAssetsId
import com.example.polyscrabbleclient.page.headerbar.viewmodels.DisconnectViewModel
import com.example.polyscrabbleclient.page.headerbar.viewmodels.ThemeSelectorViewModel
import com.example.polyscrabbleclient.ui.theme.my_account
import com.example.polyscrabbleclient.user.User


@Composable
fun HeaderBar(
    navController: NavController,
    themeSelectorViewModel: ThemeSelectorViewModel,
    disconnectViewModel: DisconnectViewModel
) {
    TopAppBar(
        modifier = Modifier.height(130.dp),
        title = {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Image(
                    modifier = Modifier.height(100.dp),
                    painter = painterResource(id = getAssetsId("logowhite")),
                    contentDescription = "Image",
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    ThemeSelectorView(themeSelectorViewModel)
                    Account(navController = navController, avatar = User.avatar)

                    IconButton(onClick = { disconnectViewModel.disconnect(navController) }) {
                        Icon(imageVector = Icons.Default.Logout, contentDescription = null)
                    }
                }
            }
        },
        backgroundColor = MaterialTheme.colors.primary,
    )
}

@Composable
fun Account(navController: NavController, avatar: String) {
    Column(
        Modifier.padding(horizontal = 2.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Image(
            modifier = Modifier
                .padding(horizontal = 50.dp)
                .clickable {
                    navController.navigate(NavPage.Account.label) {
                        launchSingleTop = true
                    }
                },
            painter = painterResource(id = getAssetsId(avatar)),
            contentDescription = null
        )
        Text(text = my_account)
    }
}

@Preview(showBackground = true, device = Devices.PIXEL_C)
@Composable
fun HeaderBarPreview() {
    HeaderBar(
        navController = rememberNavController(),
        themeSelectorViewModel = viewModel(),
        disconnectViewModel = viewModel()
    )
}
