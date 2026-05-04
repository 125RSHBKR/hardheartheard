package com.hardheartheard.app.data.api

import com.google.gson.annotations.SerializedName

// ── Domain models returned by the Next.js API ─────────────────────────────────

data class Post(
    @SerializedName("id")           val id: String              = "",
    @SerializedName("title")        val title: String           = "",
    @SerializedName("content")      val content: String         = "",
    @SerializedName("created_at")   val createdAt: String       = "",
    @SerializedName("user_id")      val userId: String          = "",
    @SerializedName("comment_count")val commentCount: Int       = 0,
    @SerializedName("coin_cost")    val coinCost: Int           = 0,
    @SerializedName("profiles")     val profiles: Profile?      = null,
)

data class Comment(
    @SerializedName("id")           val id: String              = "",
    @SerializedName("post_id")      val postId: String          = "",
    @SerializedName("content")      val content: String         = "",
    @SerializedName("created_at")   val createdAt: String       = "",
    @SerializedName("user_id")      val userId: String          = "",
    @SerializedName("coin_cost")    val coinCost: Int           = 0,
    @SerializedName("profiles")     val profiles: Profile?      = null,
)

data class Profile(
    @SerializedName("id")           val id: String              = "",
    @SerializedName("username")     val username: String        = "",
    @SerializedName("display_name") val displayName: String     = "",
    @SerializedName("avatar_url")   val avatarUrl: String?      = null,
    @SerializedName("coin_balance") val coinBalance: Int        = 0,
    @SerializedName("post_count")   val postCount: Int          = 0,
)

// ── API response wrappers ─────────────────────────────────────────────────────

data class PostsResponse(
    @SerializedName("posts") val posts: List<Post> = emptyList(),
)

data class CommentsResponse(
    @SerializedName("comments") val comments: List<Comment> = emptyList(),
)

data class CreatePostResponse(
    @SerializedName("post")        val post: Post?  = null,
    @SerializedName("newBalance")  val newBalance: Int = 0,
    @SerializedName("banned")      val banned: Boolean = false,
)

data class CreateCommentResponse(
    @SerializedName("comment")     val comment: Comment? = null,
    @SerializedName("newBalance")  val newBalance: Int   = 0,
    @SerializedName("banned")      val banned: Boolean   = false,
)

// ── Request bodies ────────────────────────────────────────────────────────────

data class CreatePostRequest(
    @SerializedName("title")   val title: String,
    @SerializedName("content") val content: String,
)

data class CreateCommentRequest(
    @SerializedName("post_id") val postId: String,
    @SerializedName("content") val content: String,
)
