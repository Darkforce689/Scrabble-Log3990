package com.example.polyscrabbleclient.user

import com.example.polyscrabbleclient.BuildConfig
import com.example.polyscrabbleclient.user.model.UserDTO
import com.example.polyscrabbleclient.user.model.UserGetRes
import com.example.polyscrabbleclient.user.model.UserStatus
import com.example.polyscrabbleclient.utils.constants.NoAvatar
import com.example.polyscrabbleclient.utils.constants.botNames
import com.example.polyscrabbleclient.utils.getBotAvatar
import com.example.polyscrabbleclient.utils.httprequests.ScrabbleHttpClient
import java.net.URL
import java.util.concurrent.locks.ReentrantLock
import kotlin.concurrent.fixedRateTimer

const val TIME_INVALIDATE_USERNAME_CACHE: Long = 60 * 1000

object UserRepository {
    private val users: MutableMap<String, UserDTO> = HashMap()      // id -> user
    private val usersByName: MutableMap<String, UserDTO> = HashMap() // name -> user
    private val usersLock = ReentrantLock()
    private val usersByNameLock = ReentrantLock()

    init {
        fixedRateTimer(period = TIME_INVALIDATE_USERNAME_CACHE) {
            usersByName.clear()
        }
    }

    fun getUser(userId: String, callback: (UserDTO) -> Unit) {
        val url = createGetUserUrl(userId)
        val thread = getUserByIdThread(userId, url, callback)
        thread.start()
        thread.join()
    }

    fun getUserByName(name: String, callback: (UserDTO) -> Unit) {
        if (isBotName(name)) {
            return callback(createBotUser(name))
        }
        val url = createGetUserWithNameUrl(name)
        val thread = getUserByNameThread(name, url, callback)
        thread.start()
        thread.join()
    }

    fun isBotName(name: String): Boolean {
        return botNames.contains(name)
    }

    fun getUsers(userIds: List<String>, callback: (List<UserDTO>) -> Unit) {
        val userCollectorLock = ReentrantLock()
        val userCollector = HashMap<Int, UserDTO>()
        val tasks = userIds.mapIndexed { index: Int, userId ->
            val url = createGetUserUrl(userId)
            getUserByIdThread(userId, url) { user ->
                userCollectorLock.lock()
                userCollector[index] = user
                userCollectorLock.unlock()
            }
        }

        tasks.forEach { task -> task.start() }
        tasks.forEach { task -> task.join() }

        val users: List<UserDTO> = userIds.mapIndexed { index: Int, _: String ->
            val user = userCollector[index]
            if (user === null) {
                throw RuntimeException("User not collected in collector")
            }
            user as UserDTO
        }
        callback(users as List<UserDTO>)
    }

    fun invalidateCache() {
        usersLock.lock()
        usersByNameLock.lock()
        users.clear()
        usersByName.clear()
        usersByNameLock.unlock()
        usersLock.unlock()
    }

    private fun getUserByIdThread(userId: String, url: URL, callback: (UserDTO) -> Unit): Thread {
        if (User._id == userId) {
            return selfUser(callback)
        }

        val userInCache = users[userId]
        if (userInCache != null) {
            return Thread {
                callback(userInCache)
            }
        }

        return getUserInternal(url) {
            addToUserCache(it)
            callback(it);
        }
    }

    private fun getUserByNameThread(name: String, url: URL, callback: (UserDTO) -> Unit): Thread {
        if (User.name == name) {
            return selfUser(callback)
        }

        val userInCache = usersByName[name]
        if (userInCache != null) {
            return Thread {
                callback(userInCache)
            }
        }

        return getUserInternal(url) {
            addToNameCache(it)
            callback(it)
        }
    }

    private fun getUserInternal(
        url: URL,
        callback: (UserDTO) -> Unit
    ) = Thread {
        val res = ScrabbleHttpClient.get(url, UserGetRes::class.java)
        val user: UserDTO = res?.user ?: createInexistantUser()
        callback(user)
    }

    private fun selfUser(callback: (UserDTO) -> Unit) =
        Thread {
            callback(
                UserDTO(
                    _id = User._id,
                    email = User.email,
                    name = User.name,
                    avatar = User.avatar,
                    status = UserStatus.Online,
                )
            )
        }

    private fun createGetUserUrl(userId: String): URL {
        val apiUrl = BuildConfig.API_URL
        return URL("${apiUrl}/users/${userId}")
    }

    private fun createGetUserWithNameUrl(name: String): URL {
        return URL("${BuildConfig.API_URL}/users?name=${name}")
    }

    private fun addToUserCache(user: UserDTO) {
        usersLock.lock()
        users[user._id] = user
        usersLock.unlock()

        addToNameCache(user)
    }

    private fun addToNameCache(user: UserDTO) {
        usersByNameLock.lock()
        users[user.name] = user
        usersByNameLock.unlock()
    }

    private fun createInexistantUser(userId: String = ""): UserDTO {
        return UserDTO(userId, "empty", "InexistantUser", NoAvatar, UserStatus.Online)
    }

    private fun createBotUser(name: String = ""): UserDTO {
        return UserDTO("", "empty", name, getBotAvatar(name), UserStatus.Online)
    }
}
