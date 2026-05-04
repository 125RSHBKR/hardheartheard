package com.hardheartheard.app.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.hardheartheard.app.data.auth.AuthManager
import com.hardheartheard.app.data.auth.AuthState
import com.hardheartheard.app.ui.screens.FeedScreen
import com.hardheartheard.app.ui.screens.LoginScreen
import com.hardheartheard.app.ui.screens.PostDetailScreen
import com.hardheartheard.app.ui.screens.ProfileScreen
import com.hardheartheard.app.ui.screens.WriteScreen
import com.hardheartheard.app.viewmodel.FeedViewModel
import com.hardheartheard.app.viewmodel.PostDetailViewModel
import com.hardheartheard.app.viewmodel.ProfileViewModel
import com.hardheartheard.app.viewmodel.WriteViewModel

sealed class Screen(val route: String) {
    object Login      : Screen("login")
    object Feed       : Screen("feed")
    object PostDetail : Screen("post_detail")
    object Write      : Screen("write")
    object Profile    : Screen("profile")
}

@Composable
fun NavGraph(authManager: AuthManager) {
    val navController = rememberNavController()
    val authState     by authManager.authState.collectAsState()

    // Shared ViewModels created once at nav-graph level
    val feedViewModel       = remember { FeedViewModel(authManager) }
    val postDetailViewModel = remember { PostDetailViewModel(authManager) }
    val writeViewModel      = remember { WriteViewModel(authManager) }
    val profileViewModel    = remember { ProfileViewModel(authManager) }

    val startDest = when (authState) {
        is AuthState.SignedIn  -> Screen.Feed.route
        is AuthState.SignedOut -> Screen.Login.route
        is AuthState.Loading   -> Screen.Login.route
    }

    val coinBalance = (authState as? AuthState.SignedIn)?.let { 0 } ?: 0
    // Note: coinBalance is maintained in the profile; in a fuller implementation
    // you'd expose it from ProfileViewModel and share it app-wide via a StateFlow.
    // For now it flows through as 0 until profile loads — the FeedScreen shows
    // the real balance once ProfileViewModel populates it.

    NavHost(
        navController    = navController,
        startDestination = startDest,
    ) {
        composable(Screen.Login.route) {
            LoginScreen(
                authManager = authManager,
                onSignedIn  = {
                    navController.navigate(Screen.Feed.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
            )
        }

        composable(Screen.Feed.route) {
            val profileState by profileViewModel.uiState.collectAsState()
            val balance = profileState.profile?.coinBalance ?: 0

            FeedScreen(
                viewModel      = feedViewModel,
                coinBalance    = balance,
                onPostClick    = { post ->
                    postDetailViewModel.loadPost(post)
                    navController.navigate(Screen.PostDetail.route)
                },
                onWriteClick   = { navController.navigate(Screen.Write.route) },
                onProfileClick = { navController.navigate(Screen.Profile.route) },
            )
        }

        composable(Screen.PostDetail.route) {
            PostDetailScreen(
                viewModel = postDetailViewModel,
                onBack    = { navController.popBackStack() },
            )
        }

        composable(Screen.Write.route) {
            val profileState by profileViewModel.uiState.collectAsState()
            val balance = profileState.profile?.coinBalance ?: 0

            WriteScreen(
                viewModel   = writeViewModel,
                coinBalance = balance,
                onBack      = { navController.popBackStack() },
                onPublished = {
                    feedViewModel.refresh()
                    navController.popBackStack()
                },
            )
        }

        composable(Screen.Profile.route) {
            ProfileScreen(
                viewModel   = profileViewModel,
                onSignedOut = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                    }
                },
            )
        }
    }
}
