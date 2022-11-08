package com.example.polyscrabbleclient.message.sources


import androidx.paging.PagingSource
import androidx.paging.PagingState
import com.example.polyscrabbleclient.account.model.Pagination
import com.example.polyscrabbleclient.message.N_MESSAGE_TO_FETCH
import com.example.polyscrabbleclient.message.model.Message
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.lang.RuntimeException

class MessageSource() : PagingSource<Int, Message>() {
    var offset = 0
    private var conversationId: String? = null

    override val keyReuseSupported: Boolean = true

    override fun getRefreshKey(state: PagingState<Int, Message>): Int? {
        return state.anchorPosition?.let { anchorPosition ->
            val anchorPage = state.closestPageToPosition(anchorPosition)
            anchorPage?.prevKey?.plus(1) ?: anchorPage?.nextKey?.minus(1)
        }
    }

    fun setCurrentConversation(conversationId: String) {
        this.conversationId = conversationId
    }

    override suspend fun load(params: LoadParams<Int>): LoadResult<Int, Message> {
        if (conversationId === null) {
            throw RuntimeException("No conversation was set before fetching messages")
        }
        return try {
            val nextPageNumber = params.key ?: 0
            var messages: List<Message>? = null
            val request = MessageRepository.fetchMessages(conversationId!!, Pagination(nextPageNumber, N_MESSAGE_TO_FETCH, offset)) {
                messages = it
            }

            request.start()
            withContext(Dispatchers.IO) {
                request.join()
            }
            LoadResult.Page(
                data = messages!!,
                prevKey = null,
                nextKey = if (messages!!.size < N_MESSAGE_TO_FETCH) null else nextPageNumber + 1
            )
        } catch (e: Exception) {
            LoadResult.Error(e)
        }
    }
}
