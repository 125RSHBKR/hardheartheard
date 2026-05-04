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
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hardheartheard.app.ui.theme.Black
import com.hardheartheard.app.ui.theme.Cyan
import com.hardheartheard.app.ui.theme.DimGreen
import com.hardheartheard.app.ui.theme.Green
import com.hardheartheard.app.ui.theme.MutedGreen
import com.hardheartheard.app.ui.theme.Pink
import com.hardheartheard.app.ui.theme.Surface
import com.hardheartheard.app.ui.theme.TextMuted
import com.hardheartheard.app.ui.theme.Yellow
import com.hardheartheard.app.viewmodel.PostDetailViewModel
import kotlinx.coroutines.launch
import java.time.Instant
import java.time.temporal.ChronoUnit

@Composable
fun PostDetailScreen(
    viewModel: PostDetailViewModel,
    onBack: () -> Unit,
) {
    val state      = viewModel.uiState.collectAsState().value
    val listState  = rememberLazyListState()
    val scope      = rememberCoroutineScope()
    val cost       = viewModel.commentCost()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Black)
            .imePadding(),
    ) {

        // ── Top bar ───────────────────────────────────────────────────────────
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Surface)
                .padding(horizontal = 16.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            TextButton(onClick = onBack) {
                Text(
                    text       = "< BACK",
                    color      = Green,
                    fontFamily = FontFamily.Monospace,
                    fontSize   = 13.sp,
                )
            }
            Spacer(Modifier.weight(1f))
            Text(
                text       = "> POST",
                color      = DimGreen,
                fontFamily = FontFamily.Monospace,
                fontSize   = 12.sp,
            )
        }

        HorizontalDivider(color = DimGreen, thickness = 1.dp)

        // ── Content ───────────────────────────────────────────────────────────
        if (state.isLoading && state.post == null) {
            Box(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                Text("loading...", color = TextMuted, fontFamily = FontFamily.Monospace)
            }
        } else {
            LazyColumn(
                modifier       = Modifier.weight(1f),
                state          = listState,
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                // Post body
                state.post?.let { post ->
                    item(key = "post_header") {
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text       = post.profiles?.username?.let { "@$it" } ?: "@anon",
                                    color      = Cyan,
                                    fontSize   = 11.sp,
                                    fontFamily = FontFamily.Monospace,
                                )
                                Spacer(Modifier.width(8.dp))
                                Text(
                                    text       = formatTime(post.createdAt),
                                    color      = TextMuted,
                                    fontSize   = 10.sp,
                                    fontFamily = FontFamily.Monospace,
                                )
                            }
                            Spacer(Modifier.height(8.dp))
                            Text(
                                text       = post.title,
                                color      = Green,
                                fontSize   = 18.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold,
                            )
                            Spacer(Modifier.height(10.dp))
                            Text(
                                text       = post.content,
                                color      = Green,
                                fontSize   = 13.sp,
                                fontFamily = FontFamily.Monospace,
                            )
                            Spacer(Modifier.height(12.dp))
                            HorizontalDivider(color = DimGreen)
                            Spacer(Modifier.height(8.dp))
                            Text(
                                text       = "── comments (${state.comments.size}) ──",
                                color      = DimGreen,
                                fontSize   = 11.sp,
                                fontFamily = FontFamily.Monospace,
                            )
                        }
                    }
                }

                // Comments
                if (state.isLoading) {
                    item(key = "loading") {
                        Text("loading comments...", color = TextMuted, fontFamily = FontFamily.Monospace, fontSize = 11.sp)
                    }
                }

                state.error?.let { err ->
                    item(key = "error") {
                        Text("! $err", color = Pink, fontFamily = FontFamily.Monospace, fontSize = 11.sp)
                    }
                }

                items(state.comments, key = { it.id }) { comment ->
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, DimGreen, RoundedCornerShape(2.dp))
                            .padding(10.dp),
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text       = comment.profiles?.username?.let { "@$it" } ?: "@anon",
                                color      = Cyan,
                                fontSize   = 10.sp,
                                fontFamily = FontFamily.Monospace,
                            )
                            Spacer(Modifier.width(8.dp))
                            Text(
                                text       = formatTime(comment.createdAt),
                                color      = TextMuted,
                                fontSize   = 9.sp,
                                fontFamily = FontFamily.Monospace,
                            )
                            Spacer(Modifier.weight(1f))
                            Text(
                                text       = "¢${comment.coinCost}",
                                color      = Yellow,
                                fontSize   = 9.sp,
                                fontFamily = FontFamily.Monospace,
                            )
                        }
                        Spacer(Modifier.height(4.dp))
                        Text(
                            text       = comment.content,
                            color      = Green,
                            fontSize   = 12.sp,
                            fontFamily = FontFamily.Monospace,
                        )
                    }
                }
            }
        }

        HorizontalDivider(color = DimGreen)

        // ── Comment input ─────────────────────────────────────────────────────
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(Surface)
                .padding(12.dp),
        ) {
            state.submitError?.let { err ->
                Text("! $err", color = Pink, fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                Spacer(Modifier.height(4.dp))
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.Bottom,
            ) {
                BasicTextField(
                    value = state.commentText,
                    onValueChange = viewModel::setCommentText,
                    modifier = Modifier
                        .weight(1f)
                        .background(Black)
                        .border(1.dp, DimGreen, RoundedCornerShape(2.dp))
                        .padding(8.dp),
                    textStyle = TextStyle(
                        color      = Green,
                        fontSize   = 12.sp,
                        fontFamily = FontFamily.Monospace,
                    ),
                    cursorBrush = SolidColor(Green),
                    maxLines    = 4,
                    decorationBox = { inner ->
                        if (state.commentText.isEmpty()) {
                            Text(
                                text     = "add a comment…",
                                color    = TextMuted,
                                fontSize = 12.sp,
                                fontFamily = FontFamily.Monospace,
                            )
                        }
                        inner()
                    },
                )

                Spacer(Modifier.width(8.dp))

                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text       = "¢$cost (½¢/char)",
                        color      = Yellow,
                        fontSize   = 9.sp,
                        fontFamily = FontFamily.Monospace,
                    )
                    Spacer(Modifier.height(4.dp))
                    Button(
                        onClick = {
                            viewModel.submitComment {
                                scope.launch {
                                    listState.animateScrollToItem(Int.MAX_VALUE)
                                }
                            }
                        },
                        enabled = state.commentText.isNotBlank() && !state.isSubmitting,
                        colors  = ButtonDefaults.buttonColors(
                            containerColor = MutedGreen,
                            contentColor   = Green,
                        ),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                    ) {
                        if (state.isSubmitting) {
                            CircularProgressIndicator(color = Green, strokeWidth = 2.dp)
                        } else {
                            Text(
                                text       = "POST",
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold,
                                fontSize   = 12.sp,
                            )
                        }
                    }
                }
            }
        }
    }
}

private fun formatTime(isoDate: String): String {
    return try {
        val then = Instant.parse(isoDate)
        val now  = Instant.now()
        val mins = ChronoUnit.MINUTES.between(then, now)
        when {
            mins < 1    -> "just now"
            mins < 60   -> "${mins}m"
            mins < 1440 -> "${mins / 60}h"
            else        -> "${mins / 1440}d"
        }
    } catch (e: Exception) {
        isoDate.take(10)
    }
}
