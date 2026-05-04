package com.hardheartheard.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hardheartheard.app.data.api.ApiClient
import com.hardheartheard.app.data.api.Comment
import com.hardheartheard.app.data.api.CreateCommentRequest
import com.hardheartheard.app.data.api.Post
import com.hardheartheard.app.data.auth.AuthManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class PostDetailUiState(
    val post: Post? = null,
    val comments: List<Comment> = emptyList(),
    val isLoading: Boolean = true,
    val isSubmitting: Boolean = false,
    val error: String? = null,
    val submitError: String? = null,
    val commentText: String = "",
    val newBalance: Int? = null,
    val banned: Boolean = false,
)

class PostDetailViewModel(
    private val authManager: AuthManager,
) : ViewModel() {

    private val _uiState = MutableStateFlow(PostDetailUiState())
    val uiState: StateFlow<PostDetailUiState> = _uiState.asStateFlow()

    fun loadPost(post: Post) {
        _uiState.value = _uiState.value.copy(post = post, isLoading = true, error = null)
        loadComments(post.id)
    }

    fun setCommentText(text: String) {
        _uiState.value = _uiState.value.copy(commentText = text, submitError = null)
    }

    /** Cost in half-cents: 0.5¢ per character */
    fun commentCost(): Int = (_uiState.value.commentText.length + 1) / 2

    private fun loadComments(postId: String) {
        viewModelScope.launch {
            try {
                val response = ApiClient.service.getComments(
                    authorization = authManager.bearerToken(),
                    postId        = postId,
                )
                if (response.isSuccessful) {
                    _uiState.value = _uiState.value.copy(
                        comments  = response.body()?.comments ?: emptyList(),
                        isLoading = false,
                        error     = null,
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error     = "Error ${response.code()}",
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error     = e.message ?: "Network error",
                )
            }
        }
    }

    fun submitComment(onSuccess: () -> Unit = {}) {
        val state  = _uiState.value
        val postId = state.post?.id ?: return
        val text   = state.commentText.trim()
        if (text.isBlank()) return

        _uiState.value = state.copy(isSubmitting = true, submitError = null)

        viewModelScope.launch {
            try {
                val response = ApiClient.service.createComment(
                    authorization = authManager.bearerToken(),
                    body          = CreateCommentRequest(postId = postId, content = text),
                )
                if (response.isSuccessful) {
                    val body = response.body()
                    if (body?.banned == true) {
                        _uiState.value = _uiState.value.copy(
                            isSubmitting = false,
                            banned       = true,
                            submitError  = "You have been banned.",
                        )
                        return@launch
                    }
                    val newComment = body?.comment
                    val updated    = if (newComment != null)
                        _uiState.value.comments + newComment
                    else
                        _uiState.value.comments

                    _uiState.value = _uiState.value.copy(
                        comments     = updated,
                        commentText  = "",
                        isSubmitting = false,
                        newBalance   = body?.newBalance,
                    )
                    onSuccess()
                } else {
                    _uiState.value = _uiState.value.copy(
                        isSubmitting = false,
                        submitError  = "Error ${response.code()}: ${response.message()}",
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isSubmitting = false,
                    submitError  = e.message ?: "Network error",
                )
            }
        }
    }
}
