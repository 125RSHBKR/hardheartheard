package com.hardheartheard.app.ui.components

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hardheartheard.app.data.api.Post
import com.hardheartheard.app.ui.theme.Cyan
import com.hardheartheard.app.ui.theme.DimGreen
import com.hardheartheard.app.ui.theme.Green
import com.hardheartheard.app.ui.theme.MutedGreen
import com.hardheartheard.app.ui.theme.Surface
import com.hardheartheard.app.ui.theme.TextMuted
import com.hardheartheard.app.ui.theme.Yellow
import java.time.Instant
import java.time.temporal.ChronoUnit

@Composable
fun PostCard(
    post: Post,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .border(width = 1.dp, color = DimGreen, shape = RoundedCornerShape(2.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 12.dp),
    ) {
        // Author + time
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text       = post.profiles?.username?.let { "@$it" } ?: "@anonymous",
                color      = Cyan,
                fontSize   = 11.sp,
                fontFamily = FontFamily.Monospace,
            )
            Spacer(Modifier.width(8.dp))
            Text(
                text       = timeAgo(post.createdAt),
                color      = TextMuted,
                fontSize   = 10.sp,
                fontFamily = FontFamily.Monospace,
            )
        }

        Spacer(Modifier.height(6.dp))

        // Title
        Text(
            text       = post.title,
            color      = Green,
            fontSize   = 14.sp,
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            maxLines   = 2,
            overflow   = TextOverflow.Ellipsis,
        )

        Spacer(Modifier.height(4.dp))

        // Content preview
        Text(
            text       = post.content,
            color      = TextMuted,
            fontSize   = 12.sp,
            fontFamily = FontFamily.Monospace,
            maxLines   = 2,
            overflow   = TextOverflow.Ellipsis,
        )

        Spacer(Modifier.height(8.dp))

        // Footer: comment count + coin cost
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text       = "[ ${post.commentCount} comments ]",
                color      = DimGreen,
                fontSize   = 10.sp,
                fontFamily = FontFamily.Monospace,
            )
            Spacer(Modifier.weight(1f))
            Text(
                text       = "¢${post.coinCost}",
                color      = Yellow,
                fontSize   = 10.sp,
                fontFamily = FontFamily.Monospace,
            )
        }
    }
}

private fun timeAgo(isoDate: String): String {
    return try {
        val then = Instant.parse(isoDate)
        val now  = Instant.now()
        val mins = ChronoUnit.MINUTES.between(then, now)
        when {
            mins < 1    -> "just now"
            mins < 60   -> "${mins}m ago"
            mins < 1440 -> "${mins / 60}h ago"
            else        -> "${mins / 1440}d ago"
        }
    } catch (e: Exception) {
        isoDate.take(10)
    }
}
