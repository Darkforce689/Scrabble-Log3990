package com.example.polyscrabbleclient.user

import com.example.polyscrabbleclient.BuildConfig
import com.example.polyscrabbleclient.utils.httprequests.ScrabbleHttpClient
import java.net.URL

object User {
    var name: String = ""
    var email: String = ""
    var _id: String = ""
    var avatar: String = "avatardefault"
    var averagePoints: Double = 0.0
    var nGamePlayed: Double = 0.0
    var nGameWinned: Double = 0.0
    var averageTimePerGame: Double = 0.0

    fun updateUser(): Thread {
        data class AccountRes(
            val _id: String, val name: String, val email: String, val avatar: String,
            val averagePoints: Double,
            val nGamePlayed: Double,
            val nGameWinned: Double,
            val averageTimePerGame: Double,
        )

        val accountUrl = URL(BuildConfig.API_URL + "/account")
        val thread = Thread {
            val account = ScrabbleHttpClient.get(accountUrl, AccountRes::class.java)
                ?: throw RuntimeException("No account linked to this cookie")
            name = account.name
            email = account.email
            _id = account._id
            avatar = account.avatar
            averagePoints = account.averagePoints
            nGamePlayed = account.nGamePlayed
            nGameWinned = account.nGameWinned
            averageTimePerGame = account.averageTimePerGame
        }
        return thread
    }
}
