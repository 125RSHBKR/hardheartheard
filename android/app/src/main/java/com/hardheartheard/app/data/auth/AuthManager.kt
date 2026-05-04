package com.hardheartheard.app.data.auth

import android.content.Context
import android.util.Log
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialException
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.auth.providers.Google
import io.github.jan.supabase.auth.providers.builtin.IDToken
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.auth.Auth
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

// TODO: Replace these placeholder values with real credentials before building.
//       - SUPABASE_URL:      Your Supabase project URL, e.g. https://xxxx.supabase.co
//       - SUPABASE_ANON_KEY: Your Supabase project anon/public key
//       - GOOGLE_WEB_CLIENT_ID: The OAuth 2.0 Web Client ID from Google Cloud Console
//         (NOT the Android client ID — the *web* client ID is used for ID token sign-in)

private const val SUPABASE_URL          = "YOUR_SUPABASE_URL"
private const val SUPABASE_ANON_KEY     = "YOUR_SUPABASE_ANON_KEY"
const val GOOGLE_WEB_CLIENT_ID          = "YOUR_GOOGLE_WEB_CLIENT_ID"

private const val TAG = "AuthManager"

// ── Supabase client (singleton) ───────────────────────────────────────────────
val supabaseClient: SupabaseClient by lazy {
    createSupabaseClient(
        supabaseUrl    = SUPABASE_URL,
        supabaseKey    = SUPABASE_ANON_KEY,
    ) {
        install(Auth)
        install(Postgrest)
    }
}

// ── Auth state ────────────────────────────────────────────────────────────────
sealed class AuthState {
    object Loading     : AuthState()
    object SignedOut   : AuthState()
    data class SignedIn(val accessToken: String, val userId: String) : AuthState()
}

class AuthManager {

    private val _authState = MutableStateFlow<AuthState>(AuthState.Loading)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    /** Call once at app start to restore a persisted session. */
    suspend fun restoreSession() {
        try {
            supabaseClient.auth.awaitInitialization()
            val session = supabaseClient.auth.currentSessionOrNull()
            if (session != null) {
                _authState.value = AuthState.SignedIn(
                    accessToken = session.accessToken,
                    userId      = session.user?.id ?: "",
                )
            } else {
                _authState.value = AuthState.SignedOut
            }
        } catch (e: Exception) {
            Log.e(TAG, "restoreSession error", e)
            _authState.value = AuthState.SignedOut
        }
    }

    /**
     * Trigger Google Sign-In via Credential Manager, then hand the ID token
     * to Supabase Auth.
     */
    suspend fun signInWithGoogle(context: Context): Result<Unit> {
        return try {
            val credentialManager = CredentialManager.create(context)

            val googleIdOption = GetGoogleIdOption.Builder()
                .setServerClientId(GOOGLE_WEB_CLIENT_ID)
                .setFilterByAuthorizedAccounts(false) // show all accounts, not just previously used
                .build()

            val request = GetCredentialRequest.Builder()
                .addCredentialOption(googleIdOption)
                .build()

            val result = credentialManager.getCredential(context = context, request = request)
            val credential = result.credential

            val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
            val idToken = googleIdTokenCredential.idToken

            // Sign in to Supabase using the Google ID token
            supabaseClient.auth.signInWith(IDToken) {
                provider    = Google
                this.idToken = idToken
            }

            val session = supabaseClient.auth.currentSessionOrNull()
                ?: return Result.failure(Exception("No session after sign-in"))

            _authState.value = AuthState.SignedIn(
                accessToken = session.accessToken,
                userId      = session.user?.id ?: "",
            )
            Result.success(Unit)
        } catch (e: GetCredentialException) {
            Log.e(TAG, "Credential manager error", e)
            Result.failure(e)
        } catch (e: Exception) {
            Log.e(TAG, "signInWithGoogle error", e)
            Result.failure(e)
        }
    }

    suspend fun signOut() {
        try {
            supabaseClient.auth.signOut()
        } catch (e: Exception) {
            Log.e(TAG, "signOut error", e)
        } finally {
            _authState.value = AuthState.SignedOut
        }
    }

    fun currentAccessToken(): String? =
        (_authState.value as? AuthState.SignedIn)?.accessToken

    fun bearerToken(): String =
        "Bearer ${currentAccessToken() ?: ""}"
}
