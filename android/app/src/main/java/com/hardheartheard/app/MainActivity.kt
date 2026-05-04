package com.hardheartheard.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import androidx.lifecycle.lifecycleScope
import com.hardheartheard.app.data.auth.AuthManager
import com.hardheartheard.app.navigation.NavGraph
import com.hardheartheard.app.ui.theme.Black
import com.hardheartheard.app.ui.theme.HhhTheme
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private val authManager = AuthManager()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Restore any persisted Supabase session before rendering
        lifecycleScope.launch {
            authManager.restoreSession()
        }

        setContent {
            HhhTheme {
                androidx.compose.material3.Surface(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Black),
                    color    = Black,
                ) {
                    NavGraph(authManager = authManager)
                }
            }
        }
    }
}
