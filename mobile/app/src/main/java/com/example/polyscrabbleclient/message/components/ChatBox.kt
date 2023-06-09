package com.example.polyscrabbleclient.message.components

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.runtime.snapshots.SnapshotStateList
import androidx.compose.ui.Alignment
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.paging.compose.LazyPagingItems
import androidx.paging.compose.collectAsLazyPagingItems
import androidx.paging.compose.items
import com.example.polyscrabbleclient.message.model.Message
import com.example.polyscrabbleclient.message.model.MessageType
import com.example.polyscrabbleclient.message.viewModel.ChatBoxViewModel

@OptIn(ExperimentalComposeUiApi::class, ExperimentalMaterialApi::class)
@Composable
fun ChatBox(chatBoxViewModel: ChatBoxViewModel) {
    val keyboardController = LocalSoftwareKeyboardController.current
    val messages = chatBoxViewModel.messages
    val history = chatBoxViewModel.historyPager.collectAsLazyPagingItems()
    val conversations = chatBoxViewModel.conversations

    val inputFocusRequester = LocalFocusManager.current
    LaunchedEffect(true) {
        chatBoxViewModel.actualizeConversations()
    }

    LaunchedEffect(chatBoxViewModel.currentConvoId.value) {
        history.refresh()
    }

    Card(
        modifier = Modifier.padding(10.dp, 0.dp, 10.dp, 10.dp),

        elevation = 2.dp,
        onClick = { keyboardController?.hide(); inputFocusRequester.clearFocus() }) {
        Column {
            ConversationPicker(
                conversations = conversations,
                selectedConvoIndex = chatBoxViewModel.selectedConvoIndex.value,
                onSelectedConvo = { index ->
                    chatBoxViewModel.onSelectedConvo(index)
                    chatBoxViewModel.scrollDown.value = true
                },
                onConvoLeave = { index, callback ->
                    chatBoxViewModel.leaveConversation(index) {
                        callback()
                    }
                },
                modifier = Modifier.height(70.dp)
            )

            Divider(thickness = 1.dp, modifier = Modifier.fillMaxWidth())

            Box(
                Modifier
                    .weight(0.5f)
                    .fillMaxHeight()
            ) {
                MessageList(messages, history, chatBoxViewModel.scrollDown)
            }
            Box(
                modifier = Modifier.padding(20.dp, 3.dp, 20.dp, 15.dp),
            ) {
                MessageInput(chatBoxViewModel)
            }
        }
    }
}


@Composable
fun MessageList(
    messages: SnapshotStateList<Message>,
    history: LazyPagingItems<Message>,
    scrolldown: MutableState<Boolean>,
) {

    val scrollState = rememberLazyListState()
    LaunchedEffect(messages.size) {
        if (messages.size == 0) {
            return@LaunchedEffect
        }

        if (scrollState.firstVisibleItemIndex == 0) {
            scrollState.animateScrollToItem(0)
            return@LaunchedEffect
        }

        if (messages.last().type !== MessageType.ME) {
            scrollState.scrollToItem(
                scrollState.firstVisibleItemIndex + 1,
                scrollState.firstVisibleItemScrollOffset
            )
            return@LaunchedEffect
        }
        scrollState.animateScrollToItem(0)
    }
    LaunchedEffect(scrolldown.value) {
        if (scrolldown.value) {
            scrollState.scrollToItem(0, 0)
            scrolldown.value = false
        }
    }

    LazyColumn(
        modifier = Modifier
            .padding(vertical = 4.dp, horizontal = 2.dp)
            .fillMaxHeight()
            .fillMaxWidth(),
        verticalArrangement = Arrangement.Bottom,
        reverseLayout = true,
        state = scrollState
    ) {
        items(messages.reversed()) { message ->
            MessageCard(message)
        }
        items(history) { message ->
            message?.let {
                MessageCard(it)
            }
        }
    }
}

@OptIn(ExperimentalComposeUiApi::class, ExperimentalFoundationApi::class)
@Composable
fun MessageInput(viewModel: ChatBoxViewModel) {
    var input by remember { mutableStateOf("") }
    fun sendMessage() {
        if (input.isNotBlank()) {
            viewModel.sendMessage(input)
        }
        input = ""
    }

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        OutlinedTextField(
            modifier = Modifier
                .fillMaxWidth(0.9f)
                .height(55.dp),
            value = input,
            onValueChange = { input = it },
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Password,
                imeAction = ImeAction.Send
            ),
            keyboardActions = KeyboardActions(
                onSend = { sendMessage() }
            ),
            placeholder = { Text(text = "Aa") },
            singleLine = true,
            )
        Button(
            modifier = Modifier
                .fillMaxWidth()
                .height(55.dp),
            onClick = { sendMessage() },
            enabled = input.isNotBlank()
        ) {
            Text(text = "Send")
        }
    }
}
