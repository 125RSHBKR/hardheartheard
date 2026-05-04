package com.hardheartheard.app.ui.screens

import android.app.Activity
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hardheartheard.app.data.auth.AuthManager
import com.hardheartheard.app.data.auth.AuthState
import com.hardheartheard.app.ui.theme.Black
import com.hardheartheard.app.ui.theme.DimGreen
import com.hardheartheard.app.ui.theme.Green
import com.hardheartheard.app.ui.theme.MutedGreen
import com.hardheartheard.app.ui.theme.Pink
import com.hardheartheard.app.ui.theme.TextMuted
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(
    authManager: AuthManager,
    onSignedIn: () -> Unit,
) {
    val context     = LocalContext.current
    val scope       = rememberCoroutineScope()
    val authState   by authManager.authState.collectAsState()

    var isLoading by remember { mutableStateOf(false) }
    var error     by remember { mutableStateOf<String?>(null) }

    // If already signed in (restored session), navigate immediately
    if (authState is AuthState.SignedIn) {
        onSignedIn()
        return
    }

    Box(
        modifier         = Modifier
            .fillMaxSize()
            .background(Black),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp),
            modifier            = Modifier.padding(horizontal = 32.dp),
        ) {

            // ── Logo / title ──────────────────────────────────────────────────
            Text(
                text       = ">_",
                color      = Green,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize   = 48.sp,
            )

            Spacer(Modifier.height(4.dp))

            Text(
                text       = "HARDHEARTHEARD",
                color      = Green,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize   = 20.sp,
                textAlign  = TextAlign.Center,
            )

            Text(
                text       = "a place to speak your truth",
                color      = TextMuted,
                fontFamily = FontFamily.Monospace,
                fontSize   = 11.sp,
                textAlign  = TextAlign.Center,
            )

            Spacer(Modifier.height(24.dp))

            // ── Google sign-in button ─────────────────────────────────────────
            Button(
                onClick = {
                    isLoading = true
                    error     = null
                    scope.launch {
                        val result = authManager.signInWithGoogle(context)
                        isLoading = false
                        result.fold(
                            onSuccess = { onSignedIn() },
                            onFailure = { e ->
                                error = e.message ?: "Sign-in failed"
                            },
                        )
                    }
                },
                enabled        = !isLoading && authState !is AuthState.Loading,
                modifier       = Modifier.fillMaxWidth(),
                colors         = ButtonDefaults.buttonColors(
                    containerColor = MutedGreen,
                    contentColor   = Green,
                ),
                shape          = RoundedCornerShape(2.dp),
                contentPadding = PaddingValues(vertical = 14.dp),
            ) {
                if (isLoading || authState is AuthState.Loading) {
                    CircularProgressIndicator(color = Green, strokeWidth = 2.dp)
                } else {
                    Text(
                        text       = "[ SIGN IN WITH GOOGLE ]",
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        fontSize   = 13.sp,
                    )
                }
            }

            // ── Error ─────────────────────────────────────────────────────────
            error?.let { err ->
                Text(
                    text       = "! $err",
                    color      = Pink,
                    fontFamily = FontFamily.Monospace,
                    fontSize   = 11.sp,
                    textAlign  = TextAlign.Center,
                )
            }

            Spacer(Modifier.height(32.dp))

            Text(
                text       = "coins cost words\nwords cost coins",
                color      = DimGreen,
                fontFamily = FontFamily.Monospace,
                fontSize   = 10.sp,
                textAlign  = TextAlign.Center,
            )
        }
    }
}
