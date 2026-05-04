package com.hardheartheard.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hardheartheard.app.data.api.ApiClient
import com.hardheartheard.app.data.api.Post
import com.hardheartheard.app.data.auth.AuthManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class FeedUiState(
    val posts: List<Post> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val sort: SortMode = SortMode.RECENT,
)

enum class SortMode(val param: String) {
    RECENT("recent"),
    TRENDING("trending"),
}

class FeedViewModel(
    private val authManager: AuthManager,
) : ViewModel() {

    private val _uiState = MutableStateFlow(FeedUiState(isLoading = true))
    val uiState: StateFlow<FeedUiState> = _uiState.asStateFlow()

    init {
        loadPosts()
    }

    fun setSort(mode: SortMode) {
        _uiState.value = _uiState.value.copy(sort = mode, isLoading = true, error = null)
        loadPosts()
    }

    fun refresh() {
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        loadPosts()
    }

    private fun loadPosts() {
        viewModelScope.launch {
            try {
                val response = ApiClient.service.getPosts(
                    authorization = authManager.bearerToken(),
                    sort          = _uiState.value.sort.param,
                )
                if (response.isSuccessful) {
                    _uiState.value = _uiState.value.copy(
                        posts     = response.body()?.posts ?: emptyList(),
                        isLoading = false,
                        error     = null,
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error     = "Error ${response.code()}: ${response.message()}",
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
}
