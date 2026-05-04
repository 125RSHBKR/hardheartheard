package com.hardheartheard.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hardheartheard.app.data.api.ApiClient
import com.hardheartheard.app.data.api.CreatePostRequest
import com.hardheartheard.app.data.api.Post
import com.hardheartheard.app.data.auth.AuthManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class WriteUiState(
    val title: String = "",
    val content: String = "",
    val isSubmitting: Boolean = false,
    val error: String? = null,
    val success: Boolean = false,
    val newBalance: Int? = null,
    val banned: Boolean = false,
)

class WriteViewModel(
    private val authManager: AuthManager,
) : ViewModel() {

    private val _uiState = MutableStateFlow(WriteUiState())
    val uiState: StateFlow<WriteUiState> = _uiState.asStateFlow()

    fun setTitle(title: String) {
        _uiState.value = _uiState.value.copy(title = title, error = null)
    }

    fun setContent(content: String) {
        _uiState.value = _uiState.value.copy(content = content, error = null)
    }

    /** Cost in cents: 1¢ per character (title + content combined) */
    fun postCost(): Int = _uiState.value.title.length + _uiState.value.content.length

    fun reset() {
        _uiState.value = WriteUiState()
    }

    fun publish(onSuccess: (Post) -> Unit = {}) {
        val state = _uiState.value
        if (state.title.isBlank()) {
            _uiState.value = state.copy(error = "Title cannot be empty.")
            return
        }
        if (state.content.isBlank()) {
            _uiState.value = state.copy(error = "Content cannot be empty.")
            return
        }

        _uiState.value = state.copy(isSubmitting = true, error = null)

        viewModelScope.launch {
            try {
                val response = ApiClient.service.createPost(
                    authorization = authManager.bearerToken(),
                    body          = CreatePostRequest(title = state.title, content = state.content),
                )
                if (response.isSuccessful) {
                    val body = response.body()
                    if (body?.banned == true) {
                        _uiState.value = _uiState.value.copy(
                            isSubmitting = false,
                            banned       = true,
                            error        = "You have been banned.",
                        )
                        return@launch
                    }
                    _uiState.value = _uiState.value.copy(
                        isSubmitting = false,
                        success      = true,
                        newBalance   = body?.newBalance,
                    )
                    body?.post?.let { onSuccess(it) }
                } else {
                    _uiState.value = _uiState.value.copy(
                        isSubmitting = false,
                        error        = "Error ${response.code()}: ${response.message()}",
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isSubmitting = false,
                    error        = e.message ?: "Network error",
                )
            }
        }
    }
}
