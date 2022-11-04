package com.example.polyscrabbleclient

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material.ripple.LocalRippleTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.platform.LocalContext
import com.example.polyscrabbleclient.auth.AppSocketHandler
import com.example.polyscrabbleclient.ui.theme.NoRippleTheme
import com.example.polyscrabbleclient.ui.theme.PolyScrabbleClientTheme
import com.example.polyscrabbleclient.user.User
import com.example.polyscrabbleclient.utils.httprequests.ScrabbleHttpClient
import java.net.URL
import kotlin.math.floor
import kotlin.math.round

data class ValidationResponse(val message: String, val errors : String)

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ScrabbleHttpClient.setCookieManager(this)
        var startPage: NavPage = NavPage.RegistrationRoute
        if (ScrabbleHttpClient.getAuthCookie() != null) {
            try {
                val thread = Thread {
                    val response = ScrabbleHttpClient.get(
                        URL(BuildConfig.COMMUNICATION_URL + "/auth/validatesession"),
                        ValidationResponse::class.java
                    ) ?: return@Thread
                    if (response.message == "OK") {
                        connectAppSocket()
                        updateUser()
                        startPage = NavPage.MainPage
                    } else {
                        ScrabbleHttpClient.clearCookies()
                    }
                }
                thread.start()
                thread.join()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        setContent {
            PolyScrabbleClientTheme {
                CompositionLocalProvider(LocalRippleTheme provides NoRippleTheme) {
                    NavGraph(startPage)
                }
            }
        }
    }
}

fun Float.roundDownToMultipleOf(base: Double): Double = base * floor(this / base)
fun Double.round(decimals: Int): Double {
    var multiplier = 1.0
    repeat(decimals) { multiplier *= 10 }
    return round(this * multiplier) / multiplier
}
fun updateUser() {
    val updateThread = User.updateUser()
    updateThread.start()
    updateThread.join()
}

fun connectAppSocket() {
    val thread = Thread {
        AppSocketHandler.setSocket()
        AppSocketHandler.connect()
    }
    thread.start()
    thread.join()
}

@Composable
fun getAssetsId(name: String): Int {
    val context = LocalContext.current
    return context.resources.getIdentifier(
        name, "drawable", context.packageName
    )
}
