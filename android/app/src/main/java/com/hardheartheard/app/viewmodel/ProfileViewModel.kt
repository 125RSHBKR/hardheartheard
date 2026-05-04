package com.hardheartheard.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hardheartheard.app.data.api.Profile
import com.hardheartheard.app.data.auth.AuthManager
import com.hardheartheard.app.data.auth.AuthState
import com.hardheartheard.app.data.auth.supabaseClient
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable

data class ProfileUiState(
    val profile: Profile? = null,
    val isLoading: Boolean = true,
    val error: String? = null,
    val isSigningOut: Boolean = false,
)

class ProfileViewModel(
    private val authManager: AuthManager,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProfileUiState())
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()

    fun loadProfile() {
        viewModelScope.launch {
            val authState = authManager.authState.value
            val userId = (authState as? AuthState.SignedIn)?.userId ?: run {
                _uiState.value = ProfileUiState(isLoading = false, error = "Not signed in")
                return@launch
            }
            try {
                val rows = supabaseClient
                    .from("profiles")
                    .select {
                        filter { eq("id", userId) }
                    }
                    .decodeList<ProfileRow>()

                val row = rows.firstOrNull()
                if (row != null) {
                    _uiState.value = ProfileUiState(
                        profile   = Profile(
                            id           = row.id,
                            username     = row.username ?: "",
                            displayName  = row.displayName ?: row.username ?: "",
                            avatarUrl    = row.avatarUrl,
                            coinBalance  = row.coinBalance ?: 0,
                            postCount    = row.postCount ?: 0,
                        ),
                        isLoading = false,
                    )
                } else {
                    _uiState.value = ProfileUiState(isLoading = false, error = "Profile not found")
                }
            } catch (e: Exception) {
                _uiState.value = ProfileUiState(isLoading = false, error = e.message ?: "Error loading profile")
            }
        }
    }

    fun signOut(onSignedOut: () -> Unit = {}) {
        _uiState.value = _uiState.value.copy(isSigningOut = true)
        viewModelScope.launch {
            authManager.signOut()
            onSignedOut()
        }
    }
}

// Supabase serializable row — mirrors the `profiles` table columns
@Serializable
private data class ProfileRow(
    val id: String = "",
    val username: String? = null,
    @kotlinx.serialization.SerialName("display_name")
    val displayName: String? = null,
    @kotlinx.serialization.SerialName("avatar_url")
    val avatarUrl: String? = null,
    @kotlinx.serialization.SerialName("coin_balance")
    val coinBalance: Int? = null,
    @kotlinx.serialization.SerialName("post_count")
    val postCount: Int? = null,
)
