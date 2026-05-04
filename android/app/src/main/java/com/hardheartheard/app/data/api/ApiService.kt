package com.hardheartheard.app.data.api

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Query

// ── Retrofit interface ────────────────────────────────────────────────────────
//
// TODO: The Next.js API routes at /api/posts and /api/comments currently
//       authenticate using Supabase server-side cookie sessions
//       (supabase.auth.getUser() reads from request cookies).
//       To make Bearer token auth work from Android, the API routes need a
//       small patch to also accept the Supabase access token from the
//       "Authorization: Bearer <token>" header, e.g.:
//
//         const authHeader = req.headers.authorization
//         if (authHeader?.startsWith("Bearer ")) {
//           const token = authHeader.slice(7)
//           const { data: { user } } = await supabase.auth.getUser(token)
//           // proceed with user
//         }
//
//       Until that patch is applied, authenticated writes will return 401/403.

interface ApiService {

    @GET("api/posts")
    suspend fun getPosts(
        @Header("Authorization") authorization: String,
        @Query("sort") sort: String = "recent",
    ): Response<PostsResponse>

    @GET("api/comments")
    suspend fun getComments(
        @Header("Authorization") authorization: String,
        @Query("post_id") postId: String,
    ): Response<CommentsResponse>

    @POST("api/posts")
    suspend fun createPost(
        @Header("Authorization") authorization: String,
        @Body body: CreatePostRequest,
    ): Response<CreatePostResponse>

    @POST("api/comments")
    suspend fun createComment(
        @Header("Authorization") authorization: String,
        @Body body: CreateCommentRequest,
    ): Response<CreateCommentResponse>
}

// ── Singleton factory ─────────────────────────────────────────────────────────

object ApiClient {
    private const val BASE_URL = "https://hardheartheard.vercel.app/"

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .build()

    val service: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}
