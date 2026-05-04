package com.hardheartheard.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hardheartheard.app.ui.theme.Black
import com.hardheartheard.app.ui.theme.DimGreen
import com.hardheartheard.app.ui.theme.Green
import com.hardheartheard.app.ui.theme.MutedGreen
import com.hardheartheard.app.ui.theme.Pink
import com.hardheartheard.app.ui.theme.Surface
import com.hardheartheard.app.ui.theme.TextMuted
import com.hardheartheard.app.ui.theme.Yellow
import com.hardheartheard.app.viewmodel.WriteViewModel

@Composable
fun WriteScreen(
    viewModel: WriteViewModel,
    coinBalance: Int,
    onBack: () -> Unit,
    onPublished: () -> Unit,
) {
    val state = viewModel.uiState.collectAsState().value
    val cost  = viewModel.postCost()

    // Navigate away on success
    if (state.success) {
        viewModel.reset()
        onPublished()
        return
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Black)
            .imePadding()
            .verticalScroll(rememberScrollState()),
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
                Text("< BACK", color = Green, fontFamily = FontFamily.Monospace, fontSize = 13.sp)
            }
            Spacer(Modifier.weight(1f))
            Text(
                text       = "> WRITE",
                color      = DimGreen,
                fontFamily = FontFamily.Monospace,
                fontSize   = 12.sp,
            )
        }

        HorizontalDivider(color = DimGreen)

        Column(modifier = Modifier.padding(16.dp)) {

            // ── Balance display ───────────────────────────────────────────────
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text       = "balance: ",
                    color      = TextMuted,
                    fontFamily = FontFamily.Monospace,
                    fontSize   = 11.sp,
                )
                Text(
                    text       = "¢$coinBalance",
                    color      = Yellow,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    fontSize   = 11.sp,
                )
                Text(
                    text       = "  →  after: ",
                    color      = TextMuted,
                    fontFamily = FontFamily.Monospace,
                    fontSize   = 11.sp,
                )
                val after = coinBalance - cost
                Text(
                    text       = "¢$after",
                    color      = if (after < 0) Pink else Yellow,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    fontSize   = 11.sp,
                )
            }

            Spacer(Modifier.height(4.dp))

            Text(
                text       = "cost: ¢$cost (1¢/char)",
                color      = Yellow,
                fontFamily = FontFamily.Monospace,
                fontSize   = 11.sp,
            )

            Spacer(Modifier.height(16.dp))

            // ── Title ─────────────────────────────────────────────────────────
            Text(
                text       = "TITLE",
                color      = DimGreen,
                fontFamily = FontFamily.Monospace,
                fontSize   = 10.sp,
                fontWeight = FontWeight.Bold,
            )
            Spacer(Modifier.height(4.dp))
            BasicTextField(
                value         = state.title,
                onValueChange = viewModel::setTitle,
                modifier      = Modifier
                    .fillMaxWidth()
                    .background(Surface)
                    .border(1.dp, DimGreen, RoundedCornerShape(2.dp))
                    .padding(10.dp),
                textStyle = TextStyle(
                    color      = Green,
                    fontSize   = 15.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                ),
                cursorBrush = SolidColor(Green),
                singleLine  = true,
                decorationBox = { inner ->
                    if (state.title.isEmpty()) {
                        Text(
                            text       = "post title…",
                            color      = TextMuted,
                            fontSize   = 15.sp,
                            fontFamily = FontFamily.Monospace,
                        )
                    }
                    inner()
                },
            )

            Spacer(Modifier.height(16.dp))

            // ── Content ───────────────────────────────────────────────────────
            Text(
                text       = "CONTENT",
                color      = DimGreen,
                fontFamily = FontFamily.Monospace,
                fontSize   = 10.sp,
                fontWeight = FontWeight.Bold,
            )
            Spacer(Modifier.height(4.dp))
            BasicTextField(
                value         = state.content,
                onValueChange = viewModel::setContent,
                modifier      = Modifier
                    .fillMaxWidth()
                    .height(220.dp)
                    .background(Surface)
                    .border(1.dp, DimGreen, RoundedCornerShape(2.dp))
                    .padding(10.dp),
                textStyle = TextStyle(
                    color      = Green,
                    fontSize   = 13.sp,
                    fontFamily = FontFamily.Monospace,
                ),
                cursorBrush = SolidColor(Green),
                decorationBox = { inner ->
                    if (state.content.isEmpty()) {
                        Text(
                            text       = "write something…",
                            color      = TextMuted,
                            fontSize   = 13.sp,
                            fontFamily = FontFamily.Monospace,
                        )
                    }
                    inner()
                },
            )

            Spacer(Modifier.height(12.dp))

            // ── Error ─────────────────────────────────────────────────────────
            state.error?.let { err ->
                Text("! $err", color = Pink, fontFamily = FontFamily.Monospace, fontSize = 11.sp)
                Spacer(Modifier.height(8.dp))
            }

            // ── Publish button ────────────────────────────────────────────────
            Button(
                onClick  = { viewModel.publish { onPublished() } },
                enabled  = state.title.isNotBlank() && state.content.isNotBlank() && !state.isSubmitting,
                modifier = Modifier.fillMaxWidth(),
                colors   = ButtonDefaults.buttonColors(
                    containerColor = MutedGreen,
                    contentColor   = Green,
                ),
                shape          = RoundedCornerShape(2.dp),
                contentPadding = PaddingValues(vertical = 14.dp),
            ) {
                if (state.isSubmitting) {
                    CircularProgressIndicator(color = Green, strokeWidth = 2.dp)
                } else {
                    Text(
                        text       = "[ PUBLISH ]",
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        fontSize   = 14.sp,
                    )
                }
            }
        }
    }
}
