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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.ExperimentalMaterialApi
import androidx.compose.material.pullrefresh.PullRefreshIndicator
import androidx.compose.material.pullrefresh.pullRefresh
import androidx.compose.material.pullrefresh.rememberPullRefreshState
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hardheartheard.app.data.api.Post
import com.hardheartheard.app.ui.components.CoinBalance
import com.hardheartheard.app.ui.components.PostCard
import com.hardheartheard.app.ui.theme.Black
import com.hardheartheard.app.ui.theme.DimGreen
import com.hardheartheard.app.ui.theme.Green
import com.hardheartheard.app.ui.theme.MutedGreen
import com.hardheartheard.app.ui.theme.Pink
import com.hardheartheard.app.ui.theme.Surface
import com.hardheartheard.app.ui.theme.TextMuted
import com.hardheartheard.app.viewmodel.FeedViewModel
import com.hardheartheard.app.viewmodel.SortMode

@OptIn(ExperimentalMaterialApi::class)
@Composable
fun FeedScreen(
    viewModel: FeedViewModel,
    coinBalance: Int,
    onPostClick: (Post) -> Unit,
    onWriteClick: () -> Unit,
    onProfileClick: () -> Unit,
) {
    val state by viewModel.uiState.collectAsState()

    val pullRefreshState = rememberPullRefreshState(
        refreshing = state.isLoading,
        onRefresh  = viewModel::refresh,
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Black)
            .pullRefresh(pullRefreshState),
    ) {
        Column(modifier = Modifier.fillMaxSize()) {

            // ── Top bar ───────────────────────────────────────────────────────
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Surface)
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment      = Alignment.CenterVertically,
                horizontalArrangement  = Arrangement.SpaceBetween,
            ) {
                Text(
                    text       = "> HARDHEARTHEARD",
                    color      = Green,
                    fontSize   = 16.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    CoinBalance(balance = coinBalance)
                    TextButton(onClick = onProfileClick) {
                        Text(
                            text       = "[ PROFILE ]",
                            color      = DimGreen,
                            fontSize   = 11.sp,
                            fontFamily = FontFamily.Monospace,
                        )
                    }
                }
            }

            // ── Sort toggle ───────────────────────────────────────────────────
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                SortMode.entries.forEach { mode ->
                    val selected = state.sort == mode
                    TextButton(
                        onClick = { viewModel.setSort(mode) },
                        modifier = Modifier
                            .border(
                                width = 1.dp,
                                color = if (selected) Green else DimGreen,
                                shape = RoundedCornerShape(2.dp),
                            )
                            .background(if (selected) MutedGreen else Black),
                    ) {
                        Text(
                            text       = "[ ${mode.name} ]",
                            color      = if (selected) Green else TextMuted,
                            fontSize   = 11.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
                        )
                    }
                }
            }

            // ── Error ─────────────────────────────────────────────────────────
            state.error?.let { err ->
                Text(
                    text     = "! $err",
                    color    = Pink,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp),
                )
            }

            // ── Feed list ─────────────────────────────────────────────────────
            LazyColumn(
                modifier            = Modifier.fillMaxSize(),
                contentPadding      = PaddingValues(
                    start  = 12.dp,
                    end    = 12.dp,
                    top    = 4.dp,
                    bottom = 88.dp, // room for FAB
                ),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                if (state.isLoading && state.posts.isEmpty()) {
                    item {
                        Text(
                            text       = "loading...",
                            color      = TextMuted,
                            fontFamily = FontFamily.Monospace,
                            modifier   = Modifier.padding(16.dp),
                        )
                    }
                }
                items(state.posts, key = { it.id }) { post ->
                    PostCard(post = post, onClick = { onPostClick(post) })
                }
                if (!state.isLoading && state.posts.isEmpty() && state.error == null) {
                    item {
                        Text(
                            text       = "[ no posts yet ]",
                            color      = TextMuted,
                            fontFamily = FontFamily.Monospace,
                            modifier   = Modifier.padding(16.dp),
                        )
                    }
                }
            }
        }

        // ── Pull-to-refresh indicator ─────────────────────────────────────────
        PullRefreshIndicator(
            refreshing = state.isLoading,
            state      = pullRefreshState,
            modifier   = Modifier.align(Alignment.TopCenter),
            backgroundColor = Surface,
            contentColor    = Green,
        )

        // ── FAB ───────────────────────────────────────────────────────────────
        FloatingActionButton(
            onClick          = onWriteClick,
            modifier         = Modifier
                .align(Alignment.BottomEnd)
                .padding(20.dp),
            containerColor   = MutedGreen,
            contentColor     = Green,
        ) {
            Text(
                text       = "+ WRITE",
                color      = Green,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize   = 13.sp,
                modifier   = Modifier.padding(horizontal = 8.dp),
            )
        }
    }
}
