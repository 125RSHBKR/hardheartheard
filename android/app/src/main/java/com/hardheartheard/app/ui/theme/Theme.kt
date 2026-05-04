package com.hardheartheard.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import androidx.compose.material3.Typography

// ── Palette ──────────────────────────────────────────────────────────────────
val Black       = Color(0xFF000000)
val Surface     = Color(0xFF0A0A0A)
val Green       = Color(0xFF00FF41)
val Cyan        = Color(0xFF00F5FF)
val Pink        = Color(0xFFFF006E)
val Yellow      = Color(0xFFFFE600)
val MutedGreen  = Color(0xFF003B0F)
val DimGreen    = Color(0xFF005C18)
val TextMuted   = Color(0xFF557A5A)

// ── Color scheme ─────────────────────────────────────────────────────────────
private val DarkColorScheme = darkColorScheme(
    primary          = Green,
    onPrimary        = Black,
    secondary        = Cyan,
    onSecondary      = Black,
    tertiary         = Pink,
    background       = Black,
    onBackground     = Green,
    surface          = Surface,
    onSurface        = Green,
    surfaceVariant   = MutedGreen,
    onSurfaceVariant = Green,
    error            = Pink,
    onError          = Black,
    outline          = DimGreen,
)

// ── Typography ────────────────────────────────────────────────────────────────
val HhhTypography = Typography(
    displayLarge  = TextStyle(fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold,   fontSize = 32.sp, color = Green),
    displayMedium = TextStyle(fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold,   fontSize = 24.sp, color = Green),
    displaySmall  = TextStyle(fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold,   fontSize = 20.sp, color = Green),
    headlineLarge = TextStyle(fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold,   fontSize = 18.sp, color = Green),
    headlineMedium= TextStyle(fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Normal, fontSize = 16.sp, color = Green),
    headlineSmall = TextStyle(fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Normal, fontSize = 14.sp, color = Green),
    bodyLarge     = TextStyle(fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Normal, fontSize = 14.sp, color = Green),
    bodyMedium    = TextStyle(fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Normal, fontSize = 12.sp, color = Green),
    bodySmall     = TextStyle(fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Normal, fontSize = 11.sp, color = TextMuted),
    labelLarge    = TextStyle(fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold,   fontSize = 13.sp, color = Green),
    labelMedium   = TextStyle(fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Normal, fontSize = 11.sp, color = TextMuted),
    labelSmall    = TextStyle(fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Normal, fontSize = 10.sp, color = TextMuted),
)

// ── Theme composable ──────────────────────────────────────────────────────────
@Composable
fun HhhTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography  = HhhTypography,
        content     = content,
    )
}
