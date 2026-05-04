package com.hardheartheard.app.ui.components

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hardheartheard.app.ui.theme.Yellow

@Composable
fun CoinBalance(
    balance: Int,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier  = modifier,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text       = "¢",
            color      = Yellow,
            fontSize   = 14.sp,
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
        )
        Spacer(Modifier.width(2.dp))
        Text(
            text       = balance.toString(),
            color      = Yellow,
            fontSize   = 14.sp,
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
        )
    }
}
