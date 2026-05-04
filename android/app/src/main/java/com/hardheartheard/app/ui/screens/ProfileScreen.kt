package com.hardheartheard.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.hardheartheard.app.ui.theme.Black
import com.hardheartheard.app.ui.theme.Cyan
import com.hardheartheard.app.ui.theme.DimGreen
import com.hardheartheard.app.ui.theme.Green
import com.hardheartheard.app.ui.theme.MutedGreen
import com.hardheartheard.app.ui.theme.Pink
import com.hardheartheard.app.ui.theme.Surface
import com.hardheartheard.app.ui.theme.TextMuted
import com.hardheartheard.app.ui.theme.Yellow
import com.hardheartheard.app.viewmodel.ProfileViewModel

@Composable
fun ProfileScreen(
    viewModel: ProfileViewModel,
    onSignedOut: () -> Unit,
) {
    val state = viewModel.uiState.collectAsState().value

    LaunchedEffect(Unit) { viewModel.loadProfile() }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Black),
    ) {

        // ── Top bar ───────────────────────────────────────────────────────────
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Surface)
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text       = "> PROFILE",
                color      = Green,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize   = 16.sp,
            )
        }

        HorizontalDivider(color = DimGreen)

        when {
            state.isLoading -> {
                Box(
                    modifier            = Modifier.fillMaxSize(),
                    contentAlignment    = Alignment.Center,
                ) {
                    CircularProgressIndicator(color = Green, strokeWidth = 2.dp)
                }
            }

            state.error != null -> {
                Column(
                    modifier            = Modifier.fillMaxSize().padding(24.dp),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Text("! ${state.error}", color = Pink, fontFamily = FontFamily.Monospace, fontSize = 13.sp)
                    Spacer(Modifier.height(24.dp))
                    SignOutButton(
                        isLoading = state.isSigningOut,
                        onSignOut = { viewModel.signOut(onSignedOut) },
                    )
                }
            }

            state.profile != null -> {
                val profile = state.profile

                Column(
                    modifier            = Modifier
                        .fillMaxWidth()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {

                    // ── Avatar ────────────────────────────────────────────────
                    if (!profile.avatarUrl.isNullOrBlank()) {
                        AsyncImage(
                            model    = profile.avatarUrl,
                            contentDescription = "Avatar",
                            modifier = Modifier
                                .size(72.dp)
                                .clip(CircleShape)
                                .border(2.dp, Green, CircleShape),
                        )
                    } else {
                        Box(
                            modifier = Modifier
                                .size(72.dp)
                                .clip(CircleShape)
                                .background(MutedGreen)
                                .border(2.dp, Green, CircleShape),
                            contentAlignment = Alignment.Center,
                        ) {
                            Text(
                                text       = profile.username.take(2).uppercase(),
                                color      = Green,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold,
                                fontSize   = 22.sp,
                            )
                        }
                    }

                    Spacer(Modifier.height(4.dp))

                    // ── Display name ──────────────────────────────────────────
                    Text(
                        text       = profile.displayName.ifBlank { profile.username },
                        color      = Green,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        fontSize   = 20.sp,
                    )

                    // ── Username ──────────────────────────────────────────────
                    Text(
                        text       = "@${profile.username}",
                        color      = Cyan,
                        fontFamily = FontFamily.Monospace,
                        fontSize   = 13.sp,
                    )

                    HorizontalDivider(color = DimGreen, modifier = Modifier.padding(vertical = 8.dp))

                    // ── Stats ─────────────────────────────────────────────────
                    Row(
                        modifier              = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly,
                    ) {
                        StatItem(label = "BALANCE", value = "¢${profile.coinBalance}", color = Yellow)
                        StatItem(label = "POSTS",   value = "${profile.postCount}",    color = Green)
                    }

                    Spacer(Modifier.height(16.dp))

                    // ── Sign out ──────────────────────────────────────────────
                    SignOutButton(
                        isLoading = state.isSigningOut,
                        onSignOut = { viewModel.signOut(onSignedOut) },
                    )
                }
            }
        }
    }
}

@Composable
private fun StatItem(label: String, value: String, color: androidx.compose.ui.graphics.Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text       = value,
            color      = color,
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            fontSize   = 24.sp,
        )
        Text(
            text       = label,
            color      = TextMuted,
            fontFamily = FontFamily.Monospace,
            fontSize   = 10.sp,
        )
    }
}

@Composable
private fun SignOutButton(isLoading: Boolean, onSignOut: () -> Unit) {
    Button(
        onClick  = onSignOut,
        enabled  = !isLoading,
        colors   = ButtonDefaults.buttonColors(
            containerColor = Black,
            contentColor   = Pink,
        ),
        shape          = RoundedCornerShape(2.dp),
        border         = androidx.compose.foundation.BorderStroke(1.dp, Pink),
        contentPadding = PaddingValues(horizontal = 24.dp, vertical = 12.dp),
    ) {
        if (isLoading) {
            CircularProgressIndicator(color = Pink, strokeWidth = 2.dp, modifier = Modifier.size(16.dp))
        } else {
            Text(
                text       = "[ SIGN OUT ]",
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize   = 13.sp,
            )
        }
    }
}
